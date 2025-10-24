import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    // Buscar usuario por email
    const user = await this.prisma.user.findFirst({
      where: { email },
      include: { account: true },
    });

    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      return {
        message: 'Si el email existe, se enviará un enlace de recuperación',
      };
    }

    // Generar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en la base de datos
    await this.prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt: resetTokenExpiry,
      },
    });

    // En un entorno real, aquí enviarías el email
    // Por ahora, solo logueamos el token para desarrollo
    // console.log(`Password reset token for ${email}: ${resetToken}`);
    // const resetUrl = `${process.env.APP_URL || `${process.env.API_PROTOCOL || 'http'}://${process.env.API_HOST || 'localhost'}:${process.env.CLIENT_PORT || '3001'}`}/reset-password?token=${resetToken}`;
    // console.log(`Reset URL: ${resetUrl}`);

    return {
      message: 'Si el email existe, se enviará un enlace de recuperación',
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // Buscar token válido
    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: { user: true },
    });

    if (!resetToken) {
      throw new BadRequestException('Token inválido o expirado');
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 8); // Reducido de 10 a 8 para mejor rendimiento

    // Actualizar contraseña del usuario
    await this.prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: hashedPassword },
    });

    // Eliminar token usado
    await this.prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  async validateResetToken(
    token: string,
  ): Promise<{ valid: boolean; message: string }> {
    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!resetToken) {
      return { valid: false, message: 'Token inválido o expirado' };
    }

    return { valid: true, message: 'Token válido' };
  }
}
