import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Obtener accountId del header, query param, o JWT
      let accountId = this.extractTenantId(req);

      // Si no hay accountId en headers/query, intentar extraer del JWT
      if (!accountId) {
        try {
          accountId = await this.extractTenantIdFromJWT(req);
        } catch (jwtError) {
          // Log del error JWT pero continuar
          // console.debug('JWT extraction failed:', jwtError.message);
        }
      }

      // Si aún no hay accountId, usar el header X-Tenant-ID como fallback
      if (!accountId) {
        accountId = req.headers['x-account-id'] as string;
      }

      // Solo validar tenant si es necesario (endpoints que requieren autenticación)
      const requiresAuth = this.requiresAuthentication(req.url);

      if (accountId && this.isValidUUID(accountId) && requiresAuth) {
        try {
          const account = await this.validateTenant(accountId);
          if (!account) {
            // console.warn(`Tenant no válido o inactivo: ${accountId}`);
            // No lanzar error, continuar sin account
          } else {
            // Agregar account al request para uso posterior
            (req as any).account = account;
            (req as any).accountId = accountId;
          }
        } catch (validationError) {
          // console.warn(
          //   `Error validating tenant ${accountId}:`,
          //   validationError.message,
          // );
          // Continuar sin account
        }
      } else if (accountId && !this.isValidUUID(accountId)) {
        // Log del error pero no bloquear la request
        // console.warn(`Invalid account ID format: ${accountId}`);
        // Continuar sin account para endpoints que no lo requieren
      }

      next();
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      // console.error('Tenant middleware error:', error);
      // Para endpoints públicos, continuar sin account
      next();
    }
  }

  private extractTenantId(req: Request): string | null {
    // 1. Header X-Account-ID (case insensitive)
    const headerTenantId =
      req.headers['x-account-id'] || req.headers['X-Account-ID'];
    if (headerTenantId && typeof headerTenantId === 'string')
      return headerTenantId;

    // 2. Query parameter accountId
    const queryTenantId = req.query.accountId as string;
    if (queryTenantId) return queryTenantId;

    // 3. Subdomain (si está configurado)
    const host = req.get('host');
    if (host) {
      const subdomain = this.extractSubdomain(host);
      if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
        return subdomain;
      }
    }

    return null;
  }

  private async extractTenantIdFromJWT(req: Request): Promise<string | null> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return null;
      }

      const token = authHeader.substring(7);
      const secret = this.configService.get<string>('JWT_SECRET');

      if (!secret) {
        return null;
      }

      const payload = this.jwtService.verify(token, { secret });
      return payload.accountId || null;
    } catch {
      return null;
    }
  }

  private extractSubdomain(host: string): string | null {
    const parts = host.split('.');
    if (parts.length >= 3) {
      return parts[0];
    }
    return null;
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  private requiresAuthentication(url: string): boolean {
    // Endpoints que NO requieren autenticación
    const publicEndpoints = [
      '/health',
      '/api/v1/health',
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/webhooks/',
      '/accounts',
      '/accounts/',
    ];

    // Verificar si la URL es un endpoint público
    return !publicEndpoints.some((endpoint) => url.includes(endpoint));
  }

  private async validateTenant(accountId: string): Promise<any> {
    try {
      const account = await this.prisma.account.findUnique({
        where: { id: accountId },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          subscriptionPlan: true,
        },
      });

      if (account?.status !== 'active') {
        return null;
      }

      return account;
    } catch {
      return null;
    }
  }
}
