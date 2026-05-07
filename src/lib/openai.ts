import OpenAI from "openai";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ProviderOptions {
  aiProvider?: string;
  openaiApiKey?: string;
  openaiModel?: string;
  groqApiKey?: string;
  groqModel?: string;
}

function buildClient(opts: ProviderOptions): { client: OpenAI; model: string } {
  if (opts.aiProvider === "groq") {
    return {
      client: new OpenAI({
        apiKey: opts.groqApiKey ?? "",
        baseURL: "https://api.groq.com/openai/v1",
      }),
      model: opts.groqModel ?? "llama-3.3-70b-versatile",
    };
  }
  return {
    client: new OpenAI({
      apiKey: opts.openaiApiKey || process.env.OPENAI_API_KEY,
    }),
    model: opts.openaiModel || "gpt-4.1-mini",
  };
}

export async function generateResponse(
  messages: ChatMessage[],
  systemPrompt: string,
  temperature: number,
  maxTokens: number,
  providerOpts: ProviderOptions = {}
): Promise<{ content: string; tokens: number }> {
  const { client, model } = buildClient(providerOpts);

  const response = await client.chat.completions.create({
    model,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    temperature,
    max_tokens: maxTokens,
  });

  return {
    content: response.choices[0].message.content ?? "",
    tokens: response.usage?.total_tokens ?? 0,
  };
}
