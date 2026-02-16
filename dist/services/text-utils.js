/**
 * Text utilities for fuzzy matching and similarity calculations
 */
/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1)
        .fill(null)
        .map(() => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++)
        dp[i][0] = i;
    for (let j = 0; j <= n; j++)
        dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            }
            else {
                dp[i][j] = Math.min(dp[i - 1][j] + 1, // deletion
                dp[i][j - 1] + 1, // insertion
                dp[i - 1][j - 1] + 1 // substitution
                );
            }
        }
    }
    return dp[m][n];
}
/**
 * Calculate similarity ratio between two strings (0-1)
 * Uses normalized Levenshtein distance
 */
export function similarityRatio(str1, str2) {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0)
        return 1.0;
    const distance = levenshteinDistance(str1, str2);
    return 1 - distance / maxLength;
}
/**
 * Normalize text for comparison
 * - Convert to lowercase
 * - Remove extra whitespace
 * - Remove punctuation
 */
export function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
/**
 * Extract significant words from text (remove stop words)
 */
export function extractKeywords(text) {
    const stopWords = new Set([
        "в", "на", "и", "с", "по", "для", "от", "к", "из", "о", "у", "а", "но",
        "что", "как", "все", "это", "так", "его", "её", "их", "же", "бы", "был",
        "была", "было", "были", "быть", "то", "те", "за", "или", "при", "до"
    ]);
    return normalizeText(text)
        .split(" ")
        .filter(word => word.length > 2 && !stopWords.has(word));
}
/**
 * Calculate keyword overlap between two texts
 */
export function keywordOverlap(text1, text2) {
    const keywords1 = new Set(extractKeywords(text1));
    const keywords2 = new Set(extractKeywords(text2));
    if (keywords1.size === 0 || keywords2.size === 0)
        return 0;
    const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
    return intersection.size / Math.min(keywords1.size, keywords2.size);
}
/**
 * Calculate combined similarity score
 * Combines exact match, keyword overlap, and fuzzy matching
 */
export function calculateSimilarity(query, text) {
    const normalizedQuery = normalizeText(query);
    const normalizedText = normalizeText(text);
    // Exact substring match
    if (normalizedText.includes(normalizedQuery)) {
        return 0.95;
    }
    // Keyword overlap
    const keywordScore = keywordOverlap(query, text);
    // Fuzzy string matching
    const fuzzyScore = similarityRatio(normalizedQuery, normalizedText);
    // Weighted combination
    return keywordScore * 0.6 + fuzzyScore * 0.4;
}
/**
 * Find best matches in a list of texts
 */
export function findBestMatches(query, texts, threshold = 0.6, limit = 10) {
    const scored = texts
        .map(item => ({
        id: item.id,
        score: calculateSimilarity(query, item.text)
    }))
        .filter(item => item.score >= threshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    return scored;
}
//# sourceMappingURL=text-utils.js.map