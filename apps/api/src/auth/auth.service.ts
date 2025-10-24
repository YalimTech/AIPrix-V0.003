import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly BCRYPT_ROUNDS = 8;
  private readonly TIMING_ATTACK_DELAY = 10;

  constructor(
    private readonly _prisma: PrismaService,
    private readonly _usersService: UsersService,
    private readonly _jwtService: JwtService,
    private readonly _configService: ConfigService,
  ) {}

  /**
   * Validates user credentials against the database
   * @param email - User email address
   * @param password - User password
   * @returns User data if valid, null otherwise
   */
  async validateUser(email: string, password: string): Promise<{ id: string; email: string; role: string; accountId: string } | null> {
    try {
      const normalizedEmail = this.normalizeEmail(email);

      if (!this.isValidCredentials(normalizedEmail, password)) {
        return null;
      }

      if (!this.isValidEmailFormat(normalizedEmail)) {
        return null;
      }

      const user = await this.findUserByEmail(normalizedEmail);

      if (!user || !this.isUserActive(user)) {
        await this.simulateTimingAttack();
        return null;
      }

      const isPasswordValid = await this.verifyPassword(password, user.passwordHash);

      if (isPasswordValid) {
        return this.sanitizeUserData(user);
      }

      await this.simulateTimingAttack();
      return null;

    } catch (error) {
      console.error('AuthService validation error:', error.message);
      console.error('AuthService validation error stack:', error.stack);
      // No re-lanzar el error para evitar 500, devolver null en su lugar
      return null;
    }
  }

  /**
   * Authenticates user and returns JWT token
   * @param loginDto - Login credentials
   * @returns Authentication response with token and user data
   */
  async login(loginDto: LoginDto) {
    try {
      this.validateLoginCredentials(loginDto);

      const user = await this.validateUser(loginDto.email, loginDto.password);
      
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verificar si el usuario está activo (asumiendo que todos los usuarios están activos por defecto)
      // if (user.status !== 'active') {
      //   throw new UnauthorizedException('Account is inactive');
      // }

      const token = this.generateJwtToken(user);
      const userResponse = this.buildUserResponse(user);

      return {
        access_token: token,
        user: userResponse,
      };
    } catch (error) {
      console.error('AuthService login error:', error.message);
      console.error('AuthService login error stack:', error.stack);
      // Re-lanzar solo errores específicos, no errores de base de datos
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Para otros errores, lanzar UnauthorizedException genérico
      throw new UnauthorizedException('Authentication failed');
    }
  }

  /**
   * Registers a new user
   * @param registerDto - Registration data
   * @returns Registration response
   */
  async register(registerDto: RegisterDto) {
    await this.validateRegistrationData(registerDto);

    const passwordHash = await this.hashPassword(registerDto.password);

    const user = await this._prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        accountId: registerDto.accountId,
        role: registerDto.role || 'user',
      },
      include: { account: true },
    });

    return {
      message: 'User registered successfully',
      user: this.sanitizeUserData(user),
    };
  }

  /**
   * Refreshes JWT token for a user
   * @param userId - User ID
   * @returns New JWT token
   */
  async refreshToken(userId: string) {
    const user = await this.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      access_token: this.generateJwtToken(user),
    };
  }

  /**
   * Logs out a user
   * @param userId - User ID
   * @returns Logout confirmation
   */
  async logout(userId: string) {
    // In a production environment, you might want to implement token blacklisting
    return { message: 'Logged out successfully' };
  }

  /**
   * Changes user password
   * @param userId - User ID
   * @param changePasswordDto - Password change data
   * @returns Success message
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentPasswordValid = await this.verifyPassword(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newPasswordHash = await this.hashPassword(changePasswordDto.newPassword);

    await this._prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { message: 'Password updated successfully' };
  }

  /**
   * Updates user profile
   * @param userId - User ID
   * @param updateProfileDto - Profile update data
   * @returns Updated user data
   */
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.validateEmailUniqueness(updateProfileDto.email, user);

    const updatedUser = await this._prisma.user.update({
      where: { id: userId },
      data: this.buildUpdateData(updateProfileDto),
      include: { account: true },
    });

    return {
      message: 'Profile updated successfully',
      user: this.sanitizeUserData(updatedUser),
    };
  }

  // Private helper methods

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private isValidCredentials(email: string, password: string): boolean {
    return !!(email && password);
  }

  private isValidEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async findUserByEmail(email: string) {
    try {
      const user = await this._prisma.user.findFirst({
        where: { email },
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
      return user;
    } catch (error) {
      console.error('AuthService findUserByEmail error:', error.message);
      return null;
    }
  }

  private async findUserById(userId: string) {
    return this._prisma.user.findUnique({
      where: { id: userId },
      include: { account: true },
    });
  }

  private isUserActive(user: any): boolean {
    // return user.status === 'active';
    return true; // Asumiendo que todos los usuarios están activos por defecto
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('AuthService verifyPassword error:', error.message);
      return false;
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.BCRYPT_ROUNDS);
  }

  private async simulateTimingAttack(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, this.TIMING_ATTACK_DELAY));
  }

  private sanitizeUserData(user: any) {
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private validateLoginCredentials(loginDto: LoginDto): void {
    if (!loginDto.email || !loginDto.password) {
      throw new UnauthorizedException('Email and password are required');
    }
  }

  private async validateRegistrationData(registerDto: RegisterDto): Promise<void> {
    const existingUser = await this._prisma.user.findFirst({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const account = await this._prisma.account.findUnique({
      where: { id: registerDto.accountId },
    });

    if (!account) {
      throw new BadRequestException('Account not found');
    }
  }

  private generateJwtToken(user: any): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      accountId: user.accountId,
      role: user.role,
    };

    return this._jwtService.sign(payload);
  }

  private buildUserResponse(user: any) {
    return {
      id: user.id,
      email: user.email,
      accountId: user.accountId,
      firstName: user.firstName || 'User',
      lastName: user.lastName || 'Name',
      role: user.role,
      account: user.account ? {
        id: user.account.id,
        name: user.account.name,
        slug: user.account.slug || 'default-account',
      } : {
        id: user.accountId || 'default-account',
        name: 'Default Account',
        slug: 'default-account',
      },
    };
  }

  private async validateEmailUniqueness(email: string, currentUser: any): Promise<void> {
    if (email && email !== currentUser.email) {
      const existingUser = await this._prisma.user.findFirst({
        where: {
          email,
          accountId: currentUser.accountId,
        },
      });

      if (existingUser) {
        throw new BadRequestException('Email is already in use');
      }
    }
  }

  private buildUpdateData(updateProfileDto: UpdateProfileDto) {
    return {
      ...(updateProfileDto.email && { email: updateProfileDto.email }),
      ...(updateProfileDto.firstName !== undefined && {
        firstName: updateProfileDto.firstName,
      }),
      ...(updateProfileDto.lastName !== undefined && {
        lastName: updateProfileDto.lastName,
      }),
    };
  }
}