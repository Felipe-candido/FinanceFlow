from pydantic import BaseModel


class CheckoutSessionResponse(BaseModel):
    url: str
    
    
class PortalSessionResponse(BaseModel):
    url: str
