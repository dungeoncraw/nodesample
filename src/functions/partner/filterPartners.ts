import middy from '@middy/core';
import cors from '@middy/http-cors'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { connectToDatabase } from '../../db/mongo';
import { generateHttpResponse } from '../../helpers/responses';
import { Partner } from '../../types/Partner';

const dbConnect = connectToDatabase;

const baseHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { active } = event.queryStringParameters || {};
  const partnerList: Partner[] = [];
  const client = await dbConnect();
  const partnersCollection = client.db().collection<Partner>('partners');
  const status = active === 'false' ? false : true;

  try {
      const partners = await partnersCollection.find({ active: status }).toArray();
      partnerList.push(...partners);
  } catch (e) {
    return generateHttpResponse(400, undefined, e.message);
  }
  if (partnerList.length) {
    return generateHttpResponse(200, partnerList);
  } else {
    return generateHttpResponse(400, undefined, 'Partners not found.');
  }
};


export const handler = middy(baseHandler).use(cors());