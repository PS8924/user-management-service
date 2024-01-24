require('dotenv').config();
const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB();
const s3 = new AWS.S3();

exports.handler = async (event) => {
  try {
    // Extract user information from the Cognito event
    const username = event.userName;
    const userId = event.request.userAttributes.sub;

    // Connect to DynamoDB and create a record for the user
    await createDynamoDBRecord(userId, username);

    // Connect to S3 and create a folder for the user
    await createS3Folder(userId);

    return {
      statusCode: 200,
      body: JSON.stringify('User creation successful'),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify('Error creating user'),
    };
  }
};

async function createDynamoDBRecord(userId, username) {
  const params = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Item: {
      UserId: { S: userId },
      Username: { S: username },
    },
  };

  await dynamoDB.putItem(params).promise();
}

async function createS3Folder(userId) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${userId}/`, // Assuming userId is unique and can be used as a folder name
    Body: '', // Empty body as it's a folder
  };

  await s3.upload(params).promise();
}
