import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      clientID: config.get('GOOGLE_CLIENT_ID')!,
      clientSecret: config.get('GOOGLE_CLIENT_SECRET')!,
      // Use the BACKEND_URL environment variable for the callback
      callbackURL: `${config.get('BACKEND_URL')}/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails } = profile;
    const email = emails[0].value;

    try {
      let user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email: email,
            firstName: name.givenName || 'Google',
            lastName: name.familyName || 'User',
            password: '', // Password is not needed for OAuth users
          },
        });
      }

      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}