import { NextRequest, NextResponse } from "next/server";
import { ReviewGenerationRequest, ReviewGenerationResponse } from "@/lib/types";
import { buildUserPrompt, SYSTEM_PROMPT, generateFallbackReview } from "@/lib/prompt-templates";

export async function POST(req: NextRequest) {
  try {
    const body: ReviewGenerationRequest = await req.json();

    if (!body.businessName) {
      return NextResponse.json(
        { error: "Business name is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // If an OpenAI API Key is configured, attempt the live OpenAI API call
    if (apiKey) {
      try {
        const userPrompt = buildUserPrompt(body);

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.8,
            max_tokens: 220,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const generatedText = data.choices?.[0]?.message?.content?.trim();

          if (generatedText) {
            // Also generate 1-2 alternatives for user variety
            const fallbackResult = generateFallbackReview(body);
            const result: ReviewGenerationResponse = {
              review: generatedText.replace(/^["']|["']$/g, ""),
              alternativeVariations: fallbackResult.alternativeVariations,
              sentimentScore: 0.95,
              generatedBy: "openai",
            };
            return NextResponse.json(result);
          }
        } else {
          console.warn("OpenAI API returned non-200, falling back to local engine.");
        }
      } catch (openAiErr) {
        console.warn("Failed to contact OpenAI API, falling back:", openAiErr);
      }
    }

    // High-performance, anti-robotic fallback generator
    // Generates human-feeling, varied reviews without requiring API credits
    const fallbackResult = generateFallbackReview(body);
    const result: ReviewGenerationResponse = {
      review: fallbackResult.review,
      alternativeVariations: fallbackResult.alternativeVariations,
      sentimentScore: body.rating >= 4 ? 0.94 : 0.4,
      generatedBy: "fallback-engine",
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in review generation route:", error);
    return NextResponse.json(
      { error: "Internal server error generating review" },
      { status: 500 }
    );
  }
}
