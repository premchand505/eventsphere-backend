// 1. Separate the regular and type-only imports
import { Controller, Headers, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common'; // Use 'import type' here
import type { Request } from 'express';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @UseGuards(JwtGuard)
  @Post('checkout-session/:eventId')
  createCheckoutSession(
    @Param('eventId') eventId: string,
    @GetUser('id') userId: string,
  ) {
    return this.paymentsService.createCheckoutSession(eventId, userId);
  }

  @Post('webhook')
  handleWebhook(
    @Headers('stripe-signature') signature: string,
    // The type annotation is now correctly supported
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.paymentsService.handleWebhookEvent(signature, req.rawBody!);
  }
}