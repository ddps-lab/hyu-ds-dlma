import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

console.log('Loading function');

const dynamodbClient = new DynamoDBClient({ region: "us-west-2" });

export const handler = async function(event, context) {
  console.log("Received event:", JSON.stringify(event, null, 2));

  try {
    let payload;
    const eventBodyContent = event.body;

    if (eventBodyContent && typeof eventBodyContent === 'string') {
      try {
        payload = JSON.parse(eventBodyContent);
      } catch (jsonParseError) {
        console.error("Error parsing event.body string:", jsonParseError);
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Malformed JSON in request body.", error: jsonParseError.message }),
          headers: { 'Content-Type': 'application/json' }
        };
      }
    } else if (eventBodyContent && typeof eventBodyContent === 'object') {
      payload = eventBodyContent; // event.body is already an object
    } else if (typeof event === 'object' && event !== null && event.voteto !== undefined) {
      payload = event; // event itself is the payload
    } else {
      console.log("Could not determine payload from event structure. Event:", JSON.stringify(event, null, 2));
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid request structure. Expecting 'voteto' in payload." }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    if (!payload || typeof payload.voteto !== 'string' || payload.voteto.trim() === '') {
      console.log("Invalid payload: 'voteto' field is missing, not a string, or empty. Payload:", JSON.stringify(payload, null, 2));
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid payload: 'voteto' field must be a non-empty string." }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    var votedFor = payload.voteto.toUpperCase().trim();

    if (['RED', 'GREEN', 'BLUE'].indexOf(votedFor) < 0) {
      console.log("Invalid vote received (%s)", votedFor);
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid vote received. Vote must be RED, GREEN, or BLUE." }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    /* Add randomness to our value to help spread across partitions */
    const votedForHash = votedFor + "." + Math.floor((Math.random() * 10) + 1).toString();
    const tableName = 'VoteApp';

    const params = {
      TableName: tableName,
      Key: { 'VotedFor': { 'S': votedForHash } },
      UpdateExpression: 'add #vote :x',
      ExpressionAttributeNames: { '#vote': 'Votes' },
      ExpressionAttributeValues: { ':x': { 'N': "1" } }
    };

    console.log("Attempting to update DynamoDB with params:", JSON.stringify(params, null, 2));

    try {
      await dynamodbClient.send(new UpdateItemCommand(params));
      console.log("Vote received for %s", votedFor);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Thank you for casting a vote for " + votedFor }),
        headers: { 'Content-Type': 'application/json' }
      };
    } catch (dbError) {
      console.error("Error updating database:", dbError);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Error updating database", error: dbError.message }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

  } catch (parseError) {
    console.error("Error parsing request body or processing vote:", parseError);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid request format or processing error.", error: parseError.message }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
