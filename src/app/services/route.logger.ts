import { RouteCounter } from "../types/route.type";

export interface ApiCounter {
  apiEndpoint: string;
}

export class RouteLogger {
  public logger: Map<string, Map<string, RouteCounter>> = new Map<
    string,
    Map<string, RouteCounter>
  >();

  public getIndexFor(apiEndpoint: string, token: string, maximumValue: number) {
      console.log("apiEndpoint " + apiEndpoint + " tokemn " + token + " maxValues " + maximumValue)
      let tokenLogger = this.logger.get(token)
      if (tokenLogger != undefined && tokenLogger.get(apiEndpoint) != undefined) {
          let routeCounterData = tokenLogger.get(apiEndpoint)
          if (routeCounterData.lastIndexServed + 1 > maximumValue) {
              return routeCounterData.lastIndexServed
          }
          routeCounterData.lastIndexServed += 1 
          let newCounterValue = new Map<string, RouteCounter>()
          newCounterValue.set(apiEndpoint, routeCounterData)
          this.logger.set(token, newCounterValue)
          return routeCounterData.lastIndexServed
      } else {
          let routeCounterData = new RouteCounter()
          routeCounterData.lastIndexServed = 0
          let routeCountValue = new Map<string, RouteCounter>()
          routeCountValue.set(apiEndpoint, routeCounterData) 
          this.logger.set(token, routeCountValue) 
          return 0
      }
  }
}
