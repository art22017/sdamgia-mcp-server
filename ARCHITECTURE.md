# СДАМ ГИА MCP Server - Architecture Document

## Overview

This document describes the architecture and design decisions for the СДАМ ГИА MCP server, which enables LLMs to interact with the Russian educational platform for exam preparation.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         LLM Client                              │
│                    (Claude, GPT, etc.)                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │ MCP Protocol
                            │ (stdio)
┌───────────────────────────┴─────────────────────────────────────┐
│                   СДАМ ГИА MCP Server                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Tool Layer                             │  │
│  │  ┌──────────────────┐  ┌──────────────────────────────┐  │  │
│  │  │ Problem Tools    │  │ Catalog Tools                │  │  │
│  │  │ • get_problem    │  │ • get_catalog                │  │  │
│  │  │ • search         │  │ • get_category_problems      │  │  │
│  │  │ • search_by_text │  │ • get_test                   │  │  │
│  │  │ • batch_get      │  │                              │  │  │
│  │  └────────┬─────────┘  └──────────────┬───────────────┘  │  │
│  └───────────┼────────────────────────────┼──────────────────┘  │
│              │                            │                     │
│  ┌───────────┴────────────────────────────┴──────────────────┐  │
│  │                 Business Logic Layer                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │  │
│  │  │ Formatters   │  │ Text Utils   │  │ Input Schemas   │ │  │
│  │  │ • JSON       │  │ • Fuzzy      │  │ • Zod           │ │  │
│  │  │ • Markdown   │  │ • Similarity │  │ • Validation    │ │  │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘ │  │
│  └────────────────────────────┬───────────────────────────────┘  │
│                               │                                  │
│  ┌────────────────────────────┴───────────────────────────────┐  │
│  │                  API Client Layer                          │  │
│  │              (SdamGiaClient - Web Scraper)                 │  │
│  │  • HTTP requests (axios)                                   │  │
│  │  • HTML parsing (cheerio)                                  │  │
│  │  • URL normalization                                       │  │
│  └────────────────────────────┬───────────────────────────────┘  │
└────────────────────────────────┼──────────────────────────────────┘
                                 │ HTTPS
                                 │
┌────────────────────────────────┴──────────────────────────────────┐
│                    СДАМ ГИА Web Platform                          │
│              https://{subject}-ege.sdamgia.ru                     │
│  • math-ege.sdamgia.ru (15 subjects total)                        │
│  • Problem pages, catalog, tests                                  │
└───────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Tool Layer

**Responsibility**: Expose MCP tools for LLM interaction

**Components**:
- `problem-tools.ts`: Problem retrieval and search
- `catalog-tools.ts`: Catalog browsing and category filtering

**Design Decisions**:
- **Granular tools**: Each operation is a separate tool for maximum composability
- **Consistent naming**: All tools prefixed with `sdamgia_` to avoid conflicts
- **Read-only focus**: All tools are non-destructive (no write operations)

### 2. Business Logic Layer

**Responsibility**: Data processing, validation, and formatting

**Components**:
- `formatters.ts`: JSON/Markdown output formatting
- `text-utils.ts`: Fuzzy text matching algorithms
- `input-schemas.ts`: Zod validation schemas

**Key Features**:
- **Dual format support**: Both structured (JSON) and human-readable (Markdown)
- **Smart text matching**: Combines multiple algorithms for robust results
- **Type-safe validation**: Runtime checks with clear error messages

### 3. API Client Layer

**Responsibility**: Communicate with СДАМ ГИА platform

**Components**:
- `sdamgia-client.ts`: Main API client

**Implementation**:
- **Web scraping**: No official API exists, uses HTTP + HTML parsing
- **Error handling**: Graceful failures with descriptive messages
- **URL normalization**: Handles relative/absolute image URLs

## Data Flow

### Example: Search Problems by Text

```
1. LLM calls sdamgia_search_by_text tool
   ↓
2. Input validation (Zod schemas)
   ↓
3. Broad search using client.searchProblems()
   ↓ (returns ~50 candidate problem IDs)
4. Batch fetch problem details
   ↓ (fetches condition text for each)
5. Fuzzy text matching (text-utils)
   ↓ (calculates similarity scores)
6. Filter by threshold & limit
   ↓
7. Format results (JSON or Markdown)
   ↓
8. Return to LLM with structured content
```

**Request Economy**:
- Single broad search: 1 request
- Batch detail fetch: 30-50 requests (parallelized)
- Local filtering: 0 requests (done in-memory)

**Total**: ~31-51 requests for fuzzy search (vs. hundreds if checking all problems)

## Tool Design Philosophy

### 1. Comprehensive Coverage

**Decision**: Expose all major endpoints as separate tools

**Rationale**:
- LLMs are good at composing operations
- Flexibility > convenience for agents
- Each tool has single responsibility

**Example Workflow**:
```
User: "Find all probability problems in math"

LLM Strategy:
1. Call get_catalog to find probability category ID
2. Call get_category_problems with that ID
3. Call batch_get_problems for details
```

### 2. Fuzzy Text Matching

**Problem**: Users often have problem text with slight differences:
- OCR errors from photos
- Typos or reformatting
- Different wording of same problem

**Solution**: Multi-algorithm approach

```typescript
calculateSimilarity(query, text) {
  // 1. Exact match check (fast path)
  if (normalized_text.includes(normalized_query)) return 0.95;
  
  // 2. Keyword overlap (semantic)
  keyword_score = intersection(keywords1, keywords2) / min(sizes);
  
  // 3. Levenshtein distance (character-level)
  fuzzy_score = 1 - levenshtein(query, text) / max_length;
  
  // 4. Weighted combination
  return keyword_score * 0.6 + fuzzy_score * 0.4;
}
```

**Tunable Parameters**:
- `threshold`: 0-1, default 0.6 (higher = stricter)
- Can be adjusted per use case

### 3. Response Format Flexibility

**JSON Format**: For programmatic use
```json
{
  "id": "1001",
  "topic": "4",
  "condition": {
    "text": "...",
    "images": ["url1", "url2"]
  },
  "answer": "0.95"
}
```

**Markdown Format**: For human presentation
```markdown
# Problem 1001

**Topic**: 4

## Condition
На экзамен вынесено 60 вопросов...

## Answer
0.95
```

**Rationale**:
- Some LLMs work better with structured data
- Some prefer readable text
- User preference matters

### 4. Efficient Batching

**Problem**: Fetching problems one-by-one is slow

**Solution**: `batch_get_problems` tool

```typescript
// Instead of:
for (id of problem_ids) {
  await get_problem(id);  // N requests
}

// Use:
await batch_get_problems(problem_ids);  // N parallel requests
```

**Benefits**:
- Parallelized requests (faster)
- Single tool call (less overhead)
- Max 10 at once (prevents abuse)

## Type System

### TypeScript Types

```typescript
enum Subject {
  MATH = "math",
  PHYS = "phys",
  // ... 15 total
}

interface Problem {
  id: string;
  topic: string;
  condition: ProblemCondition;
  solution: ProblemSolution;
  answer: string;
  analogs: string[];
  url: string;
}
```

### Zod Validation

```typescript
const SearchByTextInputSchema = z.object({
  subject: SubjectSchema,
  condition_text: z.string()
    .min(10)
    .max(1000)
    .describe("Problem condition text"),
  threshold: z.number()
    .min(0)
    .max(1)
    .default(0.6),
  limit: LimitSchema,
  response_format: ResponseFormatSchema
}).strict();
```

**Benefits**:
- Runtime validation
- Clear error messages
- IDE autocomplete
- Type inference

## Error Handling Strategy

### 1. Descriptive Errors

```typescript
throw new Error(`Failed to fetch problem ${id}: Network timeout after 10s`);
```

Not:
```typescript
throw new Error("Error");
```

### 2. Graceful Degradation

```typescript
// If some problems fail in batch, return partial results
const problems = await Promise.all(
  ids.map(id => client.getProblemById(id).catch(() => null))
);
return problems.filter(p => p !== null);
```

### 3. Error Categories

- **Validation errors**: Bad input (400-level)
- **Network errors**: Connection issues (500-level)
- **Parsing errors**: HTML structure changed (500-level)

## Performance Considerations

### Request Optimization

1. **Parallel requests**: Use `Promise.all()` for batch operations
2. **Limit enforcement**: Max 50 results per search
3. **Timeout**: 10s per request

### Memory Efficiency

1. **Streaming**: Not implemented (could add for large datasets)
2. **Pagination**: Supported via `limit` and `offset` parameters
3. **Caching**: Not implemented (future enhancement)

### Future Optimizations

```typescript
// Potential caching layer
class CachedClient {
  cache = new Map<string, Problem>();
  
  async getProblem(id: string) {
    if (this.cache.has(id)) return this.cache.get(id);
    const problem = await this.client.getProblem(id);
    this.cache.set(id, problem);
    return problem;
  }
}
```

## Limitations & Tradeoffs

### 1. No Official API

**Impact**: 
- Relies on web scraping
- May break if site changes
- No rate limit info

**Mitigation**:
- User-Agent header
- Polite request intervals
- Error handling for structure changes

### 2. Russian Language Only

**Impact**: 
- Problem text is in Russian
- Category names in Russian

**Mitigation**:
- Document expected language
- LLMs can translate if needed

### 3. No Write Operations

**Impact**: 
- Cannot create tests
- Cannot save favorites
- Cannot submit answers

**Rationale**:
- Platform doesn't offer write API
- Read-only is safer for MCP

### 4. No Authentication

**Impact**: 
- Access limited to public content
- No user-specific data

**Rationale**:
- Platform's public content is sufficient
- Simplifies implementation

## Security Considerations

1. **Input Validation**: All inputs validated with Zod
2. **URL Safety**: Only fetch from sdamgia.ru domain
3. **No Secrets**: No API keys or credentials needed
4. **Read-Only**: No destructive operations possible

## Testing Strategy

### Unit Tests (Future)

```typescript
describe('text-utils', () => {
  test('similarity calculation', () => {
    expect(similarityRatio("hello", "helo")).toBeGreaterThan(0.8);
  });
});
```

### Integration Tests (Future)

```typescript
describe('SdamGiaClient', () => {
  test('fetches problem by id', async () => {
    const problem = await client.getProblemById('math', '1001');
    expect(problem.id).toBe('1001');
  });
});
```

### Manual Testing

```bash
# Use MCP Inspector
npm run inspector

# Test tools interactively
```

## Deployment Options

### 1. Local (stdio)

```json
{
  "mcpServers": {
    "sdamgia": {
      "command": "node",
      "args": ["/path/to/dist/index.js"]
    }
  }
}
```

### 2. Remote (HTTP) - Future

```typescript
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const transport = new StreamableHTTPServerTransport({
  port: 3000
});
```

## Conclusion

This architecture balances:
- **Comprehensiveness**: All major operations supported
- **Efficiency**: Smart batching and parallel requests
- **Flexibility**: Multiple output formats, tunable parameters
- **Safety**: Type-safe, validated, read-only
- **Maintainability**: Clear separation of concerns

The design prioritizes **composability** over **convenience**, giving LLM agents maximum flexibility to solve complex user requests through intelligent tool combination.
