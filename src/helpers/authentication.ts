import * as qfroles from "../config/roles.json";
import { PolicyDocument, Statement } from "aws-lambda";
import { admin } from "../config/firebaseConfig";
import { ROLES } from './enums/Roles';

type AuthenticationResponse = {
  principalId: string;
  policyDocument: PolicyDocument;
};

type Roles = {
  name: string;
  resourcesForPolicy: ResourcePolicy[];
};

type ResourcePolicy = {
  httpVerb: string;
  path: string;
  effect: string;
};

type DecodedUserToken = {
  uid: string;
  roles: ROLES[];
  email: string;
  verified: boolean,
};

const createStatement = (resource: string, effect: string) => {
  const statement: Statement = {
    Action: "execute-api:Invoke",
    Effect: effect,
    Resource: resource,
  };
  return statement;
};

const generateFromRole = (role: Roles): Statement[] => {
  console.log('generateFromRole');
  const statements: Statement[] = [];
  role.resourcesForPolicy.forEach((policy) => {
    const statement = createStatement(
      `arn:aws:execute-api:*:*:*/${process.env.STAGE
      }/${policy.httpVerb.toUpperCase()}/${policy.path}`,
      policy.effect
    );
    statements.push(statement);
  });

  return statements;
};
const createPolicy = (roles: ROLES[] = []): Statement[] => {
  console.log('createPolicy');
  const statements: Statement[] = [];
  const userRoles = qfroles.roles.filter(qfrole => roles.find(role => role === qfrole.name));
  userRoles.forEach(userRole => statements.push(...generateFromRole(userRole)));
  return statements;
};

export const generatePolicy = function (decoded: DecodedUserToken) {
  console.log('generatePolicy');
  const authResponse = {
    principalId: decoded.uid,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [],
    },
  } as AuthenticationResponse;
  authResponse.policyDocument.Statement = createPolicy(decoded.roles);

  return authResponse;
};

export const validateToken = async (token) => {
  try {
    const decodedToken: admin.auth.DecodedIdToken = await admin
      .auth()
      .verifyIdToken(token);

    const userDecoded: DecodedUserToken = {
      uid: decodedToken.uid,
      roles: decodedToken.roles,
      email: decodedToken.email,
      verified: decodedToken.email_verified,
    };

    return userDecoded;
  } catch (err) {
    console.error(`${err.code} -  ${err.message}`);
    throw new Error("Invalid token");
  }
};
