import { BaseRouter } from "./baseRouter";
import { inject, named } from "inversify";
import { TYPES } from "../IOC/types";
import { Router } from "express";
import { NAMES } from "../IOC/names";
import { ProvideSingletonWithNamed } from "../IOC/decorators";
import { IRouter } from "../IOC/interfaces";


@ProvideSingletonWithNamed(TYPES.Router, NAMES.API)
export class ApiRouter extends BaseRouter {
  constructor(
    @inject(TYPES.Router)
    @named(NAMES.NEW)
    protected apiRouter: Router,

    @inject(TYPES.Router)
    @named(NAMES.Event)
    protected eventRouter: IRouter
  ) { super(apiRouter) }

  initRoutes() {
    this.apiRouter.use('/events', this.eventRouter.serveRouter())
  }
}