const db = require("../../db");
const { QueryCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const getEndedAuctions = async (event) => {
  const now = new Date();
  const response = { statusCode: 200 };
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      IndexName: "statusAndEndDate",
      KeyConditionExpression: "#status = :status and endingAt < :now",
      ExpressionAttributeValues: marshall({
        ":status": "OPEN",
        ":now": now.toISOString(),
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
      message: "Failed to get auction.",
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

module.exports = {
  getEndedAuctions,
};
