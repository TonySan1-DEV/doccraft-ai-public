# 🚀 DocCraft Agent Extensions Guide

> *data-mcp-source="agent_extensions_docs"*

## 1. Overview

You can now interact with your DocCraft Agent by typing commands, using your voice, or via a powerful command palette. These features make it faster and easier to get help, run exports, and discover agent capabilities.

---

## 2. Using CLI Commands

- **How to use:**
  - In the Agent chat input, type a slash command (e.g., `/export report markdown`, `/help`, `/onboarding theme`).
  - Press Enter to execute the command.
- **Example:**
  - Type `/export report markdown` and press Enter to generate a Markdown report. The agent will confirm and offer quick actions like [Download] or [Email report].
- **Available commands:**
  - `/help` — List all available commands
  - `/export report [format]` — Export a report (formats: markdown, html, json)
  - `/onboarding [module]` — Start onboarding for a module
  - `/language [code]` — Change agent language

---

## 3. Voice Assistant Mode

- **How to activate:**
  - Click the mic icon (🎤) in the chat input or header.
  - When the mic is active, a pulsing red indicator appears.
  - Speak your request; the agent will transcribe and respond.
- **What to expect:**
  - Your speech is converted to text and sent to the agent.
  - The agent can reply with both text and spoken feedback (if enabled).
- **Supported languages:**
  - English, Español, Français, Deutsch, Português, 日本語 (matches your agent language setting)
- **Privacy:**
  - Voice mode is only available to Pro-tier users. You must grant microphone permission.

---

## 4. Command Palette Shortcuts

- **How to open:**
  - Press `Cmd+P` (Mac) or `Ctrl+P` (Windows/Linux) anywhere in the app.
- **How to search:**
  - Type keywords such as `export`, `theme`, or feature names.
  - The palette will show matching commands and knowledge base entries.
- **How to use:**
  - Use arrow keys to navigate results, Enter to select.
  - Selecting a command runs it instantly; selecting a KB entry shows agent guidance.
- **Example UI:**
  ```
  +---------------------------------------------+
  | 🔍 Type a command or search…                |
  +---------------------------------------------+
  | /export report markdown      [CLI]          |
  | /onboarding theme            [CLI]          |
  | Exporting reports            [KB]           |
  | Theme alignment tips         [KB]           |
  +---------------------------------------------+
  ```

---

## 5. Availability & Limitations

- **Pro-tier only:**
  - CLI commands, voice input, and command palette are available to Pro and Admin users.
- **Free-tier:**
  - Controls are visible but disabled, with tooltips: “This feature is available in the Pro plan.”
- **Tips:**
  - If a feature isn’t available, upgrade to Pro to unlock it.

---

## 6. Troubleshooting

- **CLI command failed:**
  - Ensure you typed the command correctly (e.g., `/export report markdown`).
- **Voice not working:**
  - Check your microphone permissions and that your browser supports speech recognition.
  - Make sure your agent language is supported for voice.
- **Command palette not opening:**
  - Ensure no other overlays are blocking the shortcut. Try clicking outside modals and pressing `Cmd+P`/`Ctrl+P` again.

---

For more help, use `/help` in the agent chat or visit the [Support Center](#). 