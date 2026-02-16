/**
 * Type definitions for СДАМ ГИА MCP Server
 */
/**
 * Supported subjects on СДАМ ГИА platform
 */
export declare enum Subject {
    MATH = "math",
    MATH_BASE = "mathb",
    RUSSIAN = "rus",
    PHYSICS = "phys",
    CHEMISTRY = "chem",
    BIOLOGY = "bio",
    GEOGRAPHY = "geo",
    HISTORY = "hist",
    SOCIAL = "soc",
    INFORMATICS = "inf",
    ENGLISH = "en",
    GERMAN = "de",
    FRENCH = "fr",
    SPANISH = "sp",
    LITERATURE = "lit"
}
/**
 * Response format options
 */
export declare enum ResponseFormat {
    JSON = "json",
    MARKDOWN = "markdown"
}
/**
 * Problem condition with text and images
 */
export interface ProblemCondition {
    text: string;
    images: string[];
}
/**
 * Problem solution with text and images
 */
export interface ProblemSolution {
    text: string;
    images: string[];
}
/**
 * Complete problem information
 */
export interface Problem {
    id: string;
    topic: string;
    condition: ProblemCondition;
    solution: ProblemSolution;
    answer: string;
    analogs: string[];
    url: string;
    [key: string]: unknown;
}
/**
 * Category in catalog
 */
export interface Category {
    category_id: string;
    category_name: string;
}
/**
 * Topic in catalog
 */
export interface Topic {
    topic_id: string;
    topic_name: string;
    categories: Category[];
}
/**
 * Search result with problem IDs
 */
export interface SearchResult {
    problem_ids: string[];
    total: number;
}
/**
 * Test information
 */
export interface Test {
    id: string;
    problem_ids: string[];
    subject: Subject;
}
//# sourceMappingURL=types.d.ts.map