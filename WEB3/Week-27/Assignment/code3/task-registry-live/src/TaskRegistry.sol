// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Ownable} from "./Ownable.sol";

contract TaskRegistry is Ownable {
    enum Status {
        Open,
        InProgress,
        Done
    }

    struct Task {
        uint256 id;
        string description;
        address assignedTo;
        Status status;
    }

    mapping(uint256 => Task) private tasks;
    uint256[] private taskIds;
    uint256 private nextId;

    error TaskNotFound(uint256 id);
    error NotAssignee(address caller);

    event TaskCreated(uint256 indexed id, string description);
    event TaskAssigned(uint256 indexed id, address indexed to);
    event StatusUpdated(uint256 indexed id, Status newStatus);

    constructor() Ownable(msg.sender) {}

    modifier taskExists(uint256 id) {
        if (id >= nextId) revert TaskNotFound(id);
        _;
    }

    function createTask(
        string calldata description
    ) external onlyOwner returns (uint256 id) {
        id = nextId;
        tasks[id] = Task({
            id: id,
            description: description,
            assignedTo: address(0),
            status: Status.Open
        });
        taskIds.push(id);
        nextId += 1;
        emit TaskCreated(id, description);
    }

    function assignTask(
        uint256 id,
        address to
    ) external onlyOwner taskExists(id) {
        tasks[id].assignedTo = to;
        emit TaskAssigned(id, to);
    }

    function updateStatus(
        uint256 id,
        Status newStatus
    ) external taskExists(id) {
        Task storage task = tasks[id];
        if (msg.sender != task.assignedTo && msg.sender != owner)
            revert NotAssignee(msg.sender);
        task.status = newStatus;
        emit StatusUpdated(id, newStatus);
    }

    function getTask(
        uint256 id
    ) external view taskExists(id) returns (Task memory) {
        return tasks[id];
    }

    function getAllTaskIds() external view returns (uint256[] memory) {
        return taskIds;
    }
}
