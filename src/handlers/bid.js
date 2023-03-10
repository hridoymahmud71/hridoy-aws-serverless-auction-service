const db = require("../../db");
const {
  GetItemCommand,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { getAuctionDetails } = require("./auction");

const placeBid = async (event) => {
  const response = { statusCode: 200 };
  const { amount } = JSON.parse(event.body);
  const email = event.requestContext.authorizer.claims.email;

  const p = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: marshall({ id: event.pathParameters.id }),
  };
  const { Item } = await db.send(new GetItemCommand(p));
  const data = Item ? unmarshall(Item) : {};

  if (data.status != "OPEN") {
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "This auction has been closed",
    });
    return response;
  }

  if (data.highestBid.amount >= amount) {
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: `Currently Maximum bid amount is  ${data.highestBid.amount}  Taka`,
    });
    return response;
  }

  // otherwise
  try {
    const body = JSON.parse(event.body);
    const objKeys = Object.keys(body);

    const highestBidder = {
      amount: amount,
      email: email,
    };

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ id: event.pathParameters.id }),
      UpdateExpression: "set #highestBid = :highestBid", // set the attribute to a new value
      ExpressionAttributeNames: { "#highestBid": "highestBid" }, // specify the attribute name
      ExpressionAttributeValues: marshall({
        ":highestBid": highestBidder,
      }), // specify the attribute value
    };

    const updateResult = await db.send(new UpdateItemCommand(params));

    response.body = JSON.stringify({
      message: "Successfully updated auction.",
      updateResult,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to update auction.",
      errorMsg: e.message,
    });
  }
  return response;
};

module.exports = {
  placeBid,
};
