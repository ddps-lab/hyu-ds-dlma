from google import genai
from pydantic import BaseModel
import json

# Define a Pydantic model for a Recipe.
class Recipe(BaseModel):
    recipe_name: str
    ingredients: list[str]

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
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": list[Recipe]
        }
    )

    generated_text = api_response.text

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "text/plain; charset=utf-8"},
        "body": generated_text
    }