import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth/testing')
export class AuthTestingController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}
  
  @Get('ping')
  @HttpCode(HttpStatus.OK)
  async ping() {
    return {
      success: true,
      message: 'Ping successful',
      timestamp: new Date().toISOString()
    };
  }

  @Post('echo')
  @HttpCode(HttpStatus.OK)
  async echo(@Body() body: any) {
    return {
      success: true,
      message: 'Echo successful',
      received: body,
      timestamp: new Date().toISOString()
    };
  }

  @Post('login-test')
  @HttpCode(HttpStatus.OK)
  async loginTest(@Body() body: { email: string; password: string }) {
    // Simular validación simple sin base de datos
    const isValid = body.email === 'test@prixagent.com' && body.password === 'TestPassword123!';
    
    return {
      success: true,
      message: 'Login test completed',
      email: body.email,
      isValid: isValid,
      timestamp: new Date().toISOString()
    };
  }

  @Get('db-test')
  @HttpCode(HttpStatus.OK)
  async dbTest() {
    try {
      // Probar consulta directa a la base de datos
      const user = await this.prisma.user.findFirst({
        where: { email: 'test@prixagent.com' },
        include: {
          account: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Database test completed',
        email: 'test@prixagent.com',
        userFound: !!user,
        user: user ? {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          accountId: user.accountId,
          account: user.account
        } : null,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Database test failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('jwt-test')
  @HttpCode(HttpStatus.OK)
  async jwtTest() {
    try {
      // Probar generación de JWT
      const payload = { sub: 'test', email: 'test@test.com', role: 'user', accountId: 'test-account' };
      const token = this.jwtService.sign(payload);
      
      return {
        success: true,
        message: 'JWT test completed',
        token: token,
        payload: payload,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: 'JWT test failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
