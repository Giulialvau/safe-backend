# Backend Safe (NestJS)

Production-ready NestJS backend starter with:
- JWT access/refresh authentication
- Role-based access control
- Users CRUD with Prisma + PostgreSQL
- Global validation, exception filter, and response interceptor
- Request logging middleware
- Swagger docs at `/docs`
- Dockerized local setup

## 1) Setup

```bash
npm install
cp .env.example .env
```

## 2) Database

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

## 3) Run

```bash
npm run start:dev
```

API base: `http://localhost:3000`  
Swagger: `http://localhost:3000/docs`  
Health: `http://localhost:3000/health`

## Docker

```bash
cp .env.example .env
docker compose up --build
```

## Auth Flow

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh` (use refresh token in `Authorization: Bearer ...`)
- `POST /auth/logout`

## Users Endpoints

All `/users/*` endpoints require admin role and access token.
