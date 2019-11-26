import { IAuthGuard, ITokenService, IRequest, AuthenticateTokenResult } from "../IOC/interfaces";
import { RequestHandler, Request, NextFunction, Response } from "express";
import { ProvideSingletonWithNamed } from "../IOC/decorators";
import { TYPES } from "../IOC/types";
import { NAMES } from "../IOC/names";
import { inject, named } from "inversify";

@ProvideSingletonWithNamed(TYPES.Middleware, NAMES.Authentication)
export class AuthGuard implements IAuthGuard {
  constructor(
    @inject(TYPES.Service)
    @named(NAMES.Token)
    private tokenService: ITokenService
  ) {}

  getAuthenticationHandler(): RequestHandler {
    return async (req: IRequest, res: Response, next: NextFunction) => {
      try {
        const token = this.getToken(req);
        if (!token) { throw new Error('Auth token missing!'); }
        const authResult = await this.authenticateToken(token);
        if (!authResult.isAuthenticated) { throw new Error('Unauthorized!') }
        req.context = authResult.context;
        next();
      } catch (error) {
        next(error);
      }
    }
  }

  async authenticateToken(token: string): Promise<AuthenticateTokenResult> {
    const payload = await this.tokenService.parseToken(token);

    const reqContext = this.getContextFromTokenPayload(payload);
    if (!reqContext) return <AuthenticateTokenResult>{
      isAuthenticated: false,
      context: null
    }
    return <AuthenticateTokenResult>{
      isAuthenticated: true,
      context: reqContext
    }
  }

  private getContextFromTokenPayload<T>(payload: T): T {
    return payload;
  }

  private getToken(req: Request): string {
    const token = null;
    if (req.query.token) return req.query.token;
    if (req.headers.authorization) return req.headers.authorization.split(' ')[1];

    return token;
  }
}