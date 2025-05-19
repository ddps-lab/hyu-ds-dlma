from google import genai

# Initialize the generative AI client with the API key.
client = genai.Client(api_key="GOOGLE_API_KEY")

# Upload the audio file to the server.
myfile = client.files.upload(file="./data/sample-0.wav")

# Generate content describing the audio clip.
response = client.models.generate_content(
    model="gemini-2.0-flash", # Specify the model to use.
    contents=["Describe this audio clip", myfile] # Provide the prompt and the uploaded file.
)

print("Describe this audio clip:\n")

# Print the description of the audio clip.
print(response.text)

# Re-upload the audio file (or use the existing 'myfile' object if appropriate for the API).
# For this example, we are explicitly re-uploading as per the original code.
myfile = client.files.upload(file='sample-0.wav')

# Define the prompt for generating a transcript.
prompt = 'Generate a transcript of the speech.'

# Generate content to get a transcript of the speech.
response = client.models.generate_content(
  model='gemini-2.0-flash', # Specify the model to use.
  contents=[prompt, myfile] # Provide the prompt and the uploaded file.
)

print("Transcript of the speech:\n")

# Print the transcript of the speech.
print(response.text)