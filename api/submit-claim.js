import { submitClaim } from "./_lib/claim.js";

export const maxDuration = 60;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    return res.status(200).json(await submitClaim(body));
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || "claim execution failed",
    });
  }
}