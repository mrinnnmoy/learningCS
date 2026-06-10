use describe_derive::Describe;

#[derive(Describe)]
struct Token {
    symbol: String,
    amount: f64,
    price: f64,
}

fn main() {
    println!("{}", Token::describe());
}
