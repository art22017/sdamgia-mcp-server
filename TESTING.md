# Testing Guide

## Prerequisites

Before testing, ensure you have:
- Node.js 18+ or 20+ installed
- Internet connection (to access sdamgia.ru)
- Terminal/command prompt

## Installation

```bash
cd sdamgia-mcp-server
npm install
npm run build
```

This will:
1. Install all dependencies (axios, cheerio, zod, @modelcontextprotocol/sdk)
2. Compile TypeScript to JavaScript in `dist/` folder
3. Make the server executable

## Test Methods

### Method 1: Manual Test Script (Recommended)

Run the comprehensive test suite:

```bash
node test/manual-test.js
```

This will test:
- ✅ Text utilities (Levenshtein distance, similarity)
- ✅ Get problem by ID
- ✅ Search problems by keyword
- ✅ Get catalog structure
- ✅ Fuzzy text matching
- ✅ Multiple subjects

**Expected output:**
```
🧪 СДАМ ГИА MCP Server - Manual Tests

============================================================

📝 Test 1: Text Utilities
------------------------------------------------------------
  "hello" vs "helo"
    Distance: 1, Similarity: 0.800 (expected > 0.8)
  ...
  ✅ Text utils working correctly

🎯 Test 2: Get Problem by ID
------------------------------------------------------------
  Fetching problem 1001 from math...
  ✅ Problem fetched successfully!
    ID: 1001
    Topic: 4
    Condition: На экзамен вынесено 60 вопросов...
    Answer: 0.95
    ...

✨ All tests passed! Server is ready to use.
```

### Method 2: MCP Inspector

Test with official MCP Inspector:

```bash
npm run inspector
```

This will:
1. Start the MCP Inspector web interface
2. Connect to your server via stdio
3. Allow you to test tools interactively

**Try these in Inspector:**

1. **Get a problem:**
```json
{
  "tool": "sdamgia_get_problem",
  "arguments": {
    "subject": "math",
    "problem_id": "1001",
    "response_format": "markdown"
  }
}
```

2. **Search for problems:**
```json
{
  "tool": "sdamgia_search_problems",
  "arguments": {
    "subject": "math",
    "query": "вероятность",
    "limit": 5
  }
}
```

3. **Fuzzy text search:**
```json
{
  "tool": "sdamgia_search_by_text",
  "arguments": {
    "subject": "phys",
    "condition_text": "Найдите силу тока если сопротивление",
    "threshold": 0.7,
    "limit": 3
  }
}
```

### Method 3: Claude Desktop Integration

1. **Add to Claude Desktop config:**

On macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "sdamgia": {
      "command": "node",
      "args": ["/absolute/path/to/sdamgia-mcp-server/dist/index.js"]
    }
  }
}
```

2. **Restart Claude Desktop**

3. **Test in chat:**

Try these prompts:
- "Find probability problems in math"
- "Get problem 1001 from math with solution"
- "Search for problems about 'сопротивление' in physics"
- "Show me the catalog structure for informatics"

### Method 4: Direct TypeScript Compilation Check

Verify TypeScript compilation:

```bash
npm run build
```

**Expected output:**
```
> sdamgia-mcp-server@1.0.0 build
> tsc && chmod +x dist/index.js

[no errors]
```

Check generated files:
```bash
ls -la dist/
```

Should show:
- `index.js` (main entry point)
- `types.js`, `constants.js`
- `services/`, `tools/`, `schemas/` directories
- `.d.ts` files (TypeScript declarations)
- `.map` files (source maps)

## Common Issues

### Issue 1: Network Error

**Error:**
```
Failed to fetch problem: Network timeout
```

**Solution:**
- Check internet connection
- Verify sdamgia.ru is accessible
- Try increasing timeout in `constants.ts`

### Issue 2: Parsing Error

**Error:**
```
Failed to parse HTML structure
```

**Solution:**
- СДАМ ГИА may have changed their HTML structure
- Check the actual website HTML
- Update selectors in `sdamgia-client.ts`

### Issue 3: Module Not Found

**Error:**
```
Cannot find module '@modelcontextprotocol/sdk'
```

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue 4: Permission Denied

**Error:**
```
Permission denied: dist/index.js
```

**Solution:**
```bash
chmod +x dist/index.js
```

## Performance Benchmarks

Run this to test performance:

```bash
time node test/manual-test.js
```

**Expected timings:**
- Text utilities: < 0.1s (instant)
- Get problem: ~1-2s (1 HTTP request)
- Search: ~1-2s (1 HTTP request)
- Catalog: ~1-2s (1 HTTP request)
- Fuzzy search: ~5-10s (30-50 parallel requests)

## Validation Tests

### Test Input Validation

Try invalid inputs:

```javascript
// Should fail with validation error
sdamgia_get_problem({
  subject: "invalid_subject",
  problem_id: "1001"
})
// Error: Invalid subject. Must be one of: math, mathb, rus...

sdamgia_search_problems({
  subject: "math",
  query: "ab"  // Too short
})
// Error: Query must be at least 3 characters
```

### Test Edge Cases

```javascript
// Empty results
sdamgia_search_problems({
  subject: "math",
  query: "xyzxyzxyzxyz"  // Should return empty
})

// Invalid problem ID
sdamgia_get_problem({
  subject: "math",
  problem_id: "9999999999"  // Should fail gracefully
})
```

## Success Criteria

✅ **Server is working correctly if:**

1. All manual tests pass (6/6)
2. TypeScript compiles without errors
3. MCP Inspector can connect and list tools
4. Tools return expected data format
5. Errors have clear messages
6. Network requests complete in reasonable time

## Debugging

Enable verbose logging:

```javascript
// Add to test script
console.log('Request:', url);
console.log('Response:', response.data.substring(0, 200));
```

Check axios requests:
```javascript
// In sdamgia-client.ts
this.axiosInstance.interceptors.request.use(config => {
  console.log('→', config.method.toUpperCase(), config.url);
  return config;
});
```

## Next Steps After Testing

Once tests pass:

1. ✅ Server is ready for production use
2. 📝 Document any issues or limitations
3. 🚀 Deploy to Claude Desktop or other MCP client
4. 📊 Monitor performance in real usage
5. 🔧 Add caching if needed

## Automated Testing (Future)

To add unit tests:

```bash
npm install --save-dev jest @types/jest ts-jest
```

Create `jest.config.js` and add tests in `test/` directory.

## Contact

If tests fail consistently:
1. Check network connectivity to sdamgia.ru
2. Verify Node.js version (18+ required)
3. Review error logs in detail
4. Check if site structure has changed

---

Happy testing! 🧪
