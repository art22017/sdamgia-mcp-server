/**
 * Text utilities for fuzzy matching and similarity calculations
 */
/**
 * Calculate Levenshtein distance between two strings
 */
export declare function levenshteinDistance(str1: string, str2: string): number;
/**
 * Calculate similarity ratio between two strings (0-1)
 * Uses normalized Levenshtein distance
 */
export declare function similarityRatio(str1: string, str2: string): number;
/**
 * Normalize text for comparison
 * - Convert to lowercase
 * - Remove extra whitespace
 * - Remove punctuation
 */
export declare function normalizeText(text: string): string;
/**
 * Extract significant words from text (remove stop words)
 */
export declare function extractKeywords(text: string): string[];
/**
 * Calculate keyword overlap between two texts
 */
export declare function keywordOverlap(text1: string, text2: string): number;
/**
 * Calculate combined similarity score
 * Combines exact match, keyword overlap, and fuzzy matching
 */
export declare function calculateSimilarity(query: string, text: string): number;
/**
 * Find best matches in a list of texts
 */
export declare function findBestMatches(query: string, texts: Array<{
    id: string;
    text: string;
}>, threshold?: number, limit?: number): Array<{
    id: string;
    score: number;
}>;
//# sourceMappingURL=text-utils.d.ts.map