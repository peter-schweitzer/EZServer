import * as http from 'http';

declare class EZIncomingMessage extends http.IncomingMessage {
  uri: string;
}

type Methods = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';
type ResFunction = (req: EZIncomingMessage, res: http.ServerResponse, params: Params) => void;
type LUT<T> = { [key: string]: T };
type ResolverLUT = LUT<ResFunction>;

export declare class App {
  m_http_server: Server;

  constructor();

  /** @param port port the server will listen on */
  listen(port: number | string): void;

  /** @returns never rejects; false if the server isn't open when close() is called */
  async close(): Promise<boolean>;

  /**
   * @param uri uri to resolve
   * @param fn function for resolve the request
   */
  get(uri: string, fn: ResFunction): void;

  /**
   * @param uri uri to resolve
   * @param fn function for resolve the request
   */
  head(uri: string, fn: ResFunction): void;

  /**
   * @param uri uri to resolve
   * @param fn function for resolve the request
   */
  post(uri: string, fn: ResFunction): void;

  /**
   * @param uri uri to resolve
   * @param fn function for resolve the request
   */
  put(uri: string, fn: ResFunction): void;

  /**
   * @param uri uri to resolve
   * @param fn function for resolve the request
   */
  delete(uri: string, fn: ResFunction): void;

  /**
   * @param uri uri to resolve
   * @param fn function for resolve the request
   */
  connect(uri: string, fn: ResFunction): void;

  /**
   * @param uri uri to resolve
   * @param fn function for resolve the request
   */
  options(uri: string, fn: ResFunction): void;

  /**
   * @param uri uri to resolve
   * @param fn function for resolve the request
   */
  trace(uri: string, fn: ResFunction): void;

  /**
   * @param uri uri to resolve
   * @param fn function for resolve the request
   */
  patch(uri: string, fn: ResFunction): void;

  /**
   * @param uri uri to resolve
   * @param fn function for resolve the request
   */
  add(uri: string, fn: ResFunction): void;

  /**
   * @param method http-method of the request
   * @param uri start of the uri to resolve
   * @param fn function for resolve the request
   * @returns wether the function was successfully registered
   */
  addRestRoute(method: Methods, uri: string, fn: ResFunction): FalseOr<void>;

  /**
   * @param uri start of the uri to resolve
   * @param fn function for resolve the request
   */
  addRoute(uri: string, fn: ResFunction): void;

  /**
   * @param method http-method
   * @param functionName name of the generic function
   * @param fn function for resolve the request
   * @returns wether the function was successfully registered
   */
  addGenericRestFunction(method: Methods, functionName: string = '', fn: ResFunction): FalseOr<void>;

  /**
   * @param method http-method
   * @param functionName name of the generic function
   * @param uri uri to resolve
   * @param isRoute wether to register a route or endpoint
   * @returns wether the function was successfully registered
   */
  useGenericRestFunction(method: Methods, functionName: string, uri: string, isRoute: boolean = false): FalseOr<void>;

  /**
   * @param functionName name of the generic function
   * @param fn function for resolve the request
   * @returns wether the function was successfully registered
   */
  addGenericFunction(functionName: string = '', fn: ResFunction): FalseOr<void>;

  /**
   * @param functionName name of the generic function
   * @param uri uri to resolve
   * @param isRoute wether to register a route or endpoint
   * @returns wether the function was successfully registered
   */
  useGenericFunction(functionName: string, uri: string, isRoute: boolean = false): FalseOr<void>;
}

//#region functions

/**
 * @param res response from the server
 * @param data data of the response
 * @param options optional options
 * @param options.code status code of the response (default is 200)
 * @param options.mime mime-type of the response (default is 'text/plain')
 * @param options.headers additional headers ('Content-Type' is overwritten by mime, default is an empty Object)
 */
export declare function buildRes(
  res: ServerResponse,
  data: any = undefined,
  options: { code?: number = 200; mime?: string = 'text/plain'; headers?: LUT<string | number> = {} } = {},
): void;

/**
 * @param req request from the client
 * @param res response from the server
 */
export declare function throw404(req: EZIncomingMessage, res: ServerResponse): void;

/**
 * @param res response from the Server
 * @param filePath path of the file
 * @param statusCode status code df the response (default 200)
 */
export declare function serveFromFS(res: ServerResponse, filePath: string, statusCode: number = 200): void;

export declare function getBodyJSON(req: IncomingMessage): AsyncErrorOr<any>;

//#endregion
