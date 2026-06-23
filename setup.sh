#!/bin/bash
# ═══════════════════════════════════════════════
#  FinanceOS - Quick Setup Script
# ═══════════════════════════════════════════════

echo "🚀 FinanceOS - Enterprise ERP Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v docker >/dev/null 2>&1 || echo "⚠️  Docker not found. Docker deployment will not be available."

echo "✅ Prerequisites check passed"
echo ""

# Setup backend
echo "📦 Setting up backend..."
cd backend

if [ ! -f ".env" ]; then
  echo "DATABASE_URL=\"postgresql://postgres:postgres@localhost:5432/financeos?schema=public\"
JWT_SECRET=financeos-secret-key-change-in-production-2024
JWT_REFRESH_SECRET=financeos-refresh-secret-key-change-in-production-2024
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000" > .env
  echo "✅ Created backend .env file"
fi

npm install
echo "✅ Backend dependencies installed"

npx prisma generate
echo "✅ Prisma client generated"

echo ""
echo "🗄️  Database setup..."
read -p "Do you want to setup the database now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  npx prisma migrate dev --name init
  npm run prisma:seed
  echo "✅ Database setup complete with demo data"
fi

cd ..

# Setup frontend
echo ""
echo "📦 Setting up frontend..."
cd frontend

if [ ! -f ".env.local" ]; then
  echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1" > .env.local
  echo "✅ Created frontend .env.local file"
fi

npm install
echo "✅ Frontend dependencies installed"

cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Setup complete!"
echo ""
echo "📝 Default credentials:"
echo "   Email: admin@financeos.io"
echo "   Password: Admin@123456"
echo ""
echo "🚀 To start development:"
echo "   Terminal 1: cd backend && npm run start:dev"
echo "   Terminal 2: cd frontend && npm run dev"
echo ""
echo "🐳 Or use Docker:"
echo "   docker-compose up -d"
echo ""
echo "📚 Access:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:4000/api/v1"
echo "   API Docs: http://localhost:4000/api/docs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ─── package.json (root) ──────────────────────
{
  "name": "financeos-monorepo",
  "version": "1.0.0",
  "description": "Enterprise Accounting & Financial Management System",
  "private": true,
  "workspaces": [
    "backend",
    "frontend"
  ],
  "scripts": {
    "setup": "chmod +x setup.sh && ./setup.sh",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run start:dev",
    "dev:frontend": "cd frontend && npm run dev",
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "cd backend && npm run build",
    "build:frontend": "cd frontend && npm run build",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    "prisma:studio": "cd backend && npx prisma studio",
    "prisma:migrate": "cd backend && npx prisma migrate dev",
    "prisma:seed": "cd backend && npm run prisma:seed"
  },
  "keywords": [
    "erp",
    "accounting",
    "finance",
    "inventory",
    "payroll",
    "nextjs",
    "nestjs"
  ],
  "author": "FinanceOS Team",
  "license": "MIT",
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}

# ─── .gitignore (root) ────────────────────────
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
*.log

# Production
dist/
build/
.next/
out/

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env*.local
.env.production

# Vercel
.vercel

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~

# Database
*.db
*.db-journal

# Prisma
prisma/migrations/
!prisma/migrations/.gitkeep

# ─── .env.example (backend) ───────────────────
NODE_ENV=development
PORT=4000

# Database - Update with your credentials
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/financeos?schema=public"

# JWT Secrets - CHANGE THESE IN PRODUCTION
JWT_SECRET=financeos-secret-key-change-in-production-2024
JWT_REFRESH_SECRET=financeos-refresh-secret-key-change-in-production-2024

# Frontend URL
FRONTEND_URL=http://localhost:3000

# ─── .env.example (frontend) ──────────────────
# API URL
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# ─── .dockerignore (backend) ──────────────────
node_modules
npm-debug.log
dist
.env
.env.local
.git
.gitignore
README.md
.vscode

# ─── .dockerignore (frontend) ─────────────────
node_modules
npm-debug.log
.next
out
.env*.local
.git
.gitignore
README.md
.vscode

# ─── tsconfig.build.json (backend) ────────────
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}

# ─── .eslintrc.js (backend) ───────────────────
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};

# ─── .prettierrc (backend) ────────────────────
{
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 120,
  "tabWidth": 2,
  "semi": true
}

# ─── .eslintrc.json (frontend) ────────────────
{
  "extends": "next/core-web-vitals"
}

# ─── .prettierrc (frontend) ───────────────────
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 120,
  "tabWidth": 2
}

# ─── LICENSE ──────────────────────────────────
MIT License

Copyright (c) 2024 FinanceOS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

# ─── CONTRIBUTING.md ──────────────────────────
# Contributing to FinanceOS

We love your input! We want to make contributing to FinanceOS as easy and transparent as possible.

## Development Process

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Run `npm run lint` before committing
- Write meaningful commit messages

## Reporting Bugs

Report bugs using GitHub issues. Include:
- Quick summary
- Steps to reproduce
- Expected vs actual behavior
- Environment details

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
