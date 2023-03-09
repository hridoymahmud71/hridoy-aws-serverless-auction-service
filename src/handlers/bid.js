const db = require("../../db");
const {
  GetItemCommand,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { getAuctionDetails } = require("./auction");

const placeBid = async (event) => {
  const response = { statusCode: 200 };
  const { highestBid } = JSON.parse(event.body);

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

  if (data.highestBid.amount <= highestBid.amount) {
    response.statusCode = 500;
    response.body = JSON.stringify({
      message:
        "Currently Maximum bid amount is " + data.highestBid.amount + " Taka",
    });
    return response;
  } else {
    try {
      const body = JSON.parse(event.body);
      const objKeys = Object.keys(body);
      const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: marshall({ id: event.pathParameters.id }),
        UpdateExpression: `SET ${objKeys
          .map((_, index) => `#key${index} = :value${index}`)
          .join(", ")}`,
        ExpressionAttributeNames: objKeys.reduce(
          (acc, key, index) => ({
            ...acc,
            [`#key${index}`]: key,
          }),
          {}
        ),
        ExpressionAttributeValues: marshall(
          objKeys.reduce(
            (acc, key, index) => ({
              ...acc,
              [`:value${index}`]: body[key],
            }),
            {}
          )
        ),
      };
      const updateResult = await db.send(new UpdateItemCommand(params));

      response.body = JSON.stringify({
        message: "Successfully updated auction.",
        updateResult,
        m: data.highestBid.amount,
        t: highestBid.amount,
      });
    } catch (e) {
      console.error(e);
      response.statusCode = 500;
      response.body = JSON.stringify({
        message: "Failed to update auction.",
        errorMsg: e.message,
        errorStack: e.stack,
      });
    }
    return response;
  }
};

module.exports = {
  placeBid,
};
