# How to Build.

```
1. Create the workspace root.

   Run:
     mkdir summary-macro && cd summary-macro

   Create a root Cargo.toml matching the [workspace] section in the
   Solution below.

2. Create the proc-macro crate.

   Run:
     cargo new summary_derive --lib

   In summary_derive/Cargo.toml, add [lib] proc-macro = true and the
   syn/quote dependencies from the Solution below — the same shape as
   Medium's describe_derive.

3. Write summary_derive/src/lib.rs.

   Replace its contents with the Solution version below. The key
   difference from Medium: instead of just collecting field NAMES,
   this macro builds one quote! snippet per field that reads a real
   VALUE off self at runtime (self.#ident), then splices the whole
   collection into the generated impl using #(#field_prints),*
   repetition syntax.

4. Create the demo crate.

   Run:
     cargo new summary_demo --bin

   In summary_demo/Cargo.toml, add summary_derive as a path
   dependency (see the Solution below).

5. Write summary_demo/src/main.rs, build, and run it.

   Replace its contents with the Solution version below — note the
   Summary trait is defined here, in the consuming crate, not inside
   summary_derive itself. The macro crate only ever generates code
   that refers to Summary by name; it doesn't need to own the trait
   definition. Then run (from the workspace root):
     cargo run -p summary_demo

   You should see both print_summary results, followed by the same
   two lines again via the Vec<Box<dyn Summary>> loop, with no
   warnings or errors.

6. Add a third struct.

   Define a Potion struct (fields: name: String, healing: u32),
   derive Summary on it, and push one instance into the
   Vec<Box<dyn Summary>> list in main(). Make no changes to
   summary_derive at all. Re-run cargo run -p summary_demo and
   confirm the third line appears correctly.

7. Add a field with no Debug impl.

   Add a metadata: Metadata field to Nft, where Metadata is a bare
   struct with no derives at all (struct Metadata { uri: String }),
   and update Nft's construction in main() accordingly. Run
   cargo build and read the error closely — it's this assignment's
   actual point.
```