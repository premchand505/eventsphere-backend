import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // This decorator makes the module available across the entire app.
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // This makes PrismaService available for injection in other modules.
})
export class PrismaModule {}