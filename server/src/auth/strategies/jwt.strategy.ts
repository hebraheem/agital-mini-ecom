import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('auth.jwtSecret') as string,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // Todo: Get user from database and check if user exists
    const user = {};
    if (!user) {
      throw new UnauthorizedException('User not authorized');
    }
    return { sub: payload.sub, name: payload.name, email: payload.email };
  }
}
