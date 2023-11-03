import { Injectable } from '@nestjs/common';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

@Injectable()
export class EncryptionsService {
  private readonly encryptionKey: string;
  private readonly algorithm: string = 'aes-256-cbc';

  constructor() {
    this.encryptionKey = process.env.VERIFICATION_ENCRYPTION_KEY;
  }

  generateIv(): Buffer {
    return randomBytes(16);
  }

  encrypt(code: string): { encryptedData: string; iv: string } {
    const iv = this.generateIv();
    const cipher = createCipheriv(
      this.algorithm,
      Buffer.from(this.encryptionKey, 'hex'),
      iv,
    );
    let encrypted = cipher.update(code, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { encryptedData: encrypted, iv: iv.toString('hex') };
  }

  decrypt(encryptedCode: string): string {
    console.log('encryptedCode', encryptedCode);

    const [encrypted, ivHex] = encryptedCode.split(':');

    const iv = Buffer.from(ivHex, 'hex');

    const keyBuffer = Buffer.from(this.encryptionKey, 'hex');

    const decipher = createDecipheriv(this.algorithm, keyBuffer, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    console.log('decrypted', decrypted);
    return decrypted;
  }
}
