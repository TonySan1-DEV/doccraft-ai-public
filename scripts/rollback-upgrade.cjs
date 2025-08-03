const fs = require("fs");
const { execSync } = require("child_process");

if (!fs.existsSync("upgrade-snapshot.json")) {
  console.error("❌ No snapshot found. Run npm run pre-upgrade first.");
  process.exit(1);
}

const snapshot = JSON.parse(fs.readFileSync("upgrade-snapshot.json", "utf-8"));

console.log("🔄 Rolling back to:", snapshot);

try {
  // Handle case where esbuild was not directly installed
  const installCommand = snapshot.esbuild 
    ? `npm install vite@${snapshot.vite} esbuild@${snapshot.esbuild}`
    : `npm install vite@${snapshot.vite}`;
  
  execSync(installCommand, {
    stdio: "inherit"
  });
  console.log("✅ Rollback successful");
} catch (err) {
  console.error("❌ Rollback failed", err);
  process.exit(1);
} 