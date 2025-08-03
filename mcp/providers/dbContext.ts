import fs from "fs";
import path from "path";

export async function dbContext() {
  const envFile = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envFile)) return { error: ".env.local not found" };

  const env: Record<string, string> = {};
  const lines = fs.readFileSync(envFile, "utf-8").split("\n");
  for (const line of lines) {
    if (line.trim() && !line.startsWith("#")) {
      const [k, v] = line.split("=");
      env[k] = v || "NOT_SET";
    }
  }

  return { env };
}
