import { Transfer } from '../generated/ERC20Token/ERC20Token';
import { TransferEntity } from '../generated/schema';

export function handleTransfer(event: Transfer): void {
  const entity = new TransferEntity(event.transaction.hash.toHex());
  entity.from = event.params.from;
  entity.to = event.params.to;
  entity.value = event.params.value;
  entity.save();
}
