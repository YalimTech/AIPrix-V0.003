import { Body, Controller, Get, Post, Query, Request, UseInterceptors } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TimeoutInterceptor } from '../interceptors/timeout.interceptor';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { AuthenticationCredentialsDto, DiagnosticDataDto } from './dto/debug.dto';

/**
 * Authentication Diagnostics Controller
 * Provides diagnostic endpoints for authentication testing and troubleshooting
 */
@Controller('auth/diagnostics')
export class AuthDiagnosticsController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Test database connection and user count
   */
  @Get('db-status')
  async getDatabaseStatus() {
    try {
      const userCount = await this.prisma.user.count();
      const accountCount = await this.prisma.account.count();
      
      return {
        success: true,
        database: {
          connected: true,
          userCount,
          accountCount
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        database: {
          connected: false
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test login endpoint for debugging authentication issues
   * @param body - Login credentials
   * @returns Authentication test result
   */
  @Post('test-login')
  async testLogin(@Body() body: { email: string; password: string }) {
    try {
      const user = await this.authService.validateUser(body.email, body.password);
      
      return {
        success: true,
        email: body.email,
        userFound: !!user,
        user: user ? {
          id: user.id,
          email: user.email,
          role: user.role,
          accountId: user.accountId
        } : null,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test JWT generation
   */
  @Get('jwt-test')
  async testJwt() {
    try {
      const payload = { 
        sub: 'test-user-id', 
        email: 'test@test.com', 
        accountId: 'test-account-id', 
        role: 'user' 
      };
      const token = this.jwtService.sign(payload);
      
      return {
        success: true,
        jwt: {
          token,
          payload
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Create user endpoint for debugging
   */
  @Post('create-user')
  async createUser(@Body() body: { email: string; password: string; firstName?: string; lastName?: string }) {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.prisma.user.findFirst({
        where: { email: body.email }
      });

      if (existingUser) {
        return {
          success: true,
          message: 'User already exists',
          user: {
            id: existingUser.id,
            email: existingUser.email,
            role: existingUser.role
          },
          timestamp: new Date().toISOString()
        };
      }

      // Crear cuenta si no existe
      let account = await this.prisma.account.findFirst({
        where: { email: body.email }
      });

      if (!account) {
        account = await this.prisma.account.create({
          data: {
            name: `${body.firstName || 'User'} Account`,
            email: body.email,
            slug: body.email.split('@')[0],
            status: 'active',
            subscriptionPlan: 'premium',
            balance: 0.0,
            autoRefillAmount: 100.00,
            autoRefillEnabled: false,
            autoRefillThreshold: 50.00,
            timezone: 'UTC'
          }
        });
      }

      // Crear usuario
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash(body.password, 10);
      
      const user = await this.prisma.user.create({
        data: {
          email: body.email,
          passwordHash: passwordHash,
          firstName: body.firstName || 'User',
          lastName: body.lastName || 'Name',
          role: 'superadmin',
          status: 'active',
          accountId: account.id
        },
        include: { account: true }
      });

      return {
        success: true,
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          accountId: user.accountId,
          account: user.account
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test complete authentication flow step by step
   */
  @Post('test-auth-flow')
  async testAuthFlow(@Body() body: { email: string; password: string }) {
    try {
      const results = {
        step1_normalizeEmail: null,
        step2_validateCredentials: null,
        step3_validateEmailFormat: null,
        step4_findUser: null,
        step5_verifyPassword: null,
        step6_generateJWT: null,
        final_result: null
      };

      // Step 1: Normalize email
      try {
        const normalizedEmail = body.email.trim().toLowerCase();
        results.step1_normalizeEmail = { success: true, email: normalizedEmail };
      } catch (error) {
        results.step1_normalizeEmail = { success: false, error: error.message };
      }

      // Step 2: Validate credentials
      try {
        const isValid = !!(body.email && body.password);
        results.step2_validateCredentials = { success: true, valid: isValid };
      } catch (error) {
        results.step2_validateCredentials = { success: false, error: error.message };
      }

      // Step 3: Validate email format
      try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValidFormat = emailRegex.test(body.email);
        results.step3_validateEmailFormat = { success: true, valid: isValidFormat };
      } catch (error) {
        results.step3_validateEmailFormat = { success: false, error: error.message };
      }

      // Step 4: Find user
      try {
        const user = await this.prisma.user.findFirst({
          where: { email: body.email },
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
        results.step4_findUser = { 
          success: true, 
          userFound: !!user,
          user: user ? {
            id: user.id,
            email: user.email,
            role: user.role,
            accountId: user.accountId,
            hasAccount: !!user.account
          } : null
        };
      } catch (error) {
        results.step4_findUser = { success: false, error: error.message };
      }

      // Step 5: Verify password
      try {
        const user = await this.prisma.user.findFirst({
          where: { email: body.email }
        });
        if (user) {
          const bcrypt = require('bcryptjs');
          const isValidPassword = await bcrypt.compare(body.password, user.passwordHash);
          results.step5_verifyPassword = { success: true, valid: isValidPassword };
        } else {
          results.step5_verifyPassword = { success: false, error: 'User not found' };
        }
      } catch (error) {
        results.step5_verifyPassword = { success: false, error: error.message };
      }

      // Step 6: Generate JWT
      try {
        const payload = { 
          sub: 'test-user-id', 
          email: body.email, 
          accountId: 'test-account-id', 
          role: 'user' 
        };
        const token = this.jwtService.sign(payload);
        results.step6_generateJWT = { success: true, token: token.substring(0, 50) + '...' };
      } catch (error) {
        results.step6_generateJWT = { success: false, error: error.message };
      }

      // Final result
      results.final_result = {
        success: true,
        message: 'Authentication flow test completed',
        timestamp: new Date().toISOString()
      };

      return results;

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Direct database test without AuthService
   */
  @Post('direct-db-test')
  async directDbTest(@Body() body: AuthenticationCredentialsDto) {
    try {
      // Buscar usuario directamente
      const user = await this.prisma.user.findFirst({
        where: { email: body.email },
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

      if (!user) {
        return {
          success: true,
          message: 'User not found',
          user: null,
          timestamp: new Date().toISOString()
        };
      }

      // Verificar contraseña directamente
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(body.password, user.passwordHash);

      return {
        success: true,
        message: 'Direct database test completed',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          accountId: user.accountId,
          hasAccount: !!user.account,
          account: user.account
        },
        passwordValid: isValidPassword,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test different database query types
   */
  @Get('query-test')
  async queryTest() {
    try {
      const results = {
        simpleCount: null,
        findFirstWithoutInclude: null,
        findFirstWithInclude: null,
        findFirstWithSelect: null
      };

      // Test 1: Simple count (works)
      try {
        const userCount = await this.prisma.user.count();
        results.simpleCount = { success: true, count: userCount };
      } catch (error) {
        results.simpleCount = { success: false, error: error.message };
      }

      // Test 2: findFirst without include (should work)
      try {
        const user = await this.prisma.user.findFirst({
          where: { email: 'test@prixagent.com' }
        });
        results.findFirstWithoutInclude = { 
          success: true, 
          userFound: !!user,
          userId: user?.id
        };
      } catch (error) {
        results.findFirstWithoutInclude = { success: false, error: error.message };
      }

      // Test 3: findFirst with include (this might fail)
      try {
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
        results.findFirstWithInclude = { 
          success: true, 
          userFound: !!user,
          hasAccount: !!user?.account
        };
      } catch (error) {
        results.findFirstWithInclude = { success: false, error: error.message };
      }

      // Test 4: findFirst with select (alternative to include)
      try {
        const user = await this.prisma.user.findFirst({
          where: { email: 'test@prixagent.com' },
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            accountId: true
          }
        });
        results.findFirstWithSelect = { 
          success: true, 
          userFound: !!user
        };
      } catch (error) {
        results.findFirstWithSelect = { success: false, error: error.message };
      }

      return {
        success: true,
        message: 'Query test completed',
        results,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Simulate exact AuthService.validateUser logic
   */
  @Post('simulate-auth-service')
  async simulateAuthService(@Body() body: AuthenticationCredentialsDto) {
    try {
      const results = {
        step1_normalizeEmail: null,
        step2_validateCredentials: null,
        step3_validateEmailFormat: null,
        step4_findUser: null,
        step5_verifyPassword: null,
        step6_sanitizeUserData: null,
        step7_generateJWT: null,
        final_result: null
      };

      // Step 1: Normalize email (exact same as AuthService)
      try {
        const normalizedEmail = body.email.trim().toLowerCase();
        results.step1_normalizeEmail = { success: true, email: normalizedEmail };
      } catch (error) {
        results.step1_normalizeEmail = { success: false, error: error.message };
      }

      // Step 2: Validate credentials (exact same as AuthService)
      try {
        const isValid = !!(body.email && body.password);
        results.step2_validateCredentials = { success: true, valid: isValid };
      } catch (error) {
        results.step2_validateCredentials = { success: false, error: error.message };
      }

      // Step 3: Validate email format (exact same as AuthService)
      try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValidFormat = emailRegex.test(body.email);
        results.step3_validateEmailFormat = { success: true, valid: isValidFormat };
      } catch (error) {
        results.step3_validateEmailFormat = { success: false, error: error.message };
      }

      // Step 4: Find user (exact same as AuthService)
      try {
        const user = await this.prisma.user.findFirst({
          where: { email: body.email },
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
        results.step4_findUser = { 
          success: true, 
          userFound: !!user,
          user: user ? {
            id: user.id,
            email: user.email,
            role: user.role,
            accountId: user.accountId,
            hasAccount: !!user.account,
            account: user.account
          } : null
        };
      } catch (error) {
        results.step4_findUser = { success: false, error: error.message };
      }

      // Step 5: Verify password (exact same as AuthService)
      try {
        const user = await this.prisma.user.findFirst({
          where: { email: body.email }
        });
        if (user) {
          const bcrypt = require('bcryptjs');
          const isValidPassword = await bcrypt.compare(body.password, user.passwordHash);
          results.step5_verifyPassword = { success: true, valid: isValidPassword };
        } else {
          results.step5_verifyPassword = { success: false, error: 'User not found' };
        }
      } catch (error) {
        results.step5_verifyPassword = { success: false, error: error.message };
      }

      // Step 6: Sanitize user data (exact same as AuthService)
      try {
        const user = await this.prisma.user.findFirst({
          where: { email: body.email },
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
        if (user) {
          // Simulate sanitizeUserData
          const { passwordHash, ...userWithoutPassword } = user;
          results.step6_sanitizeUserData = { 
            success: true, 
            sanitizedUser: {
              id: userWithoutPassword.id,
              email: userWithoutPassword.email,
              role: userWithoutPassword.role,
              accountId: userWithoutPassword.accountId,
              account: userWithoutPassword.account
            }
          };
        } else {
          results.step6_sanitizeUserData = { success: false, error: 'User not found' };
        }
      } catch (error) {
        results.step6_sanitizeUserData = { success: false, error: error.message };
      }

      // Step 7: Generate JWT (exact same as AuthService)
      try {
        const user = await this.prisma.user.findFirst({
          where: { email: body.email },
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
        if (user) {
          const payload = { 
            sub: user.id, 
            email: user.email, 
            accountId: user.accountId, 
            role: user.role 
          };
          const token = this.jwtService.sign(payload);
          results.step7_generateJWT = { success: true, token: token.substring(0, 50) + '...' };
        } else {
          results.step7_generateJWT = { success: false, error: 'User not found' };
        }
      } catch (error) {
        results.step7_generateJWT = { success: false, error: error.message };
      }

      // Final result
      results.final_result = {
        success: true,
        message: 'AuthService simulation completed',
        timestamp: new Date().toISOString()
      };

      return results;

    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Direct login bypassing AuthService completely
   */
  @Post('direct-login')
  @UseInterceptors(TimeoutInterceptor)
  async directLogin(@Body() body: AuthenticationCredentialsDto) {
    try {
      // Step 1: Find user directly
      const user = await this.prisma.user.findFirst({
        where: { email: body.email },
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

      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado',
          timestamp: new Date().toISOString()
        };
      }

      // Step 2: Verify password directly
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(body.password, user.passwordHash);

      if (!isValidPassword) {
        return {
          success: false,
          message: 'Contraseña incorrecta',
          timestamp: new Date().toISOString()
        };
      }

      // Step 3: Generate JWT directly
      const payload = { 
        sub: user.id, 
        email: user.email, 
        accountId: user.accountId, 
        role: user.role 
      };
      const token = this.jwtService.sign(payload);

      // Step 4: Return success response
      return {
        success: true,
        message: 'Login exitoso',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          accountId: user.accountId,
          account: user.account
        },
        token,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Ultra simple test - no database, no complex logic
   */
  @Get('ultra-simple')
  async ultraSimple() {
    return {
      success: true,
      message: 'Ultra simple test works',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Simple database test - just count
   */
  @Get('simple-db')
  async simpleDb() {
    try {
      const userCount = await this.prisma.user.count();
      return {
        success: true,
        userCount,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Environment and configuration debug
   */
  @Get('env-debug')
  async envDebug() {
    return {
      success: true,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        isProduction: process.env.NODE_ENV === 'production',
        API_HOST: process.env.API_HOST,
        API_PROTOCOL: process.env.API_PROTOCOL,
        PORT: process.env.PORT,
        API_PORT: process.env.API_PORT,
        APP_URL: process.env.APP_URL,
        CORS_ORIGIN: process.env.CORS_ORIGIN,
        DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
        JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT_SET'
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Direct login WITHOUT TimeoutInterceptor (test)
   */
  @Post('direct-login-no-timeout')
  async directLoginNoTimeout(@Body() body: AuthenticationCredentialsDto) {
    try {
      // Step 1: Find user directly
      const user = await this.prisma.user.findFirst({
        where: { email: body.email },
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

      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado',
          timestamp: new Date().toISOString()
        };
      }

      // Step 2: Verify password directly
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(body.password, user.passwordHash);

      if (!isValidPassword) {
        return {
          success: false,
          message: 'Contraseña incorrecta',
          timestamp: new Date().toISOString()
        };
      }

      // Step 3: Generate JWT directly
      const payload = { 
        sub: user.id, 
        email: user.email, 
        accountId: user.accountId, 
        role: user.role 
      };
      const token = this.jwtService.sign(payload);

      // Step 4: Return success response
      return {
        success: true,
        message: 'Login exitoso',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          accountId: user.accountId,
          account: user.account
        },
        token,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Ultra simple POST test - no database, no complex logic
   */
  @Post('ultra-simple-post')
  async ultraSimplePost(@Body() body: DiagnosticDataDto) {
    return {
      success: true,
      message: 'Ultra simple POST test works',
      receivedBody: body,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Minimal POST test - no validation, no middleware
   */
  @Post('minimal-post')
  async minimalPost(@Body() body: any) {
    return {
      success: true,
      message: 'Minimal POST test works',
      receivedBody: body,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * GET test with query parameters instead of POST body
   */
  @Get('test-with-query')
  async testWithQuery(@Query() query: any) {
    return {
      success: true,
      message: 'GET with query parameters works',
      receivedQuery: query,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Request analysis endpoint - analyze request details
   */
  @Post('request-analysis')
  async requestAnalysis(@Body() body: any, @Request() req: any) {
    return {
      success: true,
      message: 'Request analysis completed',
      request: {
        method: req.method,
        url: req.url,
        headers: {
          'content-type': req.headers['content-type'],
          'content-length': req.headers['content-length'],
          'user-agent': req.headers['user-agent'],
          'x-forwarded-for': req.headers['x-forwarded-for'],
          'x-forwarded-proto': req.headers['x-forwarded-proto'],
          'x-real-ip': req.headers['x-real-ip'],
          'host': req.headers['host']
        },
        body: body,
        bodyType: typeof body,
        bodyKeys: body ? Object.keys(body) : [],
        bodyStringified: JSON.stringify(body),
        bodyLength: JSON.stringify(body).length,
        rawBody: req.body,
        rawBodyType: typeof req.body,
        rawBodyKeys: req.body ? Object.keys(req.body) : []
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Deep request analysis - capture raw request data
   */
  @Post('deep-analysis')
  async deepAnalysis(@Request() req: any) {
    // Capture raw request data before any processing
    const rawData = {
      method: req.method,
      url: req.url,
      originalUrl: req.originalUrl,
      baseUrl: req.baseUrl,
      path: req.path,
      query: req.query,
      params: req.params,
      headers: req.headers,
      body: req.body,
      rawBody: req.rawBody,
      readable: req.readable,
      readableEnded: req.readableEnded,
      readableFlowing: req.readableFlowing,
      readableHighWaterMark: req.readableHighWaterMark,
      readableLength: req.readableLength,
      readableObjectMode: req.readableObjectMode,
      destroyed: req.destroyed,
      aborted: req.aborted,
      complete: req.complete,
      httpVersion: req.httpVersion,
      httpVersionMajor: req.httpVersionMajor,
      httpVersionMinor: req.httpVersionMinor,
      connection: req.connection ? {
        remoteAddress: req.connection.remoteAddress,
        remotePort: req.connection.remotePort,
        localAddress: req.connection.localAddress,
        localPort: req.connection.localPort
      } : null,
      socket: req.socket ? {
        remoteAddress: req.socket.remoteAddress,
        remotePort: req.socket.remotePort,
        localAddress: req.socket.localAddress,
        localPort: req.socket.localPort
      } : null
    };

    return {
      success: true,
      message: 'Deep analysis completed',
      rawData,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Test POST with minimal body parsing
   */
  @Post('test-post-minimal')
  async testPostMinimal(@Body() body: any, @Request() req: any) {
    return {
      success: true,
      message: 'POST test completed',
      data: {
        receivedBody: body,
        bodyType: typeof body,
        bodyKeys: body ? Object.keys(body) : [],
        rawBody: (req as any).rawBody ? (req as any).rawBody.toString() : null,
        headers: {
          'content-type': req.headers['content-type'],
          'content-length': req.headers['content-length']
        }
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Middleware debugging endpoint - capture request state
   */
  @Post('middleware-debug')
  async middlewareDebug(@Request() req: any) {
    const debugInfo = {
      request: {
        method: req.method,
        url: req.url,
        originalUrl: req.originalUrl,
        headers: req.headers,
        body: req.body,
        bodyType: typeof req.body,
        bodyKeys: req.body ? Object.keys(req.body) : [],
        rawBody: (req as any).rawBody,
        rawBodyType: typeof (req as any).rawBody,
        rawBodyLength: (req as any).rawBody ? (req as any).rawBody.length : 0,
        readable: req.readable,
        readableEnded: req.readableEnded,
        readableFlowing: req.readableFlowing,
        readableLength: req.readableLength,
        destroyed: req.destroyed,
        aborted: req.aborted,
        complete: req.complete
      },
      middleware: {
        proxyFixApplied: !!(req as any).__proxyFixApplied,
        bodyParsingApplied: !!(req as any).__bodyParsingApplied,
        rawBodyErrorApplied: !!(req as any).__rawBodyErrorApplied
      }
    };

    return {
      success: true,
      message: 'Middleware debug completed',
      debugInfo,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Raw request capture - no middleware interference
   */
  @Post('raw-request')
  async rawRequest(@Request() req: any) {
    // Capture raw request data without any processing
    const rawData = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      rawBody: (req as any).rawBody,
      readable: req.readable,
      readableEnded: req.readableEnded,
      readableFlowing: req.readableFlowing,
      readableLength: req.readableLength,
      destroyed: req.destroyed,
      aborted: req.aborted,
      complete: req.complete,
      httpVersion: req.httpVersion
    };

    return {
      success: true,
      message: 'Raw request captured',
      rawData,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Login using GET with query parameters (alternative to POST)
   */
  @Get('login-get')
  async loginGet(@Query() query: { email: string; password: string }) {
    try {
      if (!query.email || !query.password) {
        return {
          success: false,
          message: 'Email and password are required',
          timestamp: new Date().toISOString()
        };
      }

      // Step 1: Find user directly
      const user = await this.prisma.user.findFirst({
        where: { email: query.email },
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

      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado',
          timestamp: new Date().toISOString()
        };
      }

      // Step 2: Verify password directly
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(query.password, user.passwordHash);

      if (!isValidPassword) {
        return {
          success: false,
          message: 'Contraseña incorrecta',
          timestamp: new Date().toISOString()
        };
      }

      // Step 3: Generate JWT directly
      const payload = { 
        sub: user.id, 
        email: user.email, 
        accountId: user.accountId, 
        role: user.role 
      };
      const token = this.jwtService.sign(payload);

      // Step 4: Return success response
      return {
        success: true,
        message: 'Login exitoso',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          accountId: user.accountId,
          account: user.account
        },
        token,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };
    }
  }
}
