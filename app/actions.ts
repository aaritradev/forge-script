'use server';

import { GoogleGenAI, Type } from "@google/genai";
import { ScriptRequest, ScriptOutput } from "../types";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import prisma from "../lib/prisma";

export async function forgeScriptAction(
  params: ScriptRequest
): Promise<ScriptOutput> {

  // 🔐 AUTH
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized.");

  let user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: session.user.email,
        name: session.user.name ?? "",
        credits: 3,
        plan: "free"
      }
    });
  }

  if (user.monthlyCredits <= 0 && user.credits <= 0) {
  throw new Error("No credits remaining.");
}

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing.");

  const ai = new GoogleGenAI({ apiKey });

  const durationRules: Record<number, { min: number; max: number }> = {
    15: { min: 40, max: 70 },
    30: { min: 90, max: 130 },
    60: { min: 180, max: 260 },
  };

  const rule = durationRules[params.duration] || durationRules[30];

  const systemInstruction = `
You are ForgeScript — a cold, psychologically sharp reel engine.

Generate EXACTLY 3 variations.

STRICT STYLE RULES:

- No metaphors.
- No poetic language.
- No motivational clichés.
- No philosophical masculinity statements.
- No “A man is…” statements.
- No abstract identity definitions.
- No coaching language.
- No "You will", "You must", "You need to".
- No step-by-step advice.

- Grounded modern scenarios only.
- At least 2 specific physical actions per variation.
- Use short, punchy lines.
- Escalate tension across sections.
- Keep language direct and observational.

STRUCTURE:

Hook:
- Directly confront "you".
- Expose behavior immediately.

Struggle:
- Show observable actions.
- Minimum 2 sentences.
- Increase pressure.

Realization:
- Expose contradiction between what you say and what you do.
- No advice tone.

Declaration:
- Personal behavioral truth.
- No philosophy.
- No identity theory.
- No inspirational framing.
- Short and sharp.

CTA:
- 2–5 words.
- Binary identity contrast.
- Minimal words.

Each variation must be ${rule.min}-${rule.max} words.

Tone: cold, controlled, dominant.
Not loud. Not inspirational. Controlled pressure.

Tone setting: ${params.tone}
Target Duration: ${params.duration} seconds
`;

  try {
    const prompt = `
Forge 3 grounded, psychologically sharp scripts about:
"${params.topic}"

Tone: ${params.tone}
Target duration: ${params.duration} seconds.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.9,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            variations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  hook: { type: Type.STRING },
                  struggle: { type: Type.STRING },
                  realization: { type: Type.STRING },
                  declaration: { type: Type.STRING },
                  cta: { type: Type.STRING },
                  estimatedDuration: { type: Type.INTEGER }
                },
                required: [
                  "hook",
                  "struggle",
                  "realization",
                  "declaration",
                  "cta",
                  "estimatedDuration"
                ]
              }
            },
            visualSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            caption: { type: Type.STRING },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["variations", "visualSuggestions", "caption", "hashtags"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}") as ScriptOutput;

    if (!parsed.variations || parsed.variations.length !== 3) {
      throw new Error("Model did not return 3 variations.");
    }

// ---- CREDIT LOGIC ----

let remainingCredits = user.credits;
let remainingMonthly = user.monthlyCredits;

// Block if no usable credits
if (user.monthlyCredits <= 0 && user.credits <= 0) {
  throw new Error("No credits remaining.");
}

// Use monthly first
if (user.monthlyCredits > 0) {
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { monthlyCredits: { decrement: 1 } }
  });

  remainingMonthly = updatedUser.monthlyCredits;

} else {
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { credits: { decrement: 1 } }
  });

  remainingCredits = updatedUser.credits;
}

// ---- RETURN ----

return {
  ...parsed,
  remainingCredits:
    remainingMonthly > 0
      ? remainingMonthly
      : remainingCredits
};

  } catch (error) {
    console.error("Forge Action Error:", error);
    throw new Error("Generation failed. Please try again.");
  }
}