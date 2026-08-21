import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dashboardDir = path.resolve(rootDir, "artifacts/medflow-dashboard");

console.log("Building MedFlow Dashboard with Vite...");
execSync("pnpm --filter @workspace/medflow-dashboard run build", {
  cwd: rootDir,
  stdio: "inherit",
});

const builtDir = path.resolve(dashboardDir, "dist");
const targets = [
  path.resolve(rootDir, "dist"),
  path.resolve(rootDir, "artifacts/api-server/dist"),
];

for (const target of targets) {
  if (target !== builtDir && fs.existsSync(builtDir)) {
    fs.mkdirSync(target, { recursive: true });
    fs.cpSync(builtDir, target, { recursive: true });
    console.log(`Synced build assets to ${target}`);
  }
}

console.log("All build outputs synchronized successfully!");
