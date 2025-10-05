import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RegistrationsService {
  constructor(private prisma: PrismaService) {}

  async createRegistration(eventId: string, userId: string) {
    // We use a transaction to ensure both checks and the creation happen atomically
    return this.prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: eventId },
      });
      if (!event) {
        throw new NotFoundException('Event not found');
      }

      // Business Logic Rule 1: A user cannot register for their own event.
      if (event.hostId === userId) {
        throw new ForbiddenException('You cannot register for your own event.');
      }

      // Business Logic Rule 2: A user cannot register for the same event twice.
      const existingRegistration = await tx.registration.findFirst({
        where: { eventId, userId },
      });
      if (existingRegistration) {
        throw new ConflictException('You are already registered for this event.');
      }

      // Business Logic Rule 3: Check if the event is full.
      const registrationCount = await tx.registration.count({
        where: { eventId },
      });
      if (registrationCount >= event.capacity) {
        throw new ForbiddenException('This event has reached full capacity.');
      }

      // If all checks pass, create the registration.
      const registration = await tx.registration.create({
        data: {
          eventId,
          userId,
        },
      });

      return registration;
    });
  }
}