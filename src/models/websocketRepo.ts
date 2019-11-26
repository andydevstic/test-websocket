import * as websocket from 'websocket';

import { IWebsocketRepo, WsMessage } from "../IOC/interfaces";
import { TYPES } from '../IOC/types';
import { ProvideSingletonWithNamed } from '../IOC/decorators';
import { NAMES } from '../IOC/names';

@ProvideSingletonWithNamed(TYPES.Model, NAMES.WebsocketRepo)
export class WebsocketRepo implements IWebsocketRepo {
  private _connectedSocketsOfUserIds: { [userId: string]: websocket.connection[] } = {};

  saveConnection(connection: websocket.connection) {
    const userId = connection[TYPES.WsMetadata.userId];
    this._connectedSocketsOfUserIds[userId] = this._connectedSocketsOfUserIds[userId] || [];
    this._connectedSocketsOfUserIds[userId].push(connection);
  }

  cleanUpClosedConnection(connection: websocket.connection) {
    const userId = connection[TYPES.WsMetadata.userId];
    const index = this._connectedSocketsOfUserIds[userId].findIndex(cachedConn => cachedConn === connection);
    if (index >= 0) { this._connectedSocketsOfUserIds[userId].splice(index, 1) }
  }

  getAllConnectionsOfUserId(userId: number | string): websocket.connection[] {
    return this._connectedSocketsOfUserIds[userId];
  }

  deleteUserIdRecord(userId: number | string): void {
    delete this._connectedSocketsOfUserIds[userId];
  }

  broadcastMessageByUserId(userId: number | string, message: WsMessage): void {
    const allConnections = this.getAllConnectionsOfUserId(userId);
    if (!allConnections || !allConnections.length) { return; }
    allConnections.forEach(conn => conn.send(JSON.stringify(message)));
  }

  broadcastMessageToAllConnections(message: WsMessage) {
    for (const userId in this._connectedSocketsOfUserIds) {
      this.broadcastMessageByUserId(userId, message);
    }
  }
}