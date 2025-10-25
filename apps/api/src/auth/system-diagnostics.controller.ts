import { Body, Controller, Get, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Controller('system')
export class SystemDiagnosticsController {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('env-check')
  async checkEnv() {
    return {
      nodeEnv: process.env.NODE_ENV,
      databaseUrl: !!process.env.DATABASE_URL,
      jwtSecret: !!process.env.JWT_SECRET,
      superAdminEmail: '',
      superAdminPassword: false,
      superAdminName: process.env.SUPER_ADMIN_NAME,
      superAdminRole: process.env.SUPER_ADMIN_ROLE,
      superAdminSecretKey: !!process.env.SUPER_ADMIN_SECRET_KEY,
    };
  }

  @Get('db-test')
  async testDatabase() {
    try {
      const userCount = await this.prisma.user.count();
      return {
        success: true,
        userCount,
        message: 'Database connection successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Database connection failed'
      };
    }
  }

  @Post('simple-login')
  async simpleLogin(@Body() body: { email: string; password: string }) {
    try {
      console.log(`🔍 Simple login test for: ${body.email}`);
      
      // Verificar variables de entorno
      const adminEmail = '';
      const adminPassword = '';
      
      console.log(`🔍 Admin email from config: ${adminEmail}`);
      console.log(`🔍 Admin password exists: ${!!adminPassword}`);
      
      if (body.email === adminEmail && body.password === adminPassword) {
        console.log(`✅ Simple login successful for: ${body.email}`);
        return {
          success: true,
          message: 'Login successful',
          user: {
            email: body.email,
            role: 'admin'
          }
        };
      }
      
      console.log(`❌ Simple login failed for: ${body.email}`);
      return {
        success: false,
        message: 'Invalid credentials'
      };
    } catch (error) {
      console.error(`❌ Simple login error:`, error);
      return {
        success: false,
        error: error.message,
        message: 'Login error'
      };
    }
  }
}
