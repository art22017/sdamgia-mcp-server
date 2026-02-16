/**
 * Debug script for SdamGiaClient catalog testing - Enhanced version
 * Looking for dynamic data loading patterns
 */
import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://math-ege.sdamgia.ru";
const TEST_URL = `${BASE_URL}/test`;

console.log("=".repeat(80));
console.log("SDAMGIA CATALOG DEBUG SCRIPT V2 - Looking for dynamic data");
console.log("=".repeat(80));
console.log(`Target URL: ${TEST_URL}`);
console.log(`Timestamp: ${new Date().toISOString()}`);
console.log("=".repeat(80));

async function debugCatalog() {
    try {
        console.log("\n[STEP 1] Fetching the page...");
        console.log("-".repeat(80));

        const response = await axios.get(TEST_URL, {
            timeout: 10000,
            headers: {
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });

        console.log(`Status: ${response.status}`);
        console.log(`Content Length: ${response.data.length} characters`);

        const $ = cheerio.load(response.data);

        console.log("\n[STEP 2] Checking for React/SPA indicators...");
        console.log("-".repeat(80));

        // Check for React
        const hasReactRoot = $('#root').length > 0 || $('#__next__').length > 0 || $('[id*="react"]').length > 0;
        console.log(`React root detected: ${hasReactRoot}`);
        console.log(`Elements with 'root' in id: ${$('[id*="root"]').length}`);

        // Check for script tags with JSON data
        console.log("\n[STEP 3] Analyzing script tags...");
        console.log("-".repeat(80));

        const scripts = $('script');
        console.log(`Total script tags: ${scripts.length}`);

        let foundJsonData = false;
        let inlineScripts = 0;
        let dataInWindow = false;

        scripts.each((i, el) => {
            const src = $(el).attr('src');
            const type = $(el).attr('type');
            const content = $(el).html();

            if (!src && content && content.length > 100) {
                inlineScripts++;
                const trimmed = content.trim().substring(0, 200);
                console.log(`\n[Inline Script ${inlineScripts}] (type: ${type || 'default'})`);
                console.log(`Preview: ${trimmed}...`);

                // Check for window.__INITIAL_STATE__ or similar patterns
                if (content.includes('window.') || content.includes('__INITIAL') || content.includes('__DATA__')) {
                    dataInWindow = true;
                    console.log("  👉 Found potential window data!");
                }

                // Check for JSON data
                if (content.includes('{') && content.includes('}') && content.includes('"')) {
                    foundJsonData = true;
                    console.log("  👉 Contains JSON-like data!");
                }
            }
        });

        console.log(`\nInline scripts with content: ${inlineScripts}`);
        console.log(`Data in window object: ${dataInWindow}`);
        console.log(`JSON data detected: ${foundJsonData}`);

        console.log("\n[STEP 4] Looking for API endpoints in scripts...");
        console.log("-".repeat(80));

        const scriptSources = $('script[src]').map((_, el) => $(el).attr('src')).get();
        const apiPatterns = ['/api/', '/ajax', '/catalog', '/test?'];

        console.log(`External scripts: ${scriptSources.length}`);
        scriptSources.slice(0, 10).forEach(src => {
            console.log(`  - ${src}`);
        });

        console.log("\n[STEP 5] Checking for common API endpoints...");
        console.log("-".repeat(80));

        const potentialEndpoints = [
            '/api/catalog',
            '/api/test/catalog',
            '/api/v1/catalog',
            '/test/catalog',
            '/prob_catalog',
            '/catalog'
        ];

        for (const endpoint of potentialEndpoints) {
            try {
                const apiUrl = `${BASE_URL}${endpoint}`;
                console.log(`\nTrying: ${apiUrl}`);
                const apiResponse = await axios.get(apiUrl, {
                    timeout: 5000,
                    headers: {
                        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
                    }
                });
                console.log(`  ✅ Status: ${apiResponse.status}`);
                console.log(`  Content-Type: ${apiResponse.headers['content-type']}`);
                console.log(`  Length: ${apiResponse.data.length} chars`);

                if (apiResponse.headers['content-type']?.includes('json')) {
                    console.log(`  🎯 JSON Response!`);
                    console.log(`  Preview: ${JSON.stringify(apiResponse.data).substring(0, 200)}...`);
                } else {
                    console.log(`  Preview: ${apiResponse.data.toString().substring(0, 200)}...`);
                }
            } catch (err) {
                console.log(`  ❌ Error: ${err.response?.status || err.code || err.message}`);
            }
        }

        console.log("\n[STEP 6] Analyzing body content...");
        console.log("-".repeat(80));

        const body = $('body').html() || '';
        console.log(`Body HTML length: ${body.length}`);

        // Look for JSON embedded in the body
        const jsonMatches = body.match(/\{[\s\S]*?\}/g) || [];
        console.log(`Potential JSON objects found: ${jsonMatches.length}`);

        if (jsonMatches.length > 0) {
            console.log("\nFirst 5 JSON-like snippets:");
            jsonMatches.slice(0, 5).forEach((json, i) => {
                const trimmed = json.substring(0, 150);
                console.log(`  [${i + 1}] ${trimmed}...`);
            });
        }

        console.log("\n[STEP 7] Full HTML dump (first 3000 chars)...");
        console.log("-".repeat(80));
        console.log(response.data.substring(0, 3000));

        console.log("\n[STEP 8] Full HTML dump (last 1500 chars)...");
        console.log("-".repeat(80));
        console.log(response.data.substring(response.data.length - 1500));

    } catch (error) {
        console.error("\n[ERROR] Request failed:");
        console.error("-".repeat(80));
        console.error(`Message: ${error.message}`);
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Headers:`, error.response.headers);
        }
        throw error;
    }
}

debugCatalog()
    .then(() => console.log("\n" + "=".repeat(80) + "\nDEBUG COMPLETE\n"))
    .catch(error => {
        console.error("\nFatal error:", error);
        process.exit(1);
    });
