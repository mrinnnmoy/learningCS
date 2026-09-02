# Solidity vs. Move. (Counter)

This comparison uses Week 27's Solidity `Counter.sol` and the Move `counter.move` module side by side. Both implement a simple counter, but they use fundamentally different approaches to storage, ownership, and access to state.

## Construct-by-Construct Comparison

| Move construct                           | Closest Solidity/EVM equivalent                                                                                                                                                                                           | Compiler-enforced in Solidity?                                                                                                                                                                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `struct Counter has key`                 | A Solidity `struct Counter` stored in contract storage, commonly using a `mapping(address => Counter)`. The mapping associates an address with its counter data.                                                          | **No.** Solidity checks the struct's type and layout, but it does not give the struct Move-style resource ownership or linearity. Solidity data can be copied, assigned, overwritten, or deleted according to the contract's code.                       |
| `move_to(account, Counter { value: 0 })` | Writing a new counter struct into persistent storage, for example `counters[msg.sender] = Counter({ value: 0 })`.                                                                                                         | **No.** Solidity's compiler checks that the assignment is type-correct, but it does not enforce Move-style resource ownership. Any function that has access to the mapping can potentially create or overwrite entries if the contract logic permits it. |
| `acquires Counter`                       | There is no direct Solidity or EVM equivalent. Solidity functions do not declare which storage variables, mappings, structs, or resource types they will access.                                                          | **No.** The Solidity compiler does not require a function to declare the storage structures it reads or modifies. Developers and reviewers must determine storage access by reading the function implementation.                                         |
| `borrow_global_mut<Counter>(addr)`       | Accessing a specific entry in a Solidity storage mapping, such as `counters[addr]`, and modifying that entry.                                                                                                             | **No.** Solidity allows any function with access to the mapping to select an address and read or modify its entry. The compiler does not automatically restrict the function to modifying only the caller's own entry.                                   |
| `borrow_global<Counter>(addr)`           | Reading a value from Solidity contract storage, such as reading `counters[addr].value`.                                                                                                                                   | **No.** Solidity checks whether the storage access is valid and type-correct, but it does not enforce resource ownership or restrict which account's data may be read by the function.                                                                   |
| Linear ownership of a resource           | No direct Solidity type-system equivalent. A Solidity struct in storage can be read, copied into memory, assigned, overwritten, or deleted by functions that have the necessary access according to the contract's logic. | **No.** Solidity does not provide Move's linear resource guarantees. Restrictions on copying, modifying, or deleting data must be implemented manually through contract logic and careful review.                                                        |

## The one property Move genuinely guarantees that Solidity does not

Move's linear resource system guarantees that a resource cannot be freely copied or accidentally dropped, while its global storage operations make resource access explicit. A `Counter` resource with the `key` ability belongs in global storage under an address and must be accessed using Move's resource operations such as `borrow_global`, `borrow_global_mut`, and `move_to`.

Solidity does not provide an equivalent compiler-enforced ownership model for contract storage. Solidity structs and storage values can be read, copied, overwritten, or deleted whenever the contract's implementation allows it. The developer must manually design and review the contract's access-control rules.

## `has key` and Solidity Storage

In Move:

```move
struct Counter has key {
    value: u64,
}
```

The `key` ability allows the `Counter` resource to be stored in global storage under an account address. This makes the resource suitable for operations such as `move_to`, `borrow_global`, and `borrow_global_mut`.

The closest Solidity design is a struct stored inside a mapping:

```solidity
struct Counter {
    uint256 value;
}

mapping(address => Counter) counters;
```

However, this is only structurally similar. The Solidity mapping does not make `Counter` a linear resource and does not prevent the stored data from being copied or overwritten by the contract's functions.

## `move_to` and Solidity Storage Assignment

In Move:

```move
move_to(account, Counter { value: 0 });
```

This places the newly created `Counter` resource into the global storage associated with `account`.

The closest Solidity operation would be:

```solidity
counters[msg.sender] = Counter({ value: 0 });
```

Both operations store counter data associated with an address. The important difference is that Move is transferring a resource into global storage, while Solidity is assigning ordinary structured data to a storage location.

Solidity's compiler verifies that the assignment is type-correct, but it does not enforce that the struct is a unique resource that cannot be copied or replaced.

## `acquires Counter` and Solidity

In Move:

```move
public fun increment(addr: address) acquires Counter
```

The `acquires Counter` declaration explicitly states that the function accesses the global `Counter` resource type.

Solidity has no direct equivalent. A Solidity function does not need to declare which storage variables, mappings, or structs it accesses.

For example:

```solidity
function increment(address addr) external {
    counters[addr].value += 1;
}
```

Nothing in the Solidity function declaration tells the compiler, caller, or reviewer that the function accesses the `counters` mapping. This information must be discovered by reading the implementation.

Therefore, `acquires` provides explicit information about resource dependencies that Solidity does not require at the function declaration level.

## `borrow_global_mut` and Manual Access Control in Solidity

In Move:

```move
let counter = borrow_global_mut<Counter>(addr);
counter.value = counter.value + 1;
```

`borrow_global_mut` explicitly obtains a mutable reference to the `Counter` resource stored under `addr`.

The closest Solidity operation would be accessing and modifying a storage entry:

```solidity
counters[addr].value += 1;
```

However, Solidity does not automatically guarantee that `addr` must belong to `msg.sender`.

A Solidity function can access:

```solidity
counters[msg.sender]
```

or:

```solidity
counters[anotherAddress]
```

The compiler does not distinguish between these choices as an ownership rule. The developer must explicitly implement the intended restriction.

For example:

```solidity
require(addr == msg.sender, "Not your counter");
```

or the contract must simply avoid accepting arbitrary addresses and always use:

```solidity
counters[msg.sender]
```

Therefore, there is no single Solidity line equivalent to Move's explicit resource access model that automatically provides the same structural ownership guarantees. Correct access restrictions depend on the Solidity contract's design and manual access-control checks.

## Linear Ownership

Move resources follow linear ownership rules. A resource cannot simply be copied like ordinary data, and it cannot be silently dropped. Resource movement and destruction must follow rules enforced by the Move type system.

This is particularly important for representing assets and state where duplication would be dangerous.

Solidity does not have an equivalent linear type system.

For example, a Solidity struct can be copied into memory:

```solidity
Counter memory copiedCounter = counters[user];
```

Its fields can also be overwritten or deleted if the contract exposes code that performs those operations.

Whether this is safe depends entirely on the contract's implementation.

Solidity provides other safety features, including static type checking and checked arithmetic in Solidity `0.8.x`, but these features do not provide linear ownership of storage values.

## Access-Control Difference in the Counter Example

The Move counter explicitly accesses a `Counter` resource stored under an address:

```move
public fun increment(addr: address) acquires Counter {
    let counter = borrow_global_mut<Counter>(addr);
    counter.value = counter.value + 1;
}
```

The resource type being accessed is explicitly declared with `acquires Counter`, and the mutable resource is explicitly borrowed using `borrow_global_mut<Counter>(addr)`.

In Solidity, a mapping-based design would allow any function that has access to the mapping to choose which address entry it modifies:

```solidity
counters[someAddress].value += 1;
```

The Solidity compiler does not automatically require `someAddress` to equal `msg.sender`, the contract owner, or any other authorized address.

A developer must enforce that rule manually through:

- modifiers such as `onlyOwner`,
- `require` or `revert` checks,
- custom errors,
- using `msg.sender` directly as the mapping key, or
- other application-specific authorization logic.

This is why there is no direct one-line Solidity equivalent to Move's resource access declarations. Solidity access restrictions are primarily rules implemented by the programmer rather than ownership rules enforced by a linear resource type system.

## Effect on Week 40 Schema Versioning

Move's `acquires` declaration would make it clearer which resource types a function reads or modifies. This can improve readability and auditing because a function's dependency on a particular global resource is explicitly visible.

However, it would not fundamentally solve Week 40's schema-versioning and lazy-migration problem.

Week 40's migration strategy still requires deliberate logic to:

1. determine whether data exists in the old or new format,
2. read old-shaped data when necessary,
3. decide when a user should be migrated,
4. create the new version of the data, and
5. preserve compatibility for users who have not yet migrated.

Therefore, Move's `acquires` declaration would make resource dependencies more explicit and potentially easier to reason about, but the core schema-versioning strategy is **genuinely unaffected**. Lazy migration would still require explicit application logic.

## Conclusion

Solidity and Move can both implement the same basic counter functionality, but they make different guarantees about state and ownership.

Solidity provides flexible contract storage and relies heavily on the developer to implement correct access-control rules. Its compiler checks types and many language-level safety conditions, but it does not enforce linear ownership of structs or require functions to declare the storage resources they access.

Move treats important on-chain state as resources and uses its type system to enforce rules around resource movement and duplication. Constructs such as `has key`, `move_to`, `acquires`, and `borrow_global_mut` make the relationship between an account, a resource, and global storage explicit.

The most important difference demonstrated by this comparison is that Move provides compiler-enforced linear resource guarantees that Solidity does not. In Solidity, equivalent ownership and access rules must be designed manually and verified through careful implementation, testing, and security review.
