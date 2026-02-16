# СДАМ ГИА MCP Server - Tool Flow Diagrams

## Tool Overview

```mermaid
graph TB
    subgraph "Problem Tools"
        P1[sdamgia_get_problem]
        P2[sdamgia_search_problems]
        P3[sdamgia_search_by_text]
        P4[sdamgia_batch_get_problems]
    end
    
    subgraph "Catalog Tools"
        C1[sdamgia_get_catalog]
        C2[sdamgia_get_category_problems]
        C3[sdamgia_get_test]
    end
    
    subgraph "API Client"
        API[SdamGiaClient]
    end
    
    P1 --> API
    P2 --> API
    P3 --> API
    P3 --> P2
    P4 --> API
    C1 --> API
    C2 --> API
    C3 --> API
    
    style P1 fill:#e1f5fe
    style P2 fill:#e1f5fe
    style P3 fill:#fff3e0
    style P4 fill:#e1f5fe
    style C1 fill:#f3e5f5
    style C2 fill:#f3e5f5
    style C3 fill:#f3e5f5
```

## Fuzzy Search Flow

```mermaid
sequenceDiagram
    participant LLM
    participant Tool as search_by_text
    participant Search as searchProblems
    participant Client as SdamGiaClient
    participant Fuzzy as Text Utils
    participant SDAMGIA as СДАМ ГИА
    
    LLM->>Tool: condition_text, threshold
    Tool->>Search: Broad search query
    Search->>Client: searchProblems()
    Client->>SDAMGIA: HTTP GET /search
    SDAMGIA-->>Client: HTML with ~50 problem IDs
    Client-->>Search: problem_ids[]
    Search-->>Tool: candidate_ids[]
    
    loop For each candidate
        Tool->>Client: getProblemById(id)
        Client->>SDAMGIA: HTTP GET /problem?id=X
        SDAMGIA-->>Client: Problem HTML
        Client-->>Tool: Problem object
    end
    
    Tool->>Fuzzy: calculateSimilarity(query, problems)
    Fuzzy-->>Tool: scored_matches[]
    Tool->>Tool: Filter by threshold
    Tool->>Tool: Sort by score
    Tool->>Tool: Limit results
    Tool-->>LLM: Ranked problem IDs with scores
```

## Catalog Exploration Flow

```mermaid
graph LR
    A[User Query] --> B{Need structure?}
    B -->|Yes| C[get_catalog]
    C --> D[Browse Topics]
    D --> E[Select Category]
    E --> F[get_category_problems]
    F --> G[Get Problem IDs]
    G --> H{Need details?}
    H -->|Yes| I[batch_get_problems]
    H -->|No| J[Return IDs]
    I --> K[Full Problem Data]
    
    style C fill:#f3e5f5
    style F fill:#f3e5f5
    style I fill:#e1f5fe
```

## Search Strategy Decision Tree

```mermaid
graph TD
    A[User Request] --> B{Have exact ID?}
    B -->|Yes| C[get_problem]
    B -->|No| D{Have problem text?}
    D -->|Yes| E[search_by_text]
    D -->|No| F{Know keywords?}
    F -->|Yes| G[search_problems]
    F -->|No| H{Know category?}
    H -->|Yes| I[get_category_problems]
    H -->|No| J[get_catalog]
    
    C --> K[Single Problem]
    E --> L[Fuzzy Matches]
    G --> M[Keyword Matches]
    I --> N[Category Problems]
    J --> O[Browse Structure]
    
    L --> P{Need details?}
    M --> P
    N --> P
    P -->|Yes| Q[batch_get_problems]
    
    style C fill:#4caf50
    style E fill:#ff9800
    style G fill:#2196f3
    style I fill:#9c27b0
    style J fill:#9c27b0
```

## Tool Composition Example

```mermaid
sequenceDiagram
    participant User
    participant LLM
    participant T1 as get_catalog
    participant T2 as get_category_problems
    participant T3 as batch_get_problems
    
    User->>LLM: Find probability problems with dice
    LLM->>T1: Get math catalog
    T1-->>LLM: Topics & categories
    LLM->>LLM: Find "Вероятность" category
    LLM->>T2: Get problems from category 4
    T2-->>LLM: 50 problem IDs
    LLM->>T3: Batch get first 10 problems
    T3-->>LLM: Full problem details
    LLM->>LLM: Filter by "кость" (dice)
    LLM-->>User: 5 matching problems with solutions
```

## Data Processing Pipeline

```mermaid
graph LR
    subgraph "Input Layer"
        A[User Request] --> B[Zod Validation]
    end
    
    subgraph "Processing Layer"
        B --> C{Tool Type}
        C -->|Search| D[Text Processing]
        C -->|Fetch| E[Direct Request]
        D --> F[Fuzzy Matching]
        F --> G[Score & Filter]
    end
    
    subgraph "API Layer"
        E --> H[HTTP Request]
        G --> H
        H --> I[HTML Parsing]
        I --> J[Data Extraction]
    end
    
    subgraph "Output Layer"
        J --> K{Format?}
        K -->|JSON| L[Structured Data]
        K -->|Markdown| M[Formatted Text]
        L --> N[Return to LLM]
        M --> N
    end
    
    style B fill:#fff9c4
    style F fill:#fff3e0
    style H fill:#e1f5fe
    style K fill:#c8e6c9
```

## API Client Architecture

```mermaid
classDiagram
    class SdamGiaClient {
        -axiosInstance: AxiosInstance
        -getBaseUrl(subject): string
        +getProblemById(subject, id): Problem
        +searchProblems(subject, query): string[]
        +getCatalog(subject): Topic[]
        +getTestById(subject, testId): string[]
        +getCategoryProblems(subject, categoryId): string[]
        -normalizeImageUrl(baseUrl, imageUrl): string
    }
    
    class TextUtils {
        +levenshteinDistance(str1, str2): number
        +similarityRatio(str1, str2): number
        +normalizeText(text): string
        +extractKeywords(text): string[]
        +keywordOverlap(text1, text2): number
        +calculateSimilarity(query, text): number
        +findBestMatches(query, texts): Match[]
    }
    
    class Formatters {
        +formatProblemMarkdown(problem): string
        +formatProblemIdsMarkdown(ids): string
        +formatCatalogMarkdown(catalog): string
        +formatSearchResultsMarkdown(results): string
        +formatBatchProblemsMarkdown(problems): string
        +formatResponse(data, format): string
    }
    
    SdamGiaClient --> Formatters: uses
    SdamGiaClient --> TextUtils: uses
```

## Error Handling Flow

```mermaid
graph TD
    A[Tool Invoked] --> B{Input Valid?}
    B -->|No| C[Zod Validation Error]
    B -->|Yes| D[Execute Tool]
    D --> E{Network OK?}
    E -->|No| F[Network Error]
    E -->|Yes| G{Parsing OK?}
    G -->|No| H[Parse Error]
    G -->|Yes| I{Data Found?}
    I -->|No| J[Not Found Error]
    I -->|Yes| K[Success]
    
    C --> L[Descriptive Error Message]
    F --> L
    H --> L
    J --> L
    K --> M[Formatted Response]
    L --> N[Error to LLM]
    M --> O[Success to LLM]
    
    style C fill:#ffcdd2
    style F fill:#ffcdd2
    style H fill:#ffcdd2
    style J fill:#ffcdd2
    style K fill:#c8e6c9
```

## Performance Optimization

```mermaid
graph TB
    subgraph "Request Optimization"
        A[Multiple Problem IDs] --> B{Count?}
        B -->|1| C[Single Request]
        B -->|2-10| D[Parallel Batch]
        B -->|>10| E[Chunked Batch]
    end
    
    subgraph "Search Optimization"
        F[Fuzzy Search] --> G[Broad Search: 50 IDs]
        G --> H[Batch Fetch: 30 Details]
        H --> I[Local Filter by Similarity]
        I --> J[Return Top N]
    end
    
    subgraph "Caching Strategy (Future)"
        K[Request] --> L{In Cache?}
        L -->|Yes| M[Return Cached]
        L -->|No| N[Fetch & Cache]
    end
    
    style D fill:#c8e6c9
    style I fill:#fff9c4
    style M fill:#81c784
```

## Tool Selection Matrix

| Use Case | Tool | Complexity | Requests |
|----------|------|------------|----------|
| Known ID | `get_problem` | Low | 1 |
| Keyword search | `search_problems` | Low | 1 |
| Text matching | `search_by_text` | High | 31-51 |
| Multiple IDs | `batch_get_problems` | Medium | N (parallel) |
| Explore topics | `get_catalog` | Low | 1 |
| Topic problems | `get_category_problems` | Low | 1 |
| Test problems | `get_test` | Low | 1 |

## Subject Coverage

```mermaid
mindmap
  root((СДАМ ГИА))
    Естественные науки
      Математика (math, mathb)
      Физика (phys)
      Химия (chem)
      Биология (bio)
      География (geo)
    Гуманитарные науки
      Русский язык (rus)
      История (hist)
      Обществознание (soc)
      Литература (lit)
    Иностранные языки
      Английский (en)
      Немецкий (de)
      Французский (fr)
      Испанский (sp)
    Информатика
      Информатика (inf)
```
