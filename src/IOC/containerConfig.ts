import * as express from 'express';
import { Container } from 'inversify';
import { buildProviderModule } from 'inversify-binding-decorators';

import { IMessageQueueConnectionParam, IEnvironmentConfig } from './interfaces';
import { NAMES } from './names';
import * as environment from '../../config';
import { TYPES } from './types';

const container = new Container();
const env = <IEnvironmentConfig>environment[process.env.NODE_ENV || 'development'];

container
  .bind(TYPES.Application)
  .toConstantValue(express())
  .whenTargetNamed(NAMES.Http)

container
  .bind<IMessageQueueConnectionParam>(TYPES.Constant)
  .toConstantValue({
    hostName: env.rabbitMQHost,
    port: env.rabbitMQPort
  })
  .whenTargetNamed(NAMES.MessageQueue);

container
  .bind<IEnvironmentConfig>(TYPES.Constant)
  .toConstantValue(env)
  .whenTargetNamed(NAMES.Env)

container
  .bind<express.Router>(TYPES.Router)
  .toFactory(() => express.Router())
  .whenTargetNamed(NAMES.NEW);

import './loader';

container.load(buildProviderModule());

export default container;