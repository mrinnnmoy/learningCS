trait Asset {
    fn symbol(&self) -> &str;
    fn value(&self) -> f64;
}

struct Token {
    symbol: String,
    amount: f64,
    price: f64,
}

impl Asset for Token {
    fn symbol(&self) -> &str {
        &self.symbol
    }
    fn value(&self) -> f64 {
        self.amount * self.price
    }
}

struct Nft {
    symbol: String,
    estimated_value: f64,
}

impl Asset for Nft {
    fn symbol(&self) -> &str {
        &self.symbol
    }
    fn value(&self) -> f64 {
        self.estimated_value
    }
}

// Generic version: T is fixed to ONE concrete type at compile time for
// any given call — the compiler generates a separate, specialized copy
// of this function for every different T it's actually called with
// (monomorphization). Zero runtime dispatch cost, but every element in
// `assets` must be the exact same type.
fn total_value<T: Asset>(assets: &[T]) -> f64 {
    let mut total = 0.0;
    for asset in assets {
        total += asset.value();
    }
    total
}

// Trait object version: Box<dyn Asset> erases the concrete type,
// keeping only "something that implements Asset". Which method
// implementation actually runs is decided at RUNTIME via a vtable
// lookup — the price paid for letting one Vec hold genuinely
// different types together.
fn total_value_dyn(assets: &[Box<dyn Asset>]) -> f64 {
    let mut total = 0.0;
    for asset in assets {
        total += asset.value();
    }
    total
}

fn print_assets_dyn(assets: &[Box<dyn Asset>]) {
    for asset in assets {
        println!("  {} -> {:.2}", asset.symbol(), asset.value());
    }
}

fn main() {
    let tokens = vec![
        Token {
            symbol: "SOL".to_string(),
            amount: 10.0,
            price: 150.0,
        },
        Token {
            symbol: "USDC".to_string(),
            amount: 500.0,
            price: 1.0,
        },
    ];

    println!("Generic version (all Tokens, same concrete type):");
    println!("  Total token value: {:.2}\n", total_value(&tokens));

    let mixed_portfolio: Vec<Box<dyn Asset>> = vec![
        Box::new(Token {
            symbol: "SOL".to_string(),
            amount: 10.0,
            price: 150.0,
        }),
        Box::new(Token {
            symbol: "USDC".to_string(),
            amount: 500.0,
            price: 1.0,
        }),
        Box::new(Nft {
            symbol: "MonkeyJPEG".to_string(),
            estimated_value: 2200.0,
        }),
    ];

    println!("Trait object version (mixed Token and Nft in one Vec):");
    print_assets_dyn(&mixed_portfolio);
    println!(
        "  Total portfolio value: {:.2}",
        total_value_dyn(&mixed_portfolio)
    );
}
