import json
from google import genai

# Please enter your API key here.
# For security, it is recommended to manage it as an environment variable.
client = genai.Client(api_key="GOOGLE_API_KEY")

def lambda_handler(event, context):
    body = json.loads(event['body'])
    prompt = body.get("prompt", None)

    if prompt is None:
        error_msg = "Bad Request: prompt is required"
        return {
            "statusCode": 400,
            "body": json.dumps(error_msg)
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