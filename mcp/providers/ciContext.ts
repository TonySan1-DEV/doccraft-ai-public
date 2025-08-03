import fs from "fs";
import path from "path";

export async function ciContext() {
  const ciFile = path.resolve(process.cwd(), ".github/workflows/ci.yml");
  if (!fs.existsSync(ciFile)) return { error: "CI workflow not found" };

  const content = fs.readFileSync(ciFile, "utf-8");
  const jobs = (content.match(/uses:/g) || []).length;

  return {
    workflow: "ci.yml",
    totalJobs: jobs,
    preview: content.split("\n").slice(0, 15).join("\n"),
  };
}
