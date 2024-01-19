import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './services/database/database.service';

@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
