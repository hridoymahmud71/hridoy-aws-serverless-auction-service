const { sendResponse } = require("../functions/index");

const handler = async (event) => {
  console.log(event.requestContext);
  return sendResponse(200, event.requestContext.authorizer.claims.email);
};

module.exports = {
  handler,
};
