import { inject, named } from "inversify";

import { ProvideSingletonWithNamed } from "../IOC/decorators";
import { TYPES } from "../IOC/types";
import { NAMES } from "../IOC/names";
import { IEnvironmentConfig, IHttpService, ITokenService, AuthTokenVerificationResponse } from "../IOC/interfaces";


@ProvideSingletonWithNamed(TYPES.Service, NAMES.Token)
export class TokenService implements ITokenService {
  private authServerUrl: string
  constructor(
    @inject(TYPES.Constant)
    @named(NAMES.Env)
    private env: IEnvironmentConfig,

    @inject(TYPES.Service)
    @named(NAMES.Http)
    private httpService: IHttpService
  ) {
    this.authServerUrl = `http://${this.env.authServerHost}:${this.env.authServerPort}`;
  }

  async parseToken(authToken: string): Promise<AuthTokenVerificationResponse> {
    const reqConfig = { headers: { authorization: `Basic ${authToken}` } };
    const response = await this.httpService.get(`${this.authServerUrl}/api/auth`, reqConfig)
    return response.data as AuthTokenVerificationResponse
  }
}