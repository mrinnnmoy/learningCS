use summary_derive::Summary;

// Naming this trait Summary — the exact same name as the derive macro
// imported above — is deliberate, not a naming collision. Derive
// macros and traits live in separate namespaces in Rust, so both
// names can coexist; this is the same pattern Serde itself uses.
trait Summary {
    fn summary(&self) -> String;
}

#[derive(Summary)]
struct Token {
    symbol: String,
    amount: f64,
}

#[derive(Summary)]
struct Nft {
    collection: String,
    id: u32,
}

fn print_summary<T: Summary>(item: &T) {
    println!("{}", item.summary());
}

fn main() {
    let token = Token {
        symbol: "SOL".to_string(),
        amount: 12.5,
    };
    let nft = Nft {
        collection: "MonkeyJPEG".to_string(),
        id: 42,
    };

    print_summary(&token);
    print_summary(&nft);

    println!("\nVia Vec<Box<dyn Summary>>:");
    let items: Vec<Box<dyn Summary>> = vec![Box::new(token), Box::new(nft)];
    for item in &items {
        println!("{}", item.summary());
    }
}
