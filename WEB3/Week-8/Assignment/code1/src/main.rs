use std::collections::HashSet;

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Default, Hash)]
struct Card {
    power: u32,
    name: String,
}

fn main() {
    let original = Card {
        power: 75,
        name: "Phoenix".to_string(),
    };
    println!("Original: {:?}", original);

    let mut cloned = original.clone();
    cloned.power += 10;
    println!("Original after clone: {:?}", original);
    println!("Cloned (mutated):     {:?}", cloned);

    let mut deck = vec![
        Card {
            power: 50,
            name: "Goblin".to_string(),
        },
        Card {
            power: 90,
            name: "Dragon".to_string(),
        },
        Card {
            power: 10,
            name: "Slime".to_string(),
        },
        Card {
            power: 65,
            name: "Griffin".to_string(),
        },
    ];
    deck.sort();
    println!("\nSorted deck (ascending by power):");
    for card in &deck {
        println!("  {:?}", card);
    }

    let mut with_duplicate = deck.clone();
    with_duplicate.push(Card {
        power: 90,
        name: "Dragon".to_string(),
    });
    let unique: HashSet<Card> = with_duplicate.into_iter().collect();
    println!("\nCards before dedup: 5, after dedup: {}", unique.len());

    println!("\nDefault card: {:?}", Card::default());
}
