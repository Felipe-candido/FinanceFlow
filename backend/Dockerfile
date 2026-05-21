FROM python:3.11-slim
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Dependências do sistema para o psycopg e compilação de pacotes
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Instalação das dependências do Python
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copia a aplicação
COPY . /app

EXPOSE 8000
# O Render injeta a variável $PORT. 
# O uso do ${PORT:-8000} faz com que rode na 8000 localmente, mas no Render use a porta certa.
CMD alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers