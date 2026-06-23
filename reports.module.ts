// ─── src/reports/reports.module.ts ───────────
import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}

// ─── src/reports/reports.controller.ts ───────
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ReportsService } from './reports.service';

@ApiTags('Financial Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('income-statement')
  @ApiQuery({ name: 'from', required: true, example: '2024-01-01' })
  @ApiQuery({ name: 'to', required: true, example: '2024-12-31' })
  getIncomeStatement(
    @GetUser() user: any,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportsService.getIncomeStatement(user.companyId, new Date(from), new Date(to));
  }

  @Get('balance-sheet')
  @ApiQuery({ name: 'date', required: true, example: '2024-12-31' })
  getBalanceSheet(@GetUser() user: any, @Query('date') date: string) {
    return this.reportsService.getBalanceSheet(user.companyId, new Date(date));
  }

  @Get('trial-balance')
  @ApiQuery({ name: 'from', required: true })
  @ApiQuery({ name: 'to', required: true })
  getTrialBalance(
    @GetUser() user: any,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportsService.getTrialBalance(user.companyId, new Date(from), new Date(to));
  }

  @Get('cash-flow-statement')
  getCashFlowStatement(
    @GetUser() user: any,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportsService.getCashFlowStatement(user.companyId, new Date(from), new Date(to));
  }

  @Get('aging-receivables')
  getAgingReceivables(@GetUser() user: any) {
    return this.reportsService.getAgingReceivables(user.companyId);
  }

  @Get('aging-payables')
  getAgingPayables(@GetUser() user: any) {
    return this.reportsService.getAgingPayables(user.companyId);
  }

  @Get('vat-report')
  getVatReport(
    @GetUser() user: any,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportsService.getVatReport(user.companyId, new Date(from), new Date(to));
  }
}

// ─── src/reports/reports.service.ts ──────────
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountType } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getIncomeStatement(companyId: string, from: Date, to: Date) {
    // Get all journal lines for revenue and expense accounts within period
    const lines = await this.prisma.journalLine.findMany({
      where: {
        journal: { companyId, date: { gte: from, lte: to }, status: 'POSTED' },
        account: { type: { in: ['REVENUE', 'EXPENSE'] } },
      },
      include: {
        account: { select: { code: true, name: true, type: true } },
      },
    });

    // Group by account
    const accountTotals: Record<string, { name: string; type: AccountType; net: number }> = {};
    for (const line of lines) {
      const acc = line.account;
      if (!accountTotals[acc.code]) {
        accountTotals[acc.code] = { name: acc.name, type: acc.type, net: 0 };
      }
      // Revenue: credit increases, debit decreases
      if (acc.type === 'REVENUE') {
        accountTotals[acc.code].net += Number(line.credit) - Number(line.debit);
      }
      // Expense: debit increases, credit decreases
      if (acc.type === 'EXPENSE') {
        accountTotals[acc.code].net += Number(line.debit) - Number(line.credit);
      }
    }

    const revenues = Object.entries(accountTotals)
      .filter(([, v]) => v.type === 'REVENUE')
      .map(([code, v]) => ({ code, ...v }))
      .sort((a, b) => a.code.localeCompare(b.code));

    const expenses = Object.entries(accountTotals)
      .filter(([, v]) => v.type === 'EXPENSE')
      .map(([code, v]) => ({ code, ...v }))
      .sort((a, b) => a.code.localeCompare(b.code));

    const totalRevenue = revenues.reduce((s, r) => s + r.net, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.net, 0);
    const netProfit = totalRevenue - totalExpenses;

    return {
      period: { from, to },
      revenues,
      expenses,
      totalRevenue,
      totalExpenses,
      grossProfit: totalRevenue - (expenses.filter(e => e.code.startsWith('51')).reduce((s, e) => s + e.net, 0)),
      netProfit,
      profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
    };
  }

  async getBalanceSheet(companyId: string, date: Date) {
    const lines = await this.prisma.journalLine.findMany({
      where: {
        journal: { companyId, date: { lte: date }, status: 'POSTED' },
        account: { type: { in: ['ASSET', 'LIABILITY', 'EQUITY'] } },
      },
      include: {
        account: { select: { code: true, name: true, type: true, normalBalance: true } },
      },
    });

    const accountTotals: Record<string, { name: string; type: AccountType; balance: number }> = {};

    for (const line of lines) {
      const acc = line.account;
      if (!accountTotals[acc.code]) {
        accountTotals[acc.code] = { name: acc.name, type: acc.type, balance: 0 };
      }
      const debit = Number(line.debit);
      const credit = Number(line.credit);
      if (acc.normalBalance === 'DEBIT') {
        accountTotals[acc.code].balance += debit - credit;
      } else {
        accountTotals[acc.code].balance += credit - debit;
      }
    }

    const assets = Object.entries(accountTotals)
      .filter(([, v]) => v.type === 'ASSET' && v.balance !== 0)
      .map(([code, v]) => ({ code, ...v }))
      .sort((a, b) => a.code.localeCompare(b.code));

    const liabilities = Object.entries(accountTotals)
      .filter(([, v]) => v.type === 'LIABILITY' && v.balance !== 0)
      .map(([code, v]) => ({ code, ...v }))
      .sort((a, b) => a.code.localeCompare(b.code));

    const equity = Object.entries(accountTotals)
      .filter(([, v]) => v.type === 'EQUITY' && v.balance !== 0)
      .map(([code, v]) => ({ code, ...v }))
      .sort((a, b) => a.code.localeCompare(b.code));

    const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
    const totalLiabilities = liabilities.reduce((s, l) => s + l.balance, 0);
    const totalEquity = equity.reduce((s, e) => s + e.balance, 0);

    return {
      date,
      assets,
      liabilities,
      equity,
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
    };
  }

  async getTrialBalance(companyId: string, from: Date, to: Date) {
    const lines = await this.prisma.journalLine.findMany({
      where: {
        journal: { companyId, date: { gte: from, lte: to }, status: 'POSTED' },
      },
      include: {
        account: { select: { code: true, name: true, type: true } },
      },
    });

    const accountTotals: Record<string, {
      name: string; type: string; totalDebit: number; totalCredit: number;
    }> = {};

    for (const line of lines) {
      const acc = line.account;
      if (!accountTotals[acc.code]) {
        accountTotals[acc.code] = { name: acc.name, type: acc.type, totalDebit: 0, totalCredit: 0 };
      }
      accountTotals[acc.code].totalDebit += Number(line.debit);
      accountTotals[acc.code].totalCredit += Number(line.credit);
    }

    const entries = Object.entries(accountTotals)
      .map(([code, v]) => ({ code, ...v, balance: v.totalDebit - v.totalCredit }))
      .sort((a, b) => a.code.localeCompare(b.code));

    const totalDebit = entries.reduce((s, e) => s + e.totalDebit, 0);
    const totalCredit = entries.reduce((s, e) => s + e.totalCredit, 0);

    return {
      period: { from, to },
      entries,
      totalDebit,
      totalCredit,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
    };
  }

  async getCashFlowStatement(companyId: string, from: Date, to: Date) {
    const payments = await this.prisma.payment.findMany({
      where: { companyId, date: { gte: from, lte: to } },
      include: {
        salesInvoice: { include: { customer: { select: { name: true } } } },
        purchaseInvoice: { include: { supplier: { select: { name: true } } } },
      },
    });

    const operating = {
      inflows: payments
        .filter((p) => p.salesInvoiceId)
        .map((p) => ({
          description: `Receipt from ${p.salesInvoice?.customer.name}`,
          amount: Number(p.amount),
          date: p.date,
          ref: p.reference,
        })),
      outflows: payments
        .filter((p) => p.purchaseInvoiceId)
        .map((p) => ({
          description: `Payment to ${p.purchaseInvoice?.supplier.name}`,
          amount: -Number(p.amount),
          date: p.date,
          ref: p.reference,
        })),
    };

    const totalInflows = operating.inflows.reduce((s, i) => s + i.amount, 0);
    const totalOutflows = operating.outflows.reduce((s, o) => s + Math.abs(o.amount), 0);
    const netOperating = totalInflows - totalOutflows;

    return {
      period: { from, to },
      operating: {
        ...operating,
        totalInflows,
        totalOutflows,
        net: netOperating,
      },
      investing: { activities: [], net: 0 },
      financing: { activities: [], net: 0 },
      netCashFlow: netOperating,
      openingBalance: 0,
      closingBalance: netOperating,
    };
  }

  async getAgingReceivables(companyId: string) {
    const invoices = await this.prisma.salesInvoice.findMany({
      where: { companyId, status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] } },
      include: { customer: { select: { name: true, code: true } } },
    });

    const now = new Date();
    const buckets = { current: 0, days30: 0, days60: 0, days90: 0, over90: 0 };
    const byCustomer: Record<string, any> = {};

    for (const inv of invoices) {
      const outstanding = Number(inv.total) - Number(inv.amountPaid);
      const daysPast = Math.floor((now.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24));

      if (!byCustomer[inv.customerId]) {
        byCustomer[inv.customerId] = {
          customer: inv.customer,
          current: 0, days30: 0, days60: 0, days90: 0, over90: 0, total: 0,
        };
      }

      byCustomer[inv.customerId].total += outstanding;

      if (daysPast <= 0) { buckets.current += outstanding; byCustomer[inv.customerId].current += outstanding; }
      else if (daysPast <= 30) { buckets.days30 += outstanding; byCustomer[inv.customerId].days30 += outstanding; }
      else if (daysPast <= 60) { buckets.days60 += outstanding; byCustomer[inv.customerId].days60 += outstanding; }
      else if (daysPast <= 90) { buckets.days90 += outstanding; byCustomer[inv.customerId].days90 += outstanding; }
      else { buckets.over90 += outstanding; byCustomer[inv.customerId].over90 += outstanding; }
    }

    const total = Object.values(buckets).reduce((s, v) => s + v, 0);

    return {
      summary: { ...buckets, total },
      byCustomer: Object.values(byCustomer).sort((a: any, b: any) => b.total - a.total),
    };
  }

  async getAgingPayables(companyId: string) {
    const invoices = await this.prisma.purchaseInvoice.findMany({
      where: { companyId, status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] } },
      include: { supplier: { select: { name: true, code: true } } },
    });

    const now = new Date();
    const buckets = { current: 0, days30: 0, days60: 0, days90: 0, over90: 0 };

    for (const inv of invoices) {
      const outstanding = Number(inv.total) - Number(inv.amountPaid);
      const daysPast = Math.floor((now.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysPast <= 0) buckets.current += outstanding;
      else if (daysPast <= 30) buckets.days30 += outstanding;
      else if (daysPast <= 60) buckets.days60 += outstanding;
      else if (daysPast <= 90) buckets.days90 += outstanding;
      else buckets.over90 += outstanding;
    }

    return { ...buckets, total: Object.values(buckets).reduce((s, v) => s + v, 0) };
  }

  async getVatReport(companyId: string, from: Date, to: Date) {
    const [salesTax, purchaseTax] = await Promise.all([
      this.prisma.salesInvoice.aggregate({
        where: { companyId, date: { gte: from, lte: to } },
        _sum: { taxAmount: true, subtotal: true, total: true },
      }),
      this.prisma.purchaseInvoice.aggregate({
        where: { companyId, date: { gte: from, lte: to } },
        _sum: { taxAmount: true, subtotal: true, total: true },
      }),
    ]);

    const outputVat = Number(salesTax._sum.taxAmount) || 0;
    const inputVat = Number(purchaseTax._sum.taxAmount) || 0;
    const netVatDue = outputVat - inputVat;

    return {
      period: { from, to },
      sales: {
        subtotal: Number(salesTax._sum.subtotal) || 0,
        taxAmount: outputVat,
        total: Number(salesTax._sum.total) || 0,
      },
      purchases: {
        subtotal: Number(purchaseTax._sum.subtotal) || 0,
        taxAmount: inputVat,
        total: Number(purchaseTax._sum.total) || 0,
      },
      outputVat,
      inputVat,
      netVatDue,
      status: netVatDue > 0 ? 'PAYABLE' : 'REFUNDABLE',
    };
  }
}
