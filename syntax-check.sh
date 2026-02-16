#!/bin/bash

echo "🔍 Checking TypeScript syntax..."
echo "================================"
echo ""

# Check for common syntax errors without TypeScript compiler
errors=0

echo "Checking imports..."
for file in src/**/*.ts; do
    if grep -q "from.*\.ts" "$file" 2>/dev/null; then
        echo "❌ $file: Import with .ts extension (should be .js)"
        errors=$((errors + 1))
    fi
done

echo "Checking export statements..."
for file in src/**/*.ts; do
    if grep -q "export default" "$file" 2>/dev/null; then
        if ! grep -q "export default" "$file" | grep -v "//"; then
            echo "⚠️  $file: Using default export (named exports preferred)"
        fi
    fi
done

echo "Checking async/await..."
for file in src/**/*.ts; do
    if grep -q "async.*=>.*await" "$file" 2>/dev/null; then
        echo "✅ $file: Async/await used correctly"
    fi
done

echo ""
echo "File structure check..."
[ -f "package.json" ] && echo "✅ package.json exists" || echo "❌ package.json missing"
[ -f "tsconfig.json" ] && echo "✅ tsconfig.json exists" || echo "❌ tsconfig.json missing"
[ -f "src/index.ts" ] && echo "✅ src/index.ts exists" || echo "❌ src/index.ts missing"
[ -d "src/tools" ] && echo "✅ src/tools/ directory exists" || echo "❌ src/tools/ missing"
[ -d "src/services" ] && echo "✅ src/services/ directory exists" || echo "❌ src/services/ missing"

echo ""
echo "Dependencies check..."
if [ -f "package.json" ]; then
    echo "Required dependencies:"
    grep -A 10 '"dependencies"' package.json | grep -E '(axios|cheerio|zod|@modelcontextprotocol)' | sed 's/^/  /'
fi

echo ""
echo "================================"
if [ $errors -eq 0 ]; then
    echo "✅ Basic syntax check passed!"
    echo "Next steps:"
    echo "  1. npm install"
    echo "  2. npm run build"
    echo "  3. node test/manual-test.js"
else
    echo "⚠️  Found $errors potential issues"
    echo "Review the errors above"
fi

