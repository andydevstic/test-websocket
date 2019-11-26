import * as websocket from 'websocket';
import { inject, named } from 'inversify';

import { IWebsocketController, IWebsocketService, IMessageQueue, MessageQueueNames, IMessageQueueRouter } from "../IOC/interfaces";
import { UuidFactory } from '../utils';
import { TYPES } from '../IOC/types';
import { NAMES } from '../IOC/names';
import { ProvideSingletonWithNamed } from '../IOC/decorators';


@ProvideSingletonWithNamed(TYPES.Controller, NAMES.Websocket)
export class WebsocketController implements IWebsocketController {
  @inject(TYPES.Service)
  @named(NAMES.Websocket)
  private websocketService: IWebsocketService;

  @inject(TYPES.Model)
  @named(NAMES.MessageQueue)
  private messageQueue: IMessageQueue;

  @inject(TYPES.Router)
  @named(NAMES.MessageQueue)
  private messageQueueRouter: IMessageQueueRouter

  setupWsEventListeners(wsServer: websocket.server): void {
    wsServer.on('request', request => this.handleWsConnRequest(request))
  }

  private handleWsConnRequest(request: websocket.request) {
    const conn = request.accept(null, request.origin);
    const tempUserId = UuidFactory();
    conn[TYPES.WsMetadata.userId] = tempUserId;

    this.websocketService.setupConnectionEventHandlers(conn);
    this.websocketService.saveConnectionToCache(conn);
    this.websocketService.sendAuthChallenge(conn);
  }

  async setupMessageQueueListeners(): Promise<void> {
    await this.messageQueue.setupConnectionAndChannel();
    const allQueuesToListen = [
      MessageQueueNames.SyncDataResponse
    ]

    allQueuesToListen
      .forEach(queueName => {
        this.messageQueue.addQueueListener(
          MessageQueueNames.SyncDataResponse,
          msg => this.messageQueueRouter.routeMessageToCorrectHandlers(queueName, msg)
        );
      })
  }
}