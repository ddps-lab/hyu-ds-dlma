from google import genai
from google.genai import types

# Initialize the generative AI client with the API key.
client = genai.Client(api_key="GOOGLE_API_KEY")

# Prompt the user to enter a YouTube video URL.
video_url = input("Enter the video URL: ")

# Generate a summary of the YouTube video.
response = client.models.generate_content(
    model='models/gemini-2.0-flash', # Specify the model to use.
    contents=types.Content(
        parts=[
            # Part containing the video file data (referenced by URI).
            types.Part(
                file_data=types.FileData(file_uri=video_url)
            ),
            # Part containing the text prompt for summarization.
            types.Part(text='Please summarize the video in 3 sentences.')
        ]
    )
)

# Print the summarized text.
print(response.text)