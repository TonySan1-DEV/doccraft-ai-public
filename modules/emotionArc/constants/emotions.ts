// MCP Context Block
/*
{
  file: "modules/emotionArc/constants/emotions.ts",
  role: "developer",
  allowedActions: ["scaffold", "structure", "define"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "writing_suite"
}
*/

// Emotion categories with intensity mappings
export const EMOTION_CATEGORIES = {
  joy: {
    keywords: ['happy', 'excited', 'elated', 'thrilled', 'content', 'pleased', 'joyful', 'cheerful', 'delighted'],
    intensity: {
      low: ['content', 'pleased'],
      medium: ['happy', 'cheerful'],
      high: ['excited', 'elated', 'thrilled', 'delighted']
    },
    color: '#10B981',
    description: 'Positive emotions of happiness and contentment'
  },
  fear: {
    keywords: ['afraid', 'terrified', 'anxious', 'worried', 'nervous', 'scared', 'frightened', 'panicked', 'horrified'],
    intensity: {
      low: ['worried', 'nervous'],
      medium: ['afraid', 'scared', 'anxious'],
      high: ['terrified', 'frightened', 'panicked', 'horrified']
    },
    color: '#EF4444',
    description: 'Negative emotions of fear and anxiety'
  },
  anger: {
    keywords: ['angry', 'furious', 'irritated', 'annoyed', 'enraged', 'hostile', 'livid', 'outraged', 'fuming'],
    intensity: {
      low: ['irritated', 'annoyed'],
      medium: ['angry', 'hostile'],
      high: ['furious', 'enraged', 'livid', 'outraged', 'fuming']
    },
    color: '#F59E0B',
    description: 'Negative emotions of anger and frustration'
  },
  sadness: {
    keywords: ['sad', 'depressed', 'melancholy', 'grief', 'sorrow', 'despair', 'heartbroken', 'devastated', 'miserable'],
    intensity: {
      low: ['sad', 'melancholy'],
      medium: ['depressed', 'sorrow'],
      high: ['grief', 'despair', 'heartbroken', 'devastated', 'miserable']
    },
    color: '#3B82F6',
    description: 'Negative emotions of sadness and grief'
  },
  surprise: {
    keywords: ['shocked', 'amazed', 'astonished', 'stunned', 'bewildered', 'surprised', 'startled', 'dumbfounded'],
    intensity: {
      low: ['surprised', 'startled'],
      medium: ['amazed', 'stunned'],
      high: ['shocked', 'astonished', 'bewildered', 'dumbfounded']
    },
    color: '#8B5CF6',
    description: 'Neutral emotions of surprise and astonishment'
  },
  disgust: {
    keywords: ['disgusted', 'repulsed', 'revolted', 'appalled', 'sickened', 'nauseated', 'horrified'],
    intensity: {
      low: ['disgusted'],
      medium: ['repulsed', 'appalled'],
      high: ['revolted', 'sickened', 'nauseated', 'horrified']
    },
    color: '#6B7280',
    description: 'Negative emotions of disgust and repulsion'
  },
  love: {
    keywords: ['loving', 'affectionate', 'tender', 'passionate', 'devoted', 'adoring', 'cherished', 'beloved'],
    intensity: {
      low: ['affectionate', 'tender'],
      medium: ['loving', 'devoted'],
      high: ['passionate', 'adoring', 'cherished', 'beloved']
    },
    color: '#EC4899',
    description: 'Positive emotions of love and affection'
  },
  conflict: {
    keywords: ['conflicted', 'torn', 'divided', 'uncertain', 'confused', 'ambivalent', 'indecisive', 'torn'],
    intensity: {
      low: ['uncertain', 'confused'],
      medium: ['conflicted', 'ambivalent'],
      high: ['torn', 'divided', 'indecisive']
    },
    color: '#F97316',
    description: 'Complex emotions of internal conflict'
  }
};

// Color mapping for emotions
export const EMOTION_COLORS = {
  joy: '#10B981',
  fear: '#EF4444',
  anger: '#F59E0B',
  sadness: '#3B82F6',
  surprise: '#8B5CF6',
  disgust: '#6B7280',
  love: '#EC4899',
  conflict: '#F97316'
};

// Emotion intensity levels
export const EMOTION_INTENSITY_LEVELS = {
  very_low: { min: 0, max: 20, label: 'Very Low' },
  low: { min: 21, max: 40, label: 'Low' },
  medium: { min: 41, max: 60, label: 'Medium' },
  high: { min: 61, max: 80, label: 'High' },
  very_high: { min: 81, max: 100, label: 'Very High' }
};

// Tension emotion categories
export const TENSION_EMOTIONS = ['fear', 'anger', 'conflict', 'surprise'];

// Vulnerability emotion categories (high empathy potential)
export const VULNERABILITY_EMOTIONS = ['sadness', 'fear', 'love', 'conflict'];

// Positive emotion categories
export const POSITIVE_EMOTIONS = ['joy', 'love'];

// Negative emotion categories
export const NEGATIVE_EMOTIONS = ['fear', 'anger', 'sadness', 'disgust'];

// Neutral emotion categories
export const NEUTRAL_EMOTIONS = ['surprise', 'conflict'];

// Emotion complexity scoring
export const EMOTION_COMPLEXITY_WEIGHTS = {
  single_emotion: 0,
  dual_emotion: 25,
  triple_emotion: 50,
  multiple_emotion: 75,
  conflicting_emotion: 100
};

// Context clue patterns for emotion detection
export const EMOTION_CONTEXT_PATTERNS = {
  feeling_patterns: [
    /(?:feeling|felt|feels)\s+(\w+)/gi,
    /(?:was|is|am)\s+(\w+)/gi,
    /(?:very|really|extremely)\s+(\w+)/gi
  ],
  physical_reactions: [
    /(?:heart|chest)\s+(?:racing|pounding|tightening)/gi,
    /(?:hands|fingers)\s+(?:trembling|shaking)/gi,
    /(?:eyes|tears)\s+(?:welling|streaming)/gi,
    /(?:stomach|gut)\s+(?:churning|twisting)/gi
  ],
  dialogue_indicators: [
    /["""]([^"""]*?)(?:!|\?|\.\.\.)["""]/g,
    /(?:whispered|shouted|cried|laughed|sighed)/gi
  ]
};

// Punctuation intensity modifiers
export const PUNCTUATION_INTENSITY = {
  exclamation: 10,
  question: 5,
  ellipsis: 3,
  caps_word: 2
};

// Emotion transition patterns
export const EMOTION_TRANSITIONS = {
  rapid_shift: 30, // points for rapid emotion change
  gradual_shift: 10, // points for gradual emotion change
  sustained: 5, // points for sustained emotion
  conflict: 20 // points for conflicting emotions
};

// Reader engagement thresholds
export const ENGAGEMENT_THRESHOLDS = {
  low_engagement: 30,
  medium_engagement: 60,
  high_engagement: 80,
  critical_drop: 20
};

// Tension thresholds
export const TENSION_THRESHOLDS = {
  low_tension: 30,
  medium_tension: 60,
  high_tension: 80,
  overwhelming: 90
};

// Empathy potential modifiers
export const EMPATHY_MODIFIERS = {
  vulnerability_emotions: 1.2,
  positive_emotions: 0.8,
  negative_emotions: 1.0,
  neutral_emotions: 0.9,
  physical_reactions: 1.1,
  dialogue_emotion: 1.15
}; 