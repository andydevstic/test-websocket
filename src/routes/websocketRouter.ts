import * as websocket from 'websocket';

import { IWebsocketMessageRouter, WsMessage, WsCloseCodes, WsMessageTypes, IAuthGuard, IWebsocketRepo } from "../IOC/interfaces";
import { inject, named } from 'inversify';
import { TYPES } from '../IOC/types';
import { NAMES } from '../IOC/names';
import { ProvideSingletonWithNamed } from '../IOC/decorators';

@ProvideSingletonWithNamed(TYPES.Router, NAMES.Websocket)
export class WebsocketMessageRouter implements IWebsocketMessageRouter {
  @inject(TYPES.Middleware)
  @named(NAMES.Authentication)
  private authGuard: IAuthGuard;

  @inject(TYPES.Model)
  @named(NAMES.WebsocketRepo)
  private websocketRepo: IWebsocketRepo;

  routeMessageToCorrectHandlers(conn: websocket.connection, msg: WsMessage): void {
    switch (msg.type) {
      case WsMessageTypes.AuthHandshakeResponse:
        this.handleAuthHandshakeResponse(conn, msg);
        return;
      case WsMessageTypes.Message:
        this.handleClientMessages(conn, msg);
        break;
      case WsMessageTypes.Ping:
        this.handleClientPing(conn);
    }
  }

  private async handleAuthHandshakeResponse(conn: websocket.connection, msg: WsMessage) {
    try {
      const token = msg.data.split(' ')[1];
      if (!token) { return conn.close(WsCloseCodes.UnsupportedData, 'Unauthorized'); }
  
      const { isAuthenticated, context } = await this.authGuard.authenticateToken(token);
      if (!isAuthenticated) {
        return conn.close(WsCloseCodes.UnsupportedData, 'Unauthorized');
      }
  
      const { user: { id: validatedUserId } } = context;
      const tempUserId = conn[TYPES.WsMetadata.userId];
      conn[TYPES.WsMetadata.userId] = validatedUserId;
      console.log(`UserId ${validatedUserId} established a connection!`);

      this.websocketRepo.saveConnection(conn);
      this.websocketRepo.deleteUserIdRecord(tempUserId);
    } catch (error) {
      return conn.close(WsCloseCodes.UnsupportedData, 'Unauthorized');
    }
  }

  private handleClientMessages(conn: websocket.connection, msg: WsMessage): void {
    const userId = <string>conn[TYPES.WsMetadata.userId];
    this.websocketRepo.broadcastMessageToAllConnections({
      type: WsMessageTypes.Message,
      data: {
        message: `UserId ${userId} said Hi!!!`
      }
    });
  }

  private handleClientPing(conn: websocket.connection): void {
    const userId = <string>conn[TYPES.WsMetadata.userId];
    const response: WsMessage = {
      type: WsMessageTypes.Message,
      data: {
        message: `Hello there, user ${userId}`
      }
    }
    this.websocketRepo.broadcastMessageByUserId(userId, response);
  }
}