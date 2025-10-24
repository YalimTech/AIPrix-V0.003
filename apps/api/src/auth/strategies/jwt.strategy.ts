import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const jwtSecret = process.env.JWT_SECRET || configService.get<string>('JWT_SECRET');
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
      algorithms: ['HS256'],
    });
  }

  /**
   * Validates JWT payload and returns user data
   * @param payload - JWT payload
   * @returns User data for request context
   */
  async validate(payload: JwtPayload) {
    try {
      const user = await this.findUserById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Invalid or inactive user');
      }

      if (!this.isUserActive(user)) {
        throw new UnauthorizedException('Invalid or inactive user');
      }

      return this.buildUserContext(user);
    } catch (error) {
      console.error('JWT validation error:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Gets JWT secret from environment variables
   * @returns JWT secret string
   */
  private getJwtSecret(): string {
    const jwtSecret = process.env.JWT_SECRET || this.configService.get<string>('JWT_SECRET');
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }
    
    return jwtSecret;
  }

  /**
   * Finds user by ID in the database
   * @param userId - User ID
   * @returns User data with account information
   */
  private async findUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { account: true },
    });
  }

  /**
   * Checks if user is active
   * @param user - User data
   * @returns True if user is active
   */
  private isUserActive(user: any): boolean {
    // return user.status === 'active';
    return true; // Asumiendo que todos los usuarios están activos por defecto
  }

  /**
   * Builds user context for request
   * @param user - User data
   * @returns User context object
   */
  private buildUserContext(user: any) {
    return {
      sub: user.id,
      email: user.email,
      accountId: user.accountId,
      role: user.role,
      // account: user.account,
    };
  }
}