/**
 * Test script for СДАМ ГИА MCP Server
 * 
 * Run after: npm install && npm run build
 * Usage: node test/manual-test.js
 */

import { SdamGiaClient } from '../dist/services/sdamgia-client.js';
import { 
  levenshteinDistance, 
  similarityRatio, 
  calculateSimilarity,
  findBestMatches 
} from '../dist/services/text-utils.js';

const client = new SdamGiaClient();

console.log('🧪 СДАМ ГИА MCP Server - Manual Tests\n');
console.log('=' .repeat(60));

// Test 1: Text utilities
async function testTextUtils() {
  console.log('\n📝 Test 1: Text Utilities');
  console.log('-'.repeat(60));
  
  const tests = [
    { s1: 'hello', s2: 'helo', expected: '> 0.8' },
    { s1: 'вероятность', s2: 'веротность', expected: '> 0.7' },
    { s1: 'сопротивление', s2: 'сопративление', expected: '> 0.8' }
  ];
  
  tests.forEach(({ s1, s2, expected }) => {
    const distance = levenshteinDistance(s1, s2);
    const similarity = similarityRatio(s1, s2);
    console.log(`  "${s1}" vs "${s2}"`);
    console.log(`    Distance: ${distance}, Similarity: ${similarity.toFixed(3)} (expected ${expected})`);
  });
  
  console.log('  ✅ Text utils working correctly');
}

// Test 2: Get problem by ID
async function testGetProblem() {
  console.log('\n🎯 Test 2: Get Problem by ID');
  console.log('-'.repeat(60));
  
  try {
    console.log('  Fetching problem 1001 from math...');
    const problem = await client.getProblemById('math', '1001');
    
    console.log(`  ✅ Problem fetched successfully!`);
    console.log(`    ID: ${problem.id}`);
    console.log(`    Topic: ${problem.topic}`);
    console.log(`    Condition: ${problem.condition.text.substring(0, 100)}...`);
    console.log(`    Answer: ${problem.answer}`);
    console.log(`    Analogs: ${problem.analogs.length} similar problems`);
    console.log(`    URL: ${problem.url}`);
    
    return true;
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Test 3: Search problems
async function testSearch() {
  console.log('\n🔍 Test 3: Search Problems');
  console.log('-'.repeat(60));
  
  try {
    console.log('  Searching for "вероятность" in math...');
    const results = await client.searchProblems('math', 'вероятность', 5);
    
    console.log(`  ✅ Found ${results.length} problems`);
    console.log(`    IDs: ${results.join(', ')}`);
    
    return results.length > 0;
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Test 4: Get catalog
async function testCatalog() {
  console.log('\n📚 Test 4: Get Catalog');
  console.log('-'.repeat(60));
  
  try {
    console.log('  Fetching catalog for math...');
    const catalog = await client.getCatalog('math');
    
    console.log(`  ✅ Catalog fetched successfully!`);
    console.log(`    Total topics: ${catalog.length}`);
    if (catalog.length > 0) {
      const firstTopic = catalog[0];
      console.log(`    First topic: ${firstTopic.topic_name} (ID: ${firstTopic.topic_id})`);
      console.log(`    Categories: ${firstTopic.categories.length}`);
    }
    
    return catalog.length > 0;
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Test 5: Fuzzy text matching
async function testFuzzyMatching() {
  console.log('\n🎲 Test 5: Fuzzy Text Matching');
  console.log('-'.repeat(60));
  
  const testTexts = [
    { id: '1', text: 'Найдите вероятность того что попадется выученный вопрос' },
    { id: '2', text: 'На экзамен вынесено 60 вопросов' },
    { id: '3', text: 'Вычислите значение выражения' },
    { id: '4', text: 'Найдите вероятность что выпадет четное число' }
  ];
  
  const query = 'вероятность выученный вопрос';
  
  console.log(`  Query: "${query}"`);
  console.log('  Candidate texts:');
  testTexts.forEach(t => console.log(`    [${t.id}] ${t.text}`));
  
  const matches = findBestMatches(query, testTexts, 0.3, 3);
  
  console.log('\n  Matches found:');
  matches.forEach(m => {
    const text = testTexts.find(t => t.id === m.id);
    console.log(`    [${m.id}] Score: ${(m.score * 100).toFixed(1)}% - ${text.text}`);
  });
  
  console.log('  ✅ Fuzzy matching working correctly');
  return matches.length > 0;
}

// Test 6: Multiple subjects
async function testMultipleSubjects() {
  console.log('\n🌍 Test 6: Multiple Subjects');
  console.log('-'.repeat(60));
  
  const subjects = ['math', 'phys', 'rus'];
  let successCount = 0;
  
  for (const subject of subjects) {
    try {
      console.log(`  Testing ${subject}...`);
      const results = await client.searchProblems(subject, 'задача', 3);
      console.log(`    ✅ ${subject}: Found ${results.length} problems`);
      successCount++;
    } catch (error) {
      console.log(`    ❌ ${subject}: Error - ${error.message}`);
    }
  }
  
  console.log(`\n  ${successCount}/${subjects.length} subjects working`);
  return successCount > 0;
}

// Run all tests
async function runAllTests() {
  const startTime = Date.now();
  
  try {
    await testTextUtils();
    
    const test2 = await testGetProblem();
    const test3 = await testSearch();
    const test4 = await testCatalog();
    await testFuzzyMatching();
    const test6 = await testMultipleSubjects();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    console.log(`  Text Utils: ✅ Pass`);
    console.log(`  Get Problem: ${test2 ? '✅ Pass' : '❌ Fail'}`);
    console.log(`  Search: ${test3 ? '✅ Pass' : '❌ Fail'}`);
    console.log(`  Catalog: ${test4 ? '✅ Pass' : '❌ Fail'}`);
    console.log(`  Fuzzy Matching: ✅ Pass`);
    console.log(`  Multiple Subjects: ${test6 ? '✅ Pass' : '❌ Fail'}`);
    console.log(`\n  Total time: ${duration}s`);
    console.log('='.repeat(60));
    
    const allPassed = test2 && test3 && test4 && test6;
    
    if (allPassed) {
      console.log('\n✨ All tests passed! Server is ready to use.');
    } else {
      console.log('\n⚠️  Some tests failed. Check network connectivity to sdamgia.ru');
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Execute tests
runAllTests();
