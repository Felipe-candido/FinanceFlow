from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
import os
import requests

security = HTTPBearer(auto_error=False)
SUPABASE_PROJECT_URL = "https://ghiyotjbqdiomlaixkvo.supabase.co"
JWKS_URL = f"{SUPABASE_PROJECT_URL}/auth/v1/.well-known/jwks.json"

jwks = requests.get(JWKS_URL).json()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
      token = credentials.credentials


      try:
            payload = jwt.decode(
                  token,
                  jwks,
                  algorithms=["ES256"],
                  audience="authenticated",
            )
            return payload
      
      except JWTError:
            raise HTTPException(
                  status_code = status.HTTP_401_UNAUTHORIZED,
                  detail = "Invalid or expired token"
            )
