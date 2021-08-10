import middy from '@middy/core';
import cors from '@middy/http-cors'
import jsonBodyParser from '@middy/http-json-body-parser';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../db/mongo';
import { logger } from '../../helpers/logger';
import { generateHttpResponse } from '../../helpers/responses';
import { Partner, PartnerImage } from '../../types/Partner';

const dbConnect = connectToDatabase;

const baseHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger({ message: `Try to add a image to partner` });
    const { partnerId } = event.pathParameters;
    const { url, trackLink, isLogo } = event.body as any as PartnerImage;
    const client = await dbConnect();
    const partnersCollection = client.db().collection<Partner>('partners');

    try {
        const partner = await partnersCollection.findOneAndUpdate(
            { _id: new ObjectId(partnerId) },
            { $push: { images: { _id: new ObjectId(), url, trackLink, isLogo } } },
            { returnOriginal: false }
        );
        if (!partner?.ok) {
            logger({ message: `Partner not found: ${partnerId}` });
            return generateHttpResponse(400, undefined, 'Something went wrong adding image to partner.');
        }
        logger({ message: `Image added to partner` });
        return generateHttpResponse(200, partner.value);
    } catch (e) {
        return generateHttpResponse(400, undefined, e.message);
    }
};


export const handler = middy(baseHandler).use(cors()).use(jsonBodyParser());