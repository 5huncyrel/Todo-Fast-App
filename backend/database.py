from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "postgresql://todolist_django_db_user:ZaJ7Qc4jnasQMt5iIeWTgxyBqZcGQi5A@dpg-cvlvboripnbc73bfg5cg-a.oregon-postgres.render.com/todolist_django_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()
