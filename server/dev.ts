import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { createServer as viteServer } from "vite";
import { handle } from "./api.js";
try {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = /^RUN_SIGNING_SECRET=(.+)$/.exec(line);
    if (m && !process.env.RUN_SIGNING_SECRET)
      process.env.RUN_SIGNING_SECRET = m[1];
  }
} catch {}
if (!process.env.RUN_SIGNING_SECRET)
  process.env.RUN_SIGNING_SECRET = randomBytes(32).toString("hex");
const port = Number(process.env.PORT || 5187);
const vite = await viteServer({
  server: { middlewareMode: true, hmr: { port: port + 20000 } },
  appType: "spa",
});
createServer(async (req, res) => {
  if (req.url?.startsWith("/api/run/")) {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    try {
      if (req.method !== "POST") {
        res.statusCode = 405;
        throw Error("Gunakan POST.");
      }
      let raw = "";
      for await (const chunk of req) {
        raw += chunk;
        if (raw.length > 18000) {
          res.statusCode = 413;
          throw Error("Request terlalu besar.");
        }
      }
      const result = handle(
        req.url.split("?")[0].split("/").pop()!,
        JSON.parse(raw),
      );
      res.end(JSON.stringify(result));
    } catch (e) {
      if (res.statusCode === 200) res.statusCode = 400;
      res.end(
        JSON.stringify({
          error: e instanceof Error ? e.message : "Request gagal.",
        }),
      );
    }
  } else vite.middlewares(req, res);
}).listen(port, "127.0.0.1", () =>
  console.log(`DI ATAS TUJUH → http://127.0.0.1:${port}`),
);
