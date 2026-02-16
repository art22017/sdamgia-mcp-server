/**
 * Constants for СДАМ ГИА MCP Server
 */
/**
 * Base URL patterns for different subjects
 */
export const BASE_URLS = {
    math: "https://math-ege.sdamgia.ru",
    mathb: "https://mathb-ege.sdamgia.ru",
    rus: "https://rus-ege.sdamgia.ru",
    phys: "https://phys-ege.sdamgia.ru",
    chem: "https://chem-ege.sdamgia.ru",
    bio: "https://bio-ege.sdamgia.ru",
    geo: "https://geo-ege.sdamgia.ru",
    hist: "https://hist-ege.sdamgia.ru",
    soc: "https://soc-ege.sdamgia.ru",
    inf: "https://inf-ege.sdamgia.ru",
    en: "https://en-ege.sdamgia.ru",
    de: "https://de-ege.sdamgia.ru",
    fr: "https://fr-ege.sdamgia.ru",
    sp: "https://sp-ege.sdamgia.ru",
    lit: "https://lit-ege.sdamgia.ru"
};
/**
 * Maximum number of search results to return
 */
export const MAX_SEARCH_RESULTS = 50;
/**
 * Maximum number of problems to fetch in batch
 */
export const MAX_BATCH_SIZE = 10;
/**
 * Maximum length for search query
 */
export const MAX_QUERY_LENGTH = 500;
/**
 * Default timeout for API requests (ms)
 */
export const REQUEST_TIMEOUT = 10000;
/**
 * User agent for requests
 */
export const USER_AGENT = "SDAMGIA-MCP-Server/1.0";
/**
 * Similarity threshold for fuzzy text matching (0-1)
 */
export const SIMILARITY_THRESHOLD = 0.6;
//# sourceMappingURL=constants.js.map