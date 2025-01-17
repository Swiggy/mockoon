import { Injectable } from "@angular/core";
import * as express from "express";
import * as fs from "fs";
import * as http from "http";
import * as proxy from "http-proxy-middleware";
import * as https from "https";
import * as killable from "killable";
import * as path from "path";
import { Config } from "src/app/config";
import { AnalyticsEvents } from "src/app/enums/analytics-events.enum";
import { Errors } from "src/app/enums/errors.enum";
import { DummyJSONParser } from "src/app/libs/dummy-helpers.lib";
import { AlertService } from "src/app/services/alert.service";
import { DataService } from "src/app/services/data.service";
import { EnvironmentsService } from "src/app/services/environments.service";
import { EventsService } from "src/app/services/events.service";
import { pemFiles } from "src/app/ssl";
import { EnvironmentType } from "src/app/types/environment.type";
import {
  CORSHeaders,
  HeaderType,
  mimeTypesWithTemplating,
  RouteType
} from "src/app/types/route.type";
import { EnvironmentLogsType } from "src/app/types/server.type";
import { URL } from "url";
import { RouteLogger } from "./route.logger";

const httpsConfig = {
  key: pemFiles.key,
  cert: pemFiles.cert
};

@Injectable()
export class ServerService {
  public environmentsLogs: EnvironmentLogsType = {};
  public routerLogger = new RouteLogger();

  constructor(
    private alertService: AlertService,
    private dataService: DataService,
    private eventsService: EventsService,
    private environmentService: EnvironmentsService
  ) {
    this.eventsService.environmentDeleted.subscribe(
      (environment: EnvironmentType) => {
        // stop if needed before deletion
        if (environment.running) {
          this.stop(environment);
        }

        // delete the request logs
        this.deleteEnvironmentLogs(environment.uuid);
      }
    );
  }

  /**
   * Start an environment / server
   *
   * @param environment - an environment
   */
  public start(environment: EnvironmentType) {
    const server = express();
    let serverInstance;

    // create https or http server instance
    if (environment.https) {
      serverInstance = https.createServer(httpsConfig, server);
    } else {
      serverInstance = http.createServer(server);
    }

    // listen to port
    serverInstance.listen(environment.port, (error, success) => {
      environment.instance = serverInstance;
      environment.running = true;
      environment.startedAt = new Date();
    });

    // apply latency, cors, routes and proxy to express server
    this.analytics(server);
    this.rewriteUrl(server);
    this.parseBody(server);
    this.logRequests(server, environment);
    this.setEnvironmentLatency(server, environment);
    this.setRoutes(server, environment);
    this.setCors(server, environment);
    this.enableProxy(server, environment);

    // handle server errors
    serverInstance.on("error", (error: any) => {
      if (error.code === "EADDRINUSE") {
        this.alertService.showAlert("error", Errors.PORT_ALREADY_USED);
      } else if (error.code === "EACCES") {
        this.alertService.showAlert("error", Errors.PORT_INVALID);
      } else {
        this.alertService.showAlert("error", error.message);
      }
    });

    killable(serverInstance);
  }

  /**
   * Completely stop an environment / server
   *
   * @param environment - an environment
   */
  public stop(environment: EnvironmentType) {
    if (environment.instance) {
      environment.instance.kill(() => {
        environment.instance = null;
        environment.running = false;
        environment.startedAt = null;
      });
    }
  }

  /**
   * Test a header validity
   *
   * @param headerName
   */
  public testHeaderValidity(headerName: string) {
    if (headerName.match(/[^A-Za-z0-9\-\!\#\$\%\&\'\*\+\.\^\_\`\|\~]/g)) {
      return true;
    }
    return false;
  }

  /**
   * Send event for all entering requests
   *
   * @param server - express instance
   */
  private analytics(server: any) {
    server.use((req, res, next) => {
      this.eventsService.analyticsEvents.next(
        AnalyticsEvents.SERVER_ENTERING_REQUEST
      );

      next();
    });
  }

  /**
   * Remove multiple slash and replace by single slash
   *
   * @param server - express instance
   */
  private rewriteUrl(server: any) {
    server.use((req, res, next) => {
      req.url = req.url.replace(/\/{2,}/g, "/");

      next();
    });
  }

  /**
   * Always answer with status 200 to CORS pre flight OPTIONS requests if option activated.
   * /!\ Must be called after the routes creation otherwise it will intercept all user defined OPTIONS routes.
   *
   * @param server - express instance
   * @param environment - environment to be started
   */
  private setCors(server: any, environment: EnvironmentType) {
    if (environment.cors) {
      server.options("/*", (req, res) => {
        CORSHeaders.forEach(CORSHeader => {
          res.header(CORSHeader.key, CORSHeader.value);
        });

        res.send(200);
      });
    }
  }

  /**
   * Generate an environment routes and attach to running server
   *
   * @param server - server on which attach routes
   * @param environment - environment to get route schema from
   */
  private setRoutes(server: any, environment: EnvironmentType) {
    environment.routes.forEach((route: RouteType) => {
      // only launch non duplicated routes
      // if (!route.duplicates.length) {
      try {
        // create route
        const endpointWithRoute = route.endpoint.split("?")[0];
        server[route.method](
          "/" +
            (environment.endpointPrefix
              ? environment.endpointPrefix + "/"
              : "") +
            endpointWithRoute.replace(/ /g, "%20"),
          (req, res) => {
            let nextRouteBody: string = undefined;
            // add route latency if any
            setTimeout(() => {
              const routeContentType = this.environmentService.getRouteContentType(
                environment,
                route
              );

              // set http code
              res.status(route.statusCode);

              this.setHeaders(environment.headers, req, res);
              this.setHeaders(route.headers, req, res);
              
              if (route.alternateRoutes != undefined && route.alternateRoutes.length > 0) {
                let token = ""
                if (req.headers.sid != undefined) {
                  token = req.headers.sid
                }
                console.log("token " + token)
                console.log("req ", req)
                console.log("req ", req.originalUrl)
                let index = this.routerLogger.getIndexFor(
                  req.requestUrl,
                  token,
                  route.alternateRoutes.length
                );
                if (index > 0) {
                  nextRouteBody = route.alternateRoutes[index - 1];
                }
              } else {
                let tempRoute = this.updateRouteForParams(
                  req,
                  res,
                  route,
                  environment
                );
                if (tempRoute != undefined) {
                  route = tempRoute;
                }
              }

              // send the file
              if (route.file) {
                let filePath: string;

                // throw error or serve file
                try {
                  filePath = DummyJSONParser(route.file.path, req);

                  // if no route content type set to the one detected
                  if (!routeContentType) {
                    res.set("Content-Type", route.file.mimeType);
                  }

                  let fileContent: Buffer | string = fs.readFileSync(filePath);

                  // parse templating for a limited list of mime types
                  if (mimeTypesWithTemplating.indexOf(route.file.mimeType) > -1) {
                    fileContent = DummyJSONParser(
                      fileContent.toString("utf-8", 0, fileContent.length),
                      req
                    )
                  }

                  if (!route.file.sendAsBody) {
                    res.set(
                      "Content-Disposition",
                      `attachment; filename="${path.basename(filePath)}"`
                    );
                  }
                  res.send(fileContent);
                } catch (error) {
                  if (error.code === "ENOENT") {
                    this.sendError(
                      res,
                      Errors.FILE_NOT_EXISTS + filePath,
                      false
                    );
                  } else if (error.message.indexOf("Parse error") > -1) {
                    this.sendError(res, Errors.TEMPLATE_PARSE, false);
                  }
                  res.end();
                }
              } else {
                // detect if content type is json in order to parse
                if (routeContentType === "application/json") {
                  try {
                    if (nextRouteBody != undefined || nextRouteBody != null) {
                      res.json(JSON.parse(DummyJSONParser(nextRouteBody, req)));
                    } else {
                      res.json(JSON.parse(DummyJSONParser(route.body, req)));
                    }
                  } catch (error) {
                    // if JSON parsing error send plain text error
                    if (
                      error.message.indexOf("Unexpected token") > -1 ||
                      error.message.indexOf("Parse error") > -1
                    ) {
                      this.sendError(res, Errors.JSON_PARSE);
                    } else if (error.message.indexOf("Missing helper") > -1) {
                      this.sendError(
                        res,
                        Errors.MISSING_HELPER + error.message.split('"')[1]
                      );
                    }
                    res.end();
                  }
                } else {
                  try {
                    res.send(DummyJSONParser(route.body, req));
                  } catch (error) {
                    // if invalid Content-Type provided
                    if (error.message.indexOf("invalid media type") > -1) {
                      this.sendError(res, Errors.INVALID_CONTENT_TYPE);
                    }
                    res.end();
                  }
                }
              }
            }, route.latency);
          }
        );
      } catch (error) {
        // if invalid regex defined
        if (error.message.indexOf("Invalid regular expression") > -1) {
          this.alertService.showAlert(
            "error",
            Errors.INVALID_ROUTE_REGEX + route.endpoint
          );
        }
      }
      // }
    });
  }

  private updateRouteForParams(
    req,
    res,
    route: RouteType,
    environment: EnvironmentType
  ) {
    let duplicateRoutes = this.environmentService.getAllDuplicateRoutes(
      environment,
      route
    );
    if (duplicateRoutes.length > 0) {
      const requestUrl = req.originalUrl.toString().startsWith("/")
        ? req.originalUrl.substr(1)
        : req.originalUrl;
      let splitValues = requestUrl.split("?");
      if (splitValues.length > 1) {
        splitValues = splitValues[1].split("&").filter(value => {
          return !(
            value.toString().includes("lat") || value.toString().includes("lng") || value.toString().includes("address_id") || value.toString().includes("card_seen_count")
          );
        });
        for (const r of duplicateRoutes) {
          let rParamsValues = r.endpoint.split("?");
          if (rParamsValues.length > 1) {
            rParamsValues = rParamsValues[1].split("&").filter(value => {
              return !(value.includes("lat") || value.includes("lng") || value.includes("address_id") || value.includes("card_seen_count"));
            });
          } else {
            rParamsValues = [];
          }
          let diff = rParamsValues.filter(function(obj) {
            return splitValues.indexOf(obj) == -1;
          });
          if (diff.length == 0) {
            return r;
          }
        }
      }
    } else {
      return undefined;
    }
  }

  private setHeaders(headers: HeaderType[], req, res) {
    headers.forEach(header => {
      if (header.key && header.value && !this.testHeaderValidity(header.key)) {
        res.set(header.key, DummyJSONParser(header.value, req));
      }
    });
  }

  /**
   * Send an error with text/plain content type and the provided message.
   * Also display a toast.
   *
   * @param res
   * @param errorMessage
   * @param showAlert
   */
  private sendError(res: any, errorMessage: string, showAlert = true) {
    if (showAlert) {
      this.alertService.showAlert("error", errorMessage);
    }
    res.set("Content-Type", "text/plain");
    res.send(errorMessage);
  }

  /**
   * Enable catch all proxy.
   * Restream the body to the proxied API because it already has been intercepted by body parser
   *
   * @param server - server on which to launch the proxy
   * @param environment - environment to get proxy settings from
   */
  private enableProxy(server: any, environment: EnvironmentType) {
    // Add catch all proxy if enabled
    if (
      environment.proxyMode &&
      environment.proxyHost &&
      this.isValidURL(environment.proxyHost)
    ) {
      // res-stream the body (intercepted by body parser method) and mark as proxied
      const processRequest = (proxyReq, req, res, options) => {
        req.proxied = true;

        if (req.body) {
          proxyReq.setHeader("Content-Length", Buffer.byteLength(req.body));
          // stream the content
          proxyReq.write(req.body);
        }
      };

      server.use(
        "*",
        proxy({
          target: environment.proxyHost,
          secure: false,
          changeOrigin: true,
          ssl: Object.assign({}, httpsConfig, { agent: false }),
          onProxyReq: processRequest
        })
      );
    }
  }

  /**
   * Parse body as a raw string
   *
   * @param server - server on which to parse the body
   */
  private parseBody(server: any) {
    try {
      server.use((req, res, next) => {
        req.setEncoding("utf8");
        req.body = "";

        req.on("data", chunk => {
          req.body += chunk;
        });

        req.on("end", () => {
          next();
        });
      });
    } catch (error) {}
  }

  /**
   * Logs all request made to the environment
   *
   * @param server - server on which to log the request
   * @param environment - environment to link log to
   */
  private logRequests(server: any, environment: EnvironmentType) {
    server.use((req, res, next) => {
      let environmentLogs = this.environmentsLogs[environment.uuid];
      if (!environmentLogs) {
        this.environmentsLogs[environment.uuid] = [];
        environmentLogs = this.environmentsLogs[environment.uuid];
      }

      // remove one at the end if we reach maximum
      if (environmentLogs.length >= Config.maxLogsPerEnvironment) {
        environmentLogs.pop();
      }

      environmentLogs.unshift(this.dataService.formatRequestLog(req));

      next();
    });
  }

  /**
   * Set the environment latency if any
   *
   * @param server - server instance
   * @param environment - environment
   */
  private setEnvironmentLatency(server: any, environment: EnvironmentType) {
    if (environment.latency > 0) {
      server.use((req, res, next) => {
        setTimeout(next, environment.latency);
      });
    }
  }

  /**
   * Test if URL is valid
   *
   * @param URL
   */
  public isValidURL(address: string): boolean {
    try {
      const myURL = new URL(address);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Clear the environment logs
   *
   * @param environmentUuid
   */
  public clearEnvironmentLogs(environmentUuid: string) {
    this.environmentsLogs[environmentUuid] = [];
  }

  /**
   * Delete an environment log
   *
   * @param environmentUuid
   */
  public deleteEnvironmentLogs(environmentUuid: string) {
    delete this.environmentsLogs[environmentUuid];
  }
}
