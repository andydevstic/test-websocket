import * as amqp from 'amqplib'
import { inject, named } from 'inversify';

import { IMessageQueueRouter, MessageQueueNames, MqMessages, IWebsocketRepo, WsMessageTypes } from "../IOC/interfaces";
import { ProvideSingletonWithNamed } from "../IOC/decorators";
import { TYPES } from "../IOC/types";
import { NAMES } from "../IOC/names";

@ProvideSingletonWithNamed(TYPES.Router, NAMES.MessageQueue)
export class MessageQueueRouter implements IMessageQueueRouter {
  @inject(TYPES.Model)
  @named(NAMES.WebsocketRepo)
  private websocketRepo: IWebsocketRepo;

  routeMessageToCorrectHandlers(queueName: MessageQueueNames, msg: amqp.Message) {
    const parsedMessage = this.parseMQMessages(msg);
    switch (queueName) {
      case MessageQueueNames.SyncDataResponse:
        this.handleSyncDataResponse(parsedMessage);
    }
  }

  private handleSyncDataResponse(msg: MqMessages) {
    const { user: { id: userId }, data } = msg;
    this.websocketRepo.broadcastMessageByUserId(userId, {
      type: WsMessageTypes.Data,
      data
    })
  }

  private  parseMQMessages(msg: amqp.Message): MqMessages {
    let parsedMessage: MqMessages;
    try {
      parsedMessage = JSON.parse(msg.content.toString('utf8'));
    } catch (error) {
      parsedMessage = <MqMessages>{ data: msg.content.toString('utf8') };
    }
    return parsedMessage;
  }
}