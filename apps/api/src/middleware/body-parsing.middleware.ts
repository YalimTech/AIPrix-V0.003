import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as express from 'express';

@Injectable()
export class BodyParsingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(BodyParsingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Mark that this middleware was applied
    (req as any).__bodyParsingApplied = true;
    
    // Log request details for debugging
    this.logger.debug(`Request: ${req.method} ${req.url}`);
    this.logger.debug(`Content-Type: ${req.headers['content-type']}`);
    this.logger.debug(`Content-Length: ${req.headers['content-length']}`);
    this.logger.debug(`Body already parsed: ${!!req.body}`);
    this.logger.debug(`Body type: ${typeof req.body}`);
    this.logger.debug(`Body content: ${JSON.stringify(req.body)}`);

    // Check if body is already parsed
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
      this.logger.debug('Body already parsed by Express, proceeding...');
      return next();
    }

    // Handle JSON body parsing manually if needed
    if (req.method === 'POST' && req.headers['content-type']?.includes('application/json')) {
      this.logger.debug('Manual body parsing required');
      
      let body = '';
      let isBodyParsed = false;
      
      // Set up data listener
      req.on('data', (chunk) => {
        if (!isBodyParsed) {
          body += chunk.toString();
          this.logger.debug(`Received chunk: ${chunk.length} bytes`);
        }
      });

      // Set up end listener
      req.on('end', () => {
        if (!isBodyParsed) {
          isBodyParsed = true;
          try {
            if (body && body.trim()) {
              req.body = JSON.parse(body);
              this.logger.debug(`Manually parsed body: ${JSON.stringify(req.body)}`);
            } else {
              this.logger.debug('Empty body received');
              req.body = {};
            }
            next();
          } catch (error) {
            this.logger.error(`Body parsing error: ${error.message}`);
            this.logger.error(`Raw body: ${body}`);
            req.body = {};
            next();
          }
        }
      });

      // Set up error listener
      req.on('error', (error) => {
        this.logger.error(`Request error: ${error.message}`);
        if (!isBodyParsed) {
          req.body = {};
          next();
        }
      });

      // Set up close listener
      req.on('close', () => {
        this.logger.debug('Request closed');
        if (!isBodyParsed) {
          req.body = {};
          next();
        }
      });

      // Set up abort listener
      req.on('aborted', () => {
        this.logger.debug('Request aborted');
        if (!isBodyParsed) {
          req.body = {};
          next();
        }
      });

    } else {
      this.logger.debug('Not a JSON POST request, proceeding...');
      next();
    }
  }
}
