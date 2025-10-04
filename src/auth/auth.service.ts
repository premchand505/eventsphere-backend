// Add JwtService and ConfigService to the imports
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// Create a new DTO for signin. It's good practice.
// You can create this in src/auth/dto/signin.dto.ts
// For now, we'll reference SignupDto as it has the same shape.
import { SigninDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
  // Inject JwtService and ConfigService
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // SIGN UP METHOD (remains the same)
  async signup(dto: SignupDto) {
    // ... your existing signup code
    const hash = await bcrypt.hash(dto.password, 10);
    try {
      const user = await this.prisma.user.create({
        data: { email: dto.email, password: hash },
      });
      const { password, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ForbiddenException('Credentials taken');
      }
      throw error;
    }
  }

  // NEW SIGN IN METHOD
  async signin(dto: SigninDto) {
    // 1. Find the user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    // If user does not exist, throw exception
    if (!user) throw new ForbiddenException('Credentials incorrect');

    // 2. Compare passwords
    const pwMatches = await bcrypt.compare(dto.password, user.password);
    // If password incorrect, throw exception
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    // 3. If everything is ok, send back the token
    return this.signToken(user.id, user.email);
  }
  
  // NEW TOKEN SIGNING HELPER
  async signToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }
}