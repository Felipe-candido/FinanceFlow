import uuid
from sqlalchemy.orm import Session
from app.users.models import User
from app.users.schemas import UserSchema

def sync_user(
            payload: dict,
            db: Session
            ):
      
      user_id = uuid.UUID(payload['sub'])
      email = payload["email"]
      
      #CHECK IF USER ALREDY EXISTS
      user = db.get(User, user_id)
      if user:
            return {"message": "User already exists"}
      
      # CREATE NEW USER INSTANCE
      new_user = User(
            id= user_id,
            email = email,
            name= payload["name"],
            last_name = payload["last_name"] if "last_name" in payload else None
      )
      
      #SAVE USER IN DATABASE
      db.add(new_user)
      db.commit()
      
      return {"message": "User created successfully", "user": UserSchema.from_orm(new_user)}