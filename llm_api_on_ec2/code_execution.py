from google import genai
from google.genai import types

# Initialize the generative AI client with the API key.
client = genai.Client(api_key="GOOGLE_API_KEY")

# Generate content with code execution capabilities.
response = client.models.generate_content(
    model="gemini-2.0-flash", # Specify the model to use.
    contents="What is the sum of the first 50 prime numbers? "
    "Generate and run code for the calculation, and make sure you get all 50.", # The prompt for the model.
    config=types.GenerateContentConfig(
        tools=[types.Tool(code_execution=types.ToolCodeExecution)] # Enable code execution tool.
    ),
)

# Iterate through the parts of the response.
for part in response.candidates[0].content.parts:
    # Print the text part if it exists.
    if part.text is not None:
        print(part.text)
    # Print the executable code part if it exists.
    if part.executable_code is not None:
        print(part.executable_code.code)
    # Print the code execution result if it exists.
    if part.code_execution_result is not None:
        print(part.code_execution_result.output)