import { HttpException, Injectable } from '@nestjs/common';
import AWS from 'aws-sdk';
import { randomUUID } from 'crypto';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { extname } from 'path';

const s3 = new AWS.S3({
    region: 'eu-central-1',
    signatureVersion: 'v4'
});

@Injectable()
export class S3Service {
    constructor() {
        AWS.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        })
        this.s3 = s3;
    };
    
    public s3: AWS.S3;
    private readonly mimeTypes = {
        'image': {
            jpg: 'image/jpg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            webp: 'image/webp'
        }
    };

    upload(options?) {
        return multer({
            limits: { fileSize: 1024 * 1024 * 50 },
            storage: multerS3({
                acl: options?.acl,
                bucket: process.env.AWS_S3_BUCKET_NAME,
                contentType: (request, file, callback) => callback(null, options?.mimeType ?? file.mimetype),
                key: (request, file, callback) => callback(null, `${options?.path ?? ''}${randomUUID().split('-').join('')}${extname(file.originalname)}`),
                s3: s3
            }),
            fileFilter: (request, file, callback) => {
                const ext = extname(file.originalname), mimeType = this.mimeTypes.image[ext.split('.')[1]];
                if (mimeType) callback(null, true);
                else callback(new Error(`Unsupported file type ${ext}`));
            }
        })
    }
}
