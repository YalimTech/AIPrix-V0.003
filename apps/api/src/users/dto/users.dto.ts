import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';

// ===========================================
// ENUMS
// ===========================================

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

// ===========================================
// CREATE USER DTO
// ===========================================

export class CreateUserDto {
  @IsEmail({}, { message: 'El email debe ser una dirección de correo válida' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El apellido no puede exceder 100 caracteres' })
  lastName?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol del usuario no es válido' })
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus, { message: 'El estado del usuario no es válido' })
  status?: UserStatus;
}

// ===========================================
// UPDATE USER DTO
// ===========================================

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'El email debe ser una dirección de correo válida' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password?: string;

  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El apellido no puede exceder 100 caracteres' })
  lastName?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol del usuario no es válido' })
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus, { message: 'El estado del usuario no es válido' })
  status?: UserStatus;
}

// ===========================================
// USER RESPONSE DTO
// ===========================================

export class UserResponseDto {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  accountId: string;
}

// ===========================================
// USER LIST RESPONSE DTO
// ===========================================

export class UserListResponseDto {
  users: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===========================================
// USER PROFILE DTO
// ===========================================

export class UserProfileDto {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  account: {
    id: string;
    name: string;
    slug: string;
  };
}

// ===========================================
// CHANGE PASSWORD DTO
// ===========================================

export class ChangePasswordDto {
  @IsString({ message: 'La contraseña actual debe ser una cadena de texto' })
  currentPassword: string;

  @IsString({ message: 'La nueva contraseña debe ser una cadena de texto' })
  @MinLength(8, {
    message: 'La nueva contraseña debe tener al menos 8 caracteres',
  })
  newPassword: string;
}

// ===========================================
// RESET PASSWORD DTO
// ===========================================

export class ResetPasswordDto {
  @IsEmail({}, { message: 'El email debe ser una dirección de correo válida' })
  email: string;
}

// ===========================================
// CONFIRM RESET PASSWORD DTO
// ===========================================

export class ConfirmResetPasswordDto {
  @IsString({ message: 'El token debe ser una cadena de texto' })
  token: string;

  @IsString({ message: 'La nueva contraseña debe ser una cadena de texto' })
  @MinLength(8, {
    message: 'La nueva contraseña debe tener al menos 8 caracteres',
  })
  newPassword: string;
}

// ===========================================
// USER STATS DTO
// ===========================================

export class UserStatsDto {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  lastRegistration: Date | null;
}
