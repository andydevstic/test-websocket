import { IEventController, IEventService, IAdSyncParams, Platforms, MessageQueueActions, IRequest } from '../IOC/interfaces';
import { ProvideSingletonWithNamed } from '../IOC/decorators';
import { TYPES } from '../IOC/types';
import { NAMES } from '../IOC/names';
import { NextFunction, Response } from 'express';
import { inject, named } from 'inversify';

@ProvideSingletonWithNamed(TYPES.Controller, NAMES.Event)
export class EventController implements IEventController {
  @inject(TYPES.Service)
  @named(NAMES.Event)
  private eventService: IEventService;

  async syncAdMappingData(req: IRequest, res: Response, next: NextFunction) {
    const body = <IAdSyncParams>req.body
    const { data: { name } } = body
    const [apiVersion, platformName, action] = name.split(':')
    if (!apiVersion || !platformName || !action) { return res.status(400).end('Invalid params') }
    switch (action) {
      case MessageQueueActions.SyncData:
        await this.eventService.pushSyncMessageForPlatform(<Platforms>platformName);
        res.status(201).json({ message: 'Message sent!' });
        break;
      default:
        return;
    }
  }
}