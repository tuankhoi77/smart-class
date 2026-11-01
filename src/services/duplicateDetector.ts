import { BankQuestion, DuplicateMatch } from '../types/questionBank';

/**
 * Normalize Vietnamese text for duplicate detection:
 * - Lowercase
 * - Normalize Unicode (NFC)
 * - Remove punctuations, special symbols, extra whitespace
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFC')
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'<>\[\]\\|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tokenize string into meaningful words (excluding common stop words if needed)
 */
export function tokenize(text: string): string[] {
  const norm = normalizeText(text);
  if (!norm) return [];
  return norm.split(' ').filter((w) => w.length > 0);
}

/**
 * Compute Jaccard token similarity (0 to 100)
 */
export function computeSimilarity(textA: string, textB: string): {
  score: number;
  matchedTokens: string[];
  isExact: boolean;
} {
  const normA = normalizeText(textA);
  const normB = normalizeText(textB);

  if (normA === normB && normA.length > 0) {
    return {
      score: 100,
      matchedTokens: tokenize(normA),
      isExact: true,
    };
  }

  const tokensA = new Set(tokenize(normA));
  const tokensB = new Set(tokenize(normB));

  if (tokensA.size === 0 || tokensB.size === 0) {
    return { score: 0, matchedTokens: [], isExact: false };
  }

  const intersection: string[] = [];
  tokensA.forEach((token) => {
    if (tokensB.has(token)) {
      intersection.push(token);
    }
  });

  const union = new Set([...tokensA, ...tokensB]);
  const score = Math.round((intersection.length / union.size) * 100);

  return {
    score,
    matchedTokens: intersection,
    isExact: score === 100,
  };
}

/**
 * Find the closest duplicate question in the existing pool.
 * Default threshold is 70% similarity.
 */
export function findClosestDuplicate(
  candidate: Partial<BankQuestion>,
  existingQuestions: BankQuestion[],
  threshold = 70
): DuplicateMatch | null {
  if (!candidate.content) return null;

  let bestMatch: DuplicateMatch | null = null;
  let highestScore = 0;

  for (const existing of existingQuestions) {
    // Skip self if comparing existing question
    if (candidate.id && candidate.id === existing.id) continue;

    const { score, matchedTokens, isExact } = computeSimilarity(
      candidate.content,
      existing.content
    );

    if (score >= threshold && score > highestScore) {
      highestScore = score;
      bestMatch = {
        existingQuestion: existing,
        similarityScore: score,
        matchedTokens,
        isExact,
      };
    }
  }

  return bestMatch;
}

/**
 * Batch detect duplicates within a list and against an existing question pool
 */
export function detectDuplicates(
  candidates: BankQuestion[],
  existingBank: BankQuestion[],
  threshold = 70
): Array<{
  candidate: BankQuestion;
  match: DuplicateMatch;
}> {
  const results: Array<{
    candidate: BankQuestion;
    match: DuplicateMatch;
  }> = [];

  const combinedPool = [...existingBank];

  for (const candidate of candidates) {
    const match = findClosestDuplicate(candidate, combinedPool, threshold);
    if (match) {
      results.push({ candidate, match });
    }
    // Also add current candidate to pool to check internal duplicates in the batch
    combinedPool.push(candidate);
  }

  return results;
}
