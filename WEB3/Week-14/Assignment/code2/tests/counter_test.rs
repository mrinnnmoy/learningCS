use borsh::{to_vec, BorshDeserialize};
use code2::{process_instruction, CounterAccount, CounterInstruction};
use solana_program_test::*;
use solana_sdk::{
    instruction::{AccountMeta, Instruction},
    pubkey::Pubkey,
    signature::Signer,
    transaction::Transaction,
};

use solana_system_interface::program as system_program;

#[tokio::test]
async fn test_initialize_and_increment() {
    let program_id = Pubkey::new_unique();

    let program_test =
        ProgramTest::new("code2", program_id, processor!(process_instruction));

    let (banks_client, payer, recent_blockhash) = program_test.start().await;

    let (counter_pda, _bump) =
        Pubkey::find_program_address(&[b"counter", payer.pubkey().as_ref()], &program_id);

    // Initialize instruction
    let init_ix = Instruction {
        program_id,
        accounts: vec![
            AccountMeta::new(counter_pda, false),
            AccountMeta::new(payer.pubkey(), true),
            AccountMeta::new_readonly(system_program::id(), false),
        ],
        data: to_vec(&CounterInstruction::Initialize).unwrap(),
    };

    let mut init_tx = Transaction::new_with_payer(
        &[init_ix],
        Some(&payer.pubkey()),
    );

    init_tx.sign(&[&payer], recent_blockhash);

    banks_client
        .process_transaction(init_tx)
        .await
        .unwrap();

    let account = banks_client
        .get_account(counter_pda)
        .await
        .unwrap()
        .unwrap();

    let counter = CounterAccount::try_from_slice(&account.data).unwrap();

    assert_eq!(counter.count, 0);

    // Increment instruction
    let inc_ix = Instruction {
        program_id,
        accounts: vec![
            AccountMeta::new(counter_pda, false),
            AccountMeta::new(payer.pubkey(), true),
            AccountMeta::new_readonly(system_program::id(), false),
        ],
        data: to_vec(&CounterInstruction::Increment).unwrap(),
    };

    let recent_blockhash = banks_client
        .get_latest_blockhash()
        .await
        .unwrap();

    let mut inc_tx = Transaction::new_with_payer(
        &[inc_ix],
        Some(&payer.pubkey()),
    );

    inc_tx.sign(&[&payer], recent_blockhash);

    banks_client
        .process_transaction(inc_tx)
        .await
        .unwrap();

    let account = banks_client
        .get_account(counter_pda)
        .await
        .unwrap()
        .unwrap();

    let counter = CounterAccount::try_from_slice(&account.data[..8]).unwrap();

    assert_eq!(counter.count, 1);
}