// ═══════════════════════════════════════════════
//  USERS MODULE
// ═══════════════════════════════════════════════

// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

// src/users/users.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll(@GetUser() user: any, @Query('search') search?: string) {
    return this.usersService.findAll(user.companyId, search);
  }

  @Get(':id')
  findOne(@GetUser() user: any, @Param('id') id: string) {
    return this.usersService.findOne(user.companyId, id);
  }

  @Post()
  create(@GetUser() user: any, @Body() dto: CreateUserDto) {
    return this.usersService.create(user.companyId, dto);
  }

  @Put(':id')
  update(@GetUser() user: any, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.companyId, id, dto);
  }

  @Delete(':id')
  remove(@GetUser() user: any, @Param('id') id: string) {
    return this.usersService.remove(user.companyId, id);
  }
}

// src/users/users.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, search?: string) {
    return this.prisma.user.findMany({
      where: {
        companyId,
        ...(search && {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, lastLoginAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, companyId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, phone: true, avatar: true, isActive: true, lastLoginAt: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(companyId: string, dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    return this.prisma.user.create({
      data: { ...dto, companyId, passwordHash, password: undefined },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
    });
  }

  async update(companyId: string, id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findFirst({ where: { id, companyId } });
    if (!user) throw new NotFoundException('User not found');

    const data: any = { ...dto };
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 12);
      delete data.password;
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
    });
  }

  async remove(companyId: string, id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, companyId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.update({ where: { id }, data: { isActive: false } });
    return { message: 'User deactivated' };
  }
}

// src/users/dto/users.dto.ts
import { IsEmail, IsString, IsOptional, IsEnum, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(8) password: string;
  @ApiProperty() @IsString() firstName: string;
  @ApiProperty() @IsString() lastName: string;
  @ApiProperty() @IsEnum(['SUPER_ADMIN', 'CFO', 'ACCOUNTANT', 'HR_MANAGER', 'VIEWER']) role: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() phone?: string;
}

export class UpdateUserDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() @MinLength(8) password?: string;
  @IsOptional() @IsEnum(['SUPER_ADMIN', 'CFO', 'ACCOUNTANT', 'HR_MANAGER', 'VIEWER']) role?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

// ═══════════════════════════════════════════════
//  LEDGER MODULE
// ═══════════════════════════════════════════════

// src/ledger/ledger.module.ts
import { Module } from '@nestjs/common';
import { LedgerController } from './ledger.controller';
import { LedgerService } from './ledger.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LedgerController],
  providers: [LedgerService],
})
export class LedgerModule {}

// src/ledger/ledger.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { LedgerService } from './ledger.service';
import { CreateAccountDto, CreateJournalDto } from './dto/ledger.dto';

@ApiTags('General Ledger')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ledger')
export class LedgerController {
  constructor(private ledgerService: LedgerService) {}

  @Get('accounts')
  getAccounts(@GetUser() user: any, @Query('type') type?: string) {
    return this.ledgerService.getAccounts(user.companyId, type);
  }

  @Post('accounts')
  createAccount(@GetUser() user: any, @Body() dto: CreateAccountDto) {
    return this.ledgerService.createAccount(user.companyId, dto);
  }

  @Get('journals')
  getJournals(@GetUser() user: any, @Query('from') from?: string, @Query('to') to?: string, @Query('status') status?: string) {
    return this.ledgerService.getJournals(user.companyId, from, to, status);
  }

  @Get('journals/:id')
  getJournal(@GetUser() user: any, @Param('id') id: string) {
    return this.ledgerService.getJournal(user.companyId, id);
  }

  @Post('journals')
  createJournal(@GetUser() user: any, @Body() dto: CreateJournalDto) {
    return this.ledgerService.createJournal(user.companyId, user.id, dto);
  }

  @Put('journals/:id/post')
  postJournal(@GetUser() user: any, @Param('id') id: string) {
    return this.ledgerService.postJournal(user.companyId, id, user.id);
  }

  @Delete('journals/:id')
  deleteJournal(@GetUser() user: any, @Param('id') id: string) {
    return this.ledgerService.deleteJournal(user.companyId, id);
  }
}

// src/ledger/ledger.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto, CreateJournalDto } from './dto/ledger.dto';

@Injectable()
export class LedgerService {
  constructor(private prisma: PrismaService) {}

  async getAccounts(companyId: string, type?: string) {
    return this.prisma.account.findMany({
      where: { companyId, ...(type && { type }) },
      orderBy: { code: 'asc' },
    });
  }

  async createAccount(companyId: string, dto: CreateAccountDto) {
    return this.prisma.account.create({
      data: { ...dto, companyId },
    });
  }

  async getJournals(companyId: string, from?: string, to?: string, status?: string) {
    return this.prisma.journalEntry.findMany({
      where: {
        companyId,
        ...(from && to && { date: { gte: new Date(from), lte: new Date(to) } }),
        ...(status && { status }),
      },
      include: {
        lines: { include: { account: { select: { code: true, name: true } } }, orderBy: { lineOrder: 'asc' } },
        createdBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { date: 'desc' },
      take: 100,
    });
  }

  async getJournal(companyId: string, id: string) {
    const journal = await this.prisma.journalEntry.findFirst({
      where: { id, companyId },
      include: {
        lines: { include: { account: { select: { code: true, name: true } } }, orderBy: { lineOrder: 'asc' } },
        createdBy: { select: { firstName: true, lastName: true, email: true } },
      },
    });
    if (!journal) throw new NotFoundException('Journal entry not found');
    return journal;
  }

  async createJournal(companyId: string, userId: string, dto: CreateJournalDto) {
    const totalDebit = dto.lines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = dto.lines.reduce((s, l) => s + l.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException('Debits must equal credits');
    }

    const lastEntry = await this.prisma.journalEntry.findFirst({
      where: { companyId },
      orderBy: { refNumber: 'desc' },
      select: { refNumber: true },
    });

    const lastNum = lastEntry ? parseInt(lastEntry.refNumber.split('-').pop() || '0') : 0;
    const refNumber = `JE-${new Date().getFullYear()}-${String(lastNum + 1).padStart(3, '0')}`;

    return this.prisma.journalEntry.create({
      data: {
        companyId,
        refNumber,
        date: new Date(dto.date),
        description: dto.description,
        reference: dto.reference,
        status: 'DRAFT',
        totalDebit,
        totalCredit,
        createdById: userId,
        lines: {
          create: dto.lines.map((line, i) => ({
            accountId: line.accountId,
            description: line.description,
            debit: line.debit,
            credit: line.credit,
            lineOrder: i,
          })),
        },
      },
      include: { lines: { include: { account: true } } },
    });
  }

  async postJournal(companyId: string, id: string, userId: string) {
    const journal = await this.prisma.journalEntry.findFirst({ where: { id, companyId } });
    if (!journal) throw new NotFoundException('Journal entry not found');
    if (journal.status === 'POSTED') throw new BadRequestException('Already posted');

    return this.prisma.journalEntry.update({
      where: { id },
      data: { status: 'POSTED', approvedById: userId, approvedAt: new Date(), postedAt: new Date() },
    });
  }

  async deleteJournal(companyId: string, id: string) {
    const journal = await this.prisma.journalEntry.findFirst({ where: { id, companyId } });
    if (!journal) throw new NotFoundException('Journal entry not found');
    if (journal.status === 'POSTED') throw new BadRequestException('Cannot delete posted entries');

    await this.prisma.journalEntry.delete({ where: { id } });
    return { message: 'Journal entry deleted' };
  }
}

// src/ledger/dto/ledger.dto.ts
import { IsString, IsEnum, IsOptional, IsArray, IsNumber, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty() @IsString() code: string;
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsEnum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']) type: string;
  @IsOptional() @IsString() nameAr?: string;
  @IsOptional() @IsString() parentId?: string;
  @IsOptional() @IsString() description?: string;
}

class JournalLineDto {
  @ApiProperty() @IsString() accountId: string;
  @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsNumber() debit: number;
  @ApiProperty() @IsNumber() credit: number;
}

export class CreateJournalDto {
  @ApiProperty() @IsDateString() date: string;
  @ApiProperty() @IsString() description: string;
  @IsOptional() @IsString() reference?: string;
  @ApiProperty({ type: [JournalLineDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => JournalLineDto) lines: JournalLineDto[];
}

// ═══════════════════════════════════════════════
//  INVOICES MODULE
// ═══════════════════════════════════════════════

// src/invoices/invoices.module.ts
import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}

// src/invoices/invoices.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { InvoicesService } from './invoices.service';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get('customers')
  getCustomers(@GetUser() user: any) {
    return this.invoicesService.getCustomers(user.companyId);
  }

  @Get('suppliers')
  getSuppliers(@GetUser() user: any) {
    return this.invoicesService.getSuppliers(user.companyId);
  }

  @Get('sales')
  getSalesInvoices(@GetUser() user: any, @Query('status') status?: string) {
    return this.invoicesService.getSalesInvoices(user.companyId, status);
  }

  @Get('purchases')
  getPurchaseInvoices(@GetUser() user: any, @Query('status') status?: string) {
    return this.invoicesService.getPurchaseInvoices(user.companyId, status);
  }

  @Get('sales/:id')
  getSalesInvoice(@GetUser() user: any, @Param('id') id: string) {
    return this.invoicesService.getSalesInvoice(user.companyId, id);
  }

  @Post('sales/:id/payment')
  recordSalesPayment(@GetUser() user: any, @Param('id') id: string, @Body() dto: any) {
    return this.invoicesService.recordSalesPayment(user.companyId, id, dto);
  }
}

// src/invoices/invoices.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async getCustomers(companyId: string) {
    return this.prisma.customer.findMany({
      where: { companyId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getSuppliers(companyId: string) {
    return this.prisma.supplier.findMany({
      where: { companyId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getSalesInvoices(companyId: string, status?: string) {
    return this.prisma.salesInvoice.findMany({
      where: { companyId, ...(status && { status }) },
      include: {
        customer: { select: { name: true, code: true } },
        items: { include: { product: { select: { name: true, sku: true } } } },
      },
      orderBy: { date: 'desc' },
      take: 100,
    });
  }

  async getPurchaseInvoices(companyId: string, status?: string) {
    return this.prisma.purchaseInvoice.findMany({
      where: { companyId, ...(status && { status }) },
      include: {
        supplier: { select: { name: true, code: true } },
        items: { include: { product: { select: { name: true, sku: true } } } },
      },
      orderBy: { date: 'desc' },
      take: 100,
    });
  }

  async getSalesInvoice(companyId: string, id: string) {
    const invoice = await this.prisma.salesInvoice.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        items: { include: { product: true } },
        payments: true,
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async recordSalesPayment(companyId: string, invoiceId: string, dto: any) {
    const invoice = await this.getSalesInvoice(companyId, invoiceId);
    const outstanding = Number(invoice.total) - Number(invoice.amountPaid);

    if (dto.amount > outstanding) {
      throw new Error('Payment exceeds outstanding amount');
    }

    const newAmountPaid = Number(invoice.amountPaid) + dto.amount;
    const newStatus = newAmountPaid >= Number(invoice.total) ? 'PAID' : 'PARTIAL';

    await this.prisma.$transaction([
      this.prisma.payment.create({
        data: { companyId, salesInvoiceId: invoiceId, date: new Date(dto.date), amount: dto.amount, method: dto.method, reference: dto.reference },
      }),
      this.prisma.salesInvoice.update({
        where: { id: invoiceId },
        data: { amountPaid: newAmountPaid, status: newStatus },
      }),
    ]);

    return { message: 'Payment recorded successfully' };
  }
}

// ═══════════════════════════════════════════════
//  INVENTORY MODULE
// ═══════════════════════════════════════════════

// src/inventory/inventory.module.ts
import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}

// src/inventory/inventory.controller.ts
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { InventoryService } from './inventory.service';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get('products')
  getProducts(@GetUser() user: any) {
    return this.inventoryService.getProducts(user.companyId);
  }

  @Get('warehouses')
  getWarehouses(@GetUser() user: any) {
    return this.inventoryService.getWarehouses(user.companyId);
  }

  @Get('stock')
  getStockLevels(@GetUser() user: any) {
    return this.inventoryService.getStockLevels(user.companyId);
  }

  @Get('movements')
  getMovements(@GetUser() user: any) {
    return this.inventoryService.getMovements(user.companyId);
  }

  @Post('movements')
  recordMovement(@GetUser() user: any, @Body() dto: any) {
    return this.inventoryService.recordMovement(user.companyId, dto);
  }
}

// src/inventory/inventory.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getProducts(companyId: string) {
    return this.prisma.product.findMany({
      where: { companyId, isActive: true },
      include: { category: true, stockItems: { include: { warehouse: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async getWarehouses(companyId: string) {
    return this.prisma.warehouse.findMany({
      where: { companyId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getStockLevels(companyId: string) {
    const products = await this.prisma.product.findMany({
      where: { companyId, isActive: true },
      include: {
        stockItems: { include: { warehouse: { select: { name: true } } } },
        category: { select: { name: true } },
      },
    });

    return products.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category?.name,
      reorderPoint: p.reorderPoint,
      totalQuantity: p.stockItems.reduce((s, si) => s + Number(si.quantity), 0),
      stockByWarehouse: p.stockItems.map((si) => ({
        warehouse: si.warehouse.name,
        quantity: Number(si.quantity),
        value: Number(si.quantity) * Number(si.avgCost),
      })),
    }));
  }

  async getMovements(companyId: string) {
    return this.prisma.stockMovement.findMany({
      where: { companyId },
      include: {
        product: { select: { name: true, sku: true } },
        warehouse: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async recordMovement(companyId: string, dto: any) {
    const { productId, warehouseId, type, quantity, unitCost, reference, notes } = dto;

    await this.prisma.$transaction(async (tx) => {
      await tx.stockMovement.create({
        data: { companyId, productId, warehouseId, type, quantity, unitCost: unitCost || 0, reference, notes },
      });

      const stockItem = await tx.stockItem.findUnique({
        where: { productId_warehouseId: { productId, warehouseId } },
      });

      if (type === 'IN') {
        const newQty = Number(stockItem?.quantity || 0) + quantity;
        const newAvgCost = stockItem
          ? (Number(stockItem.quantity) * Number(stockItem.avgCost) + quantity * unitCost) / newQty
          : unitCost;

        await tx.stockItem.upsert({
          where: { productId_warehouseId: { productId, warehouseId } },
          update: { quantity: newQty, avgCost: newAvgCost },
          create: { productId, warehouseId, quantity: newQty, avgCost: unitCost },
        });
      } else if (type === 'OUT') {
        const newQty = Number(stockItem?.quantity || 0) - quantity;
        if (newQty < 0) throw new Error('Insufficient stock');

        await tx.stockItem.update({
          where: { productId_warehouseId: { productId, warehouseId } },
          data: { quantity: newQty },
        });
      }
    });

    return { message: 'Movement recorded successfully' };
  }
}

// ═══════════════════════════════════════════════
//  PAYROLL MODULE
// ═══════════════════════════════════════════════

// src/payroll/payroll.module.ts
import { Module } from '@nestjs/common';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PayrollController],
  providers: [PayrollService],
})
export class PayrollModule {}

// src/payroll/payroll.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { PayrollService } from './payroll.service';

@ApiTags('Payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payroll')
export class PayrollController {
  constructor(private payrollService: PayrollService) {}

  @Get('employees')
  getEmployees(@GetUser() user: any) {
    return this.payrollService.getEmployees(user.companyId);
  }

  @Get('departments')
  getDepartments(@GetUser() user: any) {
    return this.payrollService.getDepartments(user.companyId);
  }

  @Get('entries')
  getPayrollEntries(@GetUser() user: any, @Query('period') period?: string) {
    return this.payrollService.getPayrollEntries(user.companyId, period);
  }

  @Post('generate')
  generatePayroll(@GetUser() user: any, @Body() dto: any) {
    return this.payrollService.generatePayroll(user.companyId, dto);
  }
}

// src/payroll/payroll.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  async getEmployees(companyId: string) {
    return this.prisma.employee.findMany({
      where: { companyId, status: 'ACTIVE' },
      include: { department: true },
      orderBy: { firstName: 'asc' },
    });
  }

  async getDepartments(companyId: string) {
    return this.prisma.department.findMany({
      where: { companyId, isActive: true },
      include: { employees: { where: { status: 'ACTIVE' } } },
    });
  }

  async getPayrollEntries(companyId: string, period?: string) {
    return this.prisma.payrollEntry.findMany({
      where: { companyId, ...(period && { period }) },
      include: { employee: { select: { firstName: true, lastName: true, code: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async generatePayroll(companyId: string, dto: any) {
    const { period } = dto;
    const employees = await this.prisma.employee.findMany({
      where: { companyId, status: 'ACTIVE' },
    });

    const entries = employees.map((emp) => ({
      companyId,
      employeeId: emp.id,
      period,
      baseSalary: emp.salary,
      allowances: 0,
      deductions: 0,
      advanceDeduct: 0,
      taxDeduction: Number(emp.salary) * 0.05,
      netSalary: Number(emp.salary) * 0.95,
      status: 'PENDING' as const,
    }));

    await this.prisma.payrollEntry.createMany({ data: entries });
    return { message: `Payroll generated for ${employees.length} employees` };
  }
}

// ═══════════════════════════════════════════════
//  SETTINGS MODULE
// ═══════════════════════════════════════════════

// src/settings/settings.module.ts
import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}

// src/settings/settings.controller.ts
import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get('company')
  getCompany(@GetUser() user: any) {
    return this.settingsService.getCompany(user.companyId);
  }

  @Put('company')
  updateCompany(@GetUser() user: any, @Body() dto: any) {
    return this.settingsService.updateCompany(user.companyId, dto);
  }

  @Get('taxes')
  getTaxes(@GetUser() user: any) {
    return this.settingsService.getTaxes(user.companyId);
  }
}

// src/settings/settings.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getCompany(companyId: string) {
    return this.prisma.company.findUnique({ where: { id: companyId } });
  }

  async updateCompany(companyId: string, dto: any) {
    return this.prisma.company.update({
      where: { id: companyId },
      data: dto,
    });
  }

  async getTaxes(companyId: string) {
    return this.prisma.tax.findMany({
      where: { companyId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}

// ═══════════════════════════════════════════════
//  AUDIT MODULE
// ═══════════════════════════════════════════════

// src/common/audit/audit.module.ts
import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}

// src/common/audit/audit.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(companyId: string, userId: string, action: string, resource: string, resourceId?: string, oldValues?: any, newValues?: any) {
    await this.prisma.auditLog.create({
      data: { companyId, userId, action, resource, resourceId, oldValues, newValues },
    });
  }
}
