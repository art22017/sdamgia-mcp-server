# Testing Checklist ✅

## Pre-Flight Checks (Done ✅)

- [x] ✅ All TypeScript files created (9 files)
- [x] ✅ Project structure correct
  - [x] src/index.ts (entry point)
  - [x] src/types.ts (type definitions)
  - [x] src/constants.ts (configuration)
  - [x] src/services/ (3 files: client, formatters, text-utils)
  - [x] src/schemas/ (input validation)
  - [x] src/tools/ (2 files: problem-tools, catalog-tools)
- [x] ✅ package.json with correct dependencies
- [x] ✅ tsconfig.json with proper configuration
- [x] ✅ All imports use .js extension (correct for ESM)
- [x] ✅ No syntax errors in basic check
- [x] ✅ Documentation complete (README, ARCHITECTURE, EXAMPLES, TESTING, SUMMARY)
- [x] ✅ Test script created (manual-test.js)
- [x] ✅ .gitignore configured

## Installation Steps (To Do on Your Machine)

```bash
cd sdamgia-mcp-server
npm install          # Install dependencies
npm run build        # Compile TypeScript → JavaScript
```

**Expected Result:**
- No compilation errors
- `dist/` directory created with all .js files
- `dist/index.js` is executable

## Manual Testing (To Do)

### Test 1: Run Test Suite

```bash
node test/manual-test.js
```

**Expected Output:**
```
🧪 СДАМ ГИА MCP Server - Manual Tests
...
✨ All tests passed! Server is ready to use.
```

**What it tests:**
- Text utilities (Levenshtein, similarity)
- Get problem by ID
- Search by keyword
- Catalog fetching
- Fuzzy text matching
- Multiple subjects

### Test 2: MCP Inspector

```bash
npm run inspector
```

**Expected:**
- Opens web interface
- Lists 7 tools
- Can invoke tools and see results

**Try these tools:**
1. `sdamgia_get_problem` with ID "1001"
2. `sdamgia_search_problems` with query "вероятность"
3. `sdamgia_search_by_text` with fuzzy text

### Test 3: Individual Tool Tests

**Test Get Problem:**
```javascript
// Should return problem with condition, solution, answer
{
  "tool": "sdamgia_get_problem",
  "arguments": {
    "subject": "math",
    "problem_id": "1001",
    "response_format": "json"
  }
}
```

**Test Search:**
```javascript
// Should return array of problem IDs
{
  "tool": "sdamgia_search_problems",
  "arguments": {
    "subject": "phys",
    "query": "сопротивление",
    "limit": 5
  }
}
```

**Test Fuzzy Search:**
```javascript
// Should find problems even with typos
{
  "tool": "sdamgia_search_by_text",
  "arguments": {
    "subject": "math",
    "condition_text": "Найдите веротность того что попадется выученый вопрос",
    "threshold": 0.6,
    "limit": 3
  }
}
```

**Test Catalog:**
```javascript
// Should return topics and categories
{
  "tool": "sdamgia_get_catalog",
  "arguments": {
    "subject": "inf",
    "response_format": "markdown"
  }
}
```

**Test Batch:**
```javascript
// Should return multiple problems
{
  "tool": "sdamgia_batch_get_problems",
  "arguments": {
    "subject": "math",
    "problem_ids": ["1001", "1002", "1003"]
  }
}
```

## Validation Tests

### Test Input Validation

These should **fail** with clear error messages:

```javascript
// Invalid subject
{ "subject": "xyz", "problem_id": "1001" }
→ Error: Invalid subject. Must be one of: math, mathb, rus...

// Too short query
{ "subject": "math", "query": "ab" }
→ Error: Query must be at least 3 characters

// Invalid problem ID
{ "subject": "math", "problem_id": "abc" }
→ Error: Problem ID must contain only digits

// Missing required field
{ "subject": "math" }
→ Error: Required field 'problem_id' missing
```

## Performance Checks

Run with timing:
```bash
time node test/manual-test.js
```

**Expected timings:**
- Text utils: < 0.1s
- Get problem: 1-3s
- Search: 1-3s
- Catalog: 1-3s
- Fuzzy search: 5-15s (many parallel requests)
- **Total test suite: 10-30s**

If much slower:
- Check network speed
- Check sdamgia.ru availability
- Consider adding request caching

## Integration Tests

### Claude Desktop Integration

1. Add to config:
```json
{
  "mcpServers": {
    "sdamgia": {
      "command": "node",
      "args": ["/absolute/path/to/dist/index.js"]
    }
  }
}
```

2. Restart Claude Desktop

3. Test prompts:
   - "Find probability problems in math"
   - "Get problem 1001 with full solution"
   - "Search for physics problems about resistance"
   - "Show me the catalog for informatics"

**Expected:**
- Claude can see and use all 7 tools
- Returns properly formatted results
- Can handle complex multi-step queries

## Edge Cases to Test

1. **Empty results:**
   - Search for non-existent text → should return empty array

2. **Network errors:**
   - Disconnect network → should fail with clear error

3. **Invalid IDs:**
   - Use ID "9999999999" → should fail gracefully

4. **Large batches:**
   - Request 10 problems → should work
   - Request 11 problems → should fail validation

5. **Special characters:**
   - Search with symbols "!@#$%" → should handle gracefully

6. **Different formats:**
   - Request JSON → should return valid JSON
   - Request Markdown → should return formatted text

## Success Criteria

✅ **Project is production-ready when:**

- [ ] All TypeScript files compile without errors
- [ ] Manual test suite passes (6/6 tests)
- [ ] MCP Inspector shows all 7 tools
- [ ] All tools return expected data
- [ ] Input validation works correctly
- [ ] Error messages are clear and actionable
- [ ] Performance is acceptable (< 15s for fuzzy search)
- [ ] Works in Claude Desktop integration
- [ ] No crashes or unhandled errors
- [ ] Code follows TypeScript/MCP best practices

## Known Limitations (Expected)

These are **not bugs**, just design constraints:

1. **Network required** - Needs internet to access sdamgia.ru
2. **No official API** - Uses web scraping (may break if site changes)
3. **Russian language** - Platform is in Russian
4. **Read-only** - No write operations (by design)
5. **No caching** - Every request hits the server (future enhancement)
6. **Rate limits** - Not enforced but should be respectful

## Troubleshooting Guide

### Issue: npm install fails
**Solution:** Check Node.js version (need 18+)

### Issue: TypeScript errors during build
**Solution:** 
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Cannot find module"
**Solution:** Make sure `npm run build` completed successfully

### Issue: Network timeouts
**Solution:** 
- Check sdamgia.ru is accessible
- Increase timeout in constants.ts
- Try VPN if site is blocked

### Issue: Parsing errors
**Solution:**
- Site HTML structure may have changed
- Check actual website
- Update selectors in sdamgia-client.ts

## Final Checklist

Before marking as complete:

- [ ] Ran `npm install` successfully
- [ ] Ran `npm run build` without errors
- [ ] Ran `node test/manual-test.js` - all tests pass
- [ ] Tested at least 3 tools manually
- [ ] Verified JSON and Markdown outputs
- [ ] Tested input validation
- [ ] Checked performance is acceptable
- [ ] Integration works in Claude Desktop
- [ ] Documentation is clear and complete

## Next Steps After Testing

1. ✅ Mark server as production-ready
2. 📝 Document any discovered issues
3. 🚀 Deploy to production environment
4. 📊 Monitor real-world usage
5. 🔧 Implement enhancements (caching, rate limiting)
6. 📈 Gather user feedback
7. 🎯 Add more subjects if needed
8. 🧪 Add automated unit tests

---

## Quick Start Commands

```bash
# Installation
npm install && npm run build

# Test
node test/manual-test.js

# Inspector
npm run inspector

# Production
node dist/index.js
```

**Status:** ✅ Code is ready, waiting for dependency installation and testing!
