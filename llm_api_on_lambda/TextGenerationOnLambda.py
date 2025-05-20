import json
from google import genai

# You have to set the environment variable GOOGLE_API_KEY
client = genai.Client()

def lambda_handler(event, context):
    body = json.loads(event['body'])
    prompt = body.get("prompt", None)

    if prompt is None:
        return {
            "statusCode": 400,
            "body": json.dumps("prompt is required in request body")
        }
    
    api_response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[prompt]
    )
    generated_text = api_response.text

    return {
        "statusCode": 200,
        "body": json.dumps(generated_text)
    }