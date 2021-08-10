import middy from '@middy/core';
import cors from '@middy/http-cors'
import jsonBodyParser from '@middy/http-json-body-parser';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../db/mongo';
import { logger } from '../../helpers/logger';
import { generateHttpResponse } from '../../helpers/responses';
import { Partner } from '../../types/Partner';

const dbConnect = connectToDatabase;

const baseHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger({ message: `Try to include user on partners table` });
    const { partnerId } = event.pathParameters;
    const { name, email, url } = event.body as any as Partner;
    const client = await dbConnect();
    const partnersCollection = client.db().collection<Partner>('partners');

    try {
        const partner = await partnersCollection.findOneAndUpdate(
            { _id: new ObjectId(partnerId) },
            { $set: { name, email, url } },
            { returnOriginal: false }
        );
        if (!partner?.ok) {
            logger({ message: `Problem updating partner: ${partnerId}` });
            return generateHttpResponse(400, undefined, 'Error updating partner.');
        }
        return generateHttpResponse(200, partner.value);
    } catch (e) {
        return generateHttpResponse(400, undefined, e.message);
    }
};


export const handler = middy(baseHandler).use(cors()).use(jsonBodyParser());