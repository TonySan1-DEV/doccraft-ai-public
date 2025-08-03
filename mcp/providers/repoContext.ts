import fs from "fs";
import path from "path";

export async function repoContext() {
  const srcPath = path.resolve(process.cwd(), "src");
  const files = fs.existsSync(srcPath) ? fs.readdirSync(srcPath) : [];

  return {
    trackedFiles: files,
    configs: ["tsconfig.json", "eslint.config.js", "jest.config.cjs"],
  };
}
