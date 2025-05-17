import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({}); // Assumes region is configured in AWS Lambda environment

console.log('Loading event');

// Helper function to update aggregate for a specific color
async function updateAggregateForColor(votedFor, numVotes, aggregatesTable) {
    console.log(`Updating Aggregate Color ${votedFor} for NumVotes: ${numVotes}`);
    const params = {
        TableName: aggregatesTable,
        Key: { 'VotedFor': { S: votedFor } },
        UpdateExpression: 'add #vote :x',
        ExpressionAttributeNames: { '#vote': 'Vote' },
        ExpressionAttributeValues: { ':x': { N: numVotes.toString() } }
    };
    try {
        await client.send(new UpdateItemCommand(params));
        console.log(`Vote update successful for ${votedFor}`);
    } catch (err) {
        console.error(`Error updating Aggregates table for ${votedFor}:`, err);
        const specificError = new Error(`Failed to update aggregate for ${votedFor}. Details: ${err.message}`);
        specificError.cause = err; // Preserve original error for inspection if needed
        throw specificError;
    }
}

export const handler = async (event, context) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    let totalRed = 0;
    let totalGreen = 0;
    let totalBlue = 0;

    event.Records.forEach(record => {
        // Basic validation for the record structure
        if (record.dynamodb && record.dynamodb.NewImage &&
            record.dynamodb.NewImage.VotedFor && record.dynamodb.NewImage.VotedFor.S &&
            record.dynamodb.NewImage.Votes && record.dynamodb.NewImage.Votes.N) {

            const votedForHash = record.dynamodb.NewImage.VotedFor.S;
            const numVotesStr = record.dynamodb.NewImage.Votes.N;
            const numVotes = parseInt(numVotesStr, 10);

            if (isNaN(numVotes)) {
                console.warn("Invalid vote count (not a number): ", numVotesStr, "for VotedForHash:", votedForHash, ". Skipping this part of the record.");
                return; // Skip processing this vote count if NaN
            }

            // Determine the color on which to add the vote
            if (votedForHash.includes("RED")) {
                totalRed += numVotes;
            } else if (votedForHash.includes("GREEN")) {
                totalGreen += numVotes;
            } else if (votedForHash.includes("BLUE")) {
                totalBlue += numVotes;
            } else {
                console.log("Invalid vote category in VotedForHash (no RED, GREEN, or BLUE): ", votedForHash);
            }
        } else {
            console.warn("Skipping record due to missing NewImage or key fields:", JSON.stringify(record.dynamodb, null, 2));
        }
    });

    console.log(`Calculated totals from ${event.Records.length} records: Red=${totalRed}, Green=${totalGreen}, Blue=${totalBlue}`);

    const aggregatesTable = 'VoteAppAggregates'; // Consider making this an environment variable
    const updatePromises = [];

    if (totalRed > 0) {
        updatePromises.push(updateAggregateForColor("RED", totalRed, aggregatesTable));
    }
    if (totalBlue > 0) {
        updatePromises.push(updateAggregateForColor("BLUE", totalBlue, aggregatesTable));
    }
    if (totalGreen > 0) {
        updatePromises.push(updateAggregateForColor("GREEN", totalGreen, aggregatesTable));
    }

    if (updatePromises.length === 0) {
        const message = `Successfully processed ${event.Records.length} records. No new votes to aggregate.`;
        console.log(message);
        return message;
    }

    console.log(`Attempting to update ${updatePromises.length} aggregates in table '${aggregatesTable}'.`);

    try {
        await Promise.all(updatePromises);
        const successMessage = `Successfully processed ${event.Records.length} records. ${updatePromises.length} aggregate(s) updated.`;
        console.log(successMessage);
        return successMessage;
    } catch (error) {
        // Log the error that caused Promise.all to fail.
        // The error should already be logged by updateAggregateForColor, but good to log the context of Promise.all failure.
        console.error("Error updating one or more aggregates, Promise.all failed:", error.message);
        // Throw a new error to indicate a processing failure for the Lambda invocation.
        // The original error (error.cause) can be inspected if needed.
        throw new Error(`Failed to process all records due to aggregate update failure(s). Last error encountered: ${error.message}`);
    }
};
