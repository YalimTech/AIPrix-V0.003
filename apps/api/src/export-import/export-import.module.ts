import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ExportImportController } from './export-import.controller';
import { ExportImportService } from './export-import.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    MulterModule.register({
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
      },
      fileFilter: (req, file, callback) => {
        const allowedMimes = [
          'text/csv',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/json',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error('Tipo de archivo no permitido'), false);
        }
      },
    }),
  ],
  controllers: [ExportImportController],
  providers: [ExportImportService],
  exports: [ExportImportService],
})
export class ExportImportModule {}
