import { Injectable } from '@nestjs/common';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
// Se asegura de importar forge de forma adecuada
import * as forge from 'node-forge';

@Injectable()
export class EncryptionsService {
  private readonly encryptionKey: string;
  private readonly algorithm: string = 'aes-256-cbc';
  private readonly circleEntitySecret: string;
  private readonly circlePublicKey: string;

  constructor() {
    this.encryptionKey = process.env.VERIFICATION_ENCRYPTION_KEY;
    this.circleEntitySecret = process.env.CIRCLE_ENTITY_SECRET;
    this.circlePublicKey = process.env.CIRCLE_PUBLIC_KEY;
  }

  generateIv(): Buffer {
    return randomBytes(16);
  }

  encrypt(code: string): string {
    const iv = this.generateIv();
    const cipher = createCipheriv(
      this.algorithm,
      Buffer.from(this.encryptionKey, 'hex'),
      iv,
    );
    let encrypted = cipher.update(code, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${encrypted}:${iv.toString('hex')}`;
  }

  decrypt(encryptedCode: string): string {
    const [encrypted, ivHex] = encryptedCode.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const keyBuffer = Buffer.from(this.encryptionKey, 'hex');
    const decipher = createDecipheriv(this.algorithm, keyBuffer, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  encryptWithPublicKey(): string {
    const entitySecretBytes = forge.util.hexToBytes(this.circleEntitySecret);
    const publicKey = forge.pki.publicKeyFromPem(this.circlePublicKey);
    const encryptedData = publicKey.encrypt(entitySecretBytes, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      mgf1: {
        md: forge.md.sha256.create(),
      },
    });
    return forge.util.encode64(encryptedData);
  }
}
