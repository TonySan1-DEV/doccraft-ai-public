// MCP Context Block
/*
role: ai-engineer,
tier: Pro,
file: "modules/agent/services/agentCLI.ts",
allowedActions: ["implement"],
theme: "agent_extensions"
*/

export type AgentCLICommand =
  | { type: "onboarding"; module: string }
  | { type: "export"; target: string; format?: string }
  | { type: "language"; locale: string }
  | { type: "help" }
  | { type: "unknown"; input: string };

const commandList = [
  { cmd: "/onboarding [module]", desc: "Start onboarding for a module" },
  { cmd: "/export [report] [format]", desc: "Export a report in a specific format (markdown, html, json)" },
  { cmd: "/language [code]", desc: "Switch agent language" },
  { cmd: "/help", desc: "Show available commands" }
];

const allowedExportFormats = ["markdown", "html", "json"];

// Parse CLI input
export function parseAgentCLI(input: string): AgentCLICommand {
  const trimmed = input.trim();
  if (/^\/onboarding\s+\w+/.test(trimmed)) {
    const [, module] = trimmed.split(/\s+/);
    return { type: "onboarding", module };
  }
  // /export report [format]
  if (/^\/export\s+report(\s+\w+)?/.test(trimmed)) {
    const parts = trimmed.split(/\s+/);
    const format = parts[2] || undefined;
    return { type: "export", target: "report", format };
  }
  if (/^\/export\s+\w+/.test(trimmed)) {
    const [, target] = trimmed.split(/\s+/);
    return { type: "export", target };
  }
  if (/^\/language\s+\w+/.test(trimmed)) {
    const [, locale] = trimmed.split(/\s+/);
    return { type: "language", locale };
  }
  if (trimmed === "/help") {
    return { type: "help" };
  }
  return { type: "unknown", input };
}

// Export logic stub (to be replaced with actual analytics module call)
async function exportReport(format: string): Promise<{ url: string; fileName: string }> {
  // Simulate async export
  await new Promise(res => setTimeout(res, 500));
  return {
    url: `/downloads/report.${format}`,
    fileName: `DocCraft-Report.${format}`
  };
}

// Execute CLI command
export async function executeAgentCLI(
  command: AgentCLICommand,
  {
    onOnboarding,
    onExport,
    onLanguage,
    onHelp,
    userTier,
    ariaAnnounce
  }: {
    onOnboarding: (module: string) => void;
    onExport: (target: string, format?: string) => void;
    onLanguage: (locale: string) => void;
    onHelp: () => void;
    userTier: string;
    ariaAnnounce?: (msg: string) => void;
  }
): Promise<
  | string
  | {
      type: "agent";
      content: string;
      suggestedActions: { label: string; action: string; url?: string }[];
      ariaLive?: "polite";
      "data-mcp-source"?: string;
    }
> {
  if (userTier !== "Pro" && userTier !== "Admin") {
    return "CLI commands are available for Pro users only.";
  }
  switch (command.type) {
    case "onboarding":
      onOnboarding(command.module);
      return `Onboarding for ${command.module} started.`;
    case "export": {
      if (command.target === "report") {
        const format = command.format ? command.format.toLowerCase() : "markdown";
        if (!allowedExportFormats.includes(format)) {
          return {
            type: "agent",
            content: `Sorry, the format '${format}' is not supported. Please use one of: ${allowedExportFormats.join(", ")}.`,
            suggestedActions: [
              { label: "Try Again", action: "retry" }
            ],
            ariaLive: "polite",
            "data-mcp-source": "agent_extension_cli_voice"
          };
        }
        if (ariaAnnounce) ariaAnnounce(`Exporting report as ${format}.`);
        // Call export logic
        const { url } = await exportReport(format);
        if (ariaAnnounce) ariaAnnounce(`Your report (${format}) is ready for download.`);
        return {
          type: "agent",
          content: `Your report (${format.charAt(0).toUpperCase() + format.slice(1)}) is being generated…`,
          suggestedActions: [
            { label: "Download", action: "download", url },
            { label: "Email report", action: "email" }
          ],
          ariaLive: "polite",
          "data-mcp-source": "agent_extension_cli_voice"
        };
      } else {
        onExport(command.target, command.format);
        return `Exporting ${command.target}...`;
      }
    }
    case "language":
      onLanguage(command.locale);
      return `Agent language switched to ${command.locale}.`;
    case "help":
      onHelp();
      return commandList.map(c => `${c.cmd}: ${c.desc}`).join("\n");
    default:
      return "Unknown command. Type /help for a list of commands.";
  }
} 