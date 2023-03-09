const db = require("../../db");
const {
  GetItemCommand,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const closingAuction = async (id) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: marshall({ id: id }),
    UpdateExpression: "set #status= :status",
    ExpressionAttributeValues: {
      ":status": "CLOSED",
    },
    ExpressionAttributeNames: {
      "#status": "status",
    },
  };

  const updateResult = await db.send(new UpdateItemCommand(params)).promise();

  return updateResult;
};

module.exports = {
  closingAuction,
};
