// ─────────────────────────────────────────────
//  FinanceOS · Database Seed
//  Realistic enterprise financial data
// ─────────────────────────────────────────────

import { PrismaClient, AccountType, JournalStatus, InvoiceStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding FinanceOS database...');

  // ── Company ──────────────────────────────────────
  const company = await prisma.company.upsert({
    where: { id: 'company-001' },
    update: {},
    create: {
      id: 'company-001',
      name: 'FinanceOS Holdings',
      legalName: 'FinanceOS Holdings Ltd.',
      taxId: 'EG-TAX-2024-00842',
      vatNumber: 'EG-VAT-2024-00842',
      address: '25 Hassan Allam St, Mohandessin',
      city: 'Cairo',
      country: 'Egypt',
      phone: '+20 2 3760 4848',
      email: 'finance@financeos.io',
      website: 'https://financeos.io',
      currency: 'USD',
      fiscalYearStart: 1,
      timezone: 'Africa/Cairo',
    },
  });
  console.log('✓ Company created');

  // ── Users ─────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin@123456', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@financeos.io' },
    update: {},
    create: {
      companyId: company.id,
      email: 'admin@financeos.io',
      passwordHash,
      firstName: 'Ahmed',
      lastName: 'Hassan',
      role: 'SUPER_ADMIN',
    },
  });

  const cfo = await prisma.user.upsert({
    where: { email: 'cfo@financeos.io' },
    update: {},
    create: {
      companyId: company.id,
      email: 'cfo@financeos.io',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Ahmed',
      role: 'CFO',
    },
  });

  await prisma.user.upsert({
    where: { email: 'accountant@financeos.io' },
    update: {},
    create: {
      companyId: company.id,
      email: 'accountant@financeos.io',
      passwordHash,
      firstName: 'Mohamed',
      lastName: 'Ali',
      role: 'ACCOUNTANT',
    },
  });
  console.log('✓ Users created (admin@financeos.io / Admin@123456)');

  // ── Chart of Accounts ─────────────────────────────
  const accounts = [
    // ASSETS
    { code: '1000', name: 'Assets', type: 'ASSET' as AccountType },
    { code: '1100', name: 'Current Assets', type: 'ASSET' as AccountType },
    { code: '1101', name: 'Cash on Hand', type: 'ASSET' as AccountType },
    { code: '1102', name: 'Bank — CIB Main Account', type: 'ASSET' as AccountType },
    { code: '1103', name: 'Bank — HSBC USD Account', type: 'ASSET' as AccountType },
    { code: '1200', name: 'Accounts Receivable', type: 'ASSET' as AccountType },
    { code: '1300', name: 'Inventory', type: 'ASSET' as AccountType },
    { code: '1400', name: 'Prepaid Expenses', type: 'ASSET' as AccountType },
    { code: '1500', name: 'Fixed Assets', type: 'ASSET' as AccountType },
    { code: '1510', name: 'Office Equipment', type: 'ASSET' as AccountType },
    { code: '1520', name: 'Computers & Servers', type: 'ASSET' as AccountType },
    { code: '1590', name: 'Accumulated Depreciation', type: 'ASSET' as AccountType },
    // LIABILITIES
    { code: '2000', name: 'Liabilities', type: 'LIABILITY' as AccountType },
    { code: '2100', name: 'Current Liabilities', type: 'LIABILITY' as AccountType },
    { code: '2101', name: 'Accounts Payable', type: 'LIABILITY' as AccountType },
    { code: '2200', name: 'VAT Payable', type: 'LIABILITY' as AccountType },
    { code: '2300', name: 'Salaries Payable', type: 'LIABILITY' as AccountType },
    { code: '2400', name: 'Long-term Liabilities', type: 'LIABILITY' as AccountType },
    { code: '2410', name: 'Bank Loans', type: 'LIABILITY' as AccountType },
    // EQUITY
    { code: '3000', name: 'Equity', type: 'EQUITY' as AccountType },
    { code: '3100', name: 'Share Capital', type: 'EQUITY' as AccountType },
    { code: '3200', name: 'Retained Earnings', type: 'EQUITY' as AccountType },
    { code: '3300', name: 'Current Year Profit', type: 'EQUITY' as AccountType },
    // REVENUE
    { code: '4000', name: 'Revenue', type: 'REVENUE' as AccountType },
    { code: '4100', name: 'Product Sales Revenue', type: 'REVENUE' as AccountType },
    { code: '4200', name: 'Service Revenue', type: 'REVENUE' as AccountType },
    { code: '4300', name: 'Subscription Revenue', type: 'REVENUE' as AccountType },
    { code: '4400', name: 'Other Income', type: 'REVENUE' as AccountType },
    // EXPENSES
    { code: '5000', name: 'Expenses', type: 'EXPENSE' as AccountType },
    { code: '5100', name: 'Cost of Goods Sold', type: 'EXPENSE' as AccountType },
    { code: '5200', name: 'Payroll & Benefits', type: 'EXPENSE' as AccountType },
    { code: '5210', name: 'Salaries', type: 'EXPENSE' as AccountType },
    { code: '5220', name: 'Health Insurance', type: 'EXPENSE' as AccountType },
    { code: '5300', name: 'Operating Expenses', type: 'EXPENSE' as AccountType },
    { code: '5310', name: 'Rent Expense', type: 'EXPENSE' as AccountType },
    { code: '5320', name: 'Utilities', type: 'EXPENSE' as AccountType },
    { code: '5330', name: 'Internet & Telecom', type: 'EXPENSE' as AccountType },
    { code: '5400', name: 'Marketing & Advertising', type: 'EXPENSE' as AccountType },
    { code: '5500', name: 'Technology & Cloud', type: 'EXPENSE' as AccountType },
    { code: '5510', name: 'AWS / Azure / GCP', type: 'EXPENSE' as AccountType },
    { code: '5520', name: 'Software Licenses', type: 'EXPENSE' as AccountType },
    { code: '5600', name: 'Depreciation Expense', type: 'EXPENSE' as AccountType },
    { code: '5700', name: 'Bank Charges', type: 'EXPENSE' as AccountType },
    { code: '5800', name: 'Tax Expense', type: 'EXPENSE' as AccountType },
  ];

  const accountMap: Record<string, string> = {};
  for (const acc of accounts) {
    const created = await prisma.account.upsert({
      where: { companyId_code: { companyId: company.id, code: acc.code } },
      update: {},
      create: { companyId: company.id, ...acc },
    });
    accountMap[acc.code] = created.id;
  }
  console.log(`✓ ${accounts.length} accounts created`);

  // ── Taxes ─────────────────────────────────────────
  await prisma.tax.createMany({
    data: [
      { companyId: company.id, name: 'VAT 14%', code: 'VAT14', rate: 14, type: 'VAT', isDefault: true },
      { companyId: company.id, name: 'VAT 5%', code: 'VAT5', rate: 5, type: 'VAT' },
      { companyId: company.id, name: 'Withholding Tax 5%', code: 'WHT5', rate: 5, type: 'WITHHOLDING' },
    ],
    skipDuplicates: true,
  });

  // ── Suppliers ─────────────────────────────────────
  const suppliersData = [
    { code: 'SUP-001', name: 'Oracle Corporation', email: 'billing@oracle.com', paymentTerms: 30, balance: 48200 },
    { code: 'SUP-002', name: 'Microsoft Azure', email: 'billing@microsoft.com', paymentTerms: 30, balance: 12450 },
    { code: 'SUP-003', name: 'Salesforce Inc', email: 'invoices@salesforce.com', paymentTerms: 60, balance: 38000 },
    { code: 'SUP-004', name: 'Dell Technologies', email: 'billing@dell.com', paymentTerms: 45, balance: 72600 },
    { code: 'SUP-005', name: 'AWS Egypt', email: 'aws-billing@amazon.com', paymentTerms: 30, balance: 15200 },
    { code: 'SUP-006', name: 'Vodafone Business', email: 'business@vodafone.com.eg', paymentTerms: 30, balance: 8400 },
    { code: 'SUP-007', name: 'Office Supply Co.', email: 'info@officesupply.eg', paymentTerms: 15, balance: 3200 },
  ];

  const supplierMap: Record<string, string> = {};
  for (const s of suppliersData) {
    const sup = await prisma.supplier.upsert({
      where: { companyId_code: { companyId: company.id, code: s.code } },
      update: {},
      create: { companyId: company.id, ...s, balance: s.balance },
    });
    supplierMap[s.code] = sup.id;
  }
  console.log(`✓ ${suppliersData.length} suppliers created`);

  // ── Customers ─────────────────────────────────────
  const customersData = [
    { code: 'CUS-001', name: 'Acme Corporation', email: 'ap@acme.com', paymentTerms: 30, balance: 84200 },
    { code: 'CUS-002', name: 'TechSolutions Ltd', email: 'finance@techsol.com', paymentTerms: 30, balance: 56800 },
    { code: 'CUS-003', name: 'Global Ventures', email: 'payments@globalv.com', paymentTerms: 45, balance: 124500 },
    { code: 'CUS-004', name: 'StartupXYZ Inc', email: 'billing@startupxyz.io', paymentTerms: 30, balance: 38400 },
    { code: 'CUS-005', name: 'MegaCorp Group', email: 'ap@megacorp.com', paymentTerms: 60, balance: 62000 },
    { code: 'CUS-006', name: 'Digital Agency Pro', email: 'finance@dagency.com', paymentTerms: 30, balance: 28500 },
    { code: 'CUS-007', name: 'Smart Systems LLC', email: 'ar@smartsys.ae', paymentTerms: 45, balance: 44800 },
    { code: 'CUS-008', name: 'Horizon Partners', email: 'pay@horizonp.com', paymentTerms: 30, balance: 19200 },
  ];

  const customerMap: Record<string, string> = {};
  for (const c of customersData) {
    const cust = await prisma.customer.upsert({
      where: { companyId_code: { companyId: company.id, code: c.code } },
      update: {},
      create: { companyId: company.id, ...c, balance: c.balance },
    });
    customerMap[c.code] = cust.id;
  }
  console.log(`✓ ${customersData.length} customers created`);

  // ── Departments ───────────────────────────────────
  const deptMap: Record<string, string> = {};
  const deptsData = [
    { name: 'Engineering', nameAr: 'الهندسة' },
    { name: 'Sales & Marketing', nameAr: 'المبيعات والتسويق' },
    { name: 'Finance & Accounting', nameAr: 'المالية والمحاسبة' },
    { name: 'Operations', nameAr: 'العمليات' },
    { name: 'Human Resources', nameAr: 'الموارد البشرية' },
  ];
  for (const d of deptsData) {
    const dept = await prisma.department.create({ data: { companyId: company.id, ...d } });
    deptMap[d.name] = dept.id;
  }

  // ── Employees ─────────────────────────────────────
  const employeesData = [
    { code: 'EMP-001', firstName: 'Omar', lastName: 'Khalil', departmentId: deptMap['Engineering'], position: 'Senior Engineer', salary: 8500, hireDate: new Date('2020-03-15') },
    { code: 'EMP-002', firstName: 'Nour', lastName: 'Ibrahim', departmentId: deptMap['Finance & Accounting'], position: 'Senior Accountant', salary: 7200, hireDate: new Date('2019-08-01') },
    { code: 'EMP-003', firstName: 'Karim', lastName: 'Saad', departmentId: deptMap['Sales & Marketing'], position: 'Sales Manager', salary: 9000, hireDate: new Date('2021-01-10') },
    { code: 'EMP-004', firstName: 'Lina', lastName: 'Mostafa', departmentId: deptMap['Operations'], position: 'Operations Lead', salary: 6800, hireDate: new Date('2021-06-20') },
    { code: 'EMP-005', firstName: 'Tarek', lastName: 'Fahmy', departmentId: deptMap['Engineering'], position: 'Tech Lead', salary: 11000, hireDate: new Date('2018-12-01') },
  ];
  for (const emp of employeesData) {
    await prisma.employee.create({ data: { companyId: company.id, ...emp } });
  }
  console.log(`✓ ${employeesData.length} employees created`);

  // ── Warehouse & Products ──────────────────────────
  const warehouse = await prisma.warehouse.create({
    data: { companyId: company.id, name: 'Main Warehouse - Cairo', isDefault: true },
  });

  const category = await prisma.category.create({
    data: { companyId: company.id, name: 'Hardware', nameAr: 'الأجهزة' },
  });

  const softCat = await prisma.category.create({
    data: { companyId: company.id, name: 'Software', nameAr: 'البرمجيات' },
  });

  const productsData = [
    { sku: 'PRD-001', name: 'Enterprise Server R740', categoryId: category.id, costPrice: 5200, sellingPrice: 7800, reorderPoint: 20, qty: 48 },
    { sku: 'PRD-002', name: 'SaaS License Bundle', categoryId: softCat.id, costPrice: 250, sellingPrice: 400, reorderPoint: 100, qty: 320 },
    { sku: 'PRD-003', name: 'Network Switch 48-port', categoryId: category.id, costPrice: 3200, sellingPrice: 4800, reorderPoint: 15, qty: 12 },
    { sku: 'PRD-004', name: 'Security Camera Kit', categoryId: category.id, costPrice: 1800, sellingPrice: 3200, reorderPoint: 10, qty: 8 },
    { sku: 'PRD-005', name: 'UPS 10KVA', categoryId: category.id, costPrice: 2400, sellingPrice: 3600, reorderPoint: 5, qty: 22 },
  ];

  for (const p of productsData) {
    const { qty, ...productData } = p;
    const product = await prisma.product.create({
      data: { companyId: company.id, taxRate: 14, ...productData },
    });
    await prisma.stockItem.create({
      data: { productId: product.id, warehouseId: warehouse.id, quantity: qty, avgCost: p.costPrice },
    });
  }
  console.log('✓ Warehouse, categories & products created');

  // ── Journal Entries ───────────────────────────────
  const journals = [
    {
      refNumber: 'JE-2024-001',
      date: new Date('2024-01-31'),
      description: 'January Revenue Recognition',
      lines: [
        { accountCode: '1102', debit: 198000, credit: 0 },
        { accountCode: '4100', debit: 0, credit: 142000 },
        { accountCode: '4200', debit: 0, credit: 56000 },
      ],
    },
    {
      refNumber: 'JE-2024-847',
      date: new Date('2024-12-18'),
      description: 'Sales Revenue — Acme Corporation',
      lines: [
        { accountCode: '1200', debit: 84200, credit: 0 },
        { accountCode: '4100', debit: 0, credit: 73860 },
        { accountCode: '2200', debit: 0, credit: 10340 },
      ],
    },
    {
      refNumber: 'JE-2024-846',
      date: new Date('2024-12-17'),
      description: 'AWS Cloud Infrastructure Cost',
      lines: [
        { accountCode: '5510', debit: 12450, credit: 0 },
        { accountCode: '2101', debit: 0, credit: 12450 },
      ],
    },
    {
      refNumber: 'JE-2024-845',
      date: new Date('2024-12-16'),
      description: 'Accounts Receivable — TechSolutions',
      lines: [
        { accountCode: '1200', debit: 56800, credit: 0 },
        { accountCode: '4200', debit: 0, credit: 49825 },
        { accountCode: '2200', debit: 0, credit: 6975 },
      ],
    },
    {
      refNumber: 'JE-2024-844',
      date: new Date('2024-12-15'),
      description: 'Q4 Office Rent Payment',
      lines: [
        { accountCode: '5310', debit: 28000, credit: 0 },
        { accountCode: '1102', debit: 0, credit: 28000 },
      ],
    },
    {
      refNumber: 'JE-2024-840',
      date: new Date('2024-12-10'),
      description: 'December Payroll — Engineering Dept',
      lines: [
        { accountCode: '5210', debit: 218400, credit: 0 },
        { accountCode: '2300', debit: 0, credit: 218400 },
      ],
    },
  ];

  for (const j of journals) {
    const totalDebit = j.lines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = j.lines.reduce((s, l) => s + l.credit, 0);

    await prisma.journalEntry.create({
      data: {
        companyId: company.id,
        refNumber: j.refNumber,
        date: j.date,
        description: j.description,
        status: 'POSTED',
        totalDebit,
        totalCredit,
        createdById: superAdmin.id,
        approvedById: cfo.id,
        postedAt: j.date,
        lines: {
          create: j.lines
            .filter(l => l.debit > 0 || l.credit > 0)
            .map((l, i) => ({
              accountId: accountMap[l.accountCode],
              debit: l.debit,
              credit: l.credit,
              lineOrder: i,
            })),
        },
      },
    });
  }
  console.log(`✓ ${journals.length} journal entries created`);

  // ── Sales Invoices ────────────────────────────────
  await prisma.salesInvoice.createMany({
    data: [
      {
        companyId: company.id,
        customerId: customerMap['CUS-001'],
        invoiceNumber: 'AR-4421',
        date: new Date('2024-12-18'),
        dueDate: new Date('2025-01-17'),
        status: 'PAID',
        subtotal: 73860,
        taxAmount: 10340,
        total: 84200,
        amountPaid: 84200,
      },
      {
        companyId: company.id,
        customerId: customerMap['CUS-002'],
        invoiceNumber: 'AR-4420',
        date: new Date('2024-12-16'),
        dueDate: new Date('2025-01-15'),
        status: 'SENT',
        subtotal: 49825,
        taxAmount: 6975,
        total: 56800,
        amountPaid: 0,
      },
      {
        companyId: company.id,
        customerId: customerMap['CUS-003'],
        invoiceNumber: 'AR-4418',
        date: new Date('2024-11-28'),
        dueDate: new Date('2025-01-12'),
        status: 'PARTIAL',
        subtotal: 109210,
        taxAmount: 15290,
        total: 124500,
        amountPaid: 50000,
      },
      {
        companyId: company.id,
        customerId: customerMap['CUS-004'],
        invoiceNumber: 'AR-4412',
        date: new Date('2024-10-22'),
        dueDate: new Date('2024-11-21'),
        status: 'OVERDUE',
        subtotal: 33685,
        taxAmount: 4715,
        total: 38400,
        amountPaid: 0,
      },
    ],
    skipDuplicates: true,
  });

  // ── Purchase Invoices ─────────────────────────────
  await prisma.purchaseInvoice.createMany({
    data: [
      {
        companyId: company.id,
        supplierId: supplierMap['SUP-001'],
        invoiceNumber: 'INV-8821',
        date: new Date('2024-12-01'),
        dueDate: new Date('2024-12-31'),
        status: 'SENT',
        subtotal: 42281,
        taxAmount: 5919,
        total: 48200,
        amountPaid: 0,
      },
      {
        companyId: company.id,
        supplierId: supplierMap['SUP-002'],
        invoiceNumber: 'INV-8820',
        date: new Date('2024-12-05'),
        dueDate: new Date('2025-01-04'),
        status: 'PAID',
        subtotal: 10921,
        taxAmount: 1529,
        total: 12450,
        amountPaid: 12450,
      },
      {
        companyId: company.id,
        supplierId: supplierMap['SUP-003'],
        invoiceNumber: 'INV-8818',
        date: new Date('2024-10-15'),
        dueDate: new Date('2024-12-14'),
        status: 'OVERDUE',
        subtotal: 33333,
        taxAmount: 4667,
        total: 38000,
        amountPaid: 0,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✓ Sales & purchase invoices created');

  // ── Audit Logs ────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      { companyId: company.id, userId: superAdmin.id, action: 'LOGIN', resource: 'Auth', ipAddress: '197.42.1.1' },
      { companyId: company.id, userId: cfo.id, action: 'CREATE', resource: 'JournalEntry', resourceId: 'JE-2024-847' },
      { companyId: company.id, userId: superAdmin.id, action: 'EXPORT', resource: 'Report', resourceId: 'income-statement-q4-2024' },
    ],
    skipDuplicates: false,
  });

  console.log('\n✅ FinanceOS database seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔑 Login credentials:');
  console.log('   Admin:      admin@financeos.io / Admin@123456');
  console.log('   CFO:        cfo@financeos.io / Admin@123456');
  console.log('   Accountant: accountant@financeos.io / Admin@123456');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
