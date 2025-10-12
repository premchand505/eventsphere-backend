    import { Body, Controller, Post, UseGuards } from '@nestjs/common';
    import { StorageService } from './storage.service';
    import { JwtGuard } from  '../auth/guard/jwt.guard'
    import { GenerateUploadUrlDto } from './dto/generate-upload-url.dto';

    @Controller('storage')
    @UseGuards(JwtGuard) // Protect all routes in this controller
    export class StorageController {
      constructor(private readonly storageService: StorageService) {}

      @Post('upload-url')
      async generateUploadUrl(@Body() generateUploadUrlDto: GenerateUploadUrlDto) {
        const { fileName, contentType } = generateUploadUrlDto;
        const url = await this.storageService.generateUploadUrl(
          fileName,
          contentType,
        );
        return { url };
      }
    }
   