const fs = require("fs");
const { execSync } = require("child_process");

function getVersion(pkg) {
  try {
    return execSync(`npm list ${pkg} --depth=0`)
      .toString()
      .match(new RegExp(`${pkg}@(\\S+)`))[1];
  } catch {
    return null;
  }
}

const snapshot = {
  vite: getVersion("vite"),
  esbuild: getVersion("esbuild"),
  timestamp: new Date().toISOString()
};

fs.writeFileSync("upgrade-snapshot.json", JSON.stringify(snapshot, null, 2));
console.log("✅ Snapshot saved:", snapshot); 