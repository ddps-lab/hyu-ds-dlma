from google import genai

client = genai.Client(api_key="GOOGLE_API_KEY")
chat = client.chats.create(model="gemini-2.0-flash")

print("Chatting Started... (type 'exit' to quit)")

while True:
    user_input = input("You: ")
    if user_input.lower() == "exit":
        print("Chat Ended...")
        break
    
    response = chat.send_message(user_input)
    print(f"AI: {response.text}")

