import { v4 as uuidv4 } from 'uuid';
import AWS from 'aws-sdk';
import { logger } from './logger';
const s3 = new AWS.S3({
    region: process.env.REGION || 'us-east-1',
    signatureVersion: 'v4'
});

export const getUploadURL = async (bucketName: string, fileType: string = 'png') => {
    const uploadName = uuidv4();
    const fileName = `${uploadName}.${fileType}`;
    const s3Params = {
        Bucket: bucketName,
        Key: fileName,
        ContentType: `image/${fileType}`,
        ACL: 'public-read',
    };
    const uploadInfo = {
        uploadUrl: s3.getSignedUrl('putObject', s3Params),
        fileName: fileName
    };

    return uploadInfo;
}

export const deleteFromS3 = async (bucketName: string, objectId: string) => {
    const s3Params = {
        Bucket: bucketName,
        Key: objectId
    };
    const result = await s3.deleteObject(s3Params).promise();
    logger({ message: "S3 delete image: ", result: JSON.stringify(result.$response) })
}