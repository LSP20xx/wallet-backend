import { PassportSerializer } from '@nestjs/passport';

export class SessionSerializer extends PassportSerializer {
  serializeUser(user: any, done: (err: Error | null, user: any) => void) {
    console.log('serializeUser', user);
    done(null, {
      id: user.id,
    });
  }

  deserializeUser(
    payload: any,
    done: (err: Error | null, payload: string) => void,
  ) {
    console.log('deserializeUser', payload);
    done(null, payload);
  }
}
