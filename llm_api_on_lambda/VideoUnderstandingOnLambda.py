from google.genai import types
from google import genai
import json
import base64
import cgi
import io

# You have to set the environment variable GOOGLE_API_KEY
client = genai.Client()

def lambda_handler(event, context):
    headers = event.get("headers", {})
    content_type_header = headers.get("Content-Type") or headers.get("content-type")
    if not content_type_header or not content_type_header.startswith("multipart/form-data"):
        return {
            "statusCode": 400,
            "body": json.dumps("Content-Type must be multipart/form-data")
        }
    
    try:
        body = event['body']

        if event.get('isBase64Encoded', False) == False:
            return {
                "statusCode": 400,
                "body": "body must be encoded in Base64"
            }
        body_data = base64.b64decode(body)
        
        form = cgi.FieldStorage(
            fp=io.BytesIO(body_data),
            headers={'content-type': content_type_header},
            environ={'REQUEST_METHOD': 'POST'},
            keep_blank_values=True,
        )

        if 'video_url' not in form:
            return {
                "statusCode": 400,
                "body": json.dumps("video_url is required")
            }
        video_url = form['video_url'].value

        prompt = "Please summarize the video in 3 sentences."

        if 'prompt' in form:
            prompt = form['prompt'].value

        api_response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=[
                types.Part(
                    file_data=types.FileData(file_uri=video_url)
                ),
                types.Part(text=prompt) 
            ]
        )

        generated_text = api_response.text

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "text/plain; charset=utf-8"},
            "body": generated_text
        }            

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps(str(e))
        }