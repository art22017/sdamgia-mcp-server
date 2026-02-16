# Tool Description Analysis Report

## Executive Summary

This report analyzes all 7 tools in the СДАМ ГИА MCP Server and identifies gaps in their current descriptions to make them comprehensive and actionable for LLMs and developers.

---

## Complete Tool Analysis Table

| Tool Name | Current Description | Missing Information | Suggested Improvements |
|-----------|-------------------|-------------------|----------------------|
| **sdamgia_get_problem** | "Retrieve a specific problem by its ID, including condition, solution, answer, and similar problems" | 1. No use cases or when to use<br>2. No output structure details<br>3. No error handling notes<br>4. No subject code examples<br>5. No mention of 'analogs' (similar problems)<br>6. No URL reference in output<br>7. No topic/category context | 1. Add "Primary tool for fetching complete problem details"<br>2. List all output fields (id, topic, condition with images, solution with images, answer, analogs, url)<br>3. Mention returns empty solution if not available<br>4. Add example subject codes<br>5. Explain analogs are similar problem IDs<br>6. Note that URL links to original problem<br>7. Add workflow tip: "Use after search or catalog browse" |
| **sdamgia_search_problems** | "Search for problems using text query. Returns list of problem IDs that match the search" | 1. No search algorithm details<br>2. No query format guidelines<br>3. No parameter constraints explained<br>4. No output structure details<br>5. No difference from sdamgia_search_by_text<br>6. No language/encoding notes<br>7. No pagination info | 1. Specify it's keyword-based search (not fuzzy)<br>2. Add "Best for topical searches (e.g., 'probability', 'derivative')"<br>3. Explicitly state min/max query length (3-500 chars)<br>4. Clarify returns only IDs, not full problem data<br>5. Add comparison: "Use this for topic discovery, search_by_text for exact problem matching"<br>6. Note "Supports Russian language queries"<br>7. Mention default limit 20, max 50 |
| **sdamgia_search_by_text** | "Find problems by matching condition text using fuzzy search. Useful when you have the problem text but don't know the ID. Supports partial and approximate matches." | 1. No fuzzy matching algorithm details<br>2. No threshold explanation with examples<br>3. No performance warnings<br>4. No multi-step process explanation<br>5. No scoring details<br>6. No edge case handling<br>7. No comparison to other search tools | 1. Specify "Uses Levenshtein distance + keyword overlap"<br>2. Add threshold guide: "0.6=60% similarity (default), 0.8=stricter, 0.4=more permissive"<br>3. Warn "Slower than keyword search - requires fetching multiple problems"<br>4. Explain process: "Does broad search first, then fetches and scores top candidates"<br>5. Detail output: "Returns problem_id + similarity score (0-1)"<br>6. Note "Returns empty array if no matches found"<br>7. Add "Best for: Finding exact problem from photo/OCR text, matching variants with minor wording changes" |
| **sdamgia_batch_get_problems** | "Retrieve multiple problems at once by their IDs. More efficient than calling get_problem multiple times." | 1. No batch size limits mentioned<br>2. No performance benefits quantified<br>3. No error handling details<br>4. No use case examples<br>5. No partial failure handling<br>6. No output structure details | 1. State "Maximum 10 problems per request"<br>2. Add "Reduces network overhead vs individual calls"<br>3. Mention "Fails completely if any problem fetch fails"<br>4. Use cases: "Fetching all problems from a category, test preparation"<br>5. Note "All-or-nothing: verify all IDs exist first"<br>6. Clarify output: "Returns array of complete Problem objects in same order as input" |
| **sdamgia_get_catalog** | "Get the complete catalog structure for a subject, including all topics and categories. Use this to explore available problem categories." | 1. No output structure details<br>2. No catalog hierarchy explanation<br>3. No caching recommendations<br>4. No update frequency info<br>5. No typical usage patterns | 1. Detail output: "Array of Topic objects, each with topic_id, topic_name, and Categories array"<br>2. Explain hierarchy: "Subject -> Topics -> Categories -> Problems"<br>3. Add "Catalog changes rarely - consider caching responses"<br>4. Note "Static data, same for all users"<br>5. Suggest workflow: "Call first to discover category_ids, then use get_category_problems" |
| **sdamgia_get_category_problems** | "Get all problem IDs from a specific category. Use catalog tool first to find category IDs." | 1. No parameter source details<br>2. No limit behavior explanation<br>3. No total count info<br>4. No pagination details<br>5. No sorting info | 1. Clarify "category_id obtained from get_catalog output"<br>2. Explain limit: "Returns up to 'limit' problems (default 20, max 50)"<br>3. Note "Output includes total count but doesn't reveal grand total"<br>4. Add "For complete list, call with limit=50 multiple times with offset (if supported)"<br>5. Mention "Problems typically ordered by ID/number" |
| **sdamgia_get_test** | "Get all problem IDs from a specific test by test ID" | 1. No test source/context<br>2. No test ID format<br>3. No test metadata<br>4. No use cases<br>5. No relationship to other tools | 1. Explain "Tests are curated problem sets on СДАМ ГИА platform"<br>2. Clarify "test_id is numeric string from platform"<br>3. Note "Does not return test metadata (name, date, etc.) - only problem IDs"<br>4. Use cases: "Exam preparation, finding complete practice tests"<br>5. Add "Combine with batch_get_problems to fetch full test content" |

---

## Detailed Analysis by Tool

### 1. sdamgia_get_problem

**Current State:**
- Basic description covers main functionality
- Missing critical output structure details
- No guidance on when to use vs other tools

**Critical Additions Needed:**
```markdown
Enhanced Description:
"Fetch complete problem details including condition (text + images), full solution,
answer, topic classification, direct URL, and list of similar problem IDs (analogs).
Primary tool for retrieving full problem content after discovery via search or catalog.

Use Cases:
- Fetching detailed solution for a specific problem
- Getting problem text with images for display
- Finding related practice problems via analogs
- Verifying problem details before use in materials

Output Structure:
{
  id: string,           // Problem ID
  topic: string,        // Topic name
  condition: {          // Problem statement
    text: string,
    images: string[]    // Image URLs
  },
  solution: {           // Detailed solution (may be empty)
    text: string,
    images: string[]
  },
  answer: string,       // Final answer
  analogs: string[],    // IDs of similar problems
  url: string          // Direct link to sdamgia.ru
}

Notes:
- Solution may be empty if not provided
- Images are HTTPS URLs to sdamgia.ru
- Analogs provide additional practice opportunities
- URL can be shared for direct problem access"
```

---

### 2. sdamgia_search_problems

**Current State:**
- Describes basic functionality
- Missing key difference from fuzzy search
- No parameter constraints visible

**Critical Additions Needed:**
```markdown
Enhanced Description:
"Keyword-based problem search. Fast topical search using platform's search index.
Returns problem IDs matching query keywords. Use for topic discovery and broad
problem exploration. For exact text matching, use sdamgia_search_by_text instead.

Parameters:
- query: 3-500 characters, Russian or English keywords
- limit: 1-50 results (default: 20)
- Returns: Only problem IDs (use get_problem for details)

Search Behavior:
- Matches problem text, topics, and tags
- Case-insensitive keyword matching
- Faster than text search (uses pre-built index)
- Best for: 'probability', 'derivative', 'triangle', etc.

Example Workflow:
1. Search by topic: sdamgia_search_problems(subject='math', query='logarithms')
2. Browse results: Returns list of problem IDs
3. Fetch details: sdamgia_get_problem for each ID of interest"
```

---

### 3. sdamgia_search_by_text

**Current State:**
- Good description but missing implementation details
- No threshold guidance
- No performance warnings

**Critical Additions Needed:**
```markdown
Enhanced Description:
"Fuzzy text search for finding problems by condition text. Uses two-stage process:
1) Broad keyword search to find candidates, 2) Fuzzy matching against full conditions.
Supports approximate matching for OCR errors, typos, and wording variations.

Algorithm:
- Levenshtein distance for character-level similarity
- Keyword overlap for semantic matching
- Combined scoring (0-1 range, higher = better match)

Threshold Guide:
- 0.4-0.5: Very permissive, many false positives
- 0.6 (default): Balanced precision/recall
- 0.7-0.8: Strict, fewer but better matches
- 0.9+: Near-exact matches only

Performance:
- Slower than keyword search (fetches multiple problems)
- Best with limit <= 20 to avoid excessive API calls
- Consider caching results for repeated queries

Use Cases:
- 'I have a photo of a problem, find it'
- 'Find problems similar to this text'
- 'Matching with minor wording differences'

Output: { problem_id, similarity } pairs sorted by score"
```

---

### 4. sdamgia_batch_get_problems

**Current State:**
- Good basic description
- Missing critical constraints
- No error handling details

**Critical Additions Needed:**
```markdown
Enhanced Description:
"Efficiently fetch multiple complete problems in one request. Reduces network overhead
compared to individual get_problem calls. All-or-nothing operation.

Constraints:
- 1-10 problem IDs per request
- All problems must be from same subject
- Fails completely if any problem is invalid

Error Handling:
- Returns error if ANY problem fetch fails
- Does not return partial results
- Verify all IDs exist before batching (use search first)

Use Cases:
- Fetching entire category (after get_category_problems)
- Loading complete test (after get_test)
- Bulk processing for analysis

Performance:
- ~3-5x faster than individual calls for 10 problems
- Still makes N API calls internally
- Best for 5-10 problems, use individual calls for 1-2"
```

---

### 5. sdamgia_get_catalog

**Current State:**
- Good description
- Missing output structure
- No caching guidance

**Critical Additions Needed:**
```markdown
Enhanced Description:
"Retrieve complete hierarchical catalog for a subject. Returns all topics and their
categories. Static data that rarely changes - ideal for caching.

Output Structure:
[
  {
    topic_id: string,
    topic_name: string,
    categories: [
      {
        category_id: string,
        category_name: string
      }
    ]
  }
]

Usage Pattern:
1. Fetch catalog: sdamgia_get_catalog(subject='math')
2. Browse topics/categories
3. Select category_id of interest
4. Fetch problems: sdamgia_get_category_problems(category_id=X)

Caching Recommendations:
- Catalog data changes infrequently
- Cache locally for days/weeks
- Invalidate only if category not found errors occur"
```

---

### 6. sdamgia_get_category_problems

**Current State:**
- Brief description
- Missing limit behavior
- No workflow guidance

**Critical Additions Needed:**
```markdown
Enhanced Description:
"Fetch all problem IDs from a specific category. Category hierarchy from
get_catalog -> topics -> categories. Supports pagination via limit parameter.

Parameters:
- category_id: From get_catalog output
- limit: 1-50 problems (default: 20)

Behavior:
- Returns problem IDs in category (not full problem data)
- Ordered by problem ID (usually)
- May not return all problems if category > limit
- Use batch_get_problems to fetch full details

Typical Workflow:
1. get_catalog -> find category
2. get_category_problems(category_id, limit=50) -> get IDs
3. batch_get_problems(ids) -> fetch full problems

Notes:
- Some categories have 100+ problems
- Call multiple times with different limits if needed
- Empty result = invalid category or no problems"
```

---

### 7. sdamgia_get_test

**Current State:**
- Minimal description
- No context about tests
- Missing use cases

**Critical Additions Needed:**
```markdown
Enhanced Description:
"Fetch all problem IDs from a specific test on СДАМ ГИА platform. Tests are
curated problem sets for exam preparation. Returns only IDs - use batch_get_problems
for full content.

Test Context:
- Tests are official or user-created problem sets
- Each test focuses on specific topics or difficulty
- Test IDs discovered on sdamgia.ru platform

Output:
- Array of problem IDs
- No test metadata (name, date, difficulty)
- Problems ordered within test

Use Cases:
- Complete practice test retrieval
- Exam preparation with real tests
- Finding comprehensive problem sets

Workflow:
1. Discover test_id on sdamgia.ru
2. get_test(test_id) -> get problem IDs
3. batch_get_problems(ids) -> fetch full problems
4. Solve/test problems in order

Note: Test catalog not available via API - find IDs manually"
```

---

## Cross-Tool Improvements

### Parameter Standardization
All tools need consistent documentation of:
1. **subject** parameter: Always list valid codes (math, mathb, rus, phys, chem, bio, geo, hist, soc, inf, en, de, fr, sp, lit)
2. **response_format** parameter: Always explain "json" vs "markdown" and default to "markdown"
3. **limit** parameter: Always state range (1-50) and default (20)

### Error Handling
All tools should document:
1. What errors can occur (invalid ID, network failure, not found)
2. How errors are returned (thrown Error objects)
3. What to do on error (retry, verify inputs, check subject)

### Output Structure
All tools should specify:
1. Exact output format (JSON schema or markdown description)
2. What fields are always present vs optional
3. Data types (string, number, array)
4. Order/sequence of results

### Usage Patterns
Each tool should include:
1. **Primary Use Case**: When to use this tool
2. **Typical Workflow**: How it fits with other tools
3. **Alternatives**: When to use a different tool
4. **Performance**: Speed and resource considerations

---

## Recommendations

### Priority 1 (Critical - Add Immediately)
1. Output structure documentation for all tools
2. Parameter constraints (min/max values)
3. Error conditions and handling
4. Subject code reference

### Priority 2 (Important - Add Soon)
1. Use case examples for each tool
2. Tool comparison (when to use which)
3. Typical workflow patterns
4. Performance characteristics

### Priority 3 (Nice to Have - Add Later)
1. Caching recommendations
2. Rate limiting notes
3. Example outputs (actual JSON/markdown samples)
4. Troubleshooting guides

---

## Implementation Template

For each tool, use this structure:

```markdown
### Tool Name

**Description**: Clear, concise 1-2 sentence summary

**Primary Use Case**: When and why to use this tool

**Parameters**:
- param_name (required/optional): Description with constraints
  - Type: data type
  - Range/Format: valid values
  - Default: if optional

**Output Structure**: Detailed field list with types

**Use Cases**: Bullet list of typical scenarios

**Workflow**: How this tool fits with others

**Notes**:
- Performance considerations
- Error conditions
- Tips and best practices
- Comparison to similar tools

**Example**:
```json
{
  "param": "value"
}
```
```

---

## Conclusion

The current tool descriptions are functional but lack the detail needed for comprehensive LLM understanding and effective developer usage. By implementing the suggested improvements above, each tool will be fully documented with:
- Clear purpose and use cases
- Complete parameter specifications
- Detailed output structures
- Workflow guidance
- Error handling
- Performance characteristics

This will enable both LLMs and human developers to use the MCP server effectively.
