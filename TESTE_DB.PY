from sqlalchemy import create_engine

DATABASE_URL = "postgresql+psycopg://postgres%2Eghiyotjbqdiomlaixkvo:6Dh1mIv6lo4dnfmF@aws-1-us-east-1.pooler.supabase.com:6543/postgres"

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

with engine.connect():
    print("🔥 CONECTOU COM SUCESSO")
