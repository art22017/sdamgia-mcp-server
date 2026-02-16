/**
 * Debug script for SdamGiaClient catalog testing
 */
import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://math-ege.sdamgia.ru";
const TEST_URL = `${BASE_URL}/test`;

console.log("=".repeat(80));
console.log("SDAMGIA CATALOG DEBUG SCRIPT");
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
                "User-Agent": "SDAMGIA-MCP-Server/1.0"
            }
        });

        console.log(`Status: ${response.status}`);
        console.log(`Status Text: ${response.statusText}`);
        console.log(`Content-Type: ${response.headers['content-type']}`);
        console.log(`Content Length: ${response.data.length} characters`);

        console.log("\n[STEP 2] Analyzing HTML structure...");
        console.log("-".repeat(80));

        const $ = cheerio.load(response.data);

        // Log basic page info
        const title = $("title").text();
        console.log(`Page Title: "${title}"`);

        // Check for maintenance mode
        const bodyText = $("body").text().toLowerCase();
        if (bodyText.includes("maintenance") || bodyText.includes("technical work")) {
            console.log("\n⚠️  WARNING: Page appears to be in maintenance mode!");
        }

        console.log("\n[STEP 3] Testing selector matches...");
        console.log("-".repeat(80));

        // Test various selectors
        const selectors = [
            { name: ".cat_category", description: "Main category container" },
            { name: ".cat_name", description: "Category name" },
            { name: ".cat_children", description: "Category children container" },
            { name: ".cat_child", description: "Individual child category" },
            { name: "[data-id]", description: "Elements with data-id attribute" },
            { name: ".catalog", description: "Generic catalog class" },
            { name: "#catalog", description: "Catalog ID" }
        ];

        selectors.forEach(({ name, description }) => {
            const count = $(name).length;
            console.log(`  ${name.padEnd(25)} (${description}): ${count} matches`);
            if (count > 0 && count <= 5) {
                $(name).each((i, el) => {
                    const text = $(el).text().trim().substring(0, 50);
                    const dataId = $(el).attr("data-id");
                    console.log(`    [${i}] text="${text}" data-id="${dataId}"`);
                });
            }
        });

        console.log("\n[STEP 4] HTML Structure Analysis...");
        console.log("-".repeat(80));

        // Look for common catalog patterns
        const allDivs = $("div").length;
        const allClasses = [];
        $("div[class]").each((_, el) => {
            const classes = $(el).attr("class").split(/\s+/);
            allClasses.push(...classes);
        });
        const uniqueClasses = [...new Set(allClasses)].sort();
        console.log(`Total divs: ${allDivs}`);
        console.log(`Unique classes found: ${uniqueClasses.length}`);
        console.log("Sample classes:", uniqueClasses.filter(c => c.includes("cat")).slice(0, 20));

        console.log("\n[STEP 5] Searching for catalog-related patterns...");
        console.log("-".repeat(80));

        // Look for data attributes
        const elementsWithDataId = $("[data-id]");
        console.log(`Elements with data-id: ${elementsWithDataId.length}`);

        if (elementsWithDataId.length > 0) {
            console.log("\nFirst 10 elements with data-id:");
            elementsWithDataId.slice(0, 10).each((i, el) => {
                const tag = el.tagName;
                const dataId = $(el).attr("data-id");
                const text = $(el).text().trim().substring(0, 50);
                const className = $(el).attr("class");
                console.log(`  [${i}] <${tag} class="${className}" data-id="${dataId}"> "${text}"`);
            });
        }

        console.log("\n[STEP 6] Trying to parse catalog with original logic...");
        console.log("-".repeat(80));

        const topics = [];
        $(".cat_category").each((index, topicEl) => {
            const topicName = $(topicEl).find(".cat_name").text().trim();
            const topicId = $(topicEl).attr("data-id") || "";
            const categories = $(topicEl)
                .find(".cat_children .cat_child")
                .map((_, catEl) => ({
                    category_id: $(catEl).attr("data-id") || "",
                    category_name: $(catEl).text().trim()
                }))
                .get();

            console.log(`\nTopic ${index}:`);
            console.log(`  Name: "${topicName}"`);
            console.log(`  ID: "${topicId}"`);
            console.log(`  Categories found: ${categories.length}`);
            if (categories.length > 0) {
                console.log(`  First few categories:`, categories.slice(0, 3));
            }

            if (topicName && topicId) {
                topics.push({
                    topic_id: topicId,
                    topic_name: topicName,
                    categories
                });
            }
        });

        console.log("\n[STEP 7] Final Results...");
        console.log("-".repeat(80));
        console.log(`Total topics parsed: ${topics.length}`);
        console.log(`Total categories across all topics: ${topics.reduce((sum, t) => sum + t.categories.length, 0)}`);

        if (topics.length === 0) {
            console.log("\n❌ NO TOPICS FOUND - Catalog parsing failed!");
            console.log("\n[STEP 8] Dumping first 2000 chars of HTML for inspection...");
            console.log("-".repeat(80));
            console.log(response.data.substring(0, 2000));
        } else {
            console.log("\n✅ SUCCESS - Catalog parsed successfully!");
            console.log("\nSample topics:");
            topics.slice(0, 3).forEach((topic, i) => {
                console.log(`  ${i + 1}. ${topic.topic_name} (${topic.topic_id})`);
                console.log(`     Categories: ${topic.categories.length}`);
            });
        }

        console.log("\n" + "=".repeat(80));
        console.log("DEBUG COMPLETE");
        console.log("=".repeat(80));

        return topics;

    } catch (error) {
        console.error("\n[ERROR] Request failed:");
        console.error("-".repeat(80));
        console.error(`Message: ${error.message}`);
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Status Text: ${error.response.statusText}`);
            console.error(`Headers:`, error.response.headers);
        }
        if (error.code) {
            console.error(`Error Code: ${error.code}`);
        }
        throw error;
    }
}

// Run the debug
debugCatalog()
    .then(topics => {
        console.log(`\nReturning ${topics.length} topics`);
    })
    .catch(error => {
        console.error("\nFatal error:", error);
        process.exit(1);
    });
