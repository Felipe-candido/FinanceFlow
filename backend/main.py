from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.users.auth.auth_routes import auth_router
from app.transactions.routes import transactions_router
from app.dashboard.routers import dashboard_router
from app.categories.routes import category_router
from app.budgets.routes import budgets_router
from app.settings.routes import settings_router

app = FastAPI()
settings = get_settings()


# --------------------
# CORS CONFIGURATION
# --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
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
