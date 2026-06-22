use borsh::{BorshDeserialize, BorshSerialize};

use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    pubkey::Pubkey,
};

use solana_system_interface::instruction::transfer;

#[cfg(not(feature = "no-entrypoint"))]
entrypoint!(process_instruction);


#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum VaultInstruction {
    Deposit { amount: u64 },
    Withdraw { amount: u64 },
}


const VAULT_SEED: &[u8] = b"vault";


pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {

    let instruction =
        VaultInstruction::try_from_slice(instruction_data)
            .map_err(|_| ProgramError::InvalidInstructionData)?;


    let accounts_iter = &mut accounts.iter();

    let vault_account = next_account_info(accounts_iter)?;
    let depositor_account = next_account_info(accounts_iter)?;
    let system_program_account = next_account_info(accounts_iter)?;


    if !depositor_account.is_signer {
        msg!("Depositor must sign");
        return Err(ProgramError::MissingRequiredSignature);
    }


    let (expected_vault, bump) =
        Pubkey::find_program_address(
            &[
                VAULT_SEED,
                depositor_account.key.as_ref()
            ],
            program_id,
        );


    if expected_vault != *vault_account.key {
        msg!("Invalid vault PDA");
        return Err(ProgramError::InvalidArgument);
    }



    match instruction {


        VaultInstruction::Deposit { amount } => {

            let ix = transfer(
                depositor_account.key,
                vault_account.key,
                amount,
            );


            invoke(
                &ix,
                &[
                    depositor_account.clone(),
                    vault_account.clone(),
                    system_program_account.clone(),
                ],
            )?;


            msg!(
                "Deposited {} lamports",
                amount
            );
        }



        VaultInstruction::Withdraw { amount } => {


            if vault_account.lamports() < amount {

                msg!(
                    "Vault has {} lamports, requested {}",
                    vault_account.lamports(),
                    amount
                );

                return Err(
                    ProgramError::InsufficientFunds
                );
            }



            let ix = transfer(
                vault_account.key,
                depositor_account.key,
                amount,
            );


            invoke_signed(
                &ix,
                &[
                    vault_account.clone(),
                    depositor_account.clone(),
                    system_program_account.clone(),
                ],
                &[
                    &[
                        VAULT_SEED,
                        depositor_account.key.as_ref(),
                        &[bump],
                    ]
                ],
            )?;


            msg!(
                "Withdrawn {} lamports",
                amount
            );
        }
    }


    Ok(())
}