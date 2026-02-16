/**
 * Catalog and test-related tools for СДАМ ГИА MCP Server
 */
import { GetCatalogInputSchema, GetCategoryProblemsInputSchema, GetTestInputSchema } from "../schemas/input-schemas.js";
import { formatCatalogMarkdown, formatProblemIdsMarkdown, formatResponse } from "../services/formatters.js";
/**
 * Register catalog and test-related tools
 */
export function registerCatalogTools(server, client) {
    /**
     * Get subject catalog
     */
    server.registerTool("sdamgia_get_catalog", {
        title: "Get Problem Catalog",
        description: `Retrieves the complete hierarchical catalog structure for a specified subject, including all topics, subtopics, and problem categories with their unique identifiers.

**PURPOSE:**
This is the primary discovery tool for exploring what problem content is available on the platform. It returns the full taxonomy of problem categories organized by topics, enabling you to navigate and find specific types of problems.

**WHEN TO USE:**
- Always use this FIRST when exploring a new subject to understand its structure
- Use when you need to find category IDs for other tools (required prerequisite for sdamgia_get_category_problems)
- Use when you need to understand the organization and topics available for a subject
- Use when building problem sets and need to browse available content
- Essential for discovering what problem types exist before querying specific categories

**KEY PARAMETERS:**
- subject (required): The subject identifier (e.g., 'ege', 'oge', 'math')
- response_format (optional): Output format - 'json' for structured data, 'markdown' for formatted text (default: 'json')

**RESPONSE FORMAT:**
Returns an array of catalog entries, where each entry contains:
- name: Human-readable topic/category name
- id: Unique category identifier (required for other tools)
- children: Optional array of subcategories (nested hierarchy)

The response is hierarchical - categories may contain subcategories, and leaf nodes represent actual problem categories you can query.

**IMPORTANT NOTES:**
- This tool ONLY returns category structure and IDs, NOT actual problems
- Must be called before using sdamgia_get_category_problems to obtain valid category_id values
- Category IDs are specific to each subject - the same ID may mean different things across subjects
- The catalog structure can change over time as new content is added
- Response size can be large for comprehensive subjects

**EXAMPLE WORKFLOW:**
1. Call sdamgia_get_catalog(subject='ege') to get all EGE categories
2. Parse response to find desired category (e.g., "Quadratic Equations" with id='12345')
3. Use category_id='12345' with sdamgia_get_category_problems to get actual problems

**TYPICAL USE CASES:**
- "Show me all available topics for EGE mathematics"
- "What categories exist under 'Algebra' for OGE?"
- "Find the category ID for trigonometry problems"
- "Browse the complete problem catalog structure"`,
        inputSchema: GetCatalogInputSchema,
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true
        }
    }, async ({ subject, response_format }) => {
        try {
            const catalog = await client.getCatalog(subject);
            const output = formatResponse({ catalog, total_topics: catalog.length }, response_format, () => formatCatalogMarkdown(catalog));
            return {
                content: [{ type: "text", text: output }],
                structuredContent: { catalog, total_topics: catalog.length }
            };
        }
        catch (error) {
            throw new Error(`Failed to get catalog: ${error}`);
        }
    });
    /**
     * Get problems from a category
     */
    server.registerTool("sdamgia_get_category_problems", {
        title: "Get Category Problems",
        description: `Retrieves all problem identifiers belonging to a specific problem category within a subject.

**PURPOSE:**
Fetches the complete list of unique problem IDs for problems classified under a specific category. This enables you to identify exactly which problems exist in a category before retrieving their full details or solutions.

**WHEN TO USE:**
- Use AFTER obtaining a category_id from sdamgia_get_catalog (required prerequisite)
- Use when you need to see all available problems in a specific category
- Use when building problem sets from particular topics
- Use when you need to count how many problems exist in a category
- Use when selecting specific problems before fetching their full content
- Essential for batch operations on category-level problem sets

**KEY PARAMETERS:**
- subject (required): The subject identifier (e.g., 'ege', 'oge', 'math')
- category_id (required): Unique category identifier obtained from sdamgia_get_catalog
- limit (optional): Maximum number of problem IDs to return (for pagination or sampling)
- response_format (optional): Output format - 'json' for structured data, 'markdown' for formatted text (default: 'json')

**PARAMETER CONSTRAINTS:**
- category_id MUST be a valid ID from the catalog - invalid IDs will return errors
- If category has no problems, returns empty array
- limit parameter truncates results if specified; otherwise returns all problems
- Category IDs are subject-specific - same ID may exist in multiple subjects but refer to different content

**RESPONSE FORMAT:**
Returns an array of problem ID strings/numbers:
- Each ID represents a unique problem that can be fetched with other tools
- IDs are typically numeric but returned as strings
- Order of IDs may not be sequential or sorted
- Array may be empty for new or unused categories
- Total count of problems is included in response metadata

**IMPORTANT NOTES:**
- This tool ONLY returns problem IDs, NOT problem content, statements, or solutions
- You MUST call sdamgia_get_catalog first to obtain valid category_id values
- category_id values are case-sensitive and must match exactly from catalog
- Large categories may return hundreds or thousands of IDs
- The same problem ID may appear in multiple categories (cross-categorized content)
- Invalid or expired category IDs will cause the request to fail

**EXAMPLE WORKFLOW:**
1. Call sdamgia_get_catalog(subject='ege') to browse categories
2. Find desired category (e.g., id='12345' for "Derivatives")
3. Call sdamgia_get_category_problems(subject='ege', category_id='12345')
4. Receive array: [1001, 1002, 1005, 1102, ...]
5. Use individual problem IDs with sdamgia_get_problem to get full content

**TYPICAL USE CASES:**
- "Get all problems in the 'Quadratic Equations' category for EGE"
- "List first 50 problems from category ID 54321"
- "How many practice problems exist for this topic?"
- "Collect all problem IDs for a specific category to analyze difficulty distribution"
- "Build a randomized problem set from category 67890"`,
        inputSchema: GetCategoryProblemsInputSchema,
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true
        }
    }, async ({ subject, category_id, limit, response_format }) => {
        try {
            const problemIds = await client.getCategoryProblems(subject, category_id, limit);
            const output = formatResponse({ problem_ids: problemIds, category_id, total: problemIds.length }, response_format, () => formatProblemIdsMarkdown(problemIds, `Category ${category_id} Problems`));
            return {
                content: [{ type: "text", text: output }],
                structuredContent: { problem_ids: problemIds, category_id, total: problemIds.length }
            };
        }
        catch (error) {
            throw new Error(`Failed to get category problems: ${error}`);
        }
    });
    /**
     * Get test by ID
     */
    server.registerTool("sdamgia_get_test", {
        title: "Get Test Problems",
        description: `Retrieves all problem identifiers that comprise a specific test or examination variant.

**PURPOSE:**
Fetches the complete list of problem IDs that make up a predefined test or exam variant. Tests are curated collections of problems designed to simulate actual exam conditions or assess specific skill sets.

**WHEN TO USE:**
- Use when you need to see all problems in a specific test variant or exam
- Use when working with practice tests or mock exams
- Use when you need the complete problem set for timed test simulations
- Use when analyzing test composition or difficulty distribution
- Use when preparing for real exams by reviewing official test variants
- Essential for accessing complete, ready-made problem collections

**KEY PARAMETERS:**
- subject (required): The subject identifier (e.g., 'ege', 'oge', 'math')
- test_id (required): Unique identifier for the specific test/variant to retrieve
- response_format (optional): Output format - 'json' for structured data, 'markdown' for formatted text (default: 'json')

**PARAMETER CONSTRAINTS:**
- test_id must be a valid, existing test identifier for the specified subject
- Invalid test IDs will result in errors or empty results
- Test IDs are typically numeric but may include alphanumeric codes
- Not all test IDs may be publicly accessible or available
- Test availability may vary by subject and time period

**RESPONSE FORMAT:**
Returns an array of problem ID strings/numbers:
- Each ID represents a problem in the test sequence
- IDs are returned in test order (first problem to last)
- Tests typically contain 5-25 problems depending on exam type
- Total count of problems is included in response metadata
- Problems are already curated and balanced by difficulty/topic

**IMPORTANT NOTES:**
- This tool ONLY returns problem IDs, NOT problem content, statements, or solutions
- Test IDs are different from category IDs - they reference specific exam variants
- Test composition is fixed and determined by test creators
- The same problem may appear in multiple tests
- Tests are designed to be completed within specific time limits
- Some tests may include special instructions or sections not visible in ID list
- Test availability may be limited by region, year, or exam board

**DISTINCTION FROM CATEGORY QUERIES:**
Unlike sdamgia_get_category_problems which fetches all problems from a topic, this tool fetches problems from a specific, curated test variant. Tests are pre-assembled problem sets, while categories are thematic collections.

**EXAMPLE WORKFLOW:**
1. Obtain test_id from external source (e.g., 'ege-2023-variant-123' or numeric ID)
2. Call sdamgia_get_test(subject='ege', test_id='12345')
3. Receive ordered array: [5001, 5002, 5003, 5004, 5005, ...]
4. Use individual problem IDs with sdamgia_get_problem for full content
5. Present problems in order to simulate actual exam experience

**TYPICAL USE CASES:**
- "Get all problems from EGE 2023 variant 15"
- "Show me the complete problem list for OGE practice test 7"
- "Retrieve all problems in diagnostic test variant 42"
- "What problems are included in the final exam simulation test?"
- "Fetch the problem IDs for yesterday's practice test"

**PRACTICAL APPLICATIONS:**
- Creating timed practice sessions with real exam variants
- Analyzing difficulty patterns in official tests
- Comparing problem distributions across different test years
- Building test preparation schedules using official variants
- Reviewing complete test content before exam day`,
        inputSchema: GetTestInputSchema,
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true
        }
    }, async ({ subject, test_id, response_format }) => {
        try {
            const problemIds = await client.getTestById(subject, test_id);
            const output = formatResponse({ problem_ids: problemIds, test_id, total: problemIds.length }, response_format, () => formatProblemIdsMarkdown(problemIds, `Test ${test_id} Problems`));
            return {
                content: [{ type: "text", text: output }],
                structuredContent: { problem_ids: problemIds, test_id, total: problemIds.length }
            };
        }
        catch (error) {
            throw new Error(`Failed to get test: ${error}`);
        }
    });
}
//# sourceMappingURL=catalog-tools.js.map