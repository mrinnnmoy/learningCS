// Two input references, no `self` — neither elision rule applies, so
// the compiler needs this spelled out explicitly: the returned
// reference is only ever as long-lived as the shorter of x and y.
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

// One input reference — Rule 2 assigns it straight to the elided
// output lifetime. No <'a> needed anywhere here.
fn first_word(s: &str) -> &str {
    s.split_whitespace().next().unwrap_or("")
}

// `announcement` deliberately sits OUTSIDE the shared 'a — it's
// printed and then dropped, never returned, so tying it to x/y's
// lifetime would only add an unnecessary constraint.
fn announce_and_return_longest<'a>(x: &'a str, y: &'a str, announcement: &str) -> &'a str {
    println!("Announcement: {}", announcement);
    longest(x, y)
}

fn main() {
    let s1 = String::from("Solana");
    let s2 = String::from("Ethereum");

    let result = longest(s1.as_str(), s2.as_str());
    println!("Longest: {}", result);

    let sentence = "the quick brown fox";
    println!("First word: {}", first_word(sentence));

    let announced = announce_and_return_longest(s1.as_str(), s2.as_str(), "Comparing chains");
    println!("Announced longest: {}", announced);
}
