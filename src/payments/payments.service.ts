import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegistrationsService } from 'src/registrations/registrations.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private registrationsService: RegistrationsService,
  ) {
    this.stripe = new Stripe(this.config.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2025-09-30.clover',
    });
  }

  async createCheckoutSession(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // This logic will now work correctly because NODE_ENV is set
    const frontendUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3001'
        : this.config.get('FRONTEND_URL');

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: event.title,
              description: event.description,
            },
            unit_amount: Math.round(event.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/events/${eventId}`,
      metadata: {
        eventId,
        userId,
      },
    });

    return { url: session.url };
  }

  async handleWebhookEvent(signature: string, body: Buffer) {
    // ... (rest of the file is correct)
    const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET')!;
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      throw new ForbiddenException('Invalid webhook signature');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, eventId } = session.metadata!;
      
      await this.registrationsService.createRegistration(eventId, userId);
    }

    return { received: true };
  }
}