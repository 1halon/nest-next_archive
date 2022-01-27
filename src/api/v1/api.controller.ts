import { Controller, Get, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { S3Service } from 'src/s3/s3.service';

@Controller({ host: 'localhost', path: 'api/v1' })
export class ApiControllerV1 {
    constructor(
        private readonly s3Service: S3Service
    ) { }

    @Post('upload')
    //@UseInterceptors(FileInterceptor('file'))
    upload(@Req() request: Request, @Res() response: Response) {
        try {
            this.s3Service.upload().single('file')(request, response, (error) => {
                if (error) return response.status(400).send(error.message);
                const { contentType, fieldname, key, location, originalname } = request.file as any;
                const url = this.s3Service.s3.getSignedUrl('getObject', { Bucket: process.env.AWS_S3_BUCKET_NAME, Key: key });
                return response.status(201).json({ contentType, fieldname, key, location, originalname, url });
            });
        } catch (error) {
            return response.status(500).send(error.message);
        }
    }
}
