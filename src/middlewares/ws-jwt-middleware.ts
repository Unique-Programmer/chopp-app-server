import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtMiddleware {
  private readonly logger = new Logger(WsJwtMiddleware.name);
  constructor(private readonly jwtService: JwtService) {}

  validate(client: Socket): any {
    const token = client.handshake.auth.accessToken;

    this.logger.log('--token: ', token);
    const decoded = this.jwtService.decode(token) as any;
    const now = Math.ceil(Date.now() / 1000);
    this.logger.verbose('--Token exp:', decoded?.exp, 'Current time:', now);
    if (decoded?.exp < now) {
      this.logger.error('Token has expired');
      return { error: 'Token has expired' };
    }

    if (!token) {
      this.logger.error('Authentication token is missing');
      return { error: `Authentication token is missing` };
      // throw new WsException('Authentication token is missing');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET_HEX,
      });
      this.logger.log(`WS Connected successfully: user ${payload.id}`);
      return { payload };
    } catch (error) {
      this.logger.error('Invalid token');
      return { error: `Invalid token: ${token}` };
      // throw new WsException('Invalid or expired token');
    }
  }
}
