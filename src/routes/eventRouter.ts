import { Router } from 'express';

import { ProvideSingletonWithNamed } from "../IOC/decorators";
import { TYPES } from "../IOC/types";
import { NAMES } from "../IOC/names";
import { inject, named } from "inversify";
import { IEventController, IAuthGuard } from 'src/IOC/interfaces';
import { BaseRouter } from './baseRouter'

@ProvideSingletonWithNamed(TYPES.Router, NAMES.Event)
export class EventRouter extends BaseRouter {
  constructor(
    @inject(TYPES.Router)
    @named(NAMES.NEW)
    protected eventRouter: Router,

    @inject(TYPES.Controller)
    @named(NAMES.Event)
    protected eventController: IEventController,

    @inject(TYPES.Middleware)
    @named(NAMES.Authentication)
    protected authGuard: IAuthGuard
  ) { super(eventRouter) }

  initRoutes(): void {
    this.eventRouter.use(this.authGuard.getAuthenticationHandler());
    this.router.post('/', this.eventController.syncAdMappingData.bind(this.eventController));
  }
}