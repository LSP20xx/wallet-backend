import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './services/database/database.service';
import { EvmNetworkModule } from 'src/networks/evm-network.module';

@Global()
@Module({
  imports: [EvmNetworkModule],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
