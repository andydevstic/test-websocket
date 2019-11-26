import * as websocket from 'websocket';
import * as http from 'http';
import { inject, named } from 'inversify';

import { IServer, IWebsocketController } from "../IOC/interfaces";
import { ProvideSingletonWithNamed } from '../IOC/decorators';
import { TYPES } from '../IOC/types';
import { NAMES } from '../IOC/names';

@ProvideSingletonWithNamed(TYPES.Server, NAMES.Websocket)
export class WebsocketServer implements IServer {
  private _httpServer: http.Server;
  private _wsServer: websocket.server;

  constructor(
    @inject(TYPES.Controller)
    @named(NAMES.Websocket)
    private websocketController: IWebsocketController
  ) {
    this._httpServer = http.createServer((req, res) => {})
    this._wsServer = new websocket.server({ httpServer: this._httpServer })
    this.onInitListeners();
  }

  private async onInitListeners(): Promise<void> {
    await this.websocketController.setupMessageQueueListeners()
    this.websocketController.setupWsEventListeners(this._wsServer);
  }

  serve(port: number) {
    this._httpServer.listen(port, () => { console.log(`Websocket server listening on port ${port}`) });
  }

}