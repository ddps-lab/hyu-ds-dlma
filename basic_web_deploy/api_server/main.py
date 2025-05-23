import uvicorn
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_data(data: str | None = None):
    return {"data": data}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)