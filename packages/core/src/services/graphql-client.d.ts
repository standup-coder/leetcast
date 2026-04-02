export declare class LeetCodeGraphQLClient {
    private static readonly ENDPOINT;
    private static readonly USER_AGENT;
    static query<T>(query: string, variables?: any): Promise<T>;
    static getProblemList(limit?: number): Promise<any[]>;
    static getProblemDetail(titleSlug: string): Promise<any>;
}
//# sourceMappingURL=graphql-client.d.ts.map