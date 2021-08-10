import middy from '@middy/core';
import cors from '@middy/http-cors'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../db/mongo';
import { logger } from '../../helpers/logger';
import { generateHttpResponse } from '../../helpers/responses';
import { getUploadURL } from '../../helpers/signedFiles';
import { Partner } from '../../types/Partner';

const dbConnect = connectToDatabase;

const baseHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { partnerId } = event.pathParameters;
    const { fileType } = event.queryStringParameters;
    const client = await dbConnect();
    const partnersCollection = client.db().collection<Partner>('partners');
    logger({ message: `Try to get signedImageUrl for partner ${partnerId}` });

    try {
        const partner = await partnersCollection.findOne(
            { _id: new ObjectId(partnerId) }
        );
        if (!partner) {
            logger({ message: `Partner not found: ${partnerId}` });
            return generateHttpResponse(400, undefined, 'Partner not found.');
        }
        const uploadInfo = await getUploadURL(process.env.IMAGE_BUCKET, fileType);
        logger({ message: `Partner found, generated new signedURL: ${uploadInfo.uploadUrl}`})
        return generateHttpResponse(200, uploadInfo);
    } catch (e) {
        return generateHttpResponse(400, undefined, e.message);
    }
};


export const handler = middy(baseHandler).use(cors());