import { CountIncreased, CountDecreased } from "../generated/Counter/Counter";
import { CountChangeEvent } from "../generated/schema";

export function handleCountIncreased(event: CountIncreased): void {
  let entity = new CountChangeEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.changedBy = event.params.by;
  entity.newCount = event.params.newCount;
  entity.eventType = "increase";
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.save();
}

export function handleCountDecreased(event: CountDecreased): void {
  let entity = new CountChangeEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.changedBy = event.params.by;
  entity.newCount = event.params.newCount;
  entity.eventType = "decrease";
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.save();
}
