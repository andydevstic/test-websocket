import * as websocket from 'websocket';
import { inject, named } from "inversify";

import { IWebsocketService, IWebsocketRepo, WsMessage, WsMessageTypes, WsCloseCodes, IWebsocketMessageRouter } from "../IOC/interfaces";
import { TYPES } from "../IOC/types";
import { NAMES } from "../IOC/names";
import { ProvideSingletonWithNamed } from '../IOC/decorators';

@ProvideSingletonWithNamed(TYPES.Service, NAMES.Websocket)
export class WebsocketService implements IWebsocketService {
  @inject(TYPES.Model)
  @named(NAMES.WebsocketRepo)
  private websocketRepo: IWebsocketRepo;

  @inject(TYPES.Router)
  @named(NAMES.Websocket)
  private websocketMessageRouter: IWebsocketMessageRouter;

  setupConnectionEventHandlers(conn: websocket.connection): void {
    conn.on('message', msg => { this.handleWsMessages(conn, msg) });
    conn.on('error', (error) => {
      console.log(error);
      conn.close(500, 'Internal server error');
    })
    conn.on('close', code => {
      console.log('Connection closed with code:', code);
      this.websocketRepo.cleanUpClosedConnection(conn);
    })
  }

  handleWsMessages(conn: websocket.connection, msg: websocket.IMessage): void {
    const parsedMessage = this.parseWsMessages(msg);
    if (typeof parsedMessage === 'string') {
      const message = <WsMessage>{
        type: 'Message',
        data: {
          message: 'Invalid websocket message!'
        }
      };
      return conn.send(JSON.stringify(message));
    }
    else { this.websocketMessageRouter.routeMessageToCorrectHandlers(conn, parsedMessage); }
  }

  private parseWsMessages(msg: websocket.IMessage): WsMessage | string {
    let parsedMessage: WsMessage | string;
    try {
      parsedMessage = JSON.parse(msg.utf8Data.toString());
    } catch (error) {
      parsedMessage = msg.utf8Data.toString();
    }
    return parsedMessage;
  }

  saveConnectionToCache(connection: websocket.connection) {
    this.websocketRepo.saveConnection(connection);
  }

  sendAuthChallenge(conn: websocket.connection): void {
    const authenticationChallengeMessage: WsMessage = { type: WsMessageTypes.AuthHandshakeRequest }
    conn.send(
      JSON.stringify(authenticationChallengeMessage),
      error => {
        if (error) { conn.close(WsCloseCodes.ProtocolError, 'Authentication challenge failed to send'); };
      });
  }

}