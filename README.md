# FinanceOS - Enterprise Accounting & Financial Management System

![FinanceOS](https://img.shields.io/badge/Status-Production%20Ready-green)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![NestJS](https://img.shields.io/badge/NestJS-10-red)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)

Modern, enterprise-grade ERP system for complete financial management, inventory control, HR & payroll automation.

## 🚀 Features

### Core Modules
- ✅ **Dashboard** - Real-time KPIs, revenue/expense charts, cash flow analytics
- ✅ **General Ledger** - Chart of accounts, journal entries, trial balance
- ✅ **Accounts Payable** - Supplier invoices, payment tracking, aging reports
- ✅ **Accounts Receivable** - Customer invoicing, collections, AR aging
- ✅ **Inventory Management** - Stock levels, warehouses, movements, valuation
- ✅ **Financial Reports** - P&L, balance sheet, cash flow, VAT reports
- ✅ **HR & Payroll** - Employee management, salary processing, attendance
- ✅ **Settings** - Company profile, user roles, permissions, billing

### Technical Features
- 🔐 **JWT Authentication** - Secure login with refresh tokens
- 👥 **Role-based Access Control** - 5 permission levels
- 🌍 **Multi-currency Support** - USD, EGP, EUR, GBP, SAR, AED
- 📊 **Interactive Charts** - Real-time data visualization with Recharts
- 🌓 **Dark/Light Mode** - System-wide theme switching
- 🌐 **RTL Support** - Arabic + English localization ready
- 📱 **Responsive Design** - Mobile, tablet, desktop optimized
- 📤 **Export Functions** - PDF & Excel export capabilities
- 🔍 **Advanced Search** - Full-text search across modules
- 📝 **Audit Logging** - Complete activity tracking

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.3
- **Styling:** Tailwind CSS + Shadcn UI
- **State:** Zustand + React Query
- **Charts:** Recharts
- **Animations:** Framer Motion

### Backend
- **Framework:** NestJS 10
- **ORM:** Prisma 5.8
- **Database:** PostgreSQL 16
- **Auth:** JWT + Passport
- **Validation:** Class Validator
- **API Docs:** Swagger/OpenAPI

### DevOps
- **Containerization:** Docker + Docker Compose
- **Deployment:** Vercel (Frontend), Railway/Render (Backend)
- **CI/CD:** GitHub Actions ready

## 📦 Installation

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- npm or yarn

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd financeos
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Setup environment variables**
```bash
# Backend (.env)
cd backend
cp .env.example .env
# Edit .env with your database credentials

# Frontend (.env.local)
cd ../frontend
cp .env.example .env.local
# Edit NEXT_PUBLIC_API_URL if needed
```

4. **Setup database**
```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database with demo data
npm run prisma:seed
```

5. **Start development servers**
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api/v1
- API Docs: http://localhost:4000/api/docs

## 🐳 Docker Deployment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

After containers start:
- Application: http://localhost:3000
- API: http://localhost:4000/api/v1
- Database: localhost:5432

## 🔑 Default Credentials

```
Email: admin@financeos.io
Password: Admin@123456
```

**Other demo accounts:**
- CFO: cfo@financeos.io / Admin@123456
- Accountant: accountant@financeos.io / Admin@123456

⚠️ **Change these in production!**

## 📁 Project Structure

```
financeos/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── seed.ts                # Demo data seeder
│   ├── src/
│   │   ├── auth/                  # Authentication module
│   │   ├── users/                 # User management
│   │   ├── dashboard/             # Dashboard APIs
│   │   ├── ledger/                # General ledger
│   │   ├── invoices/              # AP/AR invoices
│   │   ├── inventory/             # Inventory management
│   │   ├── payroll/               # HR & Payroll
│   │   ├── reports/               # Financial reports
│   │   ├── settings/              # System settings
│   │   ├── prisma/                # Prisma service
│   │   └── common/                # Shared modules
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/                   # Next.js pages
│   │   │   ├── auth/              # Login, register
│   │   │   ├── dashboard/         # Main dashboard
│   │   │   ├── ledger/            # Ledger pages
│   │   │   ├── payable/           # AP pages
│   │   │   ├── receivable/        # AR pages
│   │   │   ├── inventory/         # Inventory pages
│   │   │   ├── reports/           # Reports pages
│   │   │   ├── payroll/           # Payroll pages
│   │   │   └── settings/          # Settings pages
│   │   ├── components/
│   │   │   ├── ui/                # Shadcn components
│   │   │   ├── layout/            # Layout components
│   │   │   ├── charts/            # Chart components
│   │   │   └── tables/            # Table components
│   │   ├── lib/
│   │   │   ├── api/               # API client modules
│   │   │   ├── utils.ts           # Utility functions
│   │   │   └── api-client.ts      # Axios instance
│   │   └── store/                 # Zustand stores
│   ├── package.json
│   └── tailwind.config.ts
│
└── docker-compose.yml             # Docker orchestration
```

## 🔧 Available Scripts

### Backend
```bash
npm run start:dev      # Development server with hot reload
npm run build          # Build for production
npm run start:prod     # Start production server
npm run prisma:migrate # Run database migrations
npm run prisma:seed    # Seed demo data
npm run prisma:studio  # Open Prisma Studio
npm test               # Run tests
```

### Frontend
```bash
npm run dev            # Development server
npm run build          # Build for production
npm run start          # Start production server
npm run lint           # Lint code
npm run type-check     # TypeScript check
```

## 📊 Database Schema

The system includes 25+ tables covering:
- **Core:** Companies, Users, Audit Logs
- **Accounting:** Accounts, Journal Entries, Trial Balance
- **AP/AR:** Suppliers, Customers, Invoices, Payments
- **Inventory:** Products, Warehouses, Stock, Movements
- **HR:** Employees, Departments, Payroll, Advances
- **Config:** Taxes, Exchange Rates, Settings

## 🔐 Security

- JWT tokens with refresh mechanism
- Password hashing with bcrypt (12 rounds)
- Role-based access control (RBAC)
- SQL injection protection via Prisma
- XSS protection
- CORS configuration
- Rate limiting
- Helmet.js security headers

## 🌐 API Documentation

Interactive API documentation available at:
- Swagger UI: http://localhost:4000/api/docs
- OpenAPI JSON: http://localhost:4000/api/docs-json

### Sample API Endpoints

```
POST   /api/v1/auth/login           # User login
POST   /api/v1/auth/register        # User registration
GET    /api/v1/dashboard/kpis       # Dashboard KPIs
GET    /api/v1/ledger/accounts      # Chart of accounts
GET    /api/v1/ledger/journals      # Journal entries
GET    /api/v1/invoices/sales       # Sales invoices
GET    /api/v1/invoices/purchases   # Purchase invoices
GET    /api/v1/inventory/products   # Products list
GET    /api/v1/reports/income-statement  # P&L report
GET    /api/v1/payroll/employees    # Employee list
```

## 🚢 Deployment

### Vercel (Frontend)
```bash
cd frontend
vercel --prod
```

### Railway/Render (Backend)
```bash
# Set environment variables:
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
```

### Database Migration
```bash
npx prisma migrate deploy
```

## 📈 Performance

- **Initial Load:** < 2s
- **API Response:** < 100ms avg
- **Database Queries:** Optimized with indexes
- **Caching:** React Query with 60s stale time
- **Bundle Size:** Frontend < 500KB gzipped

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 💬 Support

- 📧 Email: support@financeos.io
- 📖 Documentation: https://docs.financeos.io
- 🐛 Issues: GitHub Issues

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Backend powered by [NestJS](https://nestjs.com/)
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Database with [Prisma](https://www.prisma.io/)

---

**Made with ❤️ by the FinanceOS Team**

⭐ Star this repo if you find it useful!
