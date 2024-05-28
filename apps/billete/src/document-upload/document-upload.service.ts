import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { DatabaseService } from '../database/services/database/database.service';
import { DocumentType } from '@prisma/client';

@Injectable()
export class DocumentUploadService {
  constructor(private readonly databaseService: DatabaseService) {}

  async uploadDocument(
    file: Express.Multer.File,
    userId: string,
    documentType: DocumentType,
  ): Promise<string> {
    const uploadsDir = path.join(__dirname, '../../uploads');
    const filePath = path.join(uploadsDir, `${userId}_${file.originalname}`);

    try {
      fs.renameSync(file.path, filePath);

      const fileUrl = `/uploads/${userId}_${file.originalname}`;

      await this.databaseService.document.create({
        data: {
          userId,
          type: documentType as any,
          url: fileUrl,
        },
      });

      console.log('Document uploaded and saved locally:', fileUrl);
      return fileUrl;
    } catch (error) {
      console.error('Error saving document locally:', error);
      throw new HttpException(
        'Error saving document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
