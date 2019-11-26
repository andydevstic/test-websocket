import { IEnvironmentConfig } from "src/IOC/interfaces";

export const development: IEnvironmentConfig = {
  PORT: 3030,
  websocketHost: 'localhost',
  websocketPort: 1337,
  rabbitMQHost: 'localhost',
  rabbitMQPort: 5672,
  rabbitQueueName: 'syncData',
  authServerHost: 'localhost',
  authServerPort: 3010
}