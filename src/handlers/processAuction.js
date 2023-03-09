const db = require("../../db");
const { QueryCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const handler = async (event) => {
  const now = new Date();
  let count = 0;
  var updateResult;
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

    Items.map((item) => {
      let item_data = unmarshall(item);
      updateResult = updateClosedAuction(item_data.id);
      count++;
    });

    response.statusCode = 200;
    response.body = JSON.stringify({
      message: "Successfully closed " + count + " auction item",
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

const updateClosedAuction = async (item_id) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: marshall({ id: item_id }),
    UpdateExpression: "set #status = :status", // set the attribute to a new value
    ExpressionAttributeNames: { "#status": "status" }, // specify the attribute name
    ExpressionAttributeValues: marshall({ ":status": "CLOSED" }), // specify the attribute value
  };
  return await db.send(new UpdateItemCommand(params));
};

module.exports = {
  handler,
};
