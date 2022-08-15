import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./createDocClient.js";

async function getRecord(table, keyName, keyVal) {
  const params = {
    TableName: table,
    Key: {
      [keyName]: keyVal,
    },
  };
  try {
    const data = await ddbDocClient.send(new GetCommand(params));
    console.log("Success :", data.Item);
    return JSON.stringify(data.Item);
  } catch (err) {
    console.log("Error", err);
  }
}

export default async function getTmp(ref) {
  const data = await getRecord("transactions", "txRef", ref.toString());
  console.log("data", data);

  return data;
}
