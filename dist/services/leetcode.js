"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeetCodeService = void 0;
class LeetCodeService {
    static problems = [
        {
            id: "1",
            title: "Two Sum",
            difficulty: "Easy",
            topics: ["Array", "Hash Table"],
            description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            acceptanceRate: "50.1%"
        },
        {
            id: "2",
            title: "Add Two Numbers",
            difficulty: "Medium",
            topics: ["Linked List", "Math", "Recursion"],
            description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit.",
            acceptanceRate: "41.2%"
        },
        {
            id: "3",
            title: "Longest Substring Without Repeating Characters",
            difficulty: "Medium",
            topics: ["Hash Table", "String", "Sliding Window"],
            description: "Given a string s, find the length of the longest substring without repeating characters.",
            acceptanceRate: "34.3%"
        },
        {
            id: "15",
            title: "3Sum",
            difficulty: "Medium",
            topics: ["Array", "Two Pointers", "Sorting"],
            description: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
            acceptanceRate: "33.5%"
        },
        {
            id: "42",
            title: "Trapping Rain Water",
            difficulty: "Hard",
            topics: ["Array", "Two Pointers", "Dynamic Programming", "Stack", "Monotonic Stack"],
            description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
            acceptanceRate: "59.8%"
        }
    ];
    static async getPopularProblems() {
        // In a real implementation, this would fetch from an API or a local database
        return this.problems;
    }
    static async getProblemById(id) {
        return this.problems.find(p => p.id === id);
    }
    static async searchProblems(query) {
        const q = query.toLowerCase();
        return this.problems.filter(p => p.title.toLowerCase().includes(q) ||
            p.id.includes(q) ||
            p.topics.some(t => t.toLowerCase().includes(q)));
    }
}
exports.LeetCodeService = LeetCodeService;
