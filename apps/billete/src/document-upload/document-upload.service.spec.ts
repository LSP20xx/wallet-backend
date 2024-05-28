import { Test, TestingModule } from '@nestjs/testing';
import { DocumentUploadService } from './document-upload.service';

describe('DocumentUploadService', () => {
  let service: DocumentUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentUploadService],
    }).compile();

    service = module.get<DocumentUploadService>(DocumentUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
