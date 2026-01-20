from fastapi import FastAPI

app = FastAPI()

from app.users.auth.auth_routes import auth_router

app.include_router(auth_router)

# para rodar o servidor, executar no terminal: uvicorn main:app --reload