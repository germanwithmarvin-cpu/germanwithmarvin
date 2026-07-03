import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

// Modell für die Korrektur. Haiku = schnell & günstig (Bruchteile eines Cents pro Korrektur).
// Für tiefere Korrekturen hier z.B. auf "claude-sonnet-4-6" oder "claude-opus-4-8" ändern.
const CORRECTION_MODEL = "claude-haiku-4-5";

const Feedback = z.object({
  level: z.string().describe("Estimated CEFR level of the writing, e.g. A1, A2, B1."),
  encouragement: z.string().describe("One warm, encouraging sentence (in English)."),
  corrected_text: z.string().describe("The student's text rewritten in correct German."),
  issues: z
    .array(
      z.object({
        original: z.string().describe("The incorrect snippet from the student's text."),
        correction: z.string().describe("The corrected version."),
        explanation: z.string().describe("Short, simple explanation in English of the mistake."),
      }),
    )
    .describe("List of concrete mistakes found. Empty if the text is already correct."),
});

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Kein Schlüssel hinterlegt → Client nutzt die einfache Korrektur.
    return Response.json({ configured: false }, { status: 200 });
  }

  const { prompt, text } = (await request.json()) as { prompt?: string; text?: string };
  if (!text || !text.trim()) {
    return Response.json({ error: "No text provided." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.parse({
      model: CORRECTION_MODEL,
      max_tokens: 2000,
      system:
        "You are Marvin, a friendly German teacher. A student learning German submitted a short text. " +
        "Correct it kindly and clearly. Explanations must be in English (the learner does not speak German yet). " +
        "Be encouraging and precise. If the text is already correct, return an empty issues list.",
      messages: [
        {
          role: "user",
          content: `Task: ${prompt ?? "Free writing"}\n\nStudent's text:\n"""${text}"""`,
        },
      ],
      output_config: { format: zodOutputFormat(Feedback) },
    });

    return Response.json({ configured: true, feedback: message.parsed_output });
  } catch (error) {
    const msg = error instanceof Anthropic.APIError ? `${error.status}: ${error.message}` : String(error);
    return Response.json({ error: msg }, { status: 502 });
  }
}
