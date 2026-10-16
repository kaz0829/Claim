# STONK community claim

The website and the claim API deploy together on Vercel. `backendBaseUrl` in `src/config.js` is already `/api`, so you do not point it at another host.

A claimer signs a plain message. The API verifies it and sends STONK from a dedicated distributor wallet to that claimer. The claimer does not approve token spending or send a transaction.

## Run locally

```bash
cd Claim
npm install
cp .env.example .env
npm run dev
```

## Vercel environment variables

In the Vercel project, add these under Settings → Environment Variables. Do not prefix them with `VITE_`.

| Name | Value |
| --- | --- |
| `RPC_URL` | A private Solana mainnet RPC URL |
| `DISTRIBUTOR_PRIVATE_KEY` | Base58 secret of a dedicated distributor wallet |
| `TOKEN_MINT` | `6GmAFSYs4gk3FDao5FzzySQpPZaWsa4rUJHacpMpUNgx` |
| `DEFAULT_ALLOCATION` | Whole tokens given to every wallet, such as `1000` |
| `ALLOCATIONS_JSON` | Optional. `{"WalletAddress":"1000"}` instead of a flat amount |
| `DATABASE_URL` | Neon or Postgres connection string |

`DATABASE_URL` is required on Vercel. It stores who already claimed so the same wallet is not paid twice. Create a free database at [neon.tech](https://neon.tech) and paste its connection string. The API creates the `claims` table on its own.

Fund the distributor wallet with STONK and a little SOL for fees. Do not use a wallet that holds unrelated funds. The public address does not need its own variable; it is derived from the private key.

Set the Vercel root directory to `Claim` if the Git repo root is the parent `Crypto` folder.

## Deploy

Push the project, import it in Vercel, add the variables, and deploy. The site and `/api/prepare-claim` plus `/api/submit-claim` are the same deployment.
