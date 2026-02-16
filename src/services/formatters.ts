/**
 * Output formatters for JSON and Markdown
 */

import { Problem, Topic, ResponseFormat } from "../types.js";

/**
 * Format problem as markdown
 */
export function formatProblemMarkdown(problem: Problem): string {
  let output = `# Problem ${problem.id}\n\n`;
  output += `**URL**: ${problem.url}\n`;
  output += `**Topic**: ${problem.topic}\n\n`;
  
  output += `## Condition\n\n${problem.condition.text}\n\n`;
  
  if (problem.condition.images.length > 0) {
    output += `**Images**:\n`;
    problem.condition.images.forEach(img => {
      output += `- ${img}\n`;
    });
    output += `\n`;
  }

  if (problem.solution.text) {
    output += `## Solution\n\n${problem.solution.text}\n\n`;
    
    if (problem.solution.images.length > 0) {
      output += `**Solution Images**:\n`;
      problem.solution.images.forEach(img => {
        output += `- ${img}\n`;
      });
      output += `\n`;
    }
  }

  output += `## Answer\n\n${problem.answer}\n\n`;

  if (problem.analogs.length > 0) {
    output += `## Similar Problems\n\n`;
    output += problem.analogs.join(", ") + "\n";
  }

  return output;
}

/**
 * Format multiple problem IDs as markdown
 */
export function formatProblemIdsMarkdown(ids: string[], title: string = "Problem IDs"): string {
  let output = `# ${title}\n\n`;
  output += `**Total**: ${ids.length}\n\n`;
  output += ids.join(", ") + "\n";
  return output;
}

/**
 * Format catalog as markdown
 */
export function formatCatalogMarkdown(catalog: Topic[]): string {
  let output = `# Problem Catalog\n\n`;
  output += `**Total Topics**: ${catalog.length}\n\n`;

  catalog.forEach(topic => {
    output += `## ${topic.topic_name} (ID: ${topic.topic_id})\n\n`;
    
    if (topic.categories.length > 0) {
      output += `**Categories**:\n`;
      topic.categories.forEach(cat => {
        output += `- ${cat.category_name} (ID: ${cat.category_id})\n`;
      });
      output += `\n`;
    }
  });

  return output;
}

/**
 * Format search results as markdown
 */
export function formatSearchResultsMarkdown(
  query: string,
  results: Array<{ id: string; score?: number }>,
  subject: string
): string {
  let output = `# Search Results\n\n`;
  output += `**Query**: ${query}\n`;
  output += `**Subject**: ${subject}\n`;
  output += `**Total Results**: ${results.length}\n\n`;

  if (results.length === 0) {
    output += `No problems found matching the query.\n`;
    return output;
  }

  output += `## Problem IDs\n\n`;
  results.forEach((result, index) => {
    output += `${index + 1}. Problem ${result.id}`;
    if (result.score !== undefined) {
      output += ` (similarity: ${(result.score * 100).toFixed(1)}%)`;
    }
    output += `\n`;
  });

  return output;
}

/**
 * Format batch problems as markdown
 */
export function formatBatchProblemsMarkdown(problems: Problem[]): string {
  let output = `# Batch Problems\n\n`;
  output += `**Total**: ${problems.length}\n\n`;
  output += `---\n\n`;

  problems.forEach((problem, index) => {
    output += formatProblemMarkdown(problem);
    if (index < problems.length - 1) {
      output += `---\n\n`;
    }
  });

  return output;
}

/**
 * Format data based on response format
 */
export function formatResponse(data: any, format: ResponseFormat, markdownFormatter?: (data: any) => string): string {
  if (format === ResponseFormat.JSON) {
    return JSON.stringify(data, null, 2);
  }
  
  if (markdownFormatter) {
    return markdownFormatter(data);
  }

  return JSON.stringify(data, null, 2);
}
