import { generatePolicy, validateToken } from "../helpers/authentication";

export const handler = async (event, context) => {
  // get token
  if (typeof event.authorizationToken === "undefined") {
    if (process.env.DEBUG === "true") {
      console.log("AUTH: No token");
    }
    return context.fail("Unauthorized");
  }

  const split = event.authorizationToken.split("Bearer");
  if (split.length !== 2) {
    if (process.env.DEBUG === "true") {
      console.log("AUTH: no token in Bearer");
    }
    return context.fail("Unauthorized");
  }
  const token = split[1].trim();
  // check on firebase if token is valid
  try {
    const userToken = await validateToken(token);
    if (userToken.verified) {
      return context.succeed(generatePolicy(userToken));
    }
    return context.fail("Unauthorized");
  } catch (error) {
    return context.fail("Unauthorized");
  }
};
