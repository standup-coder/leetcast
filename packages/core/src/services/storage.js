"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const fs_extra_1 = __importDefault(require("fs-extra"));
class StorageService {
    static s3 = new client_s3_1.S3Client({
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'us-east-1',
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
            secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
        },
        forcePathStyle: true,
    });
    static BUCKET = process.env.S3_BUCKET || 'leetcast';
    static async uploadFile(localPath, key, contentType) {
        const body = await fs_extra_1.default.readFile(localPath);
        await this.s3.send(new client_s3_1.PutObjectCommand({
            Bucket: this.BUCKET,
            Key: key,
            Body: body,
            ContentType: contentType || 'audio/mpeg',
        }));
        return `${process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT}/${this.BUCKET}/${key}`;
    }
    static async uploadBuffer(buffer, key, contentType) {
        await this.s3.send(new client_s3_1.PutObjectCommand({
            Bucket: this.BUCKET,
            Key: key,
            Body: buffer,
            ContentType: contentType || 'audio/mpeg',
        }));
        return `${process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT}/${this.BUCKET}/${key}`;
    }
    static async getSignedDownloadUrl(key, expiresIn = 3600) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.BUCKET,
            Key: key,
        });
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3, command, { expiresIn });
    }
}
exports.StorageService = StorageService;
//# sourceMappingURL=storage.js.map