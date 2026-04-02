export declare class StorageService {
    private static s3;
    private static BUCKET;
    static uploadFile(localPath: string, key: string, contentType?: string): Promise<string>;
    static uploadBuffer(buffer: Buffer, key: string, contentType?: string): Promise<string>;
    static getSignedDownloadUrl(key: string, expiresIn?: number): Promise<string>;
}
//# sourceMappingURL=storage.d.ts.map