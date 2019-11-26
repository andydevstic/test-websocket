import { Application } from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import { inject, named } from 'inversify';
import { ProvideSingletonWithNamed } from '../IOC/decorators';
import { TYPES } from '../IOC/types';
import { IServer, IRouter, IMessageQueue } from '../IOC/interfaces';
import { NAMES } from '../IOC/names';


@ProvideSingletonWithNamed(TYPES.Server, NAMES.Http)
export class HttpServer implements IServer {
  constructor(
    @inject(TYPES.Application)
    @named(NAMES.Http)
    private app: Application,

    @inject(TYPES.Router)
    @named(NAMES.API)
    private apiRouter: IRouter,

    @inject(TYPES.Model)
    @named(NAMES.MessageQueue)
    private messageQueue: IMessageQueue
  ) {
    this.initMiddlewares();
    this.initMessageQueue()
      .then(() => {
        this.initRoutes();
        this.initErrorHandlers();
      })
  } 

  initMiddlewares() {
    this.app.use(cors());
    this.app.use(bodyParser.json({limit: '10mb'}));
  }

  async initMessageQueue() {
    await this.messageQueue.setupConnectionAndChannel();
  }

  initRoutes() {
    this.app.use('/api', this.apiRouter.serveRouter());
  }

  initErrorHandlers() {
    this.app.use((err, req, res, next) => {
      console.log(err);
    })
  }

  serve(port: number) {
    this.app.listen(port, () => {
      console.log('Http server listening on port:', port);
    })
  }
}

// 1. Receive sync request from client;
// 2. Read from params to get correct data to construct
//   message to send to RabbitMQ.
// 3. Setup RabbitMQ model.
// 4. Setup webserver to listen for messages.
// 5. Listen for synced data via...
// 6. Construct response from synced data.
// 7. Push the synced data via websocket.



// RabbitMQ:
//   1. Must be able to select Message queue.