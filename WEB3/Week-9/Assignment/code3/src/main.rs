trait Asset {
    fn symbol(&self) -> &str;
    fn value(&self) -> f64;
}

// Borrows its symbol from somewhere else entirely — no String
// allocation for this field. This is exactly what makes
// BorrowedToken<'a> NOT 'static, and exactly why it needs the
// explicit `+ 'a` bound below to be usable as a trait object at all.
struct BorrowedToken<'a> {
    symbol: &'a str,
    amount: f64,
    price: f64,
}

impl<'a> Asset for BorrowedToken<'a> {
    fn symbol(&self) -> &str {
        self.symbol
    }
    fn value(&self) -> f64 {
        self.amount * self.price
    }
}

// Owns every field outright — has nothing borrowed inside it, so it
// satisfies the implicit 'static bound dyn Trait normally requires
// with no extra annotation needed at all.
struct OwnedNft {
    symbol: String,
    estimated_value: f64,
}

impl Asset for OwnedNft {
    fn symbol(&self) -> &str {
        &self.symbol
    }
    fn value(&self) -> f64 {
        self.estimated_value
    }
}

// `Box<dyn Asset>` alone would implicitly mean `Box<dyn Asset +
// 'static>` — which BorrowedToken<'a> could never satisfy unless 'a
// happened to be 'static. Spelling out `+ 'a` here (via the elided
// '_' form) is what allows a genuinely short-lived borrow to live
// inside a trait object at all. Returning a plain index, rather than
// a reference back into `assets`, keeps this function's own
// signature simple — the lifetime bound that actually matters lives
// entirely in the PARAMETER type, not the return type.
fn most_valuable(assets: &[Box<dyn Asset + '_>]) -> usize {
    let mut best = 0;
    for i in 1..assets.len() {
        if assets[i].value() > assets[best].value() {
            best = i;
        }
    }
    best
}

fn main() {
    let symbol_data = String::from("SOL");

    let assets: Vec<Box<dyn Asset + '_>> = vec![
        Box::new(BorrowedToken {
            symbol: &symbol_data,
            amount: 10.0,
            price: 150.0,
        }),
        Box::new(OwnedNft {
            symbol: "MonkeyJPEG".to_string(),
            estimated_value: 2200.0,
        }),
    ];

    let winner_index = most_valuable(&assets);
    println!(
        "Most valuable: {} -> {:.2}",
        assets[winner_index].symbol(),
        assets[winner_index].value()
    );

    println!("\nAll assets:");
    for asset in &assets {
        println!("  {} -> {:.2}", asset.symbol(), asset.value());
    }
}
