# Documentação Completa do Projeto FinanceFlow

## 1. Visão geral

FinanceFlow é um sistema de controle financeiro pessoal com frontend em Next.js e backend em FastAPI/Python. Ele integra autenticação e gerenciamento de dados com Supabase, armazenando transações, categorias, orçamentos e preferências de usuário em um banco de dados PostgreSQL.

O projeto está dividido em dois núcleos:
- `backend/`: API REST em FastAPI, com ORM SQLAlchemy e suporte a autenticação JWT via Supabase.
- `financial-app-frontend/`: aplicação Next.js com interface cliente, consumo da API backend e autenticação via Supabase.

## 2. Estrutura do repositório

Raiz:
- `.env.backend`, `.env.backend.example`: variáveis de ambiente do backend.
- `.env.frontend`, `.env.frontend.example`: variáveis de ambiente do frontend.
- `docker-compose.yml`: orquestra containers para backend e frontend.
- `backend/`: código do servidor Python.
- `financial-app-frontend/`: código do app React/Next.

### Backend

`backend/` contém:
- `main.py`: entrada da aplicação FastAPI.
- `alembic/`: migrações do banco de dados.
- `app/core/`: configuração, banco e autenticação.
- `app/users/`, `app/transactions/`, `app/categories/`, `app/budgets/`, `app/dashboard/`, `app/settings/`: módulos de domínio.

### Frontend

`financial-app-frontend/` contém:
- `app/`: páginas e rotas do Next.js.
- `components/`: componentes UI reutilizáveis.
- `contexts/`: provedor de autenticação.
- `lib/`: integração com Supabase e wrappers de API.
- `public/`: ativos estáticos.
- `styles/`: CSS global.

## 3. Backend: arquitetura e funcionamento

### 3.1 Tecnologias usadas

- Python 3.x
- FastAPI
- SQLAlchemy
- Pydantic
- Alembic
- psycopg2 / PostgreSQL
- Supabase para autenticação JWT

### 3.2 Arquitetura do backend

O backend segue um padrão organizado em camadas:
- `routes.py` / `routers.py`: definem endpoints HTTP.
- `schemas.py`: definem modelos Pydantic para validação de entrada e serialização de saída.
- `models.py`: definem entidades do banco via SQLAlchemy.
- `services.py`: contêm regras de negócio e acesso ao banco.

A aplicação é inicializada em `backend/main.py`, que registra os roteadores e o middleware CORS.

### 3.3 Configuração global

`backend/app/core/config.py` carrega variáveis de ambiente:
- `DATABASE_URL`: string de conexão com PostgreSQL.
- `SUPABASE_PROJECT_URL` ou `SUPABASE_PROJECT_REF`: URL pública do projeto Supabase.
- `CORS_ORIGINS`: origens permitidas para requisições.
- `SQL_ECHO`: habilita logging SQL.

### 3.4 Banco de dados

`backend/app/core/database.py` cria:
- `database`: engine SQLAlchemy.
- `SessionLocal`: fábrica de sessões.
- `Base`: classe base declarativa.

`backend/app/core/dependecies.py` expõe `get_db()` para injetar sessão por requisição.

### 3.5 Autenticação

`backend/app/core/security.py` faz autenticação JWT:
- Usa `HTTPBearer` para extrair `Authorization: Bearer <token>`.
- Busca chaves públicas no JWKS do Supabase em `/auth/v1/.well-known/jwks.json`.
- Valida token JWT com algoritmo `ES256` e audiência `authenticated`.
- Retorna payload do token para usar em endpoints.

### 3.6 Endpoints de saúde e CORS

`backend/main.py` define:
- `GET /healthz`: health check básico.
- Middleware CORS para: `http://localhost:3000` e `https://finance-flow-mu-sooty.vercel.app`.

### 3.7 Roteadores principais

Os roteadores registrados são:
- `/auth`: sincronização e leitura de usuário.
- `/transactions`: CRUD de transações.
- `/dashboard`: resumo financeiro.
- `/categories`: CRUD de categorias.
- `/budgets`: CRUD de orçamentos.
- `/settings`: configurações do usuário.

## 4. Banco de dados e modelos

### 4.1 Modelo `User`

`backend/app/users/models.py`:
- `id`: UUID.
- `email`, `name`, `last_name`.
- relacionamento com transações.

### 4.2 Modelo `Category`

`backend/app/categories/models.py`:
- `id`: UUID.
- `name`, `color`, `type` (`income` ou `expense`).
- `is_default`: marca categorias padrão.
- `user_id`: FK para `users.id`.
- relacionamento com transações.

### 4.3 Modelo `Transaction`

`backend/app/transactions/models.py`:
- `id`: UUID.
- `user_id`: FK para `users.id`.
- `category_id`: FK para `categories.id`.
- `description`, `amount`, `type` (`income`/`expense`), `date`, `created_at`.

### 4.4 Modelo `Budget`

`backend/app/budgets/models.py`:
- `id`: UUID.
- `user_id`, `category_id`.
- `limit`: valor do orçamento.
- `created_at`, `updated_at`.
- constraint única por usuário e categoria.

### 4.5 Modelo `UserSettings`

`backend/app/settings/models.py`:
- `user_id`: UUID PK.
- `data`: JSONB genérico para preferências.
- `updated_at`.

## 5. API do backend

### 5.1 Autenticação e sincronização

#### `POST /auth/sync`

- Valida token Supabase.
- Sincroniza usuário no banco local.
- Cria usuário se não existir.
- Garante categorias padrão com `ensure_default_categories()`.
- Retorna dados do usuário.

#### `GET /auth/me`

- Retorna usuário atual a partir do token.
- Cria registro no banco se necessário.

### 5.2 Transações

#### `POST /transactions/add`
- Cria nova transação.
- Requer `description`, `type`, `date`, `category_id`, `amount`.
- Valida existência da categoria do usuário.

#### `GET /transactions/list`
- Lista transações do usuário.
- Filtros opcionais: `start_date`, `end_date`.

#### `PUT /transactions/update/{transaction_id}`
- Atualiza transação existente.
- Pode alterar `type`, `category_id`, `description`, `date`, `amount`.

#### `DELETE /transactions/{transaction_id}`
- Exclui transação por UUID.

### 5.3 Categorias

#### `GET /categories/list`
- Retorna todas as categorias do usuário.

#### `POST /categories`
- Cria nova categoria.
- Requer `name`, `type`, `color`.

#### `PUT /categories/{category_id}`
- Atualiza nome, tipo e cor.

#### `DELETE /categories/{category_id}`
- Remove categoria se não tiver transações associadas.

### 5.4 Orçamentos

#### `GET /budgets`
- Lista budgets do usuário.

#### `POST /budgets`
- Cria orçamento para categoria de despesa.
- Requer `category_id`, `limit`.

#### `PUT /budgets/{budget_id}`
- Atualiza categoria ou limite.

#### `DELETE /budgets/{budget_id}`
- Remove orçamento.

### 5.5 Dashboard

#### `GET /dashboard/summary`
- Retorna resumo financeiro do período.
- Parâmetros opcionais: `month`, `year`, `start_date`, `end_date`, `category`.
- Calcula:
  - `total_income`
  - `total_expense`
  - `balance`
  - `expenses_by_category`
  - `income_by_category`
  - `last_transactions`

### 5.6 Configurações do usuário

#### `GET /settings`
- Retorna objeto de configuração do usuário.
- Cria preferências vazias se não existir.

#### `PUT /settings`
- Atualiza `data` JSON das configurações.

## 6. Lógica de negócio importante

### 6.1 Categorias padrão

O serviço `ensure_default_categories()` insere categorias iniciais para cada usuário, evitando criação duplicada. As categorias padrão incluem:
- `Moradia`, `Alimentacao`, `Transporte`, `Saude`, `Lazer`, `Outros` (despesa)
- `Salario`, `Freelance`, `Investimentos`, `Outros` (receita)

### 6.2 Validações

O backend valida:
- `type` de transação/categoria é `income` ou `expense`.
- `category_id` existe e pertence ao usuário.
- orçamentos não duplicados por usuário/categoria.
- não deletar categoria com transações vinculadas.

## 7. Frontend: arquitetura e funcionamento

### 7.1 Tecnologias usadas

- Next.js 16
- React 19
- TypeScript
- Supabase JS
- Tailwind CSS
- Radix UI
- React Hook Form
- Recharts

### 7.2 Estrutura do frontend

- `app/`: rotas do Next.js com páginas agrupadas em `(auth)` e `(dashboard)`.
- `components/`: componentes de UI como modal de transação, sidebar, header.
- `contexts/authProvider.tsx`: controle de sessão e token.
- `lib/supabase/client.ts`: cliente Supabase.
- `lib/api/*.ts`: wrappers para chamadas à API backend.
- `lib/auth.ts`: fluxo de autenticação e sincronização backend.

### 7.3 Autenticação e sessão

A autenticação é feita diretamente com Supabase no frontend:
- `supabase.auth.signUp()` para registro.
- `supabase.auth.signInWithPassword()` para login.
- `supabase.auth.signOut()` para logout.
- `supabase.auth.resetPasswordForEmail()` para reset de senha.

O `AuthProvider` monitora o estado de autenticação com `supabase.auth.onAuthStateChange()`.
Quando há sessão válida, o token é extraído e usado para chamar o backend.

### 7.4 Sincronização de usuário com backend

Após login ou registro, o frontend chama:
- `POST /auth/sync` com `Authorization: Bearer <access_token>`.

Isso garante que o usuário exista no banco local do backend e tenha categorias padrão.

### 7.5 Consumo da API backend

O frontend usa `API_URL` configurado em `NEXT_PUBLIC_API_URL`.
A função `getApiUrl(path)` constrói a URL completa.

O wrapper `apiFetch()` adiciona automaticamente o cabeçalho:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

### 7.6 Módulos de API do frontend

- `lib/api/transactions.tsx`: transações e categorias.
- `lib/api/dashboard.tsx`: resumo financeiro.
- `lib/api/budgets.ts`: orçamentos.
- `lib/api/settings.ts`: preferências.

Esses módulos fazem fetch para os endpoints correspondentes do backend.

### 7.7 Fluxo de página

- `app/page.tsx`: redireciona para `/login`.
- `app/(auth)/callback/page.tsx`: trata callback de login e sincroniza usuário.
- Rotas do dashboard: `/dashboard`, `/transactions`, `/budgets`, `/reports`, `/settings`.

### 7.8 Provedor de autenticação no layout

`app/layout.tsx` envolve toda a aplicação com `AuthProvider`, permitindo acesso global a `user`, `token` e `loading`.

## 8. Integração Python + Next.js

### 8.1 Fluxo de autenticação

1. Usuário se registra ou faz login no frontend via Supabase.
2. Supabase retorna um `access_token` JWT.
3. O frontend envia esse token ao backend nas chamadas à API.
4. O backend valida o JWT usando o JWKS do Supabase.
5. Se válido, o backend usa `payload["sub"]` como `user_id` e processa as requisições.

### 8.2 Chamadas backend protegidas

Todos os endpoints sensíveis dependem de `get_current_user()` em `app/core/security.py`.
Isso garante que apenas requisições com Bearer token válido acessem os recursos.

### 8.3 Sincronização / criação de usuário

A primeira vez que o usuário acessa o backend, `POST /auth/sync` e `GET /auth/me` criam ou atualizam o registro local do usuário. Esse fluxo é necessário porque a autenticação reside em Supabase, mas os dados do domínio são gerenciados pelo backend Python.

### 8.4 Uso do Supabase como backend de identidade

Supabase é usado apenas para autenticação e também para armazenar a identidade do usuário.
O backend Python não faz login direto: ele confia no token emitido pelo Supabase e mantém uma representação local dos dados.

## 9. Configuração e execução

### 9.1 Variáveis de ambiente

Frontend (`.env.frontend`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL`

Backend (`.env.backend`):
- `DATABASE_URL`
- `SUPABASE_PROJECT_URL` ou `SUPABASE_PROJECT_REF`
- `CORS_ORIGINS` (opcional)
- `SQL_ECHO` (opcional)

### 9.2 Comandos comuns

No frontend:
```bash
cd financial-app-frontend
pnpm install
pnpm dev
```

No backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 9.3 Docker

O projeto inclui `docker-compose.yml` para orquestrar os serviços, permitindo executar backend e frontend em containers.

## 10. Observações de arquitetura

- O backend trata regras de negócio e persistência.
- O frontend trata UI, navegação e comunicação com o backend.
- Supabase é a camada de autenticação e identidade.
- O backend usa JWT do Supabase em vez de gerenciar senhas localmente.
- `apiFetch` centraliza chamadas REST e adiciona o token automaticamente.

## 11. Pontos de atenção

- O arquivo `backend/teste.py` parece conter um exemplo de conexão com Supabase/PostgreSQL e não deve ser usado em produção com credenciais sensíveis.
- O CORS está autorizado para `localhost:3000` e para `finance-flow-mu-sooty.vercel.app`, então ajustes de ambiente podem ser necessários para outras origens.
- O backend valida categorias e transações por `user_id` para manter isolamento entre usuários.

## 12. Resumo de endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/healthz` | Health check |
| POST | `/auth/sync` | Sincroniza usuário Supabase com backend |
| GET | `/auth/me` | Retorna dados do usuário autenticado |
| GET | `/categories/list` | Lista categorias do usuário |
| POST | `/categories` | Cria categoria |
| PUT | `/categories/{id}` | Atualiza categoria |
| DELETE | `/categories/{id}` | Remove categoria |
| POST | `/transactions/add` | Cria transação |
| GET | `/transactions/list` | Lista transações |
| PUT | `/transactions/update/{id}` | Atualiza transação |
| DELETE | `/transactions/{id}` | Exclui transação |
| GET | `/dashboard/summary` | Resumo financeiro |
| GET | `/budgets` | Lista orçamentos |
| POST | `/budgets` | Cria orçamento |
| PUT | `/budgets/{id}` | Atualiza orçamento |
| DELETE | `/budgets/{id}` | Exclui orçamento |
| GET | `/settings` | Busca configurações do usuário |
| PUT | `/settings` | Atualiza configurações |

## 13. Conclusão

Este projeto combina a experiência de frontend moderna do Next.js com a robustez de uma API Python em FastAPI. O backend cuida de validação, persistência e regras de negócio, enquanto o frontend usa Supabase para autenticação e consome a API protegida por JWT.

A documentação acima cobre a arquitetura, a estrutura de pastas, os principais fluxos de integração e a forma como os dados são modelados. Se desejar, posso também gerar um `README.md` mais enxuto voltado para instalação e uso rápido.