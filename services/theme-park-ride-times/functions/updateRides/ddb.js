import DynamoDB from 'aws-sdk/clients/dynamodb';

const documentClient = new DynamoDB.DocumentClient({
  region: process.env.AWS_REGION,
});

const masterTable = process.env.DDBtable;

// Get all rides from the table
export const getRides = async () => {
  const result = await documentClient
    .scan({
      TableName: masterTable,
    })
    .promise();

  return result.Items;
};

// Updates ride in the table
export const updateRide = async ride => {
  ride.lastUpdated = Date.now();

  await documentClient
    .put({
      TableName: masterTable,
      Item: ride,
    })
    .promise();
};
