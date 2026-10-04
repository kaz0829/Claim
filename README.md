# STONK community claim

Solana claim site for the verified STONK mint:
`6GmAFSYs4gk3FDao5FzzySQpPZaWsa4rUJHacpMpUNgx`.

The claimant signs a plain message. The backend verifies it and sends SPL
tokens from a dedicated distributor wallet. The claimant never signs a
transaction, sends SOL, or approves token access.

## Frontend

```bash
cd Claim
npm install
npm run dev
```

Edit project text, colors, links, and URLs in `src/config.js`. Set
`backendBaseUrl` to the deployed API before building.

Supported injected Solana wallets include Phantom, Solflare, and Backpack.

## Backend

```bash
cd Claim/server
npm install
cp .env.example .env
cp allocations.example.json allocations.json
npm start
```

Configure `.env`:

- `RPC_URL`: a production Solana mainnet RPC.
- `DISTRIBUTOR_PRIVATE_KEY`: base58 or JSON-array secret for a dedicated
  distributor wallet.
- `TOKEN_MINT`: keep this locked to the verified STONK mint.
- `CORS_ORIGIN`: the exact deployed frontend origin.
- `DEFAULT_ALLOCATION`: optional flat allocation; omit it to require the list.

Put eligible Solana wallet addresses and whole-token amounts in
`server/allocations.json`. Addresses are case-sensitive.

Fund the distributor with STONK and enough SOL for transaction fees and any
recipient associated-token-account rent. Use a dedicated wallet that does not
hold unrelated funds.

## API flow

1. `POST /prepare-claim` with `{ token, user }`.
2. Wallet signs the returned plain-text `message`.
3. `POST /submit-claim` with `{ token, user, signature }`.
4. Server verifies the Ed25519 signature and sends STONK to the claimant.

Completed claims persist in `server/claims.json` (gitignored). Pending nonces
live in memory and expire after ten minutes. For a high-volume launch, replace
the JSON ledger with a transactional database.

## Production checklist

- Replace the placeholder `backendBaseUrl`.
- Use a private authenticated RPC, not the public Solana endpoint.
- Set a restrictive `CORS_ORIGIN`.
- Back up the claims ledger or move it to a database.
- Test with a small allocation and a separate distributor wallet first.
- Never commit `.env`, `allocations.json`, `claims.json`, or a private key.

```bash
cd Claim
npm run build
```

The static frontend is emitted to `dist/`.
