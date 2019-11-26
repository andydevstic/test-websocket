import { Router } from "express";
import { IRouter } from "src/IOC/interfaces";
import { injectable } from "inversify";

@injectable()
export abstract class BaseRouter implements IRouter {
  constructor(protected router: Router) {}

  abstract initRoutes(): void

  serveRouter(): Router {
    this.initRoutes()
    return this.router
  }
}