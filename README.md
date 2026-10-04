# Claim page

Config-driven meme-coin airdrop page plus a distribution-only backend.

This is a **real airdrop**: tokens flow from the project's distributor wallet **to** the user. The user only signs a short message to prove they control their address — they never approve a spender and never send tokens. The backend will not build any `approve` or `transferFrom` that pulls tokens out of a user's wallet.

## Layout

```
Claim/
  src/           frontend (React + Vite + Tailwind)
  src/config.js  the only file you edit to reskin for a new token
  server/        backend (Node + Express + ethers), its own package.json
```

## Frontend

```bash
cd Claim
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

### Swap the token

Edit `src/config.js` only. The rest of the UI reads from that file.

| Field | What it changes |
| --- | --- |
| `tokenName`, `ticker` | Name and $ticker |
| `logoUrl` | Logo. Use `/logo.svg` or any image URL |
| `tagline`, `description` | Hero line and card text |
| `primaryColor`, `accentColor`, `backgroundColor` | Theme |
| `claimButtonText`, `connectButtonText`, `successMessage` | Main buttons and success state |
| `backendBaseUrl` | Claim API origin, no trailing path |
| `tokenAddress` | Sent as `token` on both API calls |
| `chain` | Network the wallet must be on |
| `links` | Optional buttons. Leave `href` empty to hide one |
| `ui` | Every other label on the page |

## Backend (`server/`)

```bash
cd Claim/server
npm install
cp .env.example .env          # fill in RPC_URL + DISTRIBUTOR_PRIVATE_KEY
cp allocations.example.json allocations.json   # optional per-address amounts
npm start
```

Fund the **distributor** wallet with the airdrop tokens and with gas. Set each address's amount in `allocations.json` (whole token units), or set a flat `DEFAULT_ALLOCATION` in `.env`. An address with no allocation is not eligible.

### Flow

1. `POST /prepare-claim` with `{ token, user }` → `{ message, amount, description }`
2. The wallet signs `message` (a plain string — no transaction, no approval)
3. `POST /submit-claim` with `{ token, user, signature }` → backend verifies the signature, then `transfer`s the allocation from the distributor to the user and returns `{ success, txHash }`

Set `CORS_ORIGIN` in `.env` to your deployed frontend origin in production. The in-memory nonce/claimed tracking resets on restart — move it to a database before a real launch.

## Build

```bash
cd Claim
npm run build && npm run preview
```

`dist/` is the static site. Point `backendBaseUrl` at the deployed backend before you build.
