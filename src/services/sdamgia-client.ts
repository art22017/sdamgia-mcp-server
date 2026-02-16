/**
 * СДАМ ГИА API Client
 * Based on reverse-engineered endpoints from sdamgia-api Python library
 */

import axios, { AxiosInstance } from "axios";
import * as cheerio from "cheerio";
import { Problem, Topic, Subject } from "../types.js";
import { BASE_URLS, REQUEST_TIMEOUT, USER_AGENT } from "../constants.js";

/**
 * API Client for СДАМ ГИА platform
 */
export class SdamGiaClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: REQUEST_TIMEOUT,
      headers: {
        "User-Agent": USER_AGENT
      }
    });
  }

  /**
   * Get base URL for subject
   */
  private getBaseUrl(subject: Subject): string {
    const url = BASE_URLS[subject];
    if (!url) {
      throw new Error(`Unsupported subject: ${subject}`);
    }
    return url;
  }

  /**
   * Get problem by ID
   * Endpoint: /problem?id={id}
   */
  async getProblemById(subject: Subject, id: string): Promise<Problem> {
    const baseUrl = this.getBaseUrl(subject);
    const url = `${baseUrl}/problem?id=${id}`;

    try {
      const response = await this.axiosInstance.get(url);
      const $ = cheerio.load(response.data);

      // Parse problem condition
      const conditionText = $(".pbody").first().text().trim();
      const conditionImages = $(".pbody img")
        .map((_, el) => $(el).attr("src"))
        .get()
        .filter(Boolean);

      // Parse solution
      const solutionText = $(".solution").text().trim();
      const solutionImages = $(".solution img")
        .map((_, el) => $(el).attr("src"))
        .get()
        .filter(Boolean);

      // Parse answer
      const answer = $(".answer").text().replace("Ответ:", "").trim();

      // Parse topic
      const topicMatch = response.data.match(/topic[_=](\d+)/);
      const topic = topicMatch ? topicMatch[1] : "";

      // Parse analogs
      const analogs = $(".prob_nums a")
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(Boolean);

      return {
        id,
        topic,
        condition: {
          text: conditionText,
          images: conditionImages.map(img => this.normalizeImageUrl(baseUrl, img))
        },
        solution: {
          text: solutionText,
          images: solutionImages.map(img => this.normalizeImageUrl(baseUrl, img))
        },
        answer,
        analogs,
        url
      };
    } catch (error) {
      throw new Error(`Failed to fetch problem ${id}: ${error}`);
    }
  }

  /**
   * Search problems by text query
   * Endpoint: /search?search={query}
   */
  async searchProblems(subject: Subject, query: string, limit: number = 20): Promise<string[]> {
    const baseUrl = this.getBaseUrl(subject);
    const url = `${baseUrl}/search`;

    try {
      const response = await this.axiosInstance.get(url, {
        params: { search: query }
      });

      const $ = cheerio.load(response.data);
      
      // Extract problem IDs from search results
      const problemIds: string[] = [];
      $(".prob_nums a").each((_, el) => {
        const href = $(el).attr("href");
        const idMatch = href?.match(/id=(\d+)/);
        if (idMatch) {
          problemIds.push(idMatch[1]);
        }
      });

      return problemIds.slice(0, limit);
    } catch (error) {
      throw new Error(`Search failed: ${error}`);
    }
  }

  /**
   * Get catalog structure
   * Endpoint: /test (catalog page)
   */
  async getCatalog(subject: Subject): Promise<Topic[]> {
    const baseUrl = this.getBaseUrl(subject);
    const url = `${baseUrl}/prob_catalog`;

    try {
      const response = await this.axiosInstance.get(url);
      const $ = cheerio.load(response.data);

      const topics: Topic[] = [];

      // Parse catalog structure
      // Only process parent topics (those with .cat_children)
      $(".cat_category").has(".cat_children").each((_, topicEl) => {
        // Get topic ID from .pcat_num span (parent topics don't have data-id)
        const topicId = $(topicEl).find(".pcat_num").text().trim();

        // Get topic name and clean it (remove theory icon and number prefix)
        const topicNameEl = $(topicEl).find("> .cat_name").clone();
        topicNameEl.find(".pcat_num, .theory").remove();
        const topicName = topicNameEl.text().replace(/^\s*\d+\.\s*/, "").trim();

        // Parse subcategories from .cat_children
        const categories = $(topicEl)
          .find(".cat_children > .cat_category")
          .map((_, catEl) => ({
            category_id: $(catEl).attr("data-id") || "",
            category_name: $(catEl).find("a.cat_name").text().trim()
          }))
          .get();

        if (topicName && topicId) {
          topics.push({
            topic_id: topicId,
            topic_name: topicName,
            categories
          });
        }
      });

      return topics;
    } catch (error) {
      throw new Error(`Failed to fetch catalog: ${error}`);
    }
  }

  /**
   * Get test by ID
   * Endpoint: /test?id={id}
   */
  async getTestById(subject: Subject, testId: string): Promise<string[]> {
    const baseUrl = this.getBaseUrl(subject);
    const url = `${baseUrl}/test?id=${testId}`;

    try {
      const response = await this.axiosInstance.get(url);
      const $ = cheerio.load(response.data);

      // Extract problem IDs from test
      const problemIds: string[] = [];
      $(".prob_nums").each((_, el) => {
        const href = $(el).find("a").attr("href");
        const idMatch = href?.match(/id=(\d+)/);
        if (idMatch) {
          problemIds.push(idMatch[1]);
        }
      });

      return problemIds;
    } catch (error) {
      throw new Error(`Failed to fetch test ${testId}: ${error}`);
    }
  }

  /**
   * Get category problems
   * Endpoint: /prob_catalog (with category filter)
   */
  async getCategoryProblems(subject: Subject, categoryId: string, limit: number = 50): Promise<string[]> {
    const baseUrl = this.getBaseUrl(subject);
    const url = `${baseUrl}/prob_catalog`;

    try {
      const response = await this.axiosInstance.get(url, {
        params: { category: categoryId }
      });

      const $ = cheerio.load(response.data);
      
      const problemIds: string[] = [];
      $(".prob_nums a").each((_, el) => {
        const href = $(el).attr("href");
        const idMatch = href?.match(/id=(\d+)/);
        if (idMatch) {
          problemIds.push(idMatch[1]);
        }
      });

      return problemIds.slice(0, limit);
    } catch (error) {
      throw new Error(`Failed to fetch category ${categoryId}: ${error}`);
    }
  }

  /**
   * Normalize image URL to be absolute
   */
  private normalizeImageUrl(baseUrl: string, imageUrl: string): string {
    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }
    if (imageUrl.startsWith("//")) {
      return `https:${imageUrl}`;
    }
    if (imageUrl.startsWith("/")) {
      return `${baseUrl}${imageUrl}`;
    }
    return `${baseUrl}/${imageUrl}`;
  }
}
