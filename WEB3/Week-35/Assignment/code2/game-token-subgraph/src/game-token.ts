import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Transfer as TransferEvent } from "../generated/GameToken/GameToken";
import { Transfer, Holder } from "../generated/schema";

const ZERO_ADDRESS = Bytes.fromHexString(
  "0x0000000000000000000000000000000000000000"
);

function getOrCreateHolder(address: Bytes): Holder {
  let holder = Holder.load(address);

  if (holder == null) {
    holder = new Holder(address);
    holder.balance = BigInt.fromI32(0);
  }

  return holder as Holder;
}

export function handleTransfer(event: TransferEvent): void {
  let fromHolder = getOrCreateHolder(event.params.from);
  let toHolder = getOrCreateHolder(event.params.to);

  // A mint comes from address(0), so there is no real sender
  // whose balance should be debited.
  if (!event.params.from.equals(ZERO_ADDRESS)) {
    fromHolder.balance = fromHolder.balance.minus(event.params.value);
  }

  toHolder.balance = toHolder.balance.plus(event.params.value);

  fromHolder.save();
  toHolder.save();

  let transfer = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );

  transfer.from = fromHolder.id;
  transfer.to = toHolder.id;
  transfer.value = event.params.value;
  transfer.blockNumber = event.block.number;
  transfer.blockTimestamp = event.block.timestamp;

  transfer.save();
}
