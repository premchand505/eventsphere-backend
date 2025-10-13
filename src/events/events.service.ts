import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { StorageService } from 'src/storage/storage.service'; // 1. Import StorageService

@Injectable()
export class EventsService {
  // 2. Inject StorageService
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  // 3. Update createEvent to handle the file
  async createEvent(
    dto: CreateEventDto,
    userId: string,
    imageFile?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined = undefined;

    if (imageFile) {
      imageUrl = await this.storageService.uploadFile(imageFile);
    }

    return this.prisma.event.create({
      data: {
        ...dto,
        imageUrl, // Save the URL to the database
        hostId: userId,
      },
    });
  }

  getAllEvents(filters: { location?: string; name?: string; genre?: string; limit?: number }) {
    const { location, name, genre, limit } = filters;
    const where: Prisma.EventWhereInput = {};

    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (name) where.title = { contains: name, mode: 'insensitive' };
    if (genre) where.genre = { equals: genre, mode: 'insensitive' };

    return this.prisma.event.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit, // Add the limit here
    });
  }

  getHostedEvents(userId: string) {
    // ...
    return this.prisma.event.findMany({
      where: { hostId: userId },
      include: { _count: { select: { registrations: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async getEventById(eventId: string, userId?: string) {
    // ...
    const event = await this.prisma.event.findUniqueOrThrow({
      where: { id: eventId },
      include: { host: { select: { id: true, email: true, firstName: true, lastName: true } } },
    });
    let isRegistered = false;
    if (userId) {
      const registration = await this.prisma.registration.findFirst({
        where: { eventId: eventId, userId: userId },
      });
      if (registration) isRegistered = true;
    }
    return { ...event, isRegistered };
  }

  async updateEvent(userId: string, eventId: string, dto: UpdateEventDto) {
    // ...
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event || event.hostId !== userId) throw new ForbiddenException('Access to resources denied');
    return this.prisma.event.update({ where: { id: eventId }, data: { ...dto } });
  }

  async deleteEvent(userId: string, eventId: string) {
    // ...
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event || event.hostId !== userId) throw new ForbiddenException('Access to resources denied');
    await this.prisma.registration.deleteMany({ where: { eventId: eventId } });
    await this.prisma.event.delete({ where: { id: eventId } });
  }
}