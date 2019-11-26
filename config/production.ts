import { IEnvironmentConfig } from "src/IOC/interfaces";

export const production: IEnvironmentConfig = {
  PORT: null,
  websocketHost: 'localhost',
  websocketPort: 1337,
  rabbitMQHost: 'localhost',
  rabbitMQPort: 5672,
  rabbitQueueName: '',
  authServerHost: 'localhost',
  authServerPort: 3010
}