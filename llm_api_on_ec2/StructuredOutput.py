from google import genai
from pydantic import BaseModel

# Define a Pydantic model for a Recipe.
class Recipe(BaseModel):
    recipe_name: str
    ingredients: list[str]

# Initialize the generative AI client with the API key.
client = genai.Client(api_key="GOOGLE_API_KEY")

# Generate content with a specified JSON schema for the response.
response = client.models.generate_content(
    model="gemini-2.0-flash", # Specify the model to use.
    contents="List a few popular recipes, and include the amounts of ingredients.", # The prompt for the model.
    config={ # Configuration for the generation request.
        "response_mime_type": "application/json", # Specify the desired response format.
        "response_schema": list[Recipe] # Specify the Pydantic model for the response schema.
    }
)

# Print the response text, which should be a JSON string conforming to the Recipe schema.
print(response.text)
