from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.users.auth.auth_routes import auth_router
from app.transactions.routes import transactions_router

app = FastAPI()


# --------------------
# CORS CONFIGURATION
# --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],        # GET, POST, OPTIONS, etc
    allow_headers=["*"],        # Authorization, Content-Type, etc
)

# --------------------
# ROUTERS
# --------------------
app.include_router(auth_router)
app.include_router(transactions_router)

# para rodar o servidor, executar no terminal: uvicorn main:app --reload