/**
 * Problem-related tools for СДАМ ГИА MCP Server
 */
import { GetProblemInputSchema, SearchProblemsInputSchema, SearchByTextInputSchema, BatchGetProblemsInputSchema } from "../schemas/input-schemas.js";
import { formatProblemMarkdown, formatSearchResultsMarkdown, formatBatchProblemsMarkdown, formatResponse } from "../services/formatters.js";
import { findBestMatches } from "../services/text-utils.js";
/**
 * Register problem-related tools
 */
export function registerProblemTools(server, client) {
    /**
     * Get problem by ID
     */
    server.registerTool("sdamgia_get_problem", {
        title: "Get СДАМ ГИА Problem by ID",
        description: `**Retrieves a complete problem from the СДАМ ГИА database by its unique identifier.**

**When to use:**
- You have a specific problem ID and need its full details
- You need to see the problem statement, solution, answer, and similar problems
- You want to reference an exact problem from the СДАМ ГИА database

**Parameters:**
- \`subject\` (required): Subject code (e.g., 'math', 'phys', 'inf', 'rus', 'chem', 'bio', 'geo', 'hist', 'soc', 'en', 'de', 'fr', 'sp', 'lit')
- \`problem_id\` (required): Numeric problem ID as a string (e.g., "12345")
- \`response_format\` (optional): Output format - 'markdown' (default, human-readable) or 'json' (structured data)

**Returns:**
A complete problem object containing:
- **condition**: The problem statement (text and optional HTML/images)
- **solution**: Step-by-step solution with explanations
- **answer**: The correct answer
- **similar_problems**: List of related problem IDs for further practice
- **metadata**: Problem ID, subject, difficulty level where available

**Response format:**
- **Markdown**: Formatted text with sections for condition, solution, answer, and similar problems
- **JSON**: Structured object with all problem data as nested objects/arrays

**Example:**
Getting a specific math problem:
\`\`\`json
{
  "subject": "math",
  "problem_id": "54321",
  "response_format": "markdown"
}
\`\`\`

**Notes:**
- Problem IDs must be numeric strings (digits only)
- The problem_id must exist in the specified subject database
- Some problems may not have solutions available
- Similar problems are automatically included for practice
- Use this tool when you need exact problem details, not for searching`,
        inputSchema: GetProblemInputSchema,
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true
        }
    }, async ({ subject, problem_id, response_format }) => {
        try {
            const problem = await client.getProblemById(subject, problem_id);
            const output = formatResponse(problem, response_format, formatProblemMarkdown);
            return {
                content: [{ type: "text", text: output }],
                structuredContent: problem
            };
        }
        catch (error) {
            throw new Error(`Failed to get problem ${problem_id}: ${error}`);
        }
    });
    /**
     * Search problems by query
     */
    server.registerTool("sdamgia_search_problems", {
        title: "Search СДАМ ГИА Problems by Query",
        description: `**Searches for problems in the СДАМ ГИА database using a text-based query.**

**When to use:**
- You want to find problems related to a specific topic (e.g., "quadratic equations", "Newton's laws")
- You're exploring available problems in a subject area
- You need to discover problem IDs before fetching full details
- You want to browse problems by keywords or concepts

**Parameters:**
- \`subject\` (required): Subject code to search within (e.g., 'math', 'phys', 'inf')
- \`query\` (required): Search text - minimum 3 characters, maximum 500 characters. Use descriptive terms like "triangle area", "oxidation reactions", "grammar rules"
- \`limit\` (optional): Maximum number of results (1-50, default: 20)
- \`response_format\` (optional): 'markdown' (default) or 'json'

**Returns:**
A list of matching problems with:
- **problem_ids**: Array of problem IDs matching the search query
- **total**: Count of results returned
- In markdown format: numbered list with clickable links to each problem

**Search behavior:**
- Performs text-based matching against problem descriptions and metadata
- Results are ranked by relevance to your query
- Search is optimized for subject-specific terminology
- Broad search that returns problem IDs only (not full problem details)

**Response format:**
- **Markdown**: Formatted list with problem IDs and subject context
- **JSON**: Object with problem_ids array and total count

**Example usage:**
\`\`\`json
{
  "subject": "math",
  "query": "derivative of trigonometric functions",
  "limit": 10,
  "response_format": "markdown"
}
\`\`\`

**Follow-up workflow:**
1. Use this tool to find relevant problem IDs
2. Use \`sdamgia_get_problem\` or \`sdamgia_batch_get_problems\` to fetch full details

**Notes:**
- Query must be at least 3 characters for meaningful results
- Maximum 50 results per search (use limit parameter)
- Search returns IDs only - follow up with get_problem for details
- For exact text matching with problem conditions, use \`sdamgia_search_by_text\` instead
- Subject-specific terminology works best for quality results`,
        inputSchema: SearchProblemsInputSchema,
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true
        }
    }, async ({ subject, query, limit, response_format }) => {
        try {
            const problemIds = await client.searchProblems(subject, query, limit);
            const results = problemIds.map(id => ({ id }));
            const output = formatResponse({ problem_ids: problemIds, total: problemIds.length }, response_format, () => formatSearchResultsMarkdown(query, results, subject));
            return {
                content: [{ type: "text", text: output }],
                structuredContent: { problem_ids: problemIds, total: problemIds.length }
            };
        }
        catch (error) {
            throw new Error(`Search failed: ${error}`);
        }
    });
    /**
     * Search problems by condition text with fuzzy matching
     */
    server.registerTool("sdamgia_search_by_text", {
        title: "Search Problems by Condition Text (Fuzzy Match)",
        description: `**Finds problems by matching against their full condition text using fuzzy text similarity algorithms.**

**When to use:**
- You have a problem's exact condition text but don't know its ID
- You're looking for problems similar to one you've seen before
- You want to find problems with nearly identical wording
- You need to detect duplicate or similar problems across the database
- You have partial problem text and want to find the closest matches

**How it works:**
1. Performs a broad search to find candidate problems
2. Fetches the full condition text for each candidate
3. Applies fuzzy text matching to calculate similarity scores
4. Returns problems that exceed the similarity threshold

**Parameters:**
- \`subject\` (required): Subject code to search within
- \`condition_text\` (required): The problem condition text to match against (10-1000 characters). Provide as much of the original problem text as possible for best results.
- \`threshold\` (optional): Similarity threshold from 0.0 to 1.0 (default: 0.6). Higher values = stricter matching. Recommended: 0.5-0.7 for approximate matches, 0.8+ for exact matches.
- \`limit\` (optional): Maximum number of matches to return (1-50, default: 20)
- \`response_format\` (optional): 'markdown' (default) or 'json'

**Returns:**
- **matches**: Array of matching problems, each containing:
  - \`problem_id\`: The matched problem's ID
  - \`similarity\`: Score from 0-1 indicating how closely the text matches (higher = better match)
- **total**: Number of matches found

**Similarity scores:**
- 1.0: Exact match (identical text)
- 0.8-0.99: Very close match (minor differences in wording)
- 0.6-0.79: Similar problem (same concept, different phrasing)
- 0.4-0.59: Somewhat related (loosely connected)
- <0.4: Poor match (not recommended)

**Example usage:**
\`\`\`json
{
  "subject": "math",
  "condition_text": "Find the area of a triangle with sides 3, 4, and 5 units.",
  "threshold": 0.7,
  "limit": 5,
  "response_format": "markdown"
}
\`\`\`

**Best practices:**
- Include the complete problem condition for best matching
- For exact duplicates, set threshold to 0.9 or higher
- For similar problems, use threshold around 0.6-0.7
- If you get too many results, increase the threshold
- If you get no results, decrease the threshold

**Notes:**
- Condition text must be at least 10 characters
- Fuzzy matching is computationally intensive - results may take longer
- Searches broader than the limit, then applies fuzzy filtering
- Some results may have lower similarity than expected due to formatting differences
- For keyword-based searches, use \`sdamgia_search_problems\` instead
- Follow up with \`sdamgia_get_problem\` to see full problem details`,
        inputSchema: SearchByTextInputSchema,
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true
        }
    }, async ({ subject, condition_text, threshold, limit, response_format }) => {
        try {
            // Try multiple search strategies to get candidates
            let searchResults = [];
            // Strategy 1: Search with the full condition text
            searchResults = await client.searchProblems(subject, condition_text, Math.min(limit * 5, 50));
            // Strategy 2: If few results, try with extracted keywords
            if (searchResults.length < 5) {
                // Extract key terms (remove parenthesized parts like ЧТО(БЫ))
                const cleanText = condition_text.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
                const keywords = cleanText.split(' ').filter(w => w.length > 3).slice(0, 3);
                for (const keyword of keywords) {
                    const keywordResults = await client.searchProblems(subject, keyword, 20);
                    searchResults = [...new Set([...searchResults, ...keywordResults])];
                    if (searchResults.length >= 30)
                        break;
                }
            }
            if (searchResults.length === 0) {
                const output = formatResponse({ matches: [], total: 0, message: "No problems found" }, response_format, () => formatSearchResultsMarkdown(condition_text, [], subject));
                return {
                    content: [{ type: "text", text: output }],
                    structuredContent: { matches: [], total: 0 }
                };
            }
            // Fetch problem details for fuzzy matching
            const problems = await Promise.all(searchResults.slice(0, Math.min(50, limit * 5)).map(async (id) => {
                try {
                    const problem = await client.getProblemById(subject, id);
                    return {
                        id,
                        text: problem.condition.text,
                        answer: problem.answer,
                        condition: problem.condition.text
                    };
                }
                catch {
                    return null;
                }
            }));
            const validProblems = problems.filter(p => p !== null);
            // Find best matches using fuzzy text matching
            const matches = findBestMatches(condition_text, validProblems, threshold, limit);
            // Fetch full details for matches to include in response
            const enrichedMatches = await Promise.all(matches.map(async (m) => {
                try {
                    const problem = await client.getProblemById(subject, m.id);
                    const conditionText = problem.condition.text || '';
                    return {
                        problem_id: m.id,
                        similarity: m.score,
                        condition_start: conditionText.substring(0, 75),
                        condition_end: conditionText.slice(-75),
                        answer: problem.answer || ''
                    };
                }
                catch {
                    return {
                        problem_id: m.id,
                        similarity: m.score,
                        condition_start: '',
                        condition_end: '',
                        answer: ''
                    };
                }
            }));
            const output = formatResponse({
                matches: enrichedMatches,
                total: enrichedMatches.length
            }, response_format, () => formatSearchResultsMarkdown(condition_text, enrichedMatches, subject));
            return {
                content: [{ type: "text", text: output }],
                structuredContent: {
                    matches: enrichedMatches,
                    total: enrichedMatches.length
                }
            };
        }
        catch (error) {
            throw new Error(`Text search failed: ${error}`);
        }
    });
    /**
     * Batch get multiple problems
     */
    server.registerTool("sdamgia_batch_get_problems", {
        title: "Batch Retrieve Multiple Problems",
        description: `**Efficiently retrieves multiple complete problems from the СДАМ ГИА database in a single request.**

**When to use:**
- You have multiple problem IDs and need all their details
- You want to compare several problems side-by-side
- You're building a problem set or practice collection
- You need to fetch related problems after a search
- You want to reduce API calls compared to individual get_problem requests

**Parameters:**
- \`subject\` (required): Subject code for all problems (all IDs must belong to this subject)
- \`problem_ids\` (required): Array of problem IDs to fetch. Must include 1-10 problem IDs as numeric strings (e.g., ["12345", "67890", "54321"])
- \`response_format\` (optional): 'markdown' (default) or 'json'

**Returns:**
- **problems**: Array of complete problem objects, each containing:
  - **condition**: Full problem statement with text and optional HTML/images
  - **solution**: Detailed step-by-step solution
  - **answer**: The correct answer
  - **similar_problems**: Related problem IDs
  - **metadata**: Problem ID, subject, difficulty level
- **total**: Number of problems successfully fetched

**Response format:**
- **Markdown**: Formatted text with each problem in a separate section, clearly delineated with problem IDs
- **JSON**: Structured object with problems array and metadata

**Example usage:**
\`\`\`json
{
  "subject": "math",
  "problem_ids": ["12345", "67890", "54321", "11111", "22222"],
  "response_format": "markdown"
}
\`\`\`

**Typical workflow:**
1. Use \`sdamgia_search_problems\` to find relevant problem IDs
2. Pass the IDs to this tool for batch retrieval
3. Review all problems together for comparison or practice

**Performance benefits:**
- Single API call instead of multiple individual calls
- Faster than sequential \`sdamgia_get_problem\` requests
- Ideal for fetching 2-10 problems at once
- Reduces network overhead and latency

**Constraints:**
- Maximum 10 problems per batch request
- All problem IDs must be valid numeric strings
- All problems must be from the same subject
- Invalid IDs will cause the entire batch to fail
- Fetching many problems may return large responses

**Error handling:**
- If any problem ID is invalid or not found, the entire batch fails
- Make sure all IDs exist in the subject before batching
- Consider splitting into smaller batches if you encounter errors

**Notes:**
- Batch size is limited to 10 to prevent excessive response sizes
- Use when you need full problem details, not just IDs
- For searching, use \`sdamgia_search_problems\` first
- Each problem includes similar problems for extended practice
- All problems in batch are fetched in parallel for speed`,
        inputSchema: BatchGetProblemsInputSchema,
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true
        }
    }, async ({ subject, problem_ids, response_format }) => {
        try {
            const problems = await Promise.all(problem_ids.map(id => client.getProblemById(subject, id)));
            const output = formatResponse({ problems, total: problems.length }, response_format, () => formatBatchProblemsMarkdown(problems));
            return {
                content: [{ type: "text", text: output }],
                structuredContent: { problems, total: problems.length }
            };
        }
        catch (error) {
            throw new Error(`Batch fetch failed: ${error}`);
        }
    });
}
//# sourceMappingURL=problem-tools.js.map