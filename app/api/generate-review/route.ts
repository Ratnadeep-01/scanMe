import { NextRequest, NextResponse } from "next/server";
import { ReviewGenerationRequest, ReviewGenerationResponse } from "@/lib/types";
import { buildUserPrompt, SYSTEM_PROMPT, generateFallbackReview } from "@/lib/prompt-templates";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const businessName = (body.businessName || body.name || "this business").trim();
    const rating = typeof body.rating === "number" ? body.rating : 5;
    const tags: string[] = Array.isArray(body.tags) ? body.tags : [];
    const category = body.category || "business";
    const tone = body.tone || "casual";
    const customNote = body.customNote;

    const requestPayload: ReviewGenerationRequest = {
      businessName,
      category,
      rating,
      tags,
      tone,
      customNote,
      length: tone === "concise" ? "short" : "medium",
    };

    const apiKey = process.env.OPENAI_API_KEY;

    // If an OpenAI API Key is configured, attempt the live OpenAI API call
    if (apiKey) {
      try {
        const userPrompt = buildUserPrompt(requestPayload);

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
            const fallbackResult = generateFallbackReview(requestPayload);
            const result: ReviewGenerationResponse = {
              review: generatedText.replace(/^["']|["']$/g, ""),
              alternativeVariations: fallbackResult.alternativeVariations,
              sentimentScore: rating >= 4 ? 0.95 : 0.4,
              generatedBy: "openai",
            };
            return NextResponse.json(result);
          }
        }
      } catch (openAiErr) {
        console.warn("Failed to contact OpenAI API, using fallback engine:", openAiErr);
      }
    }

    // High-performance, anti-robotic fallback generator
    // Generates authentic, natural, first-person human reviews with zero external API dependency
    const fallbackResult = generateFallbackReview(requestPayload);
    const result: ReviewGenerationResponse = {
      review: fallbackResult.review,
      alternativeVariations: fallbackResult.alternativeVariations,
      sentimentScore: rating >= 4 ? 0.94 : 0.4,
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
