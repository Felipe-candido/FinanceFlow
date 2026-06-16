from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.users.auth.auth_routes import auth_router
from app.transactions.routes import transactions_router
from app.dashboard.routers import dashboard_router
from app.categories.routes import category_router
from app.budgets.routes import budgets_router
from app.settings.routes import settings_router
from app.agente_ia.router import router as ai_router
from app.payments.routes import payments_router, stripe_webhooks_router

app = FastAPI()
settings = get_settings()

# --------------------
# HEALTH CHECK
# --------------------
@app.get("/healthz")
def health():
    return {"status": "ok"}


# --------------------
# CORS CONFIGURATION
# --------------------

if isinstance(settings.cors_origins, list):
    allowed_origins = settings.cors_origins
elif isinstance(settings.cors_origins, str):
    allowed_origins = [
        origin.strip() 
        for origin in settings.cors_origins.split(",") 
        if origin.strip()
    ]
else:
    allowed_origins = []

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --------------------
# ROUTERS
# --------------------
app.include_router(auth_router)
app.include_router(transactions_router)
app.include_router(dashboard_router)
app.include_router(category_router)
app.include_router(budgets_router)
app.include_router(settings_router)
app.include_router(ai_router)
app.include_router(payments_router)
app.include_router(stripe_webhooks_router)
