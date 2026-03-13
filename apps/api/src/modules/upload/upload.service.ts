import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'images';
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

@Injectable()
export class UploadService {
  private supabase: SupabaseClient | null = null;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) {
      console.warn('[Upload] SUPABASE_URL or SUPABASE_SERVICE_KEY not set — upload disabled');
      return;
    }
    this.supabase = createClient(url, key);
  }

  async upload(
    folder: 'brands' | 'categories',
    entityId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    if (!this.supabase) {
      throw new BadRequestException('Upload servisi yapılandırılmamış (Supabase ayarları eksik).');
    }
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw new BadRequestException(
        `Desteklenmeyen dosya tipi: ${file.mimetype}. PNG, JPEG, WebP veya SVG yükleyin.`,
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('Dosya boyutu en fazla 2 MB olabilir.');
    }

    const ext = file.originalname.split('.').pop() || 'png';
    const path = `${folder}/${entityId}.${ext}`;

    const { error } = await this.supabase.storage
      .from(BUCKET)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new BadRequestException(`Upload hatası: ${error.message}`);
    }

    const { data } = this.supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  async delete(publicUrl: string): Promise<void> {
    if (!this.supabase) return;
    // Extract path from public URL: .../storage/v1/object/public/images/brands/xxx.png
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return;

    const path = publicUrl.substring(idx + marker.length);
    await this.supabase.storage.from(BUCKET).remove([path]);
  }
}
