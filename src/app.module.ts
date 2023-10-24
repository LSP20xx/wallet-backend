import { Module } from '@nestjs/common';
import { UsersService } from './users/services/users.service';
import { UsersController } from './users/controllers/users.controller';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({  
    envFilePath: '.env',
    isGlobal: true,
  })
  }), UsersModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class AppModule {}
