from google.genai import types
from google import genai

# Initialize the generative AI client with the API key.
client = genai.Client(api_key="GOOGLE_API_KEY")

# Open the image file in binary read mode and read its content.
with open('./data/timetable.png', 'rb') as f:
    image_bytes = f.read()

# Generate content based on the image and a text prompt.
response = client.models.generate_content(
    model='gemini-2.0-flash', # Specify the model to use.
    contents=[
        # Create a Part object from the image bytes.
        types.Part.from_bytes(
            data=image_bytes, # The image data.
            mime_type='image/png', # The MIME type of the image.
        ),
        # The text prompt for the model.
        'Parse the time and city from the airport board shown in this image into a list.'
    ]
)

# Print the response text from the model.
print(response.text)