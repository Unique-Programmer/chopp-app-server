import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable, tap } from 'rxjs';
  import * as fs from 'fs-extra';
  import * as path from 'path';
  
  @Injectable()
  export class LoggerInterceptor implements NestInterceptor {
    private readonly logDir = path.resolve('./logs');
  
    constructor() {
      fs.ensureDirSync(this.logDir);
    }
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const req = context.switchToHttp().getRequest();
      const { method, originalUrl, body, query, params } = req;
      const userId = req.user?.id || 'anonymous';
      const now = new Date();
      const start = Date.now();
      const formattedTime = this.formatDate(now);
  
      return next.handle().pipe(
        tap((response) => {
          const duration = Date.now() - start;
          const status = context.switchToHttp().getResponse().statusCode;
  
          const filteredBody = this.filterSensitive(body);
          const logMessage = `[${formattedTime}] [${method}] ${originalUrl} ${status} (${duration}ms) - userId: ${userId}`;
  
          const fullLog = {
            timestamp: formattedTime,
            method,
            url: originalUrl,
            status,
            duration,
            userId,
            params,
            query,
            body: filteredBody,
            response,
          };
  
          const statusColor = status < 300
            ? '\x1b[32m'
            : status < 400
            ? '\x1b[33m'
            : '\x1b[31m';
  
          console.log(`${statusColor}${logMessage}\x1b[0m`);
          console.log(fullLog);
  
          const logFilePath = path.join(this.logDir, `${this.formatDate(now, true)}.log`);
          fs.appendFileSync(logFilePath, logMessage + '\n' + JSON.stringify(fullLog, null, 2) + '\n\n');
        }),
      );
    }
  
    private formatDate(date: Date, forFileName = false): string {
      const pad = (n: number) => n.toString().padStart(2, '0');
      const day = pad(date.getDate());
      const month = pad(date.getMonth() + 1);
      const year = date.getFullYear();
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      const seconds = pad(date.getSeconds());
  
      return forFileName
        ? `${year}-${month}-${day}`
        : `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
    }
  
    private filterSensitive(data: Record<string, any>): Record<string, any> {
      const SENSITIVE_KEYS = ['password', 'token', 'accessToken', 'refreshToken'];
      const clone = { ...data };
  
      for (const key of SENSITIVE_KEYS) {
        if (key in clone) {
          clone[key] = '***';
        }
      }
  
      return clone;
    }
  }