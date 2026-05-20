import json
from functools import lru_cache
from urllib.error import URLError
from urllib.request import urlopen

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from app.core.config import get_settings

security = HTTPBearer(auto_error=False)


@lru_cache(maxsize=1)
def get_jwks():
    settings = get_settings()
    jwks_url = f"{settings.supabase_project_url}/auth/v1/.well-known/jwks.json"

    try:
        with urlopen(jwks_url, timeout=5) as response:
            return json.loads(response.read().decode("utf-8"))
    except (OSError, URLError, json.JSONDecodeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable",
        ) from exc


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
        )

    try:
        return jwt.decode(
            credentials.credentials,
            get_jwks(),
            algorithms=["ES256"],
            audience="authenticated",
        )
    except JWTError:
        get_jwks.cache_clear()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
