"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeetCodeGraphQLClient = void 0;
const axios_1 = __importDefault(require("axios"));
const retry_utils_1 = require("../utils/retry-utils");
class LeetCodeGraphQLClient {
    static ENDPOINT = 'https://leetcode.com/graphql';
    static USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    static async query(query, variables = {}) {
        return (0, retry_utils_1.retryWithBackoff)(async () => {
            const response = await axios_1.default.post(this.ENDPOINT, { query, variables }, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': this.USER_AGENT,
                    Referer: 'https://leetcode.com/',
                },
                timeout: 10000,
            });
            if (response.data.errors) {
                throw new Error(`GraphQL Error: ${JSON.stringify(response.data.errors)}`);
            }
            // Add a small delay to avoid rate limiting
            await (0, retry_utils_1.sleep)(200);
            return response.data.data;
        });
    }
    static async getProblemList(limit = 100) {
        const query = `
      query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
        problemsetQuestionList: questionList(
          categorySlug: $categorySlug
          limit: $limit
          skip: $skip
          filters: $filters
        ) {
          total: totalNum
          questions: data {
            acRate
            difficulty
            freqBar
            frontendQuestionId: questionId
            isFavor
            paidOnly: isPaidOnly
            status
            title
            titleSlug
            topicTags {
              name
              id
              slug
            }
            hasVideoSolution
            hasSolution
          }
        }
      }
    `;
        const data = await this.query(query, {
            categorySlug: '',
            limit,
            skip: 0,
            filters: {},
        });
        return data.problemsetQuestionList.questions;
    }
    static async getProblemDetail(titleSlug) {
        const query = `
      query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionId
          questionFrontendId
          title
          titleSlug
          content
          difficulty
          stats
          topicTags {
            name
            slug
          }
          hints
          solution {
            id
            canSeeDetail
            paidOnly
            hasVideoSolution
            content
          }
        }
      }
    `;
        const data = await this.query(query, { titleSlug });
        return data.question;
    }
}
exports.LeetCodeGraphQLClient = LeetCodeGraphQLClient;
//# sourceMappingURL=graphql-client.js.map