import { ProvideSingletonWithNamed } from "../IOC/decorators";
import { TYPES } from "../IOC/types";
import { NAMES } from "../IOC/names";
import { IEventService, IMessageQueue, MessageQueueActions, IMessageQueueMessage, MessageQueueNames } from "../IOC/interfaces";
import { inject, named } from "inversify";

@ProvideSingletonWithNamed(TYPES.Service, NAMES.Event)
export class EventService implements IEventService {
  constructor(
    @inject(TYPES.Model)
    @named(NAMES.MessageQueue)
    private messageQueueService: IMessageQueue
  ) {
  }

  pushSyncMessageForPlatform(platformName: string): Promise<void> {
    const message = <IMessageQueueMessage>{
      data: { platformName },
      action: MessageQueueActions.SyncData
    }
    return this.messageQueueService.pushMessage(MessageQueueNames.SyncDataRequest, message);
  }
}