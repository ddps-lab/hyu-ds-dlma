from google import genai
from google.genai import types
import httpx

# Initialize the generative AI client with the API key.
client = genai.Client(api_key="GOOGLE_API_KEY")

# URL of the PDF document to be summarized.
doc_url = "https://leeky.me/publications/spot-interrupt-visible.pdf"

# Retrieve the PDF content from the URL.
# httpx.get fetches the document, and .content gets the raw bytes.
doc_data = httpx.get(doc_url).content

# Define the prompt for summarization.
prompt = "Summarize this document"

# Generate content (summary) from the PDF document.
response = client.models.generate_content(
  model="gemini-2.0-flash", # Specify the model to use.
  contents=[
      # Create a Part object from the PDF data.
      types.Part.from_bytes(
        data=doc_data, # The PDF data in bytes.
        mime_type='application/pdf', # The MIME type of the document.
      ),
      prompt # The text prompt for summarization.
  ]
)

# Print the summarized text.
print(response.text)