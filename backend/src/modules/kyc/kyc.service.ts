import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import {
  KycDocument,
  kycDocumentView,
} from '../../database/entities/kyc-document.entity';

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const MAX_BYTES = 10 * 1024 * 1024;

@Injectable()
export class KycService {
  private readonly uploadRoot = process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads');

  constructor(
    @InjectRepository(KycDocument)
    private readonly docs: Repository<KycDocument>,
  ) {}

  private userDir(userId: string) {
    return join(this.uploadRoot, 'kyc', userId);
  }

  async uploadForUser(
    userId: string,
    file: Express.Multer.File | undefined,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('File is required');
    }
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException('Allowed types: PDF, JPEG, PNG, WEBP');
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException('File too large (max 10 MB)');
    }

    const dir = this.userDir(userId);
    await mkdir(dir, { recursive: true });
    const storedName = `${randomUUID()}-${file.originalname.replace(/[^\w.\-()]+/g, '_')}`;
    const filePath = join(dir, storedName);
    await writeFile(filePath, file.buffer);

    const doc = this.docs.create({
      userId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      filePath,
      status: 'pending',
    });
    await this.docs.save(doc);
    return kycDocumentView(doc);
  }

  async listForUser(userId: string) {
    const rows = await this.docs.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return rows.map(kycDocumentView);
  }

  async listForAdmin(userId: string) {
    return this.listForUser(userId);
  }

  async getFileForUser(userId: string, docId: string) {
    const doc = await this.docs.findOne({ where: { id: docId, userId } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async getFileForAdmin(docId: string) {
    const doc = await this.docs.findOne({ where: { id: docId } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }
}
