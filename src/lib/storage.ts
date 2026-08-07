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

function createStorage(): StorageAdapter {
  const driver = process.env.STORAGE_DRIVER ?? 'local';
  switch (driver) {
    case 'local':
      return new LocalStorageAdapter();
    default:
      throw new Error(`Unknown STORAGE_DRIVER "${driver}" — only "local" is implemented so far`);
  }
}

export const storage = createStorage();
