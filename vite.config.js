import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { prepareClaim, submitClaim } from "./api/_lib/claim.js";

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString() || "{}";
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function claimApi() {
  const routes = {
    "/api/prepare-claim": prepareClaim,
    "/api/submit-claim": submitClaim,
  };
  return {
    name: "claim-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0];
        const handler = routes[url];
        if (!handler || req.method !== "POST") return next();
        try {
          const body = await readJson(req);
          const result = await handler(body);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(result));
        } catch (error) {
          res.statusCode = error.status || 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: error.message || "claim service failed" }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [claimApi(), react(), tailwindcss()],
});
