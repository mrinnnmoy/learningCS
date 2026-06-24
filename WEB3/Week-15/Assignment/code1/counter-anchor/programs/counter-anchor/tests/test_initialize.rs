use {
    anchor_lang::{
        prelude::Pubkey,
        solana_program::{instruction::Instruction, system_program},
        AccountDeserialize, InstructionData, ToAccountMetas,
    },
    counter_anchor::{
        self,
        instruction,
        accounts,
        CounterAccount,
    },
    litesvm::LiteSVM,
    solana_keypair::Keypair,
    solana_message::{Message, VersionedMessage},
    solana_signer::Signer,
    solana_transaction::versioned::VersionedTransaction,
};

#[test]
fn test_initialize() {
    let program_id = counter_anchor::id();
    let payer = Keypair::new();

    let (counter, _) = Pubkey::find_program_address(
        &[b"counter", payer.pubkey().as_ref()],
        &program_id,
    );

    let mut svm = LiteSVM::new();

    let bytes = include_bytes!(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../target/deploy/counter_anchor.so"
    ));

    svm.add_program(program_id, bytes).unwrap();

    svm.airdrop(&payer.pubkey(), 1_000_000_000).unwrap();

    // ---------------- Initialize ----------------

    let instruction = Instruction::new_with_bytes(
        program_id,
        &instruction::Initialize {}.data(),
        accounts::Initialize {
            payer: payer.pubkey(),
            counter,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );

    let blockhash = svm.latest_blockhash();

    let msg =
        Message::new_with_blockhash(&[instruction], Some(&payer.pubkey()), &blockhash);

    let tx =
        VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[&payer]).unwrap();

    svm.send_transaction(tx).unwrap();

    let account = svm.get_account(&counter).unwrap();

    let mut data: &[u8] = &account.data;

    let counter_state =
        CounterAccount::try_deserialize(&mut data).unwrap();

    assert_eq!(counter_state.count, 0);

    // ---------------- Increment ----------------

    let instruction = Instruction::new_with_bytes(
        program_id,
        &instruction::Increment {}.data(),
        accounts::Increment {
            payer: payer.pubkey(),
            counter,
        }
        .to_account_metas(None),
    );

    let blockhash = svm.latest_blockhash();

    let msg =
        Message::new_with_blockhash(&[instruction], Some(&payer.pubkey()), &blockhash);

    let tx =
        VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[&payer]).unwrap();

    svm.send_transaction(tx).unwrap();

    let account = svm.get_account(&counter).unwrap();

    let mut data: &[u8] = &account.data;

    let counter_state =
        CounterAccount::try_deserialize(&mut data).unwrap();

    assert_eq!(counter_state.count, 1);
}