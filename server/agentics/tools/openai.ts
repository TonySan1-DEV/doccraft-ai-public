import OpenAI from "openai";

export type OpenAIAdapterInput = {
  system?: string;
  prompt: string;
  model?: string;
};

export type OpenAIAdapterOutput = {
  text: string;
  usage: { input_tokens: number; output_tokens: number; cost_usd: number };
};

export type OpenAIAdapter = (input: OpenAIAdapterInput) => Promise<OpenAIAdapterOutput>;

const MODEL_DEFAULT = "gpt-4o-mini"; // lightweight & cheap by default
const PRICE_PER_1K_TOKENS: Record<string, { in: number; out: number }> = {
  "gpt-4o-mini": { in: 0.00015, out: 0.0006 },
};

function estimateCost(model: string, input_tokens: number, output_tokens: number) {
  const p = PRICE_PER_1K_TOKENS[model] ?? PRICE_PER_1K_TOKENS[MODEL_DEFAULT];
  return (input_tokens / 1000) * p.in + (output_tokens / 1000) * p.out;
}

export function makeOpenAIAdapter(apiKey = process.env.OPENAI_API_KEY ?? ""): OpenAIAdapter {
  if (!apiKey) {
    // Graceful no‑API fallback: echo the prompt so the pipeline still works in dev.
    return async ({ prompt, model = MODEL_DEFAULT }) => {
      const input_tokens = Math.ceil(prompt.length / 4);
      const output_tokens = Math.ceil(prompt.length / 6);
      return {
        text: `[[NO_OPENAI_API_KEY]] ${prompt}`,
        usage: {
          input_tokens,
          output_tokens,
          cost_usd: estimateCost(model, input_tokens, output_tokens),
        },
      };
    };
  }
  const client = new OpenAI({ apiKey });
  return async ({ prompt, system = "You are a helpful writing assistant.", model = MODEL_DEFAULT }) => {
    const resp = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
    });
    const text = resp.choices[0]?.message?.content ?? "";
    const input_tokens = resp.usage?.prompt_tokens ?? Math.ceil(prompt.length / 4);
    const output_tokens = resp.usage?.completion_tokens ?? Math.ceil(text.length / 4);
    return {
      text,
      usage: {
        input_tokens,
        output_tokens,
        cost_usd: estimateCost(model, input_tokens, output_tokens),
      },
    };
  };
}

export default makeOpenAIAdapter;
