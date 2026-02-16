# Tool Descriptions Quick Reference

## Overview

This document provides a comprehensive analysis of all 7 tools in the СДАМ ГИА MCP Server, identifying missing information and suggesting improvements for exhaustive descriptions.

---

## Tool Summary Table

| # | Tool Name | Current Description Length | Missing Elements Count | Priority |
|---|-----------|--------------------------|----------------------|----------|
| 1 | sdamgia_get_problem | Short (1 sentence) | 7 items | High |
| 2 | sdamgia_search_problems | Short (1 sentence) | 7 items | High |
| 3 | sdamgia_search_by_text | Medium (2 sentences) | 7 items | High |
| 4 | sdamgia_batch_get_problems | Short (1 sentence) | 6 items | Medium |
| 5 | sdamgia_get_catalog | Medium (2 sentences) | 5 items | Medium |
| 6 | sdamgia_get_category_problems | Short (1 sentence) | 5 items | Medium |
| 7 | sdamgia_get_test | Minimal (1 sentence) | 5 items | Medium |

---

## Detailed Missing Information by Category

### 1. Output Structure Documentation
**Status**: Missing from all 7 tools
**Impact**: High - LLMs don't know what data to expect
**What to add**:
- Exact field names and types
- Optional vs required fields
- Example JSON output
- Data formats (string, number, array)

### 2. Parameter Constraints
**Status**: Partially in schema, not in descriptions
**Impact**: High - Causes validation errors
**What to add**:
- Min/max values for all parameters
- Valid value lists (enums)
- Default values
- Format requirements (numeric strings, etc.)

### 3. Use Cases and Examples
**Status**: Missing from all tools
**Impact**: Medium - LLMs may not know when to use each tool
**What to add**:
- Primary use case (1-2 sentences)
- Typical scenarios (3-5 bullet points)
- When NOT to use the tool
- Example parameter values

### 4. Error Handling
**Status**: Missing from all tools
**Impact**: Medium - Poor error recovery
**What to add**:
- Common error conditions
- Error message formats
- Recovery strategies
- Validation rules

### 5. Tool Relationships
**Status**: Partially present (2 tools mention others)
**Impact**: Medium - Suboptimal tool selection
**What to add**:
- Which tools to use before this one
- Which tools to use after this one
- Alternative tools for same goal
- Comparison to similar tools

### 6. Performance Characteristics
**Status**: Missing from all tools
**Impact**: Low-Medium - Efficiency issues
**What to add**:
- Relative speed (fast/slow)
- Network calls made
- Caching recommendations
- Resource usage

### 7. Subject Code Reference
**Status**: Missing from descriptions (in schema only)
**Impact**: Medium - Invalid subject errors
**What to add**:
- All 15 valid subject codes
- Full names for each code
- Language notes (Russian-focused)
- Example for each category

---

## Per-Tool Analysis

### Tool 1: sdamgia_get_problem

**Current Description**:
```
"Retrieve a specific problem by its ID, including condition, solution, answer, and similar problems"
```

**Missing Information**:
1. No mention of output fields (id, topic, condition, solution, answer, analogs, url)
2. No explanation of condition/solution structure (text + images)
3. No guidance on when solution might be empty
4. No explanation of what "analogs" are
5. No subject code examples
6. No error conditions (invalid ID, not found)
7. No workflow context (use after search)

**Suggested Enhanced Description** (60+ words vs current 18):
```
Fetch complete problem details including condition (text + images), full solution,
answer, topic classification, direct URL, and similar problem IDs (analogs).
Primary tool for retrieving full problem content after discovery via search or catalog.

Output: { id, topic, condition: {text, images[]}, solution: {text, images[]}, answer, analogs[], url }
Use: After sdamgia_search_problems or sdamgia_get_catalog to get full problem details.
Note: Solution may be empty if not provided. Images are HTTPS URLs.
Subject codes: math, mathb, rus, phys, chem, bio, geo, hist, soc, inf, en, de, fr, sp, lit
```

---

### Tool 2: sdamgia_search_problems

**Current Description**:
```
"Search for problems using text query. Returns list of problem IDs that match the search"
```

**Missing Information**:
1. No algorithm explanation (keyword-based search)
2. No query format guidelines (keywords work best)
3. No parameter constraints (3-500 chars, limit 1-50)
4. No output structure details (only IDs, not full problems)
5. No comparison to sdamgia_search_by_text
6. No language notes (Russian queries supported)
7. No typical use cases

**Suggested Enhanced Description** (80+ words vs current 16):
```
Fast keyword-based search using platform's search index. Returns problem IDs matching
query keywords - use sdamgia_get_problem for details. Best for topic discovery.
For exact text matching with fuzzy search, use sdamgia_search_by_text instead.

Parameters: query (3-500 chars), limit (1-50, default 20)
Output: { problem_ids: string[], total: number }
Use: Topic discovery, finding problems by keyword ('probability', 'derivative')
Language: Supports Russian and English keywords
Workflow: Search -> Get IDs -> Fetch details with get_problem
Note: Returns only IDs, not full problem content. Faster than text search.
```

---

### Tool 3: sdamgia_search_by_text

**Current Description**:
```
"Find problems by matching condition text using fuzzy search. Useful when you have the problem text but don't know the ID. Supports partial and approximate matches."
```

**Missing Information**:
1. No algorithm details (Levenshtein + keyword overlap)
2. No threshold explanation (0.6 = 60% similarity, when to adjust)
3. No performance warnings (slower, fetches multiple problems)
4. No multi-step process explanation (broad search + fuzzy match)
5. No output scoring details (similarity score 0-1)
6. No edge case handling (empty results)
7. No comparison to other search tools

**Suggested Enhanced Description** (100+ words vs current 26):
```
Fuzzy text search for exact problem matching. Two-stage process: 1) Broad keyword
search finds candidates, 2) Fuzzy matching scores full conditions. Uses Levenshtein
distance + keyword overlap. Supports OCR errors, typos, and wording variations.

Parameters: condition_text (10-1000 chars), threshold (0-1, default 0.6), limit (1-50)
Output: { matches: [{problem_id, similarity}], total }
Threshold: 0.6=balanced, 0.8=strict, 0.4=permissive
Use: Finding problem from photo/OCR, matching text variants
Performance: Slower than keyword search - fetches multiple problems
Workflow: Have problem text -> Search -> Get best matches -> Fetch full problem
Note: Returns similarity score (0-1). Empty array if no matches above threshold.
```

---

### Tool 4: sdamgia_batch_get_problems

**Current Description**:
```
"Retrieve multiple problems at once by their IDs. More efficient than calling get_problem multiple times."
```

**Missing Information**:
1. No batch size limits (1-10 problems)
2. No performance quantification (~3-5x faster)
3. No error handling details (all-or-nothing)
4. No use case examples (category/test fetch)
5. No partial failure handling
6. No output structure details

**Suggested Enhanced Description** (70+ words vs current 16):
```
Efficiently fetch multiple complete problems in one request. Reduces network overhead
vs individual get_problem calls. All-or-nothing operation.

Parameters: problem_ids (array of 1-10 IDs)
Output: { problems: Problem[], total }
Constraints: Max 10 problems, same subject only
Error: Fails completely if ANY problem invalid - verify IDs first
Use: Fetching entire category/test, bulk processing
Performance: 3-5x faster for 10 problems, still makes N API calls
Workflow: get_category_problems -> get IDs -> batch_get_problems
Note: Returns Problem objects in same order as input IDs.
```

---

### Tool 5: sdamgia_get_catalog

**Current Description**:
```
"Get the complete catalog structure for a subject, including all topics and categories. Use this to explore available problem categories."
```

**Missing Information**:
1. No output structure details (Topic array with nested Categories)
2. No hierarchy explanation (Subject -> Topics -> Categories)
3. No caching recommendations (static data)
4. No update frequency info
5. No typical usage patterns

**Suggested Enhanced Description** (60+ words vs current 20):
```
Retrieve complete hierarchical catalog for a subject. Returns all topics and their
categories. Static data that rarely changes - ideal for caching.

Output: [{ topic_id, topic_name, categories: [{category_id, category_name}] }]
Hierarchy: Subject -> Topics -> Categories -> Problems
Use: Discover category IDs, explore subject structure
Caching: Data changes infrequently - cache for days/weeks
Workflow: get_catalog -> browse -> select category -> get_category_problems
Note: All subjects available: math, mathb, rus, phys, chem, bio, geo, hist, soc, inf, en, de, fr, sp, lit
```

---

### Tool 6: sdamgia_get_category_problems

**Current Description**:
```
"Get all problem IDs from a specific category. Use catalog tool first to find category IDs."
```

**Missing Information**:
1. No parameter source details (from get_catalog)
2. No limit behavior explanation (may not return all)
3. No total count info
4. No pagination details
5. No sorting information

**Suggested Enhanced Description** (50+ words vs current 17):
```
Fetch problem IDs from a specific category. Category_id from get_catalog output.
Supports pagination via limit parameter.

Parameters: category_id (from catalog), limit (1-50, default 20)
Output: { problem_ids: string[], total, category_id }
Behavior: Returns up to limit problems, ordered by ID
Use: Browse all problems in a topic category
Workflow: get_catalog -> find category -> get_category_problems -> batch_get_problems
Note: Large categories may need multiple calls. Returns IDs only.
```

---

### Tool 7: sdamgia_get_test

**Current Description**:
```
"Get all problem IDs from a specific test by test ID"
```

**Missing Information**:
1. No test source/context (curated problem sets)
2. No test ID format details
3. No test metadata explanation
4. No use cases (exam prep)
5. No relationship to other tools

**Suggested Enhanced Description** (50+ words vs current 12):
```
Fetch all problem IDs from a test on СДАМ ГИА platform. Tests are curated problem
sets for exam preparation. Returns only IDs - use batch_get_problems for content.

Parameters: test_id (numeric string from platform)
Output: { problem_ids: string[], total, test_id }
Context: Tests are official/user-created problem sets
Use: Complete practice test retrieval, exam preparation
Workflow: Find test_id on sdamgia.ru -> get_test -> batch_get_problems
Note: No test metadata returned. Test catalog not available via API.
```

---

## Implementation Priority

### Phase 1: Critical (Implement First)
1. Output structure documentation for all tools
2. Parameter constraints (min/max, valid values)
3. Subject code reference in relevant tools
4. Error conditions and handling

### Phase 2: Important (Implement Second)
1. Use case examples for each tool
2. Tool comparison and selection guidance
3. Workflow patterns (how tools work together)
4. When to use each tool

### Phase 3: Enhancement (Implement Later)
1. Performance characteristics
2. Caching recommendations
3. Example outputs
4. Troubleshooting guides

---

## Standardized Template

Use this template for all tool descriptions:

```markdown
### tool_name

**Description**: Clear 1-2 sentence summary

**Primary Use Case**: When to use this tool (1 sentence)

**Parameters**:
- param1 (required/optional): Description [type, range/format, default]
- param2 (required/optional): Description [type, range/format, default]

**Output**: Structure with field types

**Use Cases**:
- Scenario 1
- Scenario 2
- Scenario 3

**Workflow**: How this tool connects to others (2-3 sentences)

**Notes**:
- Performance note
- Error handling
- Tips
- Comparison to similar tools

**Example**:
```json
{
  "param": "value"
}
```
```

---

## Summary Statistics

- **Total Tools**: 7
- **Average Description Length**: 18 words (too brief)
- **Total Missing Elements**: 42 items across all tools
- **Tools with Use Cases**: 0 (0%)
- **Tools with Output Docs**: 0 (0%)
- **Tools with Error Handling**: 0 (0%)
- **Tools with Performance Info**: 0 (0%)
- **Estimated Enhancement Time**: 2-3 hours for all tools

---

## Conclusion

The current tool descriptions are functional but incomplete. Adding the suggested
information will make them:
- **Comprehensive**: All details needed for effective use
- **Actionable**: Clear guidance on when and how to use each tool
- **Connected**: Workflow patterns showing tool relationships
- **Robust**: Error handling and edge cases documented

This will significantly improve LLM tool selection and human developer experience.
