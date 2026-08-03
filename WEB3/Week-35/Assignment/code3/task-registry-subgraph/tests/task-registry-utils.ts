import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  OwnerChanged,
  StatusUpdated,
  TaskAssigned,
  TaskCreated
} from "../generated/TaskRegistry/TaskRegistry"

export function createOwnerChangedEvent(
  previousOwner: Address,
  newOwner: Address
): OwnerChanged {
  let ownerChangedEvent = changetype<OwnerChanged>(newMockEvent())

  ownerChangedEvent.parameters = new Array()

  ownerChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownerChangedEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownerChangedEvent
}

export function createStatusUpdatedEvent(
  id: BigInt,
  newStatus: i32
): StatusUpdated {
  let statusUpdatedEvent = changetype<StatusUpdated>(newMockEvent())

  statusUpdatedEvent.parameters = new Array()

  statusUpdatedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  statusUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newStatus",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(newStatus))
    )
  )

  return statusUpdatedEvent
}

export function createTaskAssignedEvent(id: BigInt, to: Address): TaskAssigned {
  let taskAssignedEvent = changetype<TaskAssigned>(newMockEvent())

  taskAssignedEvent.parameters = new Array()

  taskAssignedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  taskAssignedEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )

  return taskAssignedEvent
}

export function createTaskCreatedEvent(
  id: BigInt,
  description: string
): TaskCreated {
  let taskCreatedEvent = changetype<TaskCreated>(newMockEvent())

  taskCreatedEvent.parameters = new Array()

  taskCreatedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  taskCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "description",
      ethereum.Value.fromString(description)
    )
  )

  return taskCreatedEvent
}
