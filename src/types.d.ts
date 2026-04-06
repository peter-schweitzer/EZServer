import { IncomingMessage as _IncomingMessage, Server as _Server, ServerResponse as _ServerResponse } from 'node:http';

import { WebSocket, WebSocketServer } from 'ws';

import { Params as _Params } from './Params.js';

export declare global {
  //#region ============================= imports ==============================
  type Server = _Server;
  type IncomingMessage = _IncomingMessage;
  type ServerResponse = _ServerResponse;

  type Params = _Params;

  type ws_WebSocket = WebSocket;
  type ws_WebSocketServer = WebSocketServer;
  //#endregion

  //#region ============================== types ===============================
  type Methods = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';
  type EZIncomingMessage = IncomingMessage & { url: string; method: Methods; uri: string };
  type RouteLUT = LUT<string> & { '*'?: string[] };
  type Middleware = { handle: (req: EZIncomingMessage, res: ServerResponse, query: LUT<string>, route: RouteLUT) => Promise<void | string> };
  type MiddlewareCurry = { use: (middleware: Middleware) => MiddlewareCurry };
  type RestLUT<T, O extends boolean = false> = O extends true ? { [method in Methods]?: T } : { [method in Methods]: T };

  //#region ========================== routing types ===========================
  type ResFunction = (req: EZIncomingMessage, res: ServerResponse, params: Params) => void;
  type ResolverLeaf = { fn: ResFunction; middleware: FalseOr<Middleware[]> };

  type WSResFunction = (ws: ws_WebSocket, request: EZIncomingMessage, params: Params) => void;
  type WSResolverLeaf = { fn: WSResFunction };

  type ResLeaf = ResolverLeaf | WSResolverLeaf;
  type ResolverLUT<L extends ResLeaf> = LUT<L>;

  type TreeLeaf<L extends ResLeaf> = L & { params: [number, string][] };
  type TreeNode<L extends ResLeaf> = { route?: LUT<TreeNode<L>>; param?: TreeNode<L>; leaf?: TreeLeaf<L> };

  type WildcardTreeNode<L extends ResLeaf> = { route?: LUT<WildcardTreeNode<L>>; param?: WildcardTreeNode<L>; leaf?: TreeLeaf<L> };
  type ResolverTreeContainer<L extends ResLeaf> = { depth: number; root: WildcardTreeNode<L> };
  //#endregion
  //#endregion
}
