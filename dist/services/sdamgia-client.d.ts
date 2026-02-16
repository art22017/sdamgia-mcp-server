/**
 * СДАМ ГИА API Client
 * Based on reverse-engineered endpoints from sdamgia-api Python library
 */
import { Problem, Topic, Subject } from "../types.js";
/**
 * API Client for СДАМ ГИА platform
 */
export declare class SdamGiaClient {
    private axiosInstance;
    constructor();
    /**
     * Get base URL for subject
     */
    private getBaseUrl;
    /**
     * Get problem by ID
     * Endpoint: /problem?id={id}
     */
    getProblemById(subject: Subject, id: string): Promise<Problem>;
    /**
     * Search problems by text query
     * Endpoint: /search?search={query}
     */
    searchProblems(subject: Subject, query: string, limit?: number): Promise<string[]>;
    /**
     * Get catalog structure
     * Endpoint: /test (catalog page)
     */
    getCatalog(subject: Subject): Promise<Topic[]>;
    /**
     * Get test by ID
     * Endpoint: /test?id={id}
     */
    getTestById(subject: Subject, testId: string): Promise<string[]>;
    /**
     * Get category problems
     * Endpoint: /prob_catalog (with category filter)
     */
    getCategoryProblems(subject: Subject, categoryId: string, limit?: number): Promise<string[]>;
    /**
     * Normalize image URL to be absolute
     */
    private normalizeImageUrl;
}
//# sourceMappingURL=sdamgia-client.d.ts.map