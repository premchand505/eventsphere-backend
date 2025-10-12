import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';

@Injectable()
export class StorageService {
  private storage: Storage;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    // --- START OF CORRECTION ---

    // 1. Get values into temporary constants
    const credentialsPath = this.configService.get<string>(
      'GOOGLE_APPLICATION_CREDENTIALS',
    );
    const bucketNameFromEnv = this.configService.get<string>('GCS_BUCKET_NAME');

    // 2. Validate the temporary constants
    if (!credentialsPath) {
      throw new InternalServerErrorException(
        'GOOGLE_APPLICATION_CREDENTIALS environment variable not set.',
      );
    }

    if (!bucketNameFromEnv) {
      throw new InternalServerErrorException(
        'GCS_BUCKET_NAME environment variable not set.',
      );
    }

    // 3. Assign to class properties only after validation
    this.bucketName = bucketNameFromEnv;

    this.storage = new Storage({
      keyFilename: credentialsPath,
    });

    // --- END OF CORRECTION ---
  }

  async generateUploadUrl(
    fileName: string,
    contentType: string,
  ): Promise<string> {
    const options = {
      version: 'v4' as const,
      action: 'write' as const,
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType,
    };

    try {
      const [url] = await this.storage
        .bucket(this.bucketName)
        .file(fileName)
        .getSignedUrl(options);

      return url;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new InternalServerErrorException(
        'Could not generate an upload URL.',
      );
    }
  }
}