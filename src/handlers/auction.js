const db = require("../../db");
const {
  QueryCommand,
  GetItemCommand,
  PutItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { uuid } = require("uuidv4");
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");
const httpEventNormalizer = require("@middy/http-event-normalizer");
const httpErrorHandler = require("@middy/http-error-handler");
const createError = require("http-errors");

const createAuction = async (event) => {
  const response = { statusCode: 200 };
  const endDate = new Date();
  const now = new Date();
  endDate.setHours(now.getHours() + 1);

  try {
    const { title } = JSON.parse(event.body);
    const body = {
      id: uuid(),
      title: title,
      status: "OPEN",
      highestBid: {
        amount: 0,
      },
      createdAt: new Date().toISOString(),
      endingAt: endDate.toISOString(),
    };
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(body || {}),
    };
    const createResult = await db.send(new PutItemCommand(params));

    response.body = JSON.stringify({
      message: "Successfully created auction.",
      data: body,
    });
  } catch (e) {
    // throw new createError.InternalServerError(e)
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to create auction.",
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

const getAuctions = async (event) => {
  const response = { statusCode: 200 };
  const { status } = event.queryStringParameters;

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      IndexName: "statusAndEndDate",
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeValues: marshall({
        ":status": status,
      }),
      ExpressionAttributeNames: {
        "#status": "status",
      },
    };

    const { Items } = await db.send(new QueryCommand(params));

    response.body = JSON.stringify({
      message: "Successfully retrieved all auctions.",
      data: Items.map((item) => unmarshall(item)),
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to retrieve auctions.",
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

const getAuctionDetails = async (event) => {
  const response = { statusCode: 200 };

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ id: event.pathParameters.id }),
    };
    const { Item } = await db.send(new GetItemCommand(params));

    console.log({ Item });
    response.body = JSON.stringify({
      message: "Successfully retrieved auction.",
      data: Item ? unmarshall(Item) : {},
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to get auction.",
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

// const handler = middy(createAuction)
//   .use(httpJsonBodyParser())
//   .use(httpEventNormalizer())
//   .use(httpErrorHandler());

module.exports = {
  createAuction,
  getAuctions,
  getAuctionDetails,
};
