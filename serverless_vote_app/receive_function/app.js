console.log('Loading event');
var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();

exports.handler = function(event, context) {
  var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10', region: 'us-west-2'});

  /* Make sure we have a valid vote (one of [RED, GREEN, BLUE]) */
  console.log(event);
  try {
    // API Gateway event body is a string, parse it
    const body = JSON.parse(event.body);
    var votedFor = body.voteto.toUpperCase().trim();

    if (['RED', 'GREEN', 'BLUE'].indexOf(votedFor) >= 0) {
      /* Add randomness to our value to help spread across partitions */
      votedForHash = votedFor + "." + Math.floor((Math.random() * 10) + 1).toString();
      /* ...updateItem into our DynamoDB database */
      var tableName = 'VoteApp';
      dynamodb.updateItem({
        'TableName': tableName,
        'Key': { 'VotedFor' : { 'S': votedForHash }},
        'UpdateExpression': 'add #vote :x',
        'ExpressionAttributeNames': {'#vote' : 'Votes'},
        'ExpressionAttributeValues': { ':x' : { "N" : "1" } }
      }, function(err, data) {
        if (err) {
          console.log(err);
          context.fail(JSON.stringify({
            statusCode: 500,
            body: JSON.stringify({ message: "Error updating database", error: err.message })
          }));
        } else {
          console.log("Vote received for %s", votedFor);
          context.succeed({
            statusCode: 200,
            body: JSON.stringify({ message: "Thank you for casting a vote for " + votedFor })
          });
        }
      });
    } else {
      console.log("Invalid vote received (%s)", votedFor);
      context.fail(JSON.stringify({
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid vote received. Vote must be RED, GREEN, or BLUE."})
      }));
    }
  } catch (parseError) {
    console.log("Error parsing request body:", parseError);
    context.fail(JSON.stringify({
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid request body. Expecting JSON with 'voteto' field.", error: parseError.message })
    }));
  }
}
