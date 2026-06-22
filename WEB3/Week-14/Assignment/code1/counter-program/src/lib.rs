use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::invoke_signed,
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
};

#[cfg(not(feature = "no-entrypoint"))]
entrypoint!(process_instruction);

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct CounterAccount {
    pub count: u64,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum CounterInstruction {
    Initialize,
    Increment,
}

const COUNTER_SEED: &[u8] = b"counter";
const COUNTER_SPACE: usize = 8;

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = CounterInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    let accounts_iter = &mut accounts.iter();
    let counter_account = next_account_info(accounts_iter)?;
    let payer_account = next_account_info(accounts_iter)?;
    let system_program_account = next_account_info(accounts_iter)?;

    if !payer_account.is_signer {
        msg!("Payer must sign this transaction");
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Never trust the client's account list blindly (Week 13,
    // Concept 5) — re-derive the canonical PDA ourselves, every time.
    let (expected_counter_pda, bump) =
        Pubkey::find_program_address(&[COUNTER_SEED, payer_account.key.as_ref()], program_id);
    if expected_counter_pda != *counter_account.key {
        msg!("Counter account does not match the expected PDA for this payer");
        return Err(ProgramError::InvalidArgument);
    }

    match instruction {
        CounterInstruction::Initialize => {
            let rent = Rent::get()?;
            let lamports = rent.minimum_balance(COUNTER_SPACE);

            let create_ix = system_instruction::create_account(
                payer_account.key,
                counter_account.key,
                lamports,
                COUNTER_SPACE as u64,
                program_id,
            );

            // invoke_signed — the program authorizes account creation
            // AS the PDA (Week 13, Concept 7, made real).
            invoke_signed(
                &create_ix,
                &[
                    payer_account.clone(),
                    counter_account.clone(),
                    system_program_account.clone(),
                ],
                &[&[COUNTER_SEED, payer_account.key.as_ref(), &[bump]]],
            )?;

            let counter = CounterAccount { count: 0 };
            counter.serialize(&mut &mut counter_account.data.borrow_mut()[..])?;
            msg!("Counter initialized to 0 at {}", counter_account.key);
        }
        CounterInstruction::Increment => {
            if counter_account.owner != program_id {
                msg!("Counter account is not owned by this program — was it initialized?");
                return Err(ProgramError::IllegalOwner);
            }

            let mut counter = CounterAccount::try_from_slice(&counter_account.data.borrow())?;
            counter.count = counter
                .count
                .checked_add(1)
                .ok_or(ProgramError::ArithmeticOverflow)?;
            counter.serialize(&mut &mut counter_account.data.borrow_mut()[..])?;
            msg!("Counter incremented to {}", counter.count);
        }
    }

    Ok(())
}
