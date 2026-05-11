# Object-Oriented Programming. (Interview Prep Guide)

> A complete, interview-style walkthrough of OOP fundamentals i.e., language-agnostic, but with examples that map naturally to Java/C++/JavaScript/Python. Each topic is explained the way an interviewer might actually ask it, followed by a clear answer. Visual reference links are included under each section so you can _see_ the concept, not just read about it.

---

## Table of Contents

1. [Introduction to OOP](#1-introduction-to-oop)
2. [Classes & Objects](#2-classes--objects)
3. [Encapsulation](#3-encapsulation)
4. [Abstraction](#4-abstraction)
5. [Inheritance](#5-inheritance)
6. [Polymorphism](#6-polymorphism)
7. [Constructors & Destructors](#7-constructors--destructors)
8. [Abstract Classes vs Interfaces](#8-abstract-classes-vs-interfaces)
9. [SOLID Principles](#9-solid-principles)
10. [Design Patterns Basics](#10-design-patterns-basics)
11. [Common Pitfalls & Misconceptions](#11-common-pitfalls--misconceptions)
12. [Quick Revision Cheat Sheet](#12-quick-revision-cheat-sheet)

---

## 1. Introduction to OOP.

### What is Object-Oriented Programming and why was it introduced?

> OOP is a programming paradigm that organizes code around **objects**. Bundles of data (attributes) and behavior (methods), rather than around functions and logic acting on separate data (as in procedural programming). It was introduced to make large codebases easier to manage, reuse and extend by modeling real-world entities directly in code, reducing the tangled dependencies you get in purely procedural code.

### What are the four main pillars of OOP?

> **Encapsulation, Abstraction, Inheritance and Polymorphism.** Together they let you bundle data safely, hide unnecessary detail, reuse code across related types and write flexible code that works with multiple types through a common interface.

![Four Pillars of OOP](https://arshsharma.com/posts/2024-12-16-oops-golang/oops.png)

### What's the difference between OOP and Procedural Programming?

> **Procedural programming** structures code as a sequence of functions/procedures that operate on data passed between them — data and logic are separate.

> **OOP** bundles data and the functions that operate on it together into objects, emphasizing reusability, modularity and modeling real-world relationships (like inheritance) that procedural code can't express as naturally.

### Is OOP always the "better" choice? Any downsides?

> Not always, no paradigm is universally best. OOP can introduce more upfront design complexity, deeper inheritance hierarchies can become hard to trace/debug and it sometimes adds performance overhead (e.g., virtual method dispatch) compared to straightforward procedural code. For small scripts or highly performance-critical/functional-style problems, other paradigms (procedural, functional) may be simpler or faster.

---

## 2. Classes & Objects.

### What is the difference between a Class and an Object?

> A **class** is a blueprint/template that defines what attributes and behaviors a type of object will have — it doesn't itself hold real data.

> An **object** is a concrete instance created from that class, occupying actual memory with real attribute values (e.g., class `Car` defines that cars have a color and can drive; object `myCar` is an actual red Car you can drive).

![Class vs Object](https://media.geeksforgeeks.org/wp-content/uploads/20250806160046168716/Class_Object_example.webp)

### What are Instance Variables vs Class (Static) Variables?

> **Instance variables** belong to each individual object — every object gets its own separate copy (e.g., each `Car` object has its own `color`).

> **Class/static variables** are shared across _all_ instances of the class — there's only one copy, and changing it via one object affects what all other objects see (e.g., a `totalCarsCreated` counter shared by every `Car`).

### What is the `this` (or `self`) keyword used for?

> It's a reference to the _current_ object instance — used inside a class's methods to refer to its own attributes/methods, especially useful to disambiguate when a parameter has the same name as an instance variable (e.g., `this.name = name;`).

### What is Method Overriding at the class level vs Method Hiding of static methods?

> (Common trick question in Java/C#) — **Overriding** works with **instance methods** and uses dynamic/runtime polymorphism — the actual object's type decides which method runs. **Static methods** can't truly be overridden; if a subclass defines a static method with the same signature, it "hides" the parent's version, but which one runs is decided at **compile time** based on the reference type, not the actual object type.

---

## 3. Encapsulation

### What is Encapsulation?

> Encapsulation is the practice of bundling data (attributes) and the methods that operate on that data into a single unit (a class), while restricting direct outside access to some of that data — typically by making fields `private` and exposing controlled access via public **getters/setters**. It protects an object's internal state from being put into an invalid state by outside code.

### Why not just make every field `public` for simplicity?

> Because that removes all control over how the data is accessed/modified — any external code could set a field to an invalid value (e.g., a negative `age`) and if you ever need to change the internal representation or add validation logic later, you'd break every piece of code that directly accessed that field. Encapsulation via getters/setters keeps that internal representation flexible and protected.

### What's the difference between `private`, `protected` and `public` access modifiers?

> - **Public:** Accessible from anywhere
> - **Private:** Accessible only within the same class
> - **Protected:** Accessible within the same class and by subclasses (and often within the same package/module, depending on the language)

### Is Encapsulation the same as Data Hiding?

> They're closely related but not identical. **Data hiding** specifically refers to restricting direct access to internal data (the "hiding" part).

> **Encapsulation** is the broader concept of bundling data + behavior together as a single unit — data hiding is one of the _mechanisms_ encapsulation uses to achieve its goal, not the whole concept.

---

## 4. Abstraction.

### What is Abstraction and how is it different from Encapsulation?

> **Abstraction** is about hiding _implementation complexity_ and exposing only the essential features/behavior to the user (e.g., you know a car has a `drive()` method, but not how the engine internally combusts fuel).

> **Encapsulation** is about _how_ you achieve that hiding — bundling data with methods and restricting direct access. Simply put: abstraction hides complexity at the _design_ level ("what" an object does); encapsulation hides complexity at the _implementation_ level ("how" it's protected/accessed).

### How do you achieve Abstraction in code?

> Primarily through **abstract classes** and **interfaces** — defining _what_ methods a type must have, without specifying _how_ they're implemented. The concrete implementation is left to the subclasses/implementing classes.

### Can you give a real-world analogy for Abstraction?

> Driving a car — you interact with a simple interface (steering wheel, pedals, gear stick) without needing to understand the internal combustion process, transmission mechanics, or electrical systems underneath. The complexity is abstracted away behind a simple set of controls.

---

## 5. Inheritance.

### What is Inheritance and why is it useful?

> Inheritance lets a class (**child/subclass**) acquire the attributes and methods of another class (**parent/superclass**), promoting code reuse and establishing an "is-a" relationship (e.g., a `Dog` _is an_ `Animal`). Instead of rewriting shared logic in every related class, you define it once in the parent and reuse/extend it in children.

![Types of Inheritance](https://www.careerride.com/images/Solved-Paper/different-types-of-inheritance.png)

### What are the different types of Inheritance?

> - **Single:** One child inherits from one parent
> - **Multilevel:** A chain — A → B → C (C inherits from B, which inherits from A)
> - **Hierarchical:** Multiple children inherit from the same single parent
> - **Multiple:** A child inherits from more than one parent class directly (not supported in Java/C# due to ambiguity issues — achieved instead via interfaces)
> - **Hybrid:** A combination of two or more of the above types

### What is the "Diamond Problem" in Multiple Inheritance?

> It occurs when a class inherits from two classes that both inherit from a common ancestor, creating ambiguity about which version of an inherited method/attribute should be used (visualized as a diamond shape in the class hierarchy). This is exactly why languages like Java and C# disallow multiple inheritance of _classes_ (though they allow implementing multiple _interfaces_, which don't carry this same ambiguity since interfaces traditionally don't hold implementation).

### What's the difference between "is-a" and "has-a" relationships?

> **"Is-a"** is modeled through inheritance (a `Car` _is a_ `Vehicle`). **"Has-a"** is modeled through composition — one class contains an instance of another as a field (a `Car` _has an_ `Engine`). Interviewers often ask you to identify which relationship fits a scenario, since misusing inheritance where composition fits better is a classic design mistake.

### What is "Composition over Inheritance," and why do many developers prefer it?

> It's a design principle suggesting you should favor building classes by _composing_ them from other objects (has-a relationships) rather than through deep inheritance chains, wherever reasonably possible. Deep inheritance hierarchies get rigid and fragile — changing a parent class can unexpectedly break many subclasses ("the fragile base class problem"). Composition tends to be more flexible, since you can swap components at runtime without restructuring a class hierarchy.

---

## 6. Polymorphism.

### What is Polymorphism? Can you explain its two main types?

> Polymorphism ("many forms") allows objects of different classes to be treated through a common interface, with each responding to the same method call in its own way.

> - **Compile-time (Static) Polymorphism:** Achieved via **method overloading**. Same method name, different parameter lists, resolved at compile time
> - **Runtime (Dynamic) Polymorphism:** Achieved via **method overriding**. A subclass provides its own implementation of a method already defined in its parent and the correct version is decided at runtime based on the actual object type

![Overloading vs Overriding](https://image.slidesharecdn.com/overloadingvsoverriding-221229154024-dc46b515/75/Overloading-vs-Overriding-pptx-2-2048.jpg)

### What's the difference between Method Overloading and Method Overriding?

> |                  | Overloading                                       | Overriding                              |
> | ---------------- | ------------------------------------------------- | --------------------------------------- |
> | Occurs within    | Same class                                        | Parent-child (inheritance) relationship |
> | Method signature | Must differ (params)                              | Must be identical                       |
> | Resolved at      | Compile time                                      | Runtime                                 |
> | Purpose          | Multiple ways to call a similarly-named operation | Customize/replace inherited behavior    |

### How does Runtime Polymorphism actually work under the hood?

> Most languages implement it using a **virtual method table (vtable)** — each object holds a reference to a table of function pointers specific to its actual class. When you call an overridden method through a parent-type reference, the runtime looks up the correct method implementation via this table based on the object's _actual_ type, not the reference's declared type — this is often called **dynamic dispatch**.

### What is Duck Typing and how does it relate to Polymorphism?

> Duck typing (common in Python/JavaScript) is a looser form of polymorphism where an object's suitability is determined by whether it has the necessary methods/properties, not by its explicit type or inheritance hierarchy — "if it walks like a duck and quacks like a duck, treat it as a duck." Unlike traditional polymorphism (which usually requires a shared parent class/interface), duck typing doesn't require any formal relationship between the types.

---

## 7. Constructors & Destructors.

### What is a Constructor?

> A special method automatically called when an object is created, typically used to initialize the object's attributes with starting values. It shares the class's name (in most languages) and has no return type.

### What is a Default Constructor vs a Parameterized Constructor?

> A **default constructor** takes no arguments and sets default values (often auto-generated by the compiler if you don't define any constructor yourself).

> A **parameterized constructor** accepts arguments, letting you initialize an object with specific values at creation time.

### What is Constructor Overloading?

> Defining multiple constructors in the same class with different parameter lists, giving multiple ways to instantiate an object depending on what data is available at creation time.

### What is a Copy Constructor?

> A constructor that creates a new object by copying the values from an existing object of the same class. Important interview nuance: a **shallow copy** copies field values directly (so reference/pointer fields still point to the _same_ underlying object), while a **deep copy** recursively copies the objects being referenced too, so the two objects are fully independent.

### What is a Destructor and do all OOP languages have one?

> A destructor is a special method called when an object is about to be destroyed/deallocated, typically used to release resources (memory, file handles, network connections). C++ has explicit destructors. Garbage-collected languages like Java, Python, and JavaScript don't have deterministic destructors in the same sense — they rely on automatic garbage collection, though some offer finalizers or `close()`-style patterns (like Python's `__del__` or context managers) for resource cleanup.

---

## 8. Abstract Classes vs Interfaces.

### What is an Abstract Class?

> A class that cannot be instantiated directly — it's meant to be subclassed. It can contain both **abstract methods** (declared but not implemented — subclasses must implement them) and **concrete methods** (fully implemented, shared by all subclasses), plus regular fields/state.

![Abstract Class vs Interface](https://media.geeksforgeeks.org/wp-content/uploads/20260113131642976251/abstract_class.webp)

### What is an Interface and how is it different from an Abstract Class?

> |                       | Abstract Class                                                           | Interface                                                                                         |
> | --------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
> | Instantiable?         | No                                                                       | No                                                                                                |
> | Method implementation | Can have both abstract & concrete methods                                | Traditionally only method signatures (though modern languages like Java 8+ allow default methods) |
> | Fields/State          | Can have instance fields                                                 | Generally cannot hold instance state (only constants)                                             |
> | Inheritance           | A class can extend only **one** abstract class                           | A class can implement **multiple** interfaces                                                     |
> | Use case              | Share common code + partial implementation among closely related classes | Define a contract/capability that unrelated classes can all agree to support                      |

### When would you choose an Abstract Class over an Interface (or vice versa)?

> Choose an **abstract class** when you have closely related classes that share common code/state you want to reuse (a true "is-a" hierarchy).

> Choose an **interface** when you want to define a capability/contract that different, possibly unrelated classes can implement (e.g., `Comparable`, `Serializable`) — especially since a class can implement many interfaces but extend only one class.

---

## 9. SOLID Principles.

### What does SOLID stand for and why does it matter?

> SOLID is a set of five design principles for writing maintainable, scalable OOP code:
>
> - **S** : Single Responsibility Principle
> - **O** : Open/Closed Principle
> - **L** : Liskov Substitution Principle
> - **I** : Interface Segregation Principle
> - **D** : Dependency Inversion Principle

Following these principles helps avoid tightly coupled, fragile code that becomes hard to extend or test as a codebase grows.

![SOLID Principles Diagram](https://techwayfit.com/assets/images/blogs/design-principles/solid-principles-banner.webp)

### Can you explain each SOLID principle with an example?

> 1. **Single Responsibility Principle (SRP):** A class should have only one reason to change — i.e., one job. (Don't make a `User` class also handle email-sending logic — split that into its own class.)
> 2. **Open/Closed Principle (OCP):** Classes should be open for extension but closed for modification — you should be able to add new behavior without changing existing, tested code (typically achieved via abstraction/polymorphism instead of editing existing `if/else` chains).
> 3. **Liskov Substitution Principle (LSP):** Subclasses should be substitutable for their parent class without breaking the program's correctness — if `Square extends Rectangle` but breaks expected `Rectangle` behavior (like independently setting width/height), that's an LSP violation.
> 4. **Interface Segregation Principle (ISP):** Don't force a class to implement methods it doesn't need — prefer several small, specific interfaces over one large, general-purpose one.
> 5. **Dependency Inversion Principle (DIP):** High-level modules shouldn't depend directly on low-level modules — both should depend on abstractions (interfaces), making it easy to swap implementations (this is the principle behind dependency injection).

### What's a classic real-world example of an LSP violation?

> The "Square-Rectangle problem" — mathematically a square _is a_ rectangle, so it seems natural for `Square` to extend `Rectangle`. But if `Rectangle` has independent `setWidth()`/`setHeight()` methods, a `Square` subclass has to override them to keep both sides equal, which breaks the expectation that setting one dimension leaves the other untouched — code that works fine with a `Rectangle` can behave unexpectedly when given a `Square`.

---

## 10. Design Patterns Basics.

### What is a Design Pattern?

> A design pattern is a reusable, general solution to a commonly occurring problem in software design — not finished code, but a template/approach you adapt to your specific situation. They exist so developers have a shared vocabulary for common structural solutions.

### What are the three main categories of Design Patterns?

> - **Creational** : Deal with object creation (e.g., **Singleton**, **Factory**, **Builder**)
> - **Structural** : Deal with composing classes/objects into larger structures (e.g., **Adapter**, **Decorator**, **Facade**)
> - **Behavioral** : Deal with communication/interaction between objects (e.g., **Observer**, **Strategy**, **Command**)

### Can you briefly explain the Singleton pattern and what's a common criticism of it?

> Singleton ensures a class has only **one instance** throughout the application, with a global point of access to it (e.g., a single shared database connection manager). Common criticism: it introduces **global state**, making code harder to test (since you can't easily swap in a mock instance) and can hide dependencies between classes that quietly rely on the singleton.

### What is the Factory pattern and what problem does it solve?

> The Factory pattern provides a method for creating objects without exposing the exact creation logic or specifying the exact class of object being created — the calling code just asks for "a shape" or "a payment processor," and the factory decides which concrete class to instantiate. It's useful when the exact type of object needed isn't known until runtime, or to keep object-creation logic centralized and decoupled from the code that uses the objects.

### What is the Observer pattern and where have you likely seen it used?

> The Observer pattern defines a one-to-many dependency where multiple "observer" objects are automatically notified whenever a "subject" object's state changes. You've likely already used it: it's the backbone of **event listeners** in the DOM (`addEventListener`), pub/sub systems, and reactive frameworks like React's state updates triggering re-renders.

---

## 11. Common Pitfalls & Misconceptions.

### Is "everything is an object" true in OOP languages?

> Not universally. In pure OOP languages like Smalltalk (and largely Python/Ruby), yes — even numbers are objects. But in languages like Java, primitive types (`int`, `boolean`, `char`) are _not_ objects (they're stored more efficiently as raw values) — you'd need wrapper classes like `Integer` to treat them as objects when needed.

### Does Inheritance always mean better code reuse?

> Not necessarily, overusing inheritance for the sake of code reuse (rather than a genuine "is-a" relationship) often leads to fragile, deeply nested hierarchies that are hard to modify safely. This is exactly why "favor composition over inheritance" is a widely repeated piece of design advice.

### Can you have Polymorphism without Inheritance?

> Yes, in languages that support duck typing or interfaces — an object doesn't need to share a common parent class, just the expected method signatures, to be used polymorphically (e.g., in Python or JavaScript, any object with a `.speak()` method can be used the same way, regardless of its inheritance chain).

### Is a Struct the same as a Class?

> Not exactly, and this differs by language. In C++, they're almost identical except default access is `public` for structs and `private` for classes. In C#, `struct` creates a **value type** (copied by value, stored typically on the stack) while `class` creates a **reference type** (copied by reference, stored on the heap) — this distinction matters a lot for performance and mutation behavior.

---

## 12. Quick Revision Cheat Sheet.

| Concept                      | One-line takeaway                                                                       |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| Class vs Object              | Class = blueprint; Object = actual instance in memory                                   |
| Encapsulation                | Bundle data + behavior, restrict direct access (private fields + getters/setters)       |
| Abstraction                  | Hide implementation complexity, expose only essential behavior                          |
| Inheritance                  | Reuse/extend behavior via parent-child ("is-a") relationships                           |
| Polymorphism                 | Same interface, different behavior — overloading (compile-time) vs overriding (runtime) |
| Abstract Class               | Partial implementation, single inheritance only                                         |
| Interface                    | Pure contract, a class can implement multiple                                           |
| SOLID                        | 5 principles for maintainable OOP design (SRP, OCP, LSP, ISP, DIP)                      |
| Composition over Inheritance | Prefer "has-a" over deep "is-a" chains for flexibility                                  |
| Design Patterns              | Reusable solution templates — Creational, Structural, Behavioral                        |

---
