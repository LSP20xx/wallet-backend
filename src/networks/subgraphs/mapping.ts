import { Transfer as TransferEvent } from 'generated/ERC20Token/ERC20';
import { Transfer } from 'generated/schema';

export function handleTransfer(event: TransferEvent): void {
  const id = event.transaction.hash.toHex() + '-' + event.logIndex.toString();
  const entity = new Transfer(id);
  entity.from = event.params.from;
  entity.to = event.params.to;
  entity.value = event.params.value;
  entity.save();
}
