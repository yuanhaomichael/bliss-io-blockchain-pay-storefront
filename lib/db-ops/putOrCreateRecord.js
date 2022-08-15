import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./createDocClient.js";

export default async function putOrCreateRecord(table, item) {
  // Set the parameters.
  const params = {
    TableName: table,
    Item: item,
  };
  try {
    const data = await ddbDocClient.send(new PutCommand(params));
    console.log("Success - item added or updated", data);
  } catch (err) {
    console.log("Error", err.stack);
  }
}
