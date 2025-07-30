// MCP Context Block
/*
role: developer,
tier: Pro,
file: "modules/narrativeDashboard/utils/diffHighlighter.ts",
allowedActions: ["generate", "highlight", "compare"],
theme: "text_diff"
*/

export type DiffSegment = {
  text: string;
  type: 'unchanged' | 'added' | 'removed' | 'modified';
  semanticTag?: 'emotion' | 'pacing' | 'structure' | 'theme';
  themeTag?: string;
  themeExplanation?: string;
};

// Simple emotion keyword set for tagging
const EMOTION_WORDS = [
  'happy', 'sad', 'angry', 'fear', 'joy', 'love', 'hate', 'excited', 'calm', 'anxious', 'hope', 'despair',
  'surprise', 'disgust', 'trust', 'anticipation', 'conflict', 'peace', 'tension', 'relief', 'regret', 'pride', 'shame'
];

function detectEmotionChange(a: string, b: string): boolean {
  const aWords = new Set(a.toLowerCase().split(/\W+/));
  const bWords = new Set(b.toLowerCase().split(/\W+/));
  return EMOTION_WORDS.some(word => aWords.has(word) !== bWords.has(word));
}

// Compact unchanged regions longer than this many words
const UNCHANGED_COMPACT_THRESHOLD = 10;

export function diffHighlighter(
  originalText: string,
  revisedText: string,
  opts?: { themeTag?: string; themeExplanation?: string }
): DiffSegment[] {
  const origWords = originalText.split(/(\s+)/);
  const revWords = revisedText.split(/(\s+)/);
  const segments: DiffSegment[] = [];
  let i = 0, j = 0;
  let unchangedBuffer: string[] = [];

  while (i < origWords.length || j < revWords.length) {
    if (origWords[i] === revWords[j]) {
      unchangedBuffer.push(origWords[i] || '');
      i++; j++;
    } else {
      // Flush unchanged buffer if needed
      if (unchangedBuffer.length) {
        if (unchangedBuffer.filter(Boolean).length > UNCHANGED_COMPACT_THRESHOLD) {
          segments.push({
            text: unchangedBuffer.join(''),
            type: 'unchanged',
          });
        } else {
          unchangedBuffer.forEach(word => {
            if (word) segments.push({ text: word, type: 'unchanged' });
          });
        }
        unchangedBuffer = [];
      }
      // Detect added
      if (revWords[j] && (!origWords[i] || !origWords.includes(revWords[j]))) {
        let tag: 'emotion' | 'pacing' | 'structure' | 'theme' | undefined = undefined;
        if (EMOTION_WORDS.includes(revWords[j].toLowerCase())) {
          tag = 'emotion';
        }
        if (opts?.themeTag) {
          tag = 'theme';
        }
        let themeTag = opts?.themeTag;
        let themeExplanation = opts?.themeExplanation;
        segments.push({ text: revWords[j], type: 'added', semanticTag: tag, themeTag, themeExplanation });
        j++;
      }
      // Detect removed
      else if (origWords[i] && (!revWords[j] || !revWords.includes(origWords[i]))) {
        const tag = EMOTION_WORDS.includes(origWords[i].toLowerCase()) ? 'emotion' : undefined;
        segments.push({ text: origWords[i], type: 'removed', semanticTag: tag });
        i++;
      }
      // Modified (both present but different)
      else if (origWords[i] && revWords[j] && origWords[i] !== revWords[j]) {
        const tag = detectEmotionChange(origWords[i], revWords[j]) ? 'emotion' : undefined;
        segments.push({ text: revWords[j], type: 'modified', semanticTag: tag });
        i++; j++;
      } else {
        // Fallback: advance both
        i++; j++;
      }
    }
  }
  // Flush any remaining unchanged
  if (unchangedBuffer.length) {
    if (unchangedBuffer.filter(Boolean).length > UNCHANGED_COMPACT_THRESHOLD) {
      segments.push({
        text: unchangedBuffer.join(''),
        type: 'unchanged',
      });
    } else {
      unchangedBuffer.forEach(word => {
        if (word) segments.push({ text: word, type: 'unchanged' });
      });
    }
  }
  return segments;
} 