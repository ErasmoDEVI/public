# SaaS Barbearia — Express + MongoDB (ready for Render)

## Overview
This project serves a frontend (in /public) and an API using Express + MongoDB (Mongoose).
Default admin credentials are provided via environment variables.

## Quick local setup
1. Install Node.js (LTS).
2. Copy `.env.example` to `.env` and fill `MONGODB_URI` and `JWT_SECRET`.
3. Install deps:
```bash
npm install
```
4. Seed initial data (creates barber and services):
```bash
npm run seed
```
5. Run:
```bash
npm run dev
# or
npm start
```
6. Open `http://localhost:3000`

## Deploy to Render
1. Create a new Web Service on Render and connect your GitHub repo.
2. Set environment variables on Render: `MONGODB_URI`, `JWT_SECRET`, `ADMIN_USER`, `ADMIN_PASS`.
3. Build & start command: `npm install && npm start`

## Notes
- This is a starter implementation. For production consider:
  - HTTPS, CORS tightening
  - Proper admin user storage and password hashing
  - Rate limiting and validations
