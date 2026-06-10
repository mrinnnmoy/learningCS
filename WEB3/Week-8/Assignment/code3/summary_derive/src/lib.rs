use proc_macro::TokenStream;
use quote::quote;
use syn::{parse_macro_input, Data, DeriveInput, Fields};

#[proc_macro_derive(Summary)]
pub fn derive_summary(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    let name = &input.ident;
    let name_str = name.to_string();

    let fields = match &input.data {
        Data::Struct(data) => match &data.fields {
            Fields::Named(fields) => &fields.named,
            _ => panic!("Summary only supports structs with named fields"),
        },
        _ => panic!("Summary can only be derived for structs"),
    };

    // One quote! snippet per field, each reading a REAL VALUE off
    // `self` at runtime (self.#ident), not just a name known at
    // macro-expansion time — this is the difference from Medium's
    // describe_derive, which only ever touched field NAMES.
    let field_prints = fields.iter().map(|f| {
        let ident = f.ident.as_ref().unwrap();
        let ident_str = ident.to_string();
        quote! {
            format!("{}: {:?}", #ident_str, self.#ident)
        }
    });

    let expanded = quote! {
        impl Summary for #name {
            fn summary(&self) -> String {
                let fields: Vec<String> = vec![#(#field_prints),*];
                format!("{} {{ {} }}", #name_str, fields.join(", "))
            }
        }
    };

    TokenStream::from(expanded)
}
