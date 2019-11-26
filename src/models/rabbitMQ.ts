import * as amqp from 'amqplib/callback_api'

import { IMessageQueue, IMessageQueueConnectionParam, MessageQueueListener } from "../IOC/interfaces";
import { ProvideSingletonWithNamed } from "../IOC/decorators";
import { TYPES } from "../IOC/types";
import { NAMES } from "../IOC/names";
import { inject, named } from 'inversify';

@ProvideSingletonWithNamed(TYPES.Model, NAMES.MessageQueue)
export class RabbitMQModel implements IMessageQueue {
  @inject(TYPES.Constant)
  @named(NAMES.MessageQueue)
  protected connectionParams: IMessageQueueConnectionParam

  private connection: amqp.Connection;
  private connectedChannel: amqp.Channel;

  async setupConnectionAndChannel(connectionParams?: IMessageQueueConnectionParam): Promise<void> {
    await this.connectHost(connectionParams);
    await this.createOrConnectChannel();
  }

  async pushMessage(queueName: string, message: any): Promise<void> {
    await this.assertQueue(queueName, { durable: true });
    this.sendToQueue(queueName, message);
  }

  private connectHost(connectionParams?: IMessageQueueConnectionParam): Promise<amqp.Connection> {
    if (!this.connection) {
      return new Promise<amqp.Connection>((resolve, reject) => {
        const { hostName, port } = connectionParams || this.connectionParams;
        amqp.connect(`amqp://${hostName}:${port}`, (error, connection: amqp.Connection) => {
          if (error) { return reject(error) }
          this.connection = connection;
          resolve(connection);
        })
      })
    } else {
      Promise.resolve(this.connection);
    }
  }

  private createOrConnectChannel(): Promise<amqp.Channel> {
    if (this.connectedChannel) { return Promise.resolve(this.connectedChannel); }
    else {
      return new Promise((resolve, reject) => {
        this.connection.createChannel((error, channel: amqp.Channel) => {
          if (error) { return reject(error); }
          this.connectedChannel = channel;
          return resolve(channel);
        })
      })
    }
  }

  private assertQueue(queueName: string, options?: amqp.Options.AssertQueue): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.connectedChannel) { reject(new Error('Can\'t assert queue: No channel was created')); }
      else {
        this.connectedChannel.assertQueue(queueName, options, (error, isOk) => {
          if (error) { reject(error); }
          else {
            if (isOk) { resolve(); }
            else { reject(new Error(`Asserting queue named ${queueName} failed`)); }
          }
        })
      }
    })
  }

  private sendToQueue(queueName: string, message: any): void {
    this.connectedChannel.sendToQueue(queueName, this.convertMessageToBuffer(message))
  }

  private convertMessageToBuffer(message: any): Buffer {
    if (!message) { throw new Error('Message must nnot be null') }
    if (typeof message === 'string') { return Buffer.from(message); }
    else { return Buffer.from(JSON.stringify(message)); }
  }

  async addQueueListener(queueName: string, listener: MessageQueueListener, consumeOption?: amqp.Options.Consume): Promise<void> {
    await this.assertQueue(queueName);
    this.connectedChannel.consume(queueName, listener, consumeOption);
  }

  disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.close((error) => {
        if (error) { reject(error); }
      })
    })
  }
  
}