import {
    Body,
    Controller,
    Get,
    Post,
    Put,
    Request,
    UnauthorizedException,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TimeoutInterceptor } from '../interceptors/timeout.interceptor';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PasswordResetService } from './services/password-reset.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly _authService: AuthService,
    private readonly _passwordResetService: PasswordResetService,
    private readonly _configService: ConfigService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req) {
    return {
      id: req.user.sub,
      email: req.user.email,
      role: req.user.role,
      accountId: req.user.accountId,
      account: req.user.account,
    };
  }

  @Post('login')
  @UseInterceptors(TimeoutInterceptor)
  async login(@Body() loginDto: LoginDto) {
    try {
      // Validar que el body no esté vacío
      if (!loginDto || !loginDto.email || !loginDto.password) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // Validar formato de email básico
      if (!loginDto.email.includes('@') || loginDto.email.length < 5) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // Validar longitud mínima de contraseña
      if (loginDto.password.length < 6) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      console.log(`🔍 [AuthController] Procesando login para: ${loginDto.email}`);

      // Procesar login
      const result = await this._authService.login(loginDto);

      console.log(`✅ [AuthController] Login exitoso para: ${loginDto.email}`);
      return result;
    } catch (error) {
      console.error('AuthController login error:', error.message);
      
      // Mejorar mensajes de error para seguridad
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // Para otros errores, lanzar UnauthorizedException genérico
      throw new UnauthorizedException('Credenciales inválidas');
    }
  }

  @Get('debug/config')
  async debugConfig() {
    return {
      timestamp: new Date().toISOString(),
      version: '1.0.3',
      deployment: 'latest',
      authService: 'updated',
      jwtStrategy: 'fixed'
    };
  }

  @Post('debug/test-auth')
  async debugTestAuth(@Body() body: { email: string; password: string }) {
    try {
      console.log(`🔍 [DEBUG] Testing authentication for: ${body.email}`);
      
      // Probar validateUser directamente
      const user = await this._authService.validateUser(body.email, body.password);
      
      console.log(`🔍 [DEBUG] validateUser result:`, user ? 'SUCCESS' : 'FAILED');
      
      return {
        email: body.email,
        validateUserResult: user ? 'SUCCESS' : 'FAILED',
        user: user ? {
          id: user.id,
          email: user.email,
          role: user.role,
          hasAccount: !!user.accountId
        } : null,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`❌ [DEBUG] Error in test-auth:`, error);
      return {
        email: body.email,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('debug/db-test')
  async debugDbTest() {
    try {
      console.log(`🔍 [DEBUG] Testing database connection...`);
      
      // Probar conexión a la base de datos usando validateUser
      // Solo usar credenciales de variables de entorno, sin fallbacks inseguros
      const testEmail = process.env.TEST_EMAIL;
      const testPassword = process.env.TEST_PASSWORD;
      
      if (!testEmail || !testPassword) {
        return {
          databaseConnected: false,
          error: 'TEST_EMAIL and TEST_PASSWORD environment variables not configured',
          timestamp: new Date().toISOString()
        };
      }
      
      const user = await this._authService.validateUser(testEmail, testPassword);
      
      console.log(`🔍 [DEBUG] Database query result:`, user ? 'SUCCESS' : 'FAILED');
      
      return {
        databaseConnected: !!user,
        user: user,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`❌ [DEBUG] Error in db-test:`, error);
      return {
        databaseConnected: false,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('debug/auth-flow')
  async debugAuthFlow() {
    const adminEmail = this._configService.get<string>('admin.email');
    const adminPassword = this._configService.get<string>('admin.password');
    const adminName = this._configService.get<string>('admin.name');
    const adminRole = this._configService.get<string>('admin.role');

    return {
      environment: process.env.NODE_ENV,
      admin: {
        email: adminEmail,
        password: adminPassword ? 'Presente' : 'Ausente',
        name: adminName,
        role: adminRole,
      },
      rawEnv: {
        SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
        SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD
          ? 'Presente'
          : 'Ausente',
        SUPER_ADMIN_NAME: process.env.SUPER_ADMIN_NAME,
        SUPER_ADMIN_ROLE: process.env.SUPER_ADMIN_ROLE,
      },
      database: {
        url: process.env.DATABASE_URL ? 'Configurado' : 'No configurado',
        connected: 'Verificar en health check'
      },
      jwt: {
        secret: process.env.JWT_SECRET ? 'Configurado' : 'No configurado',
        expiresIn: process.env.JWT_EXPIRES_IN || 'No configurado'
      }
    };
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this._authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refreshToken(@Request() req) {
    return this._authService.refreshToken(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return this._authService.logout(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return {
      user: req.user,
    };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this._passwordResetService.requestPasswordReset(
      forgotPasswordDto.email,
    );
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this._passwordResetService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @Get('validate-reset-token/:token')
  async validateResetToken(@Request() req) {
    const token = req.params.token;
    return this._passwordResetService.validateResetToken(token);
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this._authService.changePassword(req.user.sub, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this._authService.updateProfile(req.user.sub, updateProfileDto);
  }
}
