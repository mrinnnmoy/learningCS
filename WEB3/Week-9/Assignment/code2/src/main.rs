// key and value borrow directly from whatever &'a str was passed to
// parse — no String allocation happens anywhere in this struct.
struct KeyValue<'a> {
    key: &'a str,
    value: &'a str,
}

impl<'a> KeyValue<'a> {
    fn parse(line: &'a str) -> Option<KeyValue<'a>> {
        let mut parts = line.splitn(2, '=');
        let key = parts.next()?.trim();
        let value = parts.next()?.trim();
        Some(KeyValue { key, value })
    }
}

fn main() {
    let config = String::from(
        "rpc_url = https://api.mainnet-beta.solana.com\ncommitment = confirmed\ncluster = mainnet-beta",
    );

    let mut pairs = Vec::new();
    for line in config.lines() {
        if let Some(kv) = KeyValue::parse(line) {
            pairs.push(kv);
        }
    }

    for kv in &pairs {
        println!("{} -> {}", kv.key, kv.value);
    }

    // Prove this was genuinely zero-copy: the first pair's `value`
    // must point somewhere INSIDE config's own byte buffer, not at a
    // separately-allocated String.
    let value_ptr = pairs[0].value.as_ptr() as usize;
    let config_start = config.as_ptr() as usize;
    let config_end = config_start + config.len();
    let borrowed_from_config = value_ptr >= config_start && value_ptr < config_end;
    println!(
        "\nFirst value is borrowed directly from `config`: {}",
        borrowed_from_config
    );
}
