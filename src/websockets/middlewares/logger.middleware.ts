import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logDir = path.resolve('./logs');

  constructor() {
    fs.ensureDirSync(this.logDir);
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    const { method, originalUrl, body, query, params } = req;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const status = res.statusCode;
      const userId = (req as any)?.user?.id || 'anonymous';

      const filteredBody = this.filterSensitive(body);

      const now = new Date();
      const formattedTime = this.formatDate(now); // ✅ Локальное форматирование
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
    });

    next();
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
