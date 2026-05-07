import OpenAI from "openai";

export function getOpenAIClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function generateResponse(
  messages: ChatMessage[],
  systemPrompt: string,
  temperature: number,
  maxTokens: number
): Promise<{ content: string; tokens: number }> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    temperature,
    max_tokens: maxTokens,
  });

  return {
    content: response.choices[0].message.content ?? "",
    tokens: response.usage?.total_tokens ?? 0,
  };
}
