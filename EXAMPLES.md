# Usage Examples

This document provides practical examples of using the СДАМ ГИА MCP Server tools.

## Example 1: Find a Specific Problem by ID

**Scenario**: You know the problem ID and want to see the full solution.

```typescript
Tool: sdamgia_get_problem
Input: {
  "subject": "math",
  "problem_id": "1001",
  "response_format": "markdown"
}

Output:
# Problem 1001

**URL**: https://math-ege.sdamgia.ru/problem?id=1001
**Topic**: 4

## Condition
На экзамен вынесено 60 вопросов, Андрей не выучил 3 из них. 
Найдите вероятность того, что ему попадется выученный вопрос.

## Solution
Андрей выучил 60 – 3 = 57 вопросов. Поэтому вероятность 
того, что на экзамене ему попадется выученный вопрос равна 57/60 = 0.95

## Answer
0.95

## Similar Problems
1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010
```

## Example 2: Search for Problems by Keyword

**Scenario**: Find all problems about probability in mathematics.

```typescript
Tool: sdamgia_search_problems
Input: {
  "subject": "math",
  "query": "вероятность",
  "limit": 10,
  "response_format": "json"
}

Output: {
  "problem_ids": ["1001", "1002", "1003", "1004", "1005", "1006", "1007", "1008", "1009", "1010"],
  "total": 10
}
```

**Next Step**: Use `batch_get_problems` to get details for all found problems.

## Example 3: Find Problem by Partial Text

**Scenario**: Student took a photo of a problem, OCR extracted text with some errors. Need to find the original problem.

```typescript
Tool: sdamgia_search_by_text
Input: {
  "subject": "phys",
  "condition_text": "Найдите силу тока в цепи если сопративление резистора 10 Ом",
  "threshold": 0.7,
  "limit": 5,
  "response_format": "markdown"
}

Output:
# Search Results

**Query**: Найдите силу тока в цепи если сопративление резистора 10 Ом
**Subject**: phys
**Total Results**: 3

## Problem IDs

1. Problem 5421 (similarity: 87.3%)
2. Problem 5422 (similarity: 82.1%)
3. Problem 8934 (similarity: 74.5%)
```

**How it works**:
- Ignores typos ("сопративление" vs "сопротивление")
- Matches key concepts: "сила тока", "цепь", "резистор", "10 Ом"
- Returns ranked results by similarity

## Example 4: Browse Catalog and Get Category Problems

**Scenario**: Explore available problem types and get problems from a specific category.

**Step 1**: Get catalog structure

```typescript
Tool: sdamgia_get_catalog
Input: {
  "subject": "math",
  "response_format": "json"
}

Output: {
  "catalog": [
    {
      "topic_id": "1",
      "topic_name": "Простейшие текстовые задачи",
      "categories": [
        {"category_id": "174", "category_name": "Вычисления"},
        {"category_id": "1", "category_name": "Округление с недостатком"},
        {"category_id": "2", "category_name": "Округление с избытком"}
      ]
    },
    ...
  ]
}
```

**Step 2**: Get problems from category

```typescript
Tool: sdamgia_get_category_problems
Input: {
  "subject": "math",
  "category_id": "174",
  "limit": 20,
  "response_format": "json"
}

Output: {
  "problem_ids": ["77334", "323512", "501201", "509077", "509106", ...],
  "category_id": "174",
  "total": 20
}
```

## Example 5: Work with Test

**Scenario**: Get all problems from a specific test.

```typescript
Tool: sdamgia_get_test
Input: {
  "subject": "math",
  "test_id": "1770",
  "response_format": "markdown"
}

Output:
# Test 1770 Problems

**Total**: 12

77345, 28765, 77374, 27903, 26675, 27700, 77411, 27506, 27132, 28008, 26703, 99592
```

**Next Step**: Use `batch_get_problems` to fetch full details.

## Example 6: Batch Fetch Multiple Problems

**Scenario**: You have a list of problem IDs and want to get all details efficiently.

```typescript
Tool: sdamgia_batch_get_problems
Input: {
  "subject": "inf",
  "problem_ids": ["1001", "1002", "1003"],
  "response_format": "json"
}

Output: {
  "problems": [
    {
      "id": "1001",
      "topic": "5",
      "condition": {...},
      "solution": {...},
      "answer": "42",
      "analogs": ["1001", "1002", "1004"],
      "url": "https://inf-ege.sdamgia.ru/problem?id=1001"
    },
    {...},
    {...}
  ],
  "total": 3
}
```

## Example 7: Complex Workflow - Find Similar Problems

**Scenario**: Student struggles with a specific problem. Find similar problems for practice.

**Step 1**: Get the original problem

```typescript
Tool: sdamgia_get_problem
Input: {
  "subject": "math",
  "problem_id": "1001",
  "response_format": "json"
}
```

**Step 2**: Extract analog IDs from response

```json
{
  "analogs": ["1001", "1002", "1003", "1004", "1005"]
}
```

**Step 3**: Batch fetch analog problems

```typescript
Tool: sdamgia_batch_get_problems
Input: {
  "subject": "math",
  "problem_ids": ["1002", "1003", "1004", "1005"],
  "response_format": "markdown"
}
```

## Example 8: Find Problems by Topic and Filter by Text

**Scenario**: Want probability problems that mention specific keywords.

**Step 1**: Get catalog and find probability category

```typescript
Tool: sdamgia_get_catalog
Input: {"subject": "math"}
```

**Step 2**: Get all probability problems

```typescript
Tool: sdamgia_get_category_problems
Input: {
  "subject": "math",
  "category_id": "4",
  "limit": 50
}
```

**Step 3**: Search within those problems

```typescript
Tool: sdamgia_search_by_text
Input: {
  "subject": "math",
  "condition_text": "монета игральная кость",
  "threshold": 0.6,
  "limit": 10
}
```

## Example 9: Multi-Subject Search

**Scenario**: Find similar problems across multiple subjects.

```typescript
// For each subject
subjects = ["math", "phys", "chem"]

for subject in subjects:
  Tool: sdamgia_search_problems
  Input: {
    "subject": subject,
    "query": "молекула",
    "limit": 5
  }
```

## Example 10: Format Comparison

**JSON Format** (programmatic):
```json
{
  "id": "1001",
  "condition": {
    "text": "На экзамен вынесено 60 вопросов...",
    "images": ["https://..."]
  },
  "answer": "0.95"
}
```

**Markdown Format** (human-readable):
```markdown
# Problem 1001

## Condition
На экзамен вынесено 60 вопросов...

**Images**: https://...

## Answer
0.95
```

**When to use each**:
- **JSON**: For data extraction, processing, storage
- **Markdown**: For presenting to users, generating reports

## Common Patterns

### Pattern 1: Search → Filter → Fetch Details

```
1. sdamgia_search_problems (broad search)
2. Filter results based on criteria
3. sdamgia_batch_get_problems (get details)
```

### Pattern 2: Browse → Select → Deep Dive

```
1. sdamgia_get_catalog (explore structure)
2. sdamgia_get_category_problems (get IDs)
3. sdamgia_get_problem (examine specific problems)
```

### Pattern 3: Fuzzy Match → Verify → Fetch

```
1. sdamgia_search_by_text (fuzzy search)
2. Review similarity scores
3. sdamgia_get_problem (get full details)
```

## Tips for Best Results

1. **Start Broad, Then Narrow**: Use search first, then filter results
2. **Use Fuzzy Search for User Input**: When text comes from OCR or user typing
3. **Batch When Possible**: More efficient than individual calls
4. **Check Analogs**: Similar problems help with practice
5. **Adjust Threshold**: Lower (0.5-0.6) for more results, higher (0.7-0.8) for precision
6. **Use Markdown for Reports**: Better for human presentation
7. **Use JSON for Processing**: Better for programmatic workflows

## Error Handling Examples

### Invalid Subject

```typescript
Input: {
  "subject": "invalid",
  "problem_id": "1001"
}

Error: "Invalid subject. Must be one of: math, mathb, rus, phys, ..."
```

### Problem Not Found

```typescript
Input: {
  "subject": "math",
  "problem_id": "9999999999"
}

Error: "Failed to fetch problem 9999999999: Problem not found or parsing failed"
```

### Query Too Short

```typescript
Input: {
  "subject": "math",
  "query": "ab"
}

Error: "Query must be at least 3 characters"
```

## Performance Notes

- **Single Problem**: ~1 second (1 request)
- **Search**: ~1-2 seconds (1-2 requests)
- **Fuzzy Search**: ~5-10 seconds (1 search + 30-50 parallel fetches)
- **Batch Fetch (10 problems)**: ~3-5 seconds (10 parallel requests)
- **Catalog**: ~1 second (1 request)

## Rate Limiting Recommendations

While the server doesn't enforce rate limits, be considerate:
- Max 10 concurrent requests
- Wait 100ms between batches
- Cache frequently accessed data

## Next Steps

After mastering these examples:
1. Combine tools for complex workflows
2. Build custom filters and aggregations
3. Create study plans based on topic coverage
4. Generate practice test from specific categories
