import uvicorn
from fastapi import FastAPI
import requests

# change this to the address of the api server
API_SERVER_ADDRESS = "1.1.1.1"

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/api")
def read_api(data: str | None = None):
    response = requests.get(f"http://{API_SERVER_ADDRESS}:8080/", params={"data": data})
    return f"You entered: {response.json()['data']}"

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)