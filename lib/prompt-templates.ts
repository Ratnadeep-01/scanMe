import { ReviewGenerationRequest } from "./types";

/**
 * PRODUCTION PROMPT ENGINEERING SPECIFICATION FOR GOOGLE REVIEWS
 * 
 * Objective:
 * Generate an authentic, realistic, first-person Google review that reads like a
 * real human customer who just experienced the business.
 * 
 * Key Guardrails:
 * 1. Tone & Natural Voice: Avoid marketing hype, robotic clichés ("In conclusion",
 *    "I recently had the pleasure of visiting", "As someone who..."), and repetitive adjectives.
 * 2. Specificity: Weave in the selected tags and custom user notes naturally into sentences.
 * 3. Star-Rating Calibration:
 *    - 5 Stars: Genuine delight, standout praise, clear intent to return or recommend.
 *    - 4 Stars: Very positive overall, perhaps with balanced nuance or a casual warm recommendation.
 * 4. Human Cadence: Vary sentence lengths. Use natural contractions ("wasn't", "they're", "didn't").
 */

export const SYSTEM_PROMPT = `You are a helpful assistant assisting a genuine customer in drafting a Google Maps review for a business they just visited.

CRITICAL RULES:
1. Write in the first-person ("I", "we", "my family").
2. Write naturally and conversationally, matching the way real people write mobile reviews on Google Maps.
3. NEVER use generic AI cliches or overly formal phrasing such as:
   - "I recently had the pleasure of visiting..."
   - "Nestled in the heart of..."
   - "In conclusion..." / "All in all..."
   - "A testament to excellence..."
   - "Look no further..."
   - "From the moment I walked in..."
4. Incorporate the user's selected tags and any custom notes seamlessly into the narrative without merely listing them.
5. Keep the review concise, punchy, and mobile-friendly (typically 2 to 5 sentences depending on requested length).
6. Match the requested tone (Casual, Enthusiastic, Professional, or Concise).
7. Return ONLY the plain text of the review. Do not wrap in quotes or preface with "Here is your review:".`;

export function buildUserPrompt(req: ReviewGenerationRequest): string {
  const { businessName, category, rating, tags, tone = "casual", customNote, length = "medium" } = req;

  const toneGuidelines: Record<string, string> = {
    casual: "Casual, friendly, and down-to-earth. Sounds like a text or quick recommendation to a friend.",
    enthusiastic: "High energy, super happy, highlighting how amazing the experience was, with natural exclamation.",
    professional: "Polite, well-structured, focusing on quality, efficiency, reliability, and competence.",
    concise: "Short, punchy, straight to the point (2 sentences max). Perfect for busy reviewers.",
  };

  const lengthGuidelines: Record<string, string> = {
    short: "2 sentences (around 25-45 words).",
    medium: "3 to 4 sentences (around 50-80 words).",
    detailed: "5 to 6 sentences with vivid details (around 90-130 words).",
  };

  const tagList = tags.length > 0 ? tags.join(", ") : "general positive experience";

  return `Please draft a ${rating}-star Google review for "${businessName}" (${category}).

Tone: ${toneGuidelines[tone] || toneGuidelines.casual}
Length: ${lengthGuidelines[length] || lengthGuidelines.medium}
Highlights/Tags to mention naturally: ${tagList}
${customNote ? `Specific customer note to include: "${customNote}"` : ""}

Draft the review now:`;
}

/**
 * High-fidelity fallback generative engine.
 * Generates natural, human-grade reviews when an external LLM API key is not configured,
 * ensuring 100% offline reliability with zero downtime.
 */
export function generateFallbackReview(req: ReviewGenerationRequest): {
  review: string;
  alternativeVariations: string[];
} {
  const { businessName, category, rating, tags, tone = "casual", customNote } = req;

  // Category specific vocabulary
  const categoryVocab: Record<string, { noun: string; action: string; compliment: string }> = {
    restaurant: { noun: "food and drinks", action: "eating here", compliment: "the flavors were spot on" },
    cafe: { noun: "coffee and pastries", action: "stopping by", compliment: "great vibes to relax or get work done" },
    hotel: { noun: "stay and hospitality", action: "staying here", compliment: "the room was super comfortable" },
    dentist: { noun: "care and treatment", action: "my appointment", compliment: "they made the whole visit completely stress-free" },
    healthcare: { noun: "care and staff", action: "my consultation", compliment: "very attentive and knowledgeable" },
    salon: { noun: "styling and service", action: "my cut and style", compliment: "left feeling fantastic with the results" },
    automotive: { noun: "mechanics and repairs", action: "getting my car serviced", compliment: "honest pricing and fast turnaround" },
    retail: { noun: "selection and customer care", action: "shopping here", compliment: "found exactly what I needed" },
    gym: { noun: "equipment and trainers", action: "working out here", compliment: "clean facilities and motivating atmosphere" },
    college: { noun: "academics and campus life", action: "studying here", compliment: "the professors and campus facilities are exceptional" },
    education: { noun: "courses and instruction", action: "learning here", compliment: "the faculty and curriculum are top notch" },
    professional: { noun: "service and expertise", action: "working with them", compliment: "handled everything with utmost attention to detail" },
    other: { noun: "service and experience", action: "visiting", compliment: "exceeded all my expectations" },
  };

  const vocab = categoryVocab[category.toLowerCase()] || categoryVocab.other;

  // Tag incorporation phrases
  const tagPhrases = tags.map(tag => {
    const t = tag.toLowerCase();
    if (t.includes("fast") || t.includes("quick") || t.includes("speed")) return "the service was remarkably quick";
    if (t.includes("friendly") || t.includes("staff") || t.includes("welcoming")) return "the team was super welcoming and friendly";
    if (t.includes("clean") || t.includes("hygiene")) return "everything was spotless and clean";
    if (t.includes("ambiance") || t.includes("vibe") || t.includes("atmosphere")) return "loved the cozy, welcoming atmosphere";
    if (t.includes("food") || t.includes("delicious") || t.includes("taste")) return "every single item was fresh and delicious";
    if (t.includes("value") || t.includes("price") || t.includes("affordable")) return "great value for the quality you get";
    if (t.includes("professional") || t.includes("expert")) return "extremely professional and knowledgeable";
    return `really appreciated the ${tag.toLowerCase()}`;
  });

  const tagSentence = tagPhrases.length > 0 
    ? `Special shoutout for how ${tagPhrases.slice(0, 2).join(" and ")}.`
    : "";

  const noteAddition = customNote ? ` Also, ${customNote.trim().replace(/^([a-z])/, m => m.toUpperCase())}.` : "";

  // Diverse tone variations
  const variations: string[] = [];

  if (rating >= 4) {
    if (tone === "casual") {
      variations.push(
        `Really enjoyed my visit to ${businessName}! ${tagSentence ? tagSentence + " " : ""}${vocab.compliment}.${noteAddition} Definitely coming back again soon.`
      );
      variations.push(
        `Can't say enough good things about ${businessName}. ${tagPhrases.length > 0 ? tagPhrases[0].charAt(0).toUpperCase() + tagPhrases[0].slice(1) + ", and " : ""}${vocab.compliment}.${noteAddition} Easily a 5-star experience.`
      );
      variations.push(
        `Such a great spot. ${vocab.action.charAt(0).toUpperCase() + vocab.action.slice(1)} was super smooth from start to finish. ${tagSentence}${noteAddition} Highly recommend checking them out!`
      );
    } else if (tone === "enthusiastic") {
      variations.push(
        `Absolutely blown away by ${businessName}! Everything about ${vocab.action} was top-tier. ${tagSentence}${noteAddition} Will 100% be recommending this place to all my friends and family!`
      );
      variations.push(
        `Hands down one of the best experiences I've had! ${businessName} completely knocked it out of the park. ${tagSentence} ${vocab.compliment}.${noteAddition} Five stars all the way!`
      );
    } else if (tone === "professional") {
      variations.push(
        `Consistently impressed with the standards at ${businessName}. ${tagSentence ? tagSentence + " " : ""}${vocab.compliment}. Their attention to customer satisfaction is evident in every detail.${noteAddition} Highly recommended.`
      );
      variations.push(
        `High quality service and great professionalism at ${businessName}. ${tagPhrases.length > 0 ? "Particularly appreciated that " + tagPhrases.join(" and ") + ". " : ""}${vocab.compliment}.${noteAddition} Will gladly return.`
      );
    } else {
      // concise
      variations.push(
        `Top notch experience at ${businessName}. ${tagPhrases[0] ? tagPhrases[0].charAt(0).toUpperCase() + tagPhrases[0].slice(1) + ". " : ""}${noteAddition}Will definitely be back!`
      );
      variations.push(
        `Great visit to ${businessName}! ${vocab.compliment}.${noteAddition} Highly recommended.`
      );
    }
  } else {
    // 3 stars or lower (if customer decides to generate anyway)
    variations.push(
      `Visited ${businessName} recently. While ${tagPhrases[0] || "some parts were okay"}, there were a few areas that could use improvement.${noteAddition} Hope to see things get better next time.`
    );
  }

  // Shuffle or pick primary
  const primary = variations[0];
  const alternatives = variations.slice(1);

  return {
    review: primary,
    alternativeVariations: alternatives.length > 0 ? alternatives : [
      `Solid 5 stars for ${businessName}. Quality ${vocab.noun} and very attentive staff.${noteAddition}`
    ],
  };
}
