import 'reflect-metadata';

import container from "./IOC/containerConfig"
import { IServer, ServerTypes } from "./IOC/interfaces"
import { TYPES } from "./IOC/types"
import * as Config from '../config'

const env = process.env.NODE_ENV || 'development';
const port = process.env.PORT || Config[env].PORT;
const serverType = <ServerTypes>process.env.SERVER_TYPE || ServerTypes.Http;

const server = container.getNamed<IServer>(TYPES.Server, serverType)
server.serve(port)