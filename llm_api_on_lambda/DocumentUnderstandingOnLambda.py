from google import genai
from google.genai import types
import json
import boto3

# You have to set the environment variable GOOGLE_API_KEY
client = genai.Client()

s3 = boto3.client('s3')

bucket_name = "YOUR_BUCKET_NAME"
object_key = "YOUR_OBJECT_KEY (e.g., spot-interrupt-visible.pdf)"

def lambda_handler(event, context):
    body = json.loads(event['body'])
    prompt = body.get("prompt", None)

    # If prompt is not provided, use the default prompt
    if prompt is None:
        prompt = "Summarize this document"

    s3_response = s3.get_object(Bucket=bucket_name, Key=object_key)
    doc_data = s3_response['Body'].read()

    api_response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            types.Part.from_bytes(
                data=doc_data,
                mime_type='application/pdf',
            ),
            prompt
        ]
    )

    generated_text = api_response.text

    return {
        "statusCode": 200,
        "body": json.dumps(generated_text)
    }