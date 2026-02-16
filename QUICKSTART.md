# Quick Start Guide 🚀

## TL;DR

```bash
cd sdamgia-mcp-server
npm install
npm run build
node test/manual-test.js
```

If all tests pass → **You're ready!** ✅

---

## 5-Minute Setup

### Step 1: Install (2 min)

```bash
npm install
```

Downloads dependencies (~15MB):
- `@modelcontextprotocol/sdk` - MCP framework
- `axios` - HTTP client
- `cheerio` - HTML parser
- `zod` - Validation
- `typescript` - Compiler

### Step 2: Build (30 sec)

```bash
npm run build
```

Compiles TypeScript → JavaScript in `dist/` folder

### Step 3: Test (30 sec)

```bash
node test/manual-test.js
```

**Expected output:**
```
🧪 СДАМ ГИА MCP Server - Manual Tests
...
✨ All tests passed! Server is ready to use.
```

### Step 4: Use (immediately)

**Option A: MCP Inspector**
```bash
npm run inspector
```
Opens browser interface to test tools interactively

**Option B: Claude Desktop**
Add to config and restart Claude:
```json
{
  "mcpServers": {
    "sdamgia": {
      "command": "node",
      "args": ["/full/path/to/dist/index.js"]
    }
  }
}
```

---

## First Query Examples

Once running, try these:

**In MCP Inspector or Claude:**

1. **Get a problem:**
   ```
   Get problem 1001 from math subject
   ```

2. **Search for topics:**
   ```
   Find all probability problems in mathematics
   ```

3. **Fuzzy text search:**
   ```
   I have this problem text: "Найдите веротность" 
   (even with typo!)
   ```

4. **Browse catalog:**
   ```
   Show me all topics available for physics
   ```

---

## Troubleshooting

### ❌ npm install fails
```bash
# Check Node version
node --version  # Need 18 or 20+

# If wrong version, install NVM and update
```

### ❌ Build fails
```bash
# Clean and retry
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### ❌ Tests timeout
```bash
# Check network
curl https://math-ege.sdamgia.ru

# If blocked, may need VPN
```

### ❌ "Module not found"
```bash
# Make sure build succeeded
ls dist/  # Should show .js files

# Rebuild if needed
npm run build
```

---

## What's Working

✅ **7 Tools:**
- Get problem by ID
- Search by keywords
- **Fuzzy text search** (unique feature!)
- Batch get problems
- Get catalog
- Get category problems
- Get test problems

✅ **15 Subjects:**
- Math, Physics, Chemistry, Biology
- Russian, English, German, French, Spanish
- History, Social Studies, Literature
- Informatics, Geography

✅ **Smart Features:**
- Handles typos in search
- Multiple output formats (JSON/Markdown)
- Parallel batch requests
- Input validation with clear errors

---

## Next Steps

After successful test:

1. ✅ **Try real queries** in MCP Inspector
2. ✅ **Integrate with Claude Desktop**
3. ✅ **Test fuzzy search** with typos
4. ✅ **Explore different subjects**
5. ✅ **Check performance** on complex queries

---

## File Structure (Post-Build)

```
sdamgia-mcp-server/
├── dist/              ← Compiled JavaScript (run this)
├── src/               ← TypeScript source
├── test/              ← Test scripts
├── node_modules/      ← Dependencies
└── *.md               ← Documentation
```

**Key files:**
- `dist/index.js` - Main entry point
- `test/manual-test.js` - Test suite
- `README.md` - Full documentation

---

## Common Questions

**Q: Do I need API keys?**  
A: No! Uses public СДАМ ГИА website.

**Q: Does it work offline?**  
A: No, needs internet to access sdamgia.ru

**Q: Can it write/modify problems?**  
A: No, read-only by design (safer).

**Q: What if site structure changes?**  
A: Update selectors in `sdamgia-client.ts` (instructions in ARCHITECTURE.md)

**Q: Can I add caching?**  
A: Yes! See ARCHITECTURE.md for implementation guide.

**Q: Is it production-ready?**  
A: Yes, after tests pass! ✅

---

## Support

**Documentation:**
- README.md - Full guide
- ARCHITECTURE.md - Design details
- EXAMPLES.md - Usage examples
- TESTING.md - Test guide
- VERIFICATION_REPORT.md - Code analysis

**Issues:**
1. Check CHECKLIST.md
2. Review TESTING.md troubleshooting
3. Verify network connectivity
4. Check error messages (they're descriptive!)

---

## Success Checklist

- [ ] Installed dependencies
- [ ] Built successfully
- [ ] All tests pass
- [ ] Tried at least one tool
- [ ] Verified both JSON and Markdown output
- [ ] Tested fuzzy search
- [ ] Integrated with Claude Desktop (optional)

All checked? **Congratulations!** 🎉 Your server is production-ready!

---

**Ready?** Run this now:

```bash
cd sdamgia-mcp-server && npm install && npm run build && node test/manual-test.js
```

**Time required:** ~3 minutes  
**Difficulty:** Easy ⭐  
**Result:** Working MCP server! 🚀
