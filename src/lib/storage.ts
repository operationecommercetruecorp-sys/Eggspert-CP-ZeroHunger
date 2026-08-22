import 'server-only';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export interface UploadInput {
  buffer: Buffer;
  filename: string;
}

export interface StorageAdapter {
  /** Stores a file under `folder` and returns its publicly reachable URL. */
  upload(input: UploadInput, folder: string): Promise<{ url: string }>;
}

// Local-disk stub for development: writes into public/uploads/<folder>/.
// Swap STORAGE_DRIVER to a real adapter (S3 / Supabase Storage) once credentials
// exist — every call site only depends on the StorageAdapter interface above.
class LocalStorageAdapter implements StorageAdapter {
  async upload(input: UploadInput, folder: string): Promise<{ url: string }> {
    const safeExt = path.extname(input.filename).slice(0, 10);
    const key = `${randomUUID()}${safeExt}`;
    const dir = path.join(process.cwd(), 'public', 'uploads', folder);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, key), input.buffer);
    return { url: `/uploads/${folder}/${key}` };
  }
}

// Works with AWS S3, Supabase Storage (its S3-compatible endpoint), Cloudflare R2, or any
// other S3-protocol object store — set S3_ENDPOINT for anything that isn't real AWS S3.
// Needs an env-configured bucket with public-read access (or a CDN in front of it) since
// uploaded photos/documents are rendered directly with <img src>/<a href>, not signed URLs.
class S3StorageAdapter implements StorageAdapter {
  private clientPromise: Promise<import('@aws-sdk/client-s3').S3Client> | null = null;
  private bucket: string;
  private publicUrlBase: string | null;

  constructor() {
    const bucket = process.env.S3_BUCKET;
    if (!bucket) throw new Error('S3_BUCKET is required when STORAGE_DRIVER=s3');
    this.bucket = bucket;
    this.publicUrlBase = process.env.S3_PUBLIC_URL_BASE?.replace(/\/$/, '') ?? null;
  }

  private async getClient() {
    if (!this.clientPromise) {
      this.clientPromise = import('@aws-sdk/client-s3').then(({ S3Client }) => {
        const endpoint = process.env.S3_ENDPOINT;
        const accessKeyId = process.env.S3_ACCESS_KEY_ID;
        const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
        if (!accessKeyId || !secretAccessKey) {
          throw new Error('S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY are required when STORAGE_DRIVER=s3');
        }
        return new S3Client({
          region: process.env.S3_REGION || 'auto',
          endpoint: endpoint || undefined,
          forcePathStyle: !!endpoint, // path-style is what R2/Supabase/MinIO expect; real AWS S3 doesn't set S3_ENDPOINT
          credentials: { accessKeyId, secretAccessKey },
        });
      });
    }
    return this.clientPromise;
  }

  async upload(input: UploadInput, folder: string): Promise<{ url: string }> {
    const { PutObjectCommand } = await import('@aws-sdk/client-s3');
    const client = await this.getClient();
    const safeExt = path.extname(input.filename).slice(0, 10);
    const key = `${folder}/${randomUUID()}${safeExt}`;

    await client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: input.buffer,
        ContentType: contentTypeFor(safeExt),
      }),
    );

    const url = this.publicUrlBase
      ? `${this.publicUrlBase}/${key}`
      : `https://${this.bucket}.s3.${process.env.S3_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    return { url };
  }
}

function contentTypeFor(ext: string): string {
  const map: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.csv': 'text/csv',
    '.html': 'text/html',
  };
  return map[ext.toLowerCase()] ?? 'application/octet-stream';
}

function createStorage(): StorageAdapter {
  const driver = process.env.STORAGE_DRIVER ?? 'local';
  switch (driver) {
    case 'local':
      return new LocalStorageAdapter();
    case 's3':
      return new S3StorageAdapter();
    default:
      throw new Error(`Unknown STORAGE_DRIVER "${driver}" — expected "local" or "s3"`);
  }
}

export const storage = createStorage();
