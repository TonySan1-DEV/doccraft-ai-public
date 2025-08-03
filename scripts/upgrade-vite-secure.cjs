const fs = require("fs");
const { execSync } = require("child_process");

console.log("🚀 Starting secure Vite & esbuild upgrade...");

// Step 1: Create snapshot
console.log("\n📸 Creating pre-upgrade snapshot...");
try {
  execSync("node scripts/pre-upgrade-snapshot.cjs", { stdio: "inherit" });
} catch (err) {
  console.error("❌ Failed to create snapshot");
  process.exit(1);
}

// Step 2: Upgrade dependencies
console.log("\n⬆️ Upgrading Vite and esbuild...");
try {
  execSync("npm install vite@latest esbuild@latest", { stdio: "inherit" });
} catch (err) {
  console.error("❌ Upgrade failed, rolling back...");
  execSync("node scripts/rollback-upgrade.cjs", { stdio: "inherit" });
  process.exit(1);
}

// Step 3: Validate upgrade
console.log("\n🔍 Validating upgrade...");
const validationSteps = [
  { name: "Type check", command: "npm run type-check" },
  { name: "Lint", command: "npm run lint" },
  { name: "Build", command: "npm run build" },
  { name: "Tests", command: "npm run test" }
];

for (const step of validationSteps) {
  console.log(`\n🧪 Running ${step.name}...`);
  try {
    execSync(step.command, { stdio: "inherit" });
    console.log(`✅ ${step.name} passed`);
  } catch (err) {
    console.error(`❌ ${step.name} failed, rolling back...`);
    execSync("node scripts/rollback-upgrade.cjs", { stdio: "inherit" });
    process.exit(1);
  }
}

console.log("\n🎉 Upgrade completed successfully!");
console.log("📝 Don't forget to commit your changes:");
console.log("git add . && git commit -m 'chore: upgrade vite and esbuild'"); 