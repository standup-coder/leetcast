export declare class AudioService {
    private static DOWNLOAD_DIR;
    static ensureDownloadDir(): Promise<void>;
    static downloadAudio(url: string, filename: string): Promise<string>;
    static playAudio(filePath: string): Promise<void>;
}
