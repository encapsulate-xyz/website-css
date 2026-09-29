# Editing our Cosmos validators' profiles

`edit.mjs` sets the name and the description of our 13 bonded Cosmos validators (`plan.json`: the validator, the account
that signs, and whether it signs as the operator or through an authz grant). It leaves the website, identity,
security contact, commission and minimum self-delegation untouched (`[do-not-modify]`, empty rate).

    npm install --ignore-scripts
    SEED_FILE=/path/outside/the/repo node edit.mjs --dry  [--only <chain>]    # signs and simulates; sends nothing
    SEED_FILE=/path/outside/the/repo node edit.mjs --send [--only <chain>]    # sends, waits for the block, reads back

The seed is read by the process and never printed. **The script stops on a chain when the seed's address is not the
signer `plan.json` names**, before anything is signed.

## State, 2026-09-29

Nothing has been sent. The account that may edit is `…1p8uxq4ska2psv2k8wknljh568k5qfnwt…`: it holds
`MsgEditValidator` from ten validators and is itself the operator of three (Axelar, Agoric, ixo), with fee tokens on
every chain. The seed the user supplied opens `…1lz32rfqzkaju4ff0kq47fc0pxdjnlqh4…`, the voting wallet: it holds only
`MsgVote` (eight chains) and is not another account of the permitted wallet (864 derivation paths tried, `find.mjs`).

To go on, either the permitted wallet's seed is used, or each operator account grants `MsgEditValidator` to the voting
wallet — then `plan.json`'s `signer` becomes that wallet and every row's `mode` becomes `authz`. The voting wallet has
no fee tokens on Terra, Agoric, Althea, humans.ai and Chain4Energy.
