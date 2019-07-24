export const methods = [
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'head',
  'options'
];

export const statusCodes = [
  100,
  101,
  102,
  200,
  201,
  202,
  203,
  204,
  205,
  206,
  207,
  208,
  226,
  300,
  301,
  302,
  303,
  304,
  305,
  306,
  307,
  308,
  400,
  401,
  402,
  403,
  404,
  405,
  406,
  407,
  408,
  409,
  410,
  411,
  412,
  413,
  414,
  415,
  416,
  417,
  421,
  422,
  423,
  424,
  426,
  428,
  429,
  431,
  451,
  500,
  501,
  502,
  503,
  504,
  505,
  506,
  507,
  508,
  510,
  511
];

export const statusCodesExplanation = {
  100: 'Continue',
  101: 'Switching Protocols',
  102: 'Processing',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  207: 'Multi-Status',
  208: 'Already Reported',
  226: 'IM Used',
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  306: '(Unused)',
  307: 'Temporary Redirect',
  308: 'Permanent Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  417: 'Expectation Failed',
  421: 'Misdirected Request',
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  451: 'Unavailable For Legal Reasons',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',
  507: 'Insufficient Storage',
  508: 'Loop Detected',
  510: 'Not Extended',
  511: 'Network Authentication Required'
};

export const headerNames = [
  'Accept',
  'Accept-CH',
  'Accept-Charset',
  'Accept-Features',
  'Accept-Encoding',
  'Accept-Language',
  'Accept-Ranges',
  'Access-Control-Allow-Credentials',
  'Access-Control-Allow-Origin',
  'Access-Control-Allow-Methods',
  'Access-Control-Allow-Headers',
  'Access-Control-Max-Age',
  'Access-Control-Expose-Headers',
  'Access-Control-Request-Method',
  'Access-Control-Request-Headers',
  'Age',
  'Allow',
  'Alternates',
  'Authorization',
  'Cache-Control',
  'Connection',
  'Content-Encoding',
  'Content-Language',
  'Content-Length',
  'Content-Location',
  'Content-MD5',
  'Content-Range',
  'Content-Security-Policy',
  'Content-Type',
  'Cookie',
  'DNT',
  'Date',
  'ETag',
  'Expect',
  'Expires',
  'From',
  'Host',
  'If-Match',
  'If-Modified-Since',
  'If-None-Match',
  'If-Range',
  'If-Unmodified-Since',
  'Last-Event-ID',
  'Last-Modified',
  'Link',
  'Location',
  'Max-Forwards',
  'Negotiate',
  'Origin',
  'Pragma',
  'Proxy-Authenticate',
  'Proxy-Authorization',
  'Range',
  'Referer',
  'Retry-After',
  'Sec-Websocket-Extensions',
  'Sec-Websocket-Key',
  'Sec-Websocket-Origin',
  'Sec-Websocket-Protocol',
  'Sec-Websocket-Version',
  'Server',
  'Set-Cookie',
  'Set-Cookie2',
  'Strict-Transport-Security',
  'TCN',
  'TE',
  'Trailer',
  'Transfer-Encoding',
  'Upgrade',
  'User-Agent',
  'Variant-Vary',
  'Vary',
  'Via',
  'Warning',
  'WWW-Authenticate',
  'X-Content-Duration',
  'X-Content-Security-Policy',
  'X-DNSPrefetch-Control',
  'X-Frame-Options',
  'X-Requested-With'
];

export const mimeTypesWithTemplating = [
  'application/json',
  'text/html',
  'text/css',
  'text/csv',
  'application/javascript',
  'application/typescript',
  'text/plain',
  'application/xhtml+xml',
  'application/xml'
];

// values used to suggest
export const headerValues = [
  // content types
  'text/plain',
  'text/html',
  'application/json',
  'application/xml',
  'multipart/form-data',
  'application/xhtml+xml',
  'application/x-www-form-urlencoded',
  'text/csv',
  'text/css',
  'application/javascript',
  'application/x-www-form-urlencoded',
  'application/zip',
  'application/pdf',
  'application/sql',
  'application/graphql',
  'application/ld+json',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.text',
  'audio/mpeg',
  'audio/vorbis',
  'image/png',
  'image/jpeg',
  'image/gif',

  // authorization
  'Basic ',
  'Bearer ',
  'Digest ',
  'HOBA ',
  'Mutual ',
  'AWS4-HMAC-SHA256 ',

  // cache control
  'max-age=',
  'max-stale=',
  'min-fresh=',
  'no-cache',
  'no-store',
  'no-transform',
  'only-if-cached',
  'must-revalidate',
  'no-cache',
  'no-store',
  'no-transform',
  'public',
  'private',
  'proxy-revalidate',
  's-maxage=',

  // charset
  'US-ASCII',
  'ISO-8859-1',
  'UTF-8',
  'UTF-16BE',
  'UTF-16LE',
  'UTF-16'
];

export type RouteType = {
  uuid: string;
  documentation: string;
  method: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head';
  endpoint: string;
  statusCode: string;
  headers: HeaderType[];
  body?: string;
  latency: number;
  file?: {
    path?: string;
    filename: string;
    mimeType: string;
    sendAsBody?: boolean;
  };
  /**
   * Store duplicates routes indexes, use .length to assess if there is any duplicate
   */
  duplicates: number[];
  /**
   * Store alternative responses
   */
  alternateRoutes: string[];
  selectedAlternateRoute: number;
};

export class RouteCounter {
  lastIndexServed: number;
}

export type HeaderType = { uuid: string, key: string, value: string };

export const CORSHeaders = [
  { key: 'Access-Control-Allow-Origin', value: '*' },
  { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS' },
  { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Origin, Accept, Authorization, Content-Length, X-Requested-With' }
];

// import {Pipe, PipeTransform} from '@angular/core';

// @Pipe({
//   name: 'search'
// })
// export class SearchPipe implements PipeTransform {
//   public transform(value, keys: string, term: string) {

//     if (!term) return value;
//     return (value || []).filter(item => keys.split(',').some(key => item.hasOwnProperty(key) && new RegExp(term, 'gi').test(item[key])));

//   }
// }


import {Pipe, PipeTransform} from '@angular/core';
@Pipe({
  name: 'myFilter',
  pure: false
})
export class MyFilterPipe implements PipeTransform {
    transform(items: RouteType[], str : string): any {
        if( str == undefined || str.length<2)
            return items;
        return items.filter(element => {
          return element.endpoint.includes(str);
        });
    }
}