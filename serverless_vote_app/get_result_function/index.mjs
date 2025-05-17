import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = "VoteAppAggregates";

export const handler = async (event) => {
    const params = {
        TableName: tableName,
    };

    try {
        const command = new ScanCommand(params);
        const data = await client.send(command);

        let redCount = 0;
        let greenCount = 0;
        let blueCount = 0;

        if (data.Items) {
            data.Items.forEach(item => {
                if (item.VotedFor && item.VotedFor.S === "RED" && item.Vote && item.Vote.N) {
                    redCount = parseInt(item.Vote.N);
                } else if (item.VotedFor && item.VotedFor.S === "GREEN" && item.Vote && item.Vote.N) {
                    greenCount = parseInt(item.Vote.N);
                } else if (item.VotedFor && item.VotedFor.S === "BLUE" && item.Vote && item.Vote.N) {
                    blueCount = parseInt(item.Vote.N);
                }
            });
        }

        const responseBody = {
            RED: redCount,
            GREEN: greenCount,
            BLUE: blueCount,
        };

        const response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
            },
            body: JSON.stringify(responseBody),
        };
        return response;

    } catch (err) {
        console.error("Error scanning DynamoDB table:", err);
        const response = {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ message: "Failed to get vote results", error: err.message }),
        };
        return response;
    }
};
