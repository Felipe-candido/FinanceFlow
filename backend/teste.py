from sqlalchemy import create_engine

# Sua string exata do SQLAlchemy
DATABASE_URL = "postgresql+psycopg://postgres.jdjbohlfydldkoijzzvi:T2i9vbs6df.@aws-1-us-east-1.pooler.supabase.com:6543/postgres"

try:
    engine = create_engine(DATABASE_URL)
    connection = engine.connect()
    print("✅ Conexão com o Supabase funcionou perfeitamente!")
    connection.close()
except Exception as e:
    print(f"❌ Erro ao conectar: {e}")