import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

// API health endpoint
app.get("/api/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

// Serve static frontend dashboard
const staticDirs = [
  path.join(__dirname, "artifacts/medflow-dashboard/dist/public"),
  path.join(__dirname, "artifacts/medflow-dashboard/dist"),
  path.join(__dirname, "dist/public"),
  path.join(__dirname, "dist"),
];

let activeStaticDir = staticDirs[0];
for (const dir of staticDirs) {
  if (existsSync(dir)) {
    activeStaticDir = dir;
    break;
  }
}

app.use(express.static(activeStaticDir));

// Fallback for SPA routing
app.use((_req, res) => {
  const indexHtml = path.join(activeStaticDir, "index.html");
  if (existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.send("MedFlow Dashboard is initializing. Please build the frontend.");
  }
});

const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`MedFlow Server running on port ${PORT}`);
  });
}

export default app;
