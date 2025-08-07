// MCP Context Block
/*
{
  file: "characterDevelopmentService.ts",
  role: "developer",
  allowedActions: ["analyze", "generate", "simulate", "develop"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "character_development"
}
*/

import { CharacterPersona } from "../types/CharacterPersona";

export interface CharacterDevelopmentPrompt {
  id: string;
  category:
    | "personality"
    | "background"
    | "goals"
    | "relationships"
    | "psychology"
    | "communication";
  question: string;
  description: string;
  importance: "low" | "medium" | "high";
  completed: boolean;
  response?: string;
  timestamp: Date;
  followUpQuestions?: string[];
}

export interface CharacterAnalysis {
  personalityInsights: string[];
  relationshipPatterns: string[];
  goalAlignment: string[];
  psychologicalProfile: string[];
  communicationStyle: string[];
  developmentRecommendations: string[];
  storyPotential: string[];
}

export interface CharacterInteraction {
  message: string;
  characterResponse: string;
  emotion: string;
  intensity: number;
  context: string;
  timestamp: Date;
}

export interface CharacterDevelopmentSession {
  characterId: string;
  sessionId: string;
  interactions: CharacterInteraction[];
  prompts: CharacterDevelopmentPrompt[];
  analysis: CharacterAnalysis;
  sessionNotes: string[];
  duration: number;
  completed: boolean;
}

// Personality frameworks for character development
export const PERSONALITY_FRAMEWORKS = {
  mbti: {
    types: [
      "INTJ",
      "INTP",
      "ENTJ",
      "ENTP",
      "INFJ",
      "INFP",
      "ENFJ",
      "ENFP",
      "ISTJ",
      "ISFJ",
      "ESTJ",
      "ESFJ",
      "ISTP",
      "ISFP",
      "ESTP",
      "ESFP",
    ],
    descriptions: {
      INTJ: "Architect - Imaginative and strategic thinkers",
      INTP: "Logician - Innovative inventors with an unquenchable thirst for knowledge",
      ENTJ: "Commander - Bold, imaginative and strong-willed leaders",
      ENTP: "Debater - Smart and curious thinkers who cannot resist an intellectual challenge",
      INFJ: "Advocate - Quiet and mystical, yet very inspiring and tireless idealists",
      INFP: "Mediator - Poetic, kind and altruistic people, always eager to help a good cause",
      ENFJ: "Protagonist - Charismatic and inspiring leaders, able to mesmerize their listeners",
      ENFP: "Campaigner - Enthusiastic, creative and sociable free spirits",
      ISTJ: "Logistician - Practical and fact-minded individuals, whose reliability cannot be doubted",
      ISFJ: "Defender - Very dedicated and warm protectors, always ready to defend their loved ones",
      ESTJ: "Executive - Excellent administrators, unsurpassed at managing things or people",
      ESFJ: "Consul - Extraordinarily caring, social and popular people",
      ISTP: "Virtuoso - Bold and practical experimenters, masters of all kinds of tools",
      ISFP: "Adventurer - Flexible and charming artists, always ready to explore and experience something new",
      ESTP: "Entrepreneur - Smart, energetic and very perceptive people",
      ESFP: "Entertainer - Spontaneous, energetic and enthusiastic entertainers",
    },
  },
  enneagram: {
    types: [
      "Type 1",
      "Type 2",
      "Type 3",
      "Type 4",
      "Type 5",
      "Type 6",
      "Type 7",
      "Type 8",
      "Type 9",
    ],
    descriptions: {
      "Type 1":
        "The Reformer - Principled, purposeful, self-controlled, and perfectionistic",
      "Type 2": "The Helper - Generous, people-pleasing, and possessive",
      "Type 3":
        "The Achiever - Adaptable, excelling, driven, and image-conscious",
      "Type 4":
        "The Individualist - Expressive, dramatic, self-absorbed, and temperamental",
      "Type 5":
        "The Investigator - Perceptive, innovative, secretive, and isolated",
      "Type 6": "The Loyalist - Engaging, responsible, anxious, and suspicious",
      "Type 7": "The Enthusiast - Busy, fun-loving, and scattered",
      "Type 8":
        "The Challenger - Powerful, dominating, self-confident, and confrontational",
      "Type 9":
        "The Peacemaker - Receptive, reassuring, complacent, and resigned",
    },
  },
  bigFive: {
    traits: [
      "Openness",
      "Conscientiousness",
      "Extraversion",
      "Agreeableness",
      "Neuroticism",
    ],
    descriptions: {
      Openness:
        "Imagination, artistic interests, emotionality, adventurousness, intellect, liberalism",
      Conscientiousness:
        "Self-efficacy, orderliness, dutifulness, achievement-striving, self-discipline, cautiousness",
      Extraversion:
        "Friendliness, gregariousness, assertiveness, activity level, excitement-seeking, cheerfulness",
      Agreeableness:
        "Trust, straightforwardness, altruism, compliance, modesty, tender-mindedness",
      Neuroticism:
        "Anxiety, anger, depression, self-consciousness, immoderation, vulnerability",
    },
  },
};

// Character development prompts by category
export const DEVELOPMENT_PROMPTS = {
  personality: [
    {
      question:
        "What is your biggest fear and how does it affect your decisions?",
      description:
        "Explore the character's deepest fears and their impact on behavior",
      importance: "high" as const,
    },
    {
      question: "How do you typically react under pressure?",
      description: "Understand the character's stress response patterns",
      importance: "medium" as const,
    },
    {
      question: "What makes you feel most alive and fulfilled?",
      description: "Discover what truly motivates and energizes the character",
      importance: "high" as const,
    },
    {
      question: "How do you handle criticism from others?",
      description:
        "Explore the character's emotional resilience and self-esteem",
      importance: "medium" as const,
    },
    {
      question: "What is your greatest strength and how do you use it?",
      description: "Identify and understand the character's core competencies",
      importance: "high" as const,
    },
    {
      question: "What would you change about yourself if you could?",
      description: "Reveal the character's self-awareness and growth areas",
      importance: "medium" as const,
    },
    {
      question: "How do you make important decisions?",
      description: "Understand the character's decision-making process",
      importance: "medium" as const,
    },
    {
      question: "What do you value most in life?",
      description: "Discover the character's core values and principles",
      importance: "high" as const,
    },
  ],
  background: [
    {
      question: "What was the most defining moment of your childhood?",
      description: "Explore formative experiences that shaped the character",
      importance: "high" as const,
    },
    {
      question: "How did your family shape who you are today?",
      description: "Understand family dynamics and their lasting impact",
      importance: "high" as const,
    },
    {
      question: "What was your first job and what did you learn from it?",
      description: "Explore early work experiences and their influence",
      importance: "medium" as const,
    },
    {
      question: "What cultural traditions are important to you?",
      description: "Understand cultural background and identity",
      importance: "medium" as const,
    },
    {
      question: "What was the hardest lesson you ever learned?",
      description: "Reveal significant life lessons and their impact",
      importance: "high" as const,
    },
    {
      question: "Where did you grow up and how did it influence you?",
      description: "Explore environmental factors in character development",
      importance: "medium" as const,
    },
    {
      question: "What was your education like?",
      description: "Understand educational background and its effects",
      importance: "medium" as const,
    },
    {
      question: "What significant events shaped your worldview?",
      description: "Identify key experiences that changed perspective",
      importance: "high" as const,
    },
  ],
  goals: [
    {
      question: "What is your ultimate dream in life?",
      description: "Discover the character's deepest aspirations",
      importance: "high" as const,
    },
    {
      question: "What would you sacrifice everything for?",
      description: "Identify the character's highest priorities",
      importance: "high" as const,
    },
    {
      question: "What do you want to achieve in the next year?",
      description: "Understand short-term goals and motivation",
      importance: "medium" as const,
    },
    {
      question: "What legacy do you want to leave behind?",
      description: "Explore the character's long-term vision",
      importance: "medium" as const,
    },
    {
      question: "What would make you feel truly successful?",
      description: "Define the character's success criteria",
      importance: "high" as const,
    },
    {
      question: "What are you willing to fight for?",
      description: "Identify the character's core convictions",
      importance: "high" as const,
    },
    {
      question: "What do you want to be remembered for?",
      description: "Understand the character's desired impact",
      importance: "medium" as const,
    },
    {
      question: "What would you do if you had unlimited resources?",
      description: "Explore the character's ideal scenario",
      importance: "medium" as const,
    },
  ],
  relationships: [
    {
      question: "Who do you trust most and why?",
      description: "Understand the character's trust patterns",
      importance: "high" as const,
    },
    {
      question: "What do you look for in a friend?",
      description: "Explore friendship values and criteria",
      importance: "medium" as const,
    },
    {
      question: "How do you handle conflict with loved ones?",
      description: "Understand relationship conflict resolution",
      importance: "high" as const,
    },
    {
      question: "What is your love language?",
      description: "Discover how the character expresses affection",
      importance: "medium" as const,
    },
    {
      question: "How do you show affection to others?",
      description: "Explore the character's emotional expression",
      importance: "medium" as const,
    },
    {
      question: "What makes you feel connected to someone?",
      description: "Understand the character's bonding patterns",
      importance: "medium" as const,
    },
    {
      question: "How do you support others when they're struggling?",
      description: "Explore the character's empathy and support style",
      importance: "medium" as const,
    },
    {
      question: "What boundaries are most important to you?",
      description: "Understand the character's relationship boundaries",
      importance: "high" as const,
    },
  ],
  psychology: [
    {
      question: "What triggers your anxiety or stress?",
      description: "Identify the character's stress triggers",
      importance: "high" as const,
    },
    {
      question: "How do you cope with difficult emotions?",
      description: "Understand the character's emotional regulation",
      importance: "high" as const,
    },
    {
      question: "What helps you feel grounded and centered?",
      description: "Discover the character's self-soothing strategies",
      importance: "medium" as const,
    },
    {
      question: "How do you process grief or loss?",
      description: "Explore the character's grief response",
      importance: "high" as const,
    },
    {
      question: "What patterns do you notice in your behavior?",
      description: "Encourage self-reflection and awareness",
      importance: "medium" as const,
    },
    {
      question: "What are your defense mechanisms?",
      description: "Identify the character's psychological defenses",
      importance: "high" as const,
    },
    {
      question: "How do you handle uncertainty?",
      description: "Understand the character's tolerance for ambiguity",
      importance: "medium" as const,
    },
    {
      question: "What gives you a sense of security?",
      description: "Discover the character's security needs",
      importance: "medium" as const,
    },
  ],
  communication: [
    {
      question: "How do you express anger or frustration?",
      description: "Understand the character's anger expression",
      importance: "high" as const,
    },
    {
      question: "What topics are hardest for you to discuss?",
      description: "Identify the character's communication barriers",
      importance: "medium" as const,
    },
    {
      question: "How do you give feedback to others?",
      description: "Explore the character's feedback style",
      importance: "medium" as const,
    },
    {
      question: "What makes you feel heard and understood?",
      description: "Understand the character's communication needs",
      importance: "medium" as const,
    },
    {
      question: "How do you handle misunderstandings?",
      description: "Explore the character's conflict communication",
      importance: "high" as const,
    },
    {
      question: "What is your communication style under stress?",
      description: "Understand stress communication patterns",
      importance: "medium" as const,
    },
    {
      question: "How do you express love and affection?",
      description: "Explore the character's emotional communication",
      importance: "medium" as const,
    },
    {
      question: "What do you do when you need space?",
      description: "Understand the character's boundary communication",
      importance: "medium" as const,
    },
  ],
};

// Generate character development prompts
export function generateCharacterPrompts(
  _character: CharacterPersona
): CharacterDevelopmentPrompt[] {
  const prompts: CharacterDevelopmentPrompt[] = [];

  Object.entries(DEVELOPMENT_PROMPTS).forEach(([category, categoryPrompts]) => {
    categoryPrompts.forEach((prompt, index) => {
      prompts.push({
        id: `${category}-${index}`,
        category: category as CharacterDevelopmentPrompt["category"],
        question: prompt.question,
        description: prompt.description,
        importance: prompt.importance,
        completed: false,
        timestamp: new Date(),
        followUpQuestions: generateFollowUpQuestions(prompt.question, category),
      });
    });
  });

  return prompts;
}

// Generate follow-up questions based on the main question
function generateFollowUpQuestions(
  _mainQuestion: string,
  category: string
): string[] {
  const followUps: Record<string, string[]> = {
    personality: [
      "Can you give me a specific example of when this happened?",
      "How has this changed over time?",
      "What would you like to change about this?",
    ],
    background: [
      "How did this experience shape your worldview?",
      "What would you do differently now?",
      "How does this still affect you today?",
    ],
    goals: [
      "What steps are you taking to achieve this?",
      "What obstacles do you face?",
      "How will you know when you've succeeded?",
    ],
    relationships: [
      "How does this affect your other relationships?",
      "What have you learned from this?",
      "How would you like this to be different?",
    ],
    psychology: [
      "When did you first notice this pattern?",
      "What triggers this response?",
      "How do you want to handle this in the future?",
    ],
    communication: [
      "How do others typically respond to this?",
      "What would make this easier for you?",
      "How do you want to improve this?",
    ],
  };

  return (
    followUps[category] || [
      "Can you tell me more about that?",
      "How does this make you feel?",
      "What would you like to change?",
    ]
  );
}

// Analyze character personality using AI
export async function analyzeCharacterPersonality(
  character: CharacterPersona,
  interactions: CharacterInteraction[] = []
): Promise<CharacterAnalysis> {
  const analysisPrompt = `
Analyze the personality of ${
    character.name
  } based on their profile and interactions.

CHARACTER PROFILE:
- Name: ${character.name}
- Archetype: ${character.archetype}
- Personality: ${character.personality}
- Goals: ${character.goals}
- Voice Style: ${character.voiceStyle}
- Worldview: ${character.worldview}
- Backstory: ${character.backstory || "Not provided"}

RECENT INTERACTIONS:
${interactions
  .slice(-10)
  .map(
    (i) =>
      `${i.timestamp.toLocaleString()}: ${i.message} -> ${i.characterResponse}`
  )
  .join("\n")}

Please provide a comprehensive analysis covering:
1. Personality insights and patterns
2. Relationship dynamics and patterns
3. Goal alignment and motivation
4. Psychological profile and coping mechanisms
5. Communication style and preferences
6. Development recommendations
7. Story potential and character arc suggestions

Format your response as a structured analysis with clear sections.
`;

  try {
    const response = await fetch("/api/openai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a character development expert analyzing fictional characters.",
          },
          { role: "user", content: analysisPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) throw new Error("Analysis service unavailable");

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content?.trim() || "";

    return parseCharacterAnalysis(analysisText);
  } catch (error) {
    console.error("Character analysis failed:", error);
    return generateFallbackAnalysis(character);
  }
}

// Parse AI analysis into structured format
function parseCharacterAnalysis(analysisText: string): CharacterAnalysis {
  // Simple parsing - in a real implementation, you'd want more sophisticated parsing
  const sections = analysisText.split("\n\n");

  return {
    personalityInsights: extractInsights(sections, "personality"),
    relationshipPatterns: extractInsights(sections, "relationship"),
    goalAlignment: extractInsights(sections, "goal"),
    psychologicalProfile: extractInsights(sections, "psychological"),
    communicationStyle: extractInsights(sections, "communication"),
    developmentRecommendations: extractInsights(sections, "development"),
    storyPotential: extractInsights(sections, "story"),
  };
}

function extractInsights(sections: string[], keyword: string): string[] {
  const relevantSection = sections.find((section) =>
    section.toLowerCase().includes(keyword)
  );

  if (!relevantSection) return [];

  return relevantSection
    .split("\n")
    .filter(
      (line) => line.trim().startsWith("-") || line.trim().startsWith("•")
    )
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter((line) => line.length > 0);
}

// Generate fallback analysis when AI is unavailable
function generateFallbackAnalysis(
  character: CharacterPersona
): CharacterAnalysis {
  return {
    personalityInsights: [
      `${character.name} shows a ${character.archetype} archetype with ${character.personality} personality traits.`,
      `Their worldview is shaped by ${character.worldview}.`,
      `They communicate in a ${character.voiceStyle} style.`,
    ],
    relationshipPatterns: [
      `Based on their ${character.archetype} nature, they likely form ${
        character.knownConnections.length > 0 ? "deep" : "selective"
      } relationships.`,
      `Their ${character.personality} suggests they value authenticity in connections.`,
    ],
    goalAlignment: [
      `Primary goal: ${character.goals}`,
      `This aligns with their ${character.archetype} archetype.`,
    ],
    psychologicalProfile: [
      `As a ${character.archetype}, they likely have strong convictions.`,
      `Their ${character.personality} suggests emotional depth.`,
    ],
    communicationStyle: [
      `Communication style: ${character.voiceStyle}`,
      `They likely prefer ${
        character.voiceStyle.includes("direct") ? "direct" : "nuanced"
      } communication.`,
    ],
    developmentRecommendations: [
      "Explore their backstory more deeply",
      "Develop their relationships with other characters",
      "Consider their character arc progression",
    ],
    storyPotential: [
      `${character.name} has strong potential for a ${character.archetype} character arc.`,
      "Their goals and personality create natural conflict opportunities.",
      "Their relationships can drive plot development.",
    ],
  };
}

// Simulate character response to user input
export async function simulateCharacterResponse(
  userInput: string,
  character: CharacterPersona,
  context: string = "",
  conversationHistory: CharacterInteraction[] = []
): Promise<CharacterInteraction> {
  const systemPrompt = `
You are role-playing as ${
    character.name
  }, a fictional character with the following profile:

PERSONALITY: ${character.personality}
ARCHETYPE: ${character.archetype}
GOALS: ${character.goals}
VOICE STYLE: ${character.voiceStyle}
WORLDVIEW: ${character.worldview}
${character.backstory ? `BACKSTORY: ${character.backstory}` : ""}

KNOWN CONNECTIONS:
${character.knownConnections
  .map(
    (conn) =>
      `- ${conn.relationship} of ${conn.name}${
        conn.description ? ` (${conn.description})` : ""
      }`
  )
  .join("\n")}

CONTEXT: ${context}

CONVERSATION HISTORY:
${conversationHistory
  .slice(-5)
  .map(
    (i) =>
      `${i.timestamp.toLocaleString()}: User: ${i.message} | ${
        character.name
      }: ${i.characterResponse}`
  )
  .join("\n")}

Respond as ${
    character.name
  } would, maintaining their personality, speaking style, and worldview. Stay in character at all times. Keep responses natural and conversational, not overly formal.
`;

  try {
    const response = await fetch("/api/openai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userInput },
        ],
        temperature: 0.8,
        max_tokens: 300,
      }),
    });

    if (!response.ok) throw new Error("Character response service unavailable");

    const data = await response.json();
    const characterResponse =
      data.choices?.[0]?.message?.content?.trim() ||
      `${character.name} seems lost in thought...`;

    return {
      message: userInput,
      characterResponse,
      emotion: analyzeEmotion(characterResponse),
      intensity: analyzeIntensity(characterResponse),
      context,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Character response generation failed:", error);
    return {
      message: userInput,
      characterResponse: `${character.name} is momentarily distracted and doesn't respond clearly.`,
      emotion: "neutral",
      intensity: 0.3,
      context,
      timestamp: new Date(),
    };
  }
}

// Simple emotion analysis
function analyzeEmotion(text: string): string {
  const emotionKeywords = {
    joy: ["happy", "excited", "thrilled", "delighted", "joyful"],
    anger: ["angry", "furious", "mad", "irritated", "frustrated"],
    sadness: ["sad", "depressed", "melancholy", "sorrowful", "grief"],
    fear: ["afraid", "scared", "terrified", "anxious", "worried"],
    surprise: ["surprised", "shocked", "amazed", "astonished", "stunned"],
    disgust: ["disgusted", "repulsed", "revolted", "appalled"],
    trust: ["trusting", "confident", "assured", "certain"],
    anticipation: ["eager", "hopeful", "optimistic", "expectant"],
  };

  const lowerText = text.toLowerCase();

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      return emotion;
    }
  }

  return "neutral";
}

// Simple intensity analysis
function analyzeIntensity(text: string): number {
  const intensityIndicators = {
    high: ["!", "very", "extremely", "absolutely", "completely"],
    medium: ["quite", "rather", "somewhat", "fairly"],
    low: ["slightly", "a bit", "kind of", "sort of"],
  };

  const lowerText = text.toLowerCase();
  const exclamationCount = (text.match(/!/g) || []).length;

  if (
    exclamationCount > 2 ||
    intensityIndicators.high.some((indicator) => lowerText.includes(indicator))
  ) {
    return 0.8;
  } else if (
    intensityIndicators.medium.some((indicator) =>
      lowerText.includes(indicator)
    )
  ) {
    return 0.6;
  } else if (
    intensityIndicators.low.some((indicator) => lowerText.includes(indicator))
  ) {
    return 0.4;
  }

  return 0.5;
}

// Generate personality insights using psychological frameworks
export function generatePersonalityInsights(
  character: CharacterPersona
): string[] {
  const insights: string[] = [];

  // MBTI analysis
  if (character.traits?.mbti) {
    const mbtiType = character.traits.mbti;
    const mbtiDescription =
      PERSONALITY_FRAMEWORKS.mbti.descriptions[
        mbtiType as keyof typeof PERSONALITY_FRAMEWORKS.mbti.descriptions
      ];
    if (mbtiDescription) {
      insights.push(`MBTI Type ${mbtiType}: ${mbtiDescription}`);
    }
  }

  // Enneagram analysis
  if (character.traits?.enneagram) {
    const enneagramType = character.traits.enneagram;
    const enneagramDescription =
      PERSONALITY_FRAMEWORKS.enneagram.descriptions[
        enneagramType as keyof typeof PERSONALITY_FRAMEWORKS.enneagram.descriptions
      ];
    if (enneagramDescription) {
      insights.push(`Enneagram ${enneagramType}: ${enneagramDescription}`);
    }
  }

  // Big Five analysis
  if (character.traits?.bigFive) {
    const bigFive = character.traits.bigFive;
    const traits = PERSONALITY_FRAMEWORKS.bigFive.traits;

    traits.forEach((trait) => {
      const score = bigFive[trait.toLowerCase() as keyof typeof bigFive];
      if (score !== undefined) {
        const level = score > 0.7 ? "high" : score > 0.4 ? "moderate" : "low";
        insights.push(`${trait}: ${level} (${Math.round(score * 100)}%)`);
      }
    });
  }

  return insights;
}

// Export character data
export function exportCharacterData(
  character: CharacterPersona,
  interactions: CharacterInteraction[],
  prompts: CharacterDevelopmentPrompt[],
  analysis: CharacterAnalysis
): string {
  const exportData = {
    character,
    interactions,
    prompts,
    analysis,
    exportDate: new Date().toISOString(),
    version: "1.0",
  };

  return JSON.stringify(exportData, null, 2);
}

// Import character data
export function importCharacterData(data: string): {
  character: CharacterPersona;
  interactions: CharacterInteraction[];
  prompts: CharacterDevelopmentPrompt[];
  analysis: CharacterAnalysis;
} {
  try {
    const parsed = JSON.parse(data);
    return {
      character: parsed.character,
      interactions: parsed.interactions || [],
      prompts: parsed.prompts || [],
      analysis: parsed.analysis || generateFallbackAnalysis(parsed.character),
    };
  } catch (_error) {
    throw new Error("Invalid character data format");
  }
}
