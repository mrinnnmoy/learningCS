# How to Build.

```
1. Create the workspace root.

   Run:
     mkdir describe-macro && cd describe-macro

   Create a root Cargo.toml matching the [workspace] section in the
   Solution below — it just lists both member crates, it is not
   itself a buildable package.

2. Create the proc-macro crate.

   Run:
     cargo new describe_derive --lib

   In describe_derive/Cargo.toml, add [lib] proc-macro = true and the
   syn/quote dependencies from the Solution below. That one line,
   proc-macro = true, is what tells Cargo this crate's public
   functions run at COMPILE TIME against other crates' source code,
   rather than compiling into an ordinary library.

3. Write describe_derive/src/lib.rs.

   Replace its contents with the Solution version below. Read it
   alongside Concept 4 — parse_macro_input! is syn doing the parsing,
   the quote! block is where the new impl gets built, and the two
   panic! arms are what happens when Describe is applied to something
   the match can't handle.

4. Create the demo crate.

   Run:
     cargo new describe_demo --bin

   In describe_demo/Cargo.toml, add describe_derive as a path
   dependency (see the Solution below) — this is what makes
   #[derive(Describe)] resolve to the macro you just wrote, not to
   anything from crates.io.

5. Write describe_demo/src/main.rs, build, and run it.

   Replace its contents with the Solution version below, then run
   (from the workspace root):
     cargo run -p describe_demo

   You should see Token's describe() output, with no warnings or
   errors.

6. Add a second struct.

   Define an Nft struct (fields: collection, id) in
   describe_demo/src/main.rs, derive Describe on it, and print
   Nft::describe() as well. Make no changes to describe_derive at all.
   Re-run cargo run -p describe_demo and confirm the second line
   appears correctly.
```