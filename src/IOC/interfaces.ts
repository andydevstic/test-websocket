import { Router, RequestHandler, Request, Response, NextFunction } from "express";
import * as websocket from 'websocket';
import * as amqp from 'amqplib/callback_api';

export interface IMessageQueue {
  setupConnectionAndChannel(connectionParams?: IMessageQueueConnectionParam): Promise<void>
  pushMessage(queueName: string, message: any): Promise<void>;
  addQueueListener(queueName: string, listener: MessageQueueListener): Promise<void>;
  disconnect(): Promise<void>;
}

export interface IEventController {
  syncAdMappingData(req: Request, res: Response, next: NextFunction): void
}


export interface IServer {
  serve(port: number): void
}

export interface IRouter {
  serveRouter(): Router
  initRoutes(): void
}

export interface IAuthGuard {
  getAuthenticationHandler(): RequestHandler;
  authenticateToken(token: string): Promise<AuthenticateTokenResult>;
}

export interface IEventService {
  pushSyncMessageForPlatform(platform: Platforms): Promise<any>
}

export interface ICustomError {
  throw(code: number, message: string, errCat: ErrorCategory)
}

export enum Platforms {
  facebook = 'facebook',
  google = 'google',
  yomediia = 'yomedia'
}

export enum ErrorCategory {
  Internal = 'Internal Server Error',
  Database = 'Database error',
}

export interface IAdSyncParams {
  data: {
    name: string
  }
}

export interface IMessageQueueConnectionParam {
  hostName: string;
  port?: number | string;
}

export interface IMessageQueueConnector<T> {
  connect(): T
  disconnect(): void;
}

export interface IEnvironmentConfig {
  PORT: number;
  websocketHost: string;
  websocketPort: number;
  rabbitMQHost: string;
  rabbitMQPort: number;
  rabbitQueueName: string;
  authServerHost: string;
  authServerPort: number;
}

export interface IMessageQueueMessage {
  action: MessageQueueActions;
  data: any;
}

export enum MessageQueueActions {
  SyncData = 'syncData',
}

export enum MessageQueueNames {
  SyncDataRequest = 'syncDataRequest',
  SyncDataResponse = 'syncDataResponse',
}

export interface IMessageQueueListenerManager {
  startListening(): void;
}

export type MessageQueueListener = (msg: amqp.Message) => void;

export interface ITokenService {
  parseToken(token: string): Promise<AuthTokenVerificationResponse>;
}

export interface IHttpModel {
  get(url: string, config?: any): Promise<any>;
  post(url: string, config?: any): Promise<any>;
  put(url: string, config?: any): Promise<any>;
  delete(url: string, config?: any): Promise<any>;
}

export interface IHttpService extends IHttpModel {}

export interface AuthTokenVerificationResponse {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    isSuperAdmin: boolean;
    status: number;
  };
  account: {
    id: number;
    name: string;
    email: string;
    type: number;
    adminId: string;
    brandId: string;
    companyId: string;
    permissions: string[];
  };
  originalAccount: {
    id: number;
    name: string;
    email: string;
    type: number;
    adminId: string;
    brandId: string;
    companyId: string;
    permissions: string[];
    transaction: any;
    token: string;
  }
}

export interface IRequest extends Request {
  context: any
}

export enum ServerTypes {
  Http = 'Http',
  Websocket = 'Websocket'
}

export interface AuthenticateTokenResult {
  isAuthenticated: boolean;
  context: AuthTokenVerificationResponse
}

export enum WsMessageTypes {
  AuthHandshakeRequest = 'authHandShakeRequest',
  AuthHandshakeResponse = 'authHandShakeResponse',
  Message = 'Message',
  Data = 'Data',
  Ping = 'Ping'
}

export enum WsCloseCodes {
  UnsupportedData = 1003,
  GoingAway = 1001,
  ProtocolError = 1002
}

export interface WsMessage {
  user?: {
    id: number;
  };
  type: WsMessageTypes;
  data?: any;
}

export interface IWebsocketController {
  setupMessageQueueListeners(): Promise<void>;
  setupWsEventListeners(wsServer: websocket.server): void;
}

export interface IWebsocketRepo {
  saveConnection(conn: websocket.connection): void;
  cleanUpClosedConnection(conn: websocket.connection): void;
  /**
   * This does not close any opening connections of this userId.
   * @param userId 
   */
  deleteUserIdRecord(userId: number | string): void;
  getAllConnectionsOfUserId(userId: number | string): websocket.connection[];
  broadcastMessageByUserId(userId: number | string, message: WsMessage): void;
  broadcastMessageToAllConnections(message: WsMessage): void;
}

export interface IWebsocketService {
  sendAuthChallenge(conn: websocket.connection): void;
  handleWsMessages(conn: websocket.connection, msg: websocket.IMessage): void;
  setupConnectionEventHandlers(conn: websocket.connection): void;
  saveConnectionToCache(conn: websocket.connection): void;
}

export interface IWebsocketMessageRouter {
  routeMessageToCorrectHandlers(conn: websocket.connection, message: WsMessage): void;
}

export interface MqMessages {
  user?: {
    id: number;
  };
  data: any;
}

export interface IMessageQueueRouter {
  routeMessageToCorrectHandlers(queueName: MessageQueueNames, msg: amqp.Message): void;
}