import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { TokenPayload } from './types/token-payload.interface';
import { ReqUser } from './types/request-with-user.interface';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  public async getAccessToken(user: ReqUser): Promise<string> {
    const payload: TokenPayload = { userId: user.id };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`
    });
  }

  public async getAuthenticatedUser(email: string, pw: string) {
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return null;
    }

    // separate password
    const { password, ...safeUserData } = user;
    const isPasswordMatching = await bcrypt.compare(pw, password);

    if (!isPasswordMatching) {
      return null;
    }

    return safeUserData;
  }

  async getUserById(userId: number) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true
      }
    });
  }
}
