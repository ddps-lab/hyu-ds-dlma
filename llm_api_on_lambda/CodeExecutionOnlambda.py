from google import genai
from google.genai import types
import json

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
        config=types.GenerateContentConfig(
            tools=[types.Tool(code_execution=types.ToolCodeExecution)]
        )
    )

    generated_text = ""

    for part in api_response.candidates[0].content.parts:
        if part.text is not None:
            generated_text += part.text
            generated_text += "\n"
        if part.executable_code is not None:
            generated_text += part.executable_code.code
            generated_text += "\n"
        if part.code_execution_result is not None:
            generated_text += part.code_execution_result.output
            generated_text += "\n"

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "text/plain; charset=utf-8"},
        "body": generated_text
    }