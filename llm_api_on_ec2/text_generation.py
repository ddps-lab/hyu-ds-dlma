from google import genai

# Please enter your API key here.
# For security, it is recommended to manage it as an environment variable.
client = genai.Client(api_key="GOOGLE_API_KEY")

# Define the prompt (text) to send to the model.
prompt = input("Enter a prompt: ") # Example prompt

# Request text generation and receive the response.
response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents=[prompt]
)

# Print the response text.
print(response.text)