import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(    private usersService: UsersService,
) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'my-super-secret-key',
    });
  }

  async validate(payload: { sub: number; email: string; role?: string }) {
        const user = await this.usersService.findById(payload.sub);

    return {
      id: payload.sub,
      userId: payload.sub,
      email: payload.email,
      name: user?.name,
      role: user?.role ?? payload.role,
    };
  }
}
