import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class ProxyFixMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ProxyFixMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Mark that this middleware was applied
    (req as any).__proxyFixApplied = true;
    
    // Log all request details for debugging
    this.logger.debug(`=== PROXY FIX MIDDLEWARE ===`);
    this.logger.debug(`Method: ${req.method}`);
    this.logger.debug(`URL: ${req.url}`);
    this.logger.debug(`Original URL: ${req.originalUrl}`);
    this.logger.debug(`Headers: ${JSON.stringify(req.headers, null, 2)}`);
    this.logger.debug(`Body exists: ${!!req.body}`);
    this.logger.debug(`Body type: ${typeof req.body}`);
    this.logger.debug(`Body content: ${JSON.stringify(req.body)}`);
    this.logger.debug(`Raw body exists: ${!!(req as any).rawBody}`);
    this.logger.debug(`Raw body length: ${(req as any).rawBody ? (req as any).rawBody.length : 0}`);

    // Fix common proxy issues
    if (req.headers['x-forwarded-proto'] === 'https') {
      // Set secure flag using Object.defineProperty to avoid readonly error
      Object.defineProperty(req, 'secure', {
        value: true,
        writable: true,
        enumerable: true,
        configurable: true
      });
    }

    // Handle body parsing issues
    if (req.method === 'POST' && req.headers['content-type']?.includes('application/json')) {
      // Check if body is already parsed correctly
      if (!req.body || (typeof req.body === 'object' && Object.keys(req.body).length === 0)) {
        this.logger.debug('Body parsing issue detected, attempting manual parsing...');
        
        // Try to parse from raw body if available
        if ((req as any).rawBody) {
          try {
            const rawBodyString = (req as any).rawBody.toString();
            this.logger.debug(`Raw body string: ${rawBodyString}`);
            req.body = JSON.parse(rawBodyString);
            this.logger.debug(`Successfully parsed from raw body: ${JSON.stringify(req.body)}`);
          } catch (error) {
            this.logger.error(`Failed to parse raw body: ${error.message}`);
          }
        }
      }
    }

    // Add CORS headers for proxy
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    this.logger.debug(`=== END PROXY FIX MIDDLEWARE ===`);
    next();
  }
}
