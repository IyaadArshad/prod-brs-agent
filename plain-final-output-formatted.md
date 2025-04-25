# Overview

This Business Requirements Specification (BRS) document covers the comprehensive set of modules in the new enterprise resource planning system, structured to provide clear guidance on functional requirements, data flows, business rules, user screens, and reporting. This revision reconstructs the existing Stock & Sales module—organizing it into four sub-sections (Common Configuration, Master Files, Transactions, Reports)—and introduces five additional modules: Accounts Receivable, Accounts Payable, Manufacturing, Petty Cash, and Sugar Tax. Each module section follows a consistent BRS structure, including screen-level specifications, data diagrams, process details, and data validation rules. The rationale, overview, and full context of all user notes are provided throughout, with unedited notes included at the end of the document.

# Table of Contents

1 Overview  
2 Table of Contents  
3 Stock & Sales Module  
   3.1 Common Configuration  
   3.2 Master Files  
       3.2.1 Brand Master File  
       3.2.2 Group Master File  
       3.2.3 Category Master File  
       3.2.4 Sub Category Master File  
       3.2.5 Product Master File  
       3.2.6 QC Parameter Master File  
   3.3 Transactions  
       3.3.1 Purchase Order Entry  
       3.3.2 QC Approve Entry  
       3.3.3 Goods Received Note  
   3.4 Reports  
4 Accounts Receivable Module  
   4.1 Customer Master File  
   4.2 AR Invoice Entry  
   4.3 Customer Receipt Entry  
   4.4 AR Credit Memo Entry  
   4.5 AR Aging Report  
   4.6 AR Ledger Report  
   4.7 Customer Statement Report  
5 Accounts Payable Module  
   5.1 Vendor Master File  
   5.2 AP Invoice Entry  
   5.3 AP Payment Entry  
   5.4 AP Credit Note Entry  
   5.5 AP Aging Report  
   5.6 AP Ledger Report  
   5.7 Vendor Statement Report  
6 Manufacturing Module  
   6.1 Bill of Materials Master File  
   6.2 Routing Master File  
   6.3 Work Order Entry  
   6.4 Material Issue Transaction  
   6.5 Production Completion Transaction  
   6.6 Production Schedule Report  
   6.7 WIP Report  
7 Petty Cash Module  
   7.1 Petty Cash Fund Master File  
   7.2 Petty Cash Voucher Entry  
   7.3 Petty Cash Replenishment Request  
   7.4 Petty Cash Journal Report  
   7.5 Petty Cash Balance Report  
8 Sugar Tax Module  
   8.1 Sugar Tax Rate Master File  
   8.2 Sugar Tax Calculation Screen  
   8.3 Sugar Tax Return Submission  
   8.4 Sugar Tax Liability Report  
   8.5 Sugar Tax Return History Report  
9 NOTES  

# Stock & Sales Module

### Common Configuration

## 1. Common Configuration

This screen centralizes global controls and settings that apply across the Stock & Sales module, ensuring that data entry, access permissions, audit trails, notifications, and integrations obey company policies.

**Key highlights:**
- Data entry period locks per module and user group  
- Comprehensive audit logs for all transactions  
- Material issue category access mirroring location permissions  
- Dashboard widget for pending approvals  
- Dedicated tab for store-related functions  
- Automated payroll journal posting to ERP  
- Fixed asset-device-person mapping  
- Consistent decimal precision across the system  
- Real-time lorry GPS tracking  

```json
{\"brsDiagram\": {}}
```

Detailed specifications:
- Inputs: Module ID, User Group, Start Date, End Date  
- Process:  
  1. Validate permissions against user roles  
  2. Enforce open/close locks on selected modules  
  3. Log configuration changes in the audit trail  
- Outputs: Confirmation messages; Updated lock statuses on screens  

Additional details for each functional module:
1. Data Entry Period Control  
   - Manages opening and closing of data entry windows by module and user group.  
   - Inputs: Module ID, user group, start date, end date  
   - Process: Validate permissions; enforce locks; log changes  
   - Outputs: Confirmation messages; enabled/disabled screens  

2. Audit Trail  
   - Records every create, read, update, or delete action within the module.  
   - Inputs: User ID, action type, timestamp, record ID  
   - Process: Capture and store audit entries  
   - Outputs: Searchable audit log  

3. Material Issue Category Access  
   - Applies category-based access rights to material issue functions.  
   - Inputs: User roles, category list, location assignment  
   - Process: Evaluate and filter permitted categories  
   - Outputs: Category dropdown limited to permissions  

4. Pending Approvals Dashboard  
   - Displays all transactions awaiting approval across modules.  
   - Inputs: User role, pending-queue data  
   - Process: Query ‘Pending’ items; aggregate by module  
   - Outputs: Dashboard cards with counts and quick links  

5. Stores Tab  
   - Provides a consolidated view of store operations in a separate tab.  
   - Inputs: Store IDs, inventory snapshots  
   - Process: Load store-specific functions (GRN, GRNR, Transfer)  
   - Outputs: Tabbed menu with store actions  

6. Payroll Journal Automation  
   - Syncs payroll journal entries to ERP as in the legacy system.  
   - Inputs: Journal definition, payroll run ID  
   - Process: Format and post via ERP API  
   - Outputs: ERP confirmation or error log  

7. Fixed Asset Mapping  
   - Links devices to responsible personnel in the asset register.  
   - Inputs: Asset tag, employee ID  
   - Process: Validate asset; assign mapping  
   - Outputs: Assignment confirmation  

8. Decimal Precision Configuration  
   - Ensures numerical fields adhere to corporate decimal standards.  
   - Inputs: Decimal precision (e.g., 2, 4)  
   - Process: Apply formatting to UI and reports  
   - Outputs: Consistent numeric display  

9. Lorry GPS Tracking  
   - Monitors vehicle location in real time during deliveries.  
   - Inputs: GPS feed, lorry ID  
   - Process: Poll GPS endpoint; update coordinates  
   - Outputs: Live map view and path logs  

### Master Files

## 2. Brand Master File

This screen manages product brand definitions, enforcing a hierarchical link to the product hierarchy and supporting full CRUD (Create, Read, Update, Delete).

```json
{\"brsDiagram\": {}}
```

Sample data:
| Brand ID | Brand Name    | Type         |
|---------:|---------------|--------------|
| B001     | SMAK Original | SMAK         |
| B002     | SMAK Zero     | SMAK         |
| B003     | TradeMaster   | TRADING      |
| B004     | RawEssence    | RAW MATERIAL |
| B005     | FillFast      | FILLING      |
| B006     | SnackKing     | TRADING      |
| B007     | RawBlend      | RAW MATERIAL |

- Create Brand  
  • Inputs: Brand Name, Type  
  • Process: Validate uniqueness; Assign Brand ID; Persist record  
  • Outputs: New brand record; Audit log entry  
- Update Brand  
  • Inputs: Brand ID, Updated Fields  
  • Process: Validate changes; Apply updates; Log modifications  
  • Outputs: Updated record  
- Delete Brand  
  • Inputs: Brand ID  
  • Process: Check for linked products; Soft-delete or block  
  • Outputs: Confirmation or error  
- List Brands  
  • Inputs: Filter criteria (Type, Name)  
  • Process: Query and paginate  
  • Outputs: Brand grid  

## 3. Group Master File

Defines product groups, linking upward to brands and downward to categories.

```json
{\"brsDiagram\": {}}
```

Sample data:
| Group ID | Group Name |
|---------:|------------|
| G001     | 190 GLASS  |
| G002     | WATER      |
| G003     | PET        |
| G004     | TETRA      |
| G005     | RAW        |
| G006     | SNACK      |
| G007     | BITE       |

- Create Group  
  • Inputs: Name, Brand  
  • Process: Validate uniqueness; Assign ID; Save  
  • Outputs: New group record  
- Update Group  
  • Inputs: Group ID, New Name  
  • Process: Validate; Update; Log changes  
  • Outputs: Updated record  
- Delete Group  
  • Inputs: Group ID  
  • Process: Check linked categories/products; Block or soft-delete  
  • Outputs: Success or blocking message  
- List Groups  
  • Inputs: Search criteria  
  • Process: Filter, sort  
  • Outputs: Group grid  

## 4. Category Master File

Captures product categories for further sub-classification.

```json
{\"brsDiagram\": {}}
```

Sample data:
| Category ID | Category Name |
|------------:|---------------|
| C001        | 190 FRUIT     |
| C002        | 190 MILK      |
| C003        | WATER         |
| C004        | TETRA         |
| C005        | HOT & SPICY   |
| C006        | KISSES        |
| C007        | OTHER         |

- Create Category: inputs (Name, Group); process (validate, save); outputs (new record)  
- Update Category: inputs (ID, New Name); process (validate, update); outputs (updated record)  
- Delete Category: inputs (ID); process (check dependencies); outputs (result)  
- List Categories: inputs (filters); process (query); outputs (grid)  

## 5. Sub Category Master File

Handles sub-categories, linked directly to categories.

```json
{\"brsDiagram\": {}}
```

Sample data:
| SubCat ID | SubCategory  |
|----------:|--------------|
| SC001     | MILK         |
| SC002     | FRUIT LABEL  |
| SC003     | LID          |
| SC004     | CONTAINER    |
| SC005     | CAP          |
| SC006     | WRAPPER      |
| SC007     | BOX          |

- Create Sub Category: inputs (Name, Category); process (validate, save); outputs (new record)  
- Update Sub Category: inputs (ID, New Name); process (validate, update); outputs (updated record)  
- Delete Sub Category: inputs (ID); process (dependency check); outputs (status)  
- List Sub Categories: inputs (search); process (query); outputs (grid)  

## 6. Product Master File

Central screen for products, linking sub-category and category; Brand and Group are auto-filled.

```json
{\"brsDiagram\": {}}
```

Sample data:
| Prod ID | Code   | Name           | Brand       | Group     | Category   | SubCategory | Capacity (L) | QC  | Expiry | BatchType | PriceLvl1 |
|--------:|--------|----------------|-------------|-----------|------------|-------------|-------------:|-----|--------|-----------|----------|
| P001    | SMK100 | Smak Cola      | SMAK        | 190 GLASS | 190 FRUIT  | LID         | 0.33         | Yes | No     | FIFO      | 1.00      |
| P002    | SMK200 | Smak Diet Cola | SMAK        | 190 GLASS | 190 FRUIT  | CAP         | 0.33         | Yes | No     | FIFO      | 1.10      |
| P003    | TRD01  | Trade Orange   | TRADING     | PET       | WATER      | CONTAINER   | 0.5          | No  | No     | FIFO      | 0.80      |
| P004    | RAWB01 | Raw Batch Milk | RAW MATERIAL| RAW       | 190 MILK   | BOX         | 1.0          | No  | Yes    | Batch     | 0.95      |
| P005    | FLT01  | FillFast Juice | FILLING     | TETRA     | TETRA      | WRAPPER     | 1.5          | Yes | No     | FIFO      | 1.50      |
| P006    | SNK01  | Snack Bite     | TRADING     | SNACK     | HOT & SPICY| CAP         | 0.0          | No  | No     | FIFO      | 0.50      |
| P007    | RAWP01 | Pulp Raw Mix   | RAW MATERIAL| RAW       | RAW        | CONTAINER   | 10.0         | No  | No     | Batch     | 5.00      |

- Create Product  
  • Inputs: Code; Category; Sub Category; QC Flag; Expiry Flag; Capacity; Batch Type  
  • Process: Auto-fill Brand/Group; Validate codes, capacity; Persist record  
  • Outputs: New product record  
- Update Product  
  • Inputs: Prod ID; Fields to change  
  • Process: Validate inter-dependencies (e.g., category/sub-category alignment); Save updates  
  • Outputs: Updated record  
- Bulk Price Update  
  • Inputs: Price levels; Effective Date Range  
  • Process: Validate date range; Apply price changes; Log history  
  • Outputs: Price update summary  
- Excel Price Upload/Download  
  • Inputs: Excel template; Mapped columns  
  • Process: Validate data; Persist changes; Provide feedback  
  • Outputs: Success/failure report  
- Discount Free Issue Upload  
  • Inputs: Free issue rules  
  • Process: Validate rule format; Save free issue definitions  
  • Outputs: Confirmation  
- Pulp-to-Raw Mapping  
  • Inputs: Pulp Prod ID; Raw Prod ID; Percentage  
  • Process: Save mapping; Update BOM associations  
  • Outputs: Mapping report  

## 7. QC Parameter Master File

Defines quality control parameters for QC-marked products.

```json
{\"brsDiagram\": {}}
```

Sample data:
| Param ID | Parameter     | Unit    | Min  | Max  |
|---------:|---------------|---------|-----:|-----:|
| Q001     | pH Level      | pH      | 3.5  | 4.5  |
| Q002     | Viscosity     | cP      | 50   | 150  |
| Q003     | Brix          | °Bx     | 8    | 12   |
| Q004     | Moisture      | %       | 0    | 0.5  |
| Q005     | Color         | EBC     | 10   | 20   |
| Q006     | Density       | kg/m³   |1000  |1020  |
| Q007     | Particle Size | microns | 10   |100   |

- Create Parameter: inputs (Name, Unit, Min, Max); process (validate, save); outputs (new param)  
- Update Parameter: inputs (ID, New values); process (validate, save); outputs (updated param)  
- Delete Parameter: inputs (ID); process (dependency check); outputs (result)  
- Link Parameter to Product: inputs (Prod ID, Param IDs); process (assign linkage); outputs (confirmation)  

### Transactions

## 8. Purchase Order Entry

Enter purchase orders, enforcing QC/Non-QC separation, multi-level approvals, certificate checks, and notifications.

```json
{\"brsDiagram\": {}}
```

**Functions and business rules:**
- QC/Non-QC Validation: prevent mixing; show popup on violation.  
- Approval Workflow: Data Entry → Purchasing Manager → Finance; support bulk-PO interface; track approval serial.  
- Validity & Certificates: block if certificate missing or expired; select validity window per PO line.  
- Email Notifications: generate PO PDF; email supplier; notify Purchasing Manager on pending approval.  

## 9. QC Approve Entry

Process QC approvals for QC-marked purchase orders with document attachments and parameter inputs.

```json
{\"brsDiagram\": {}}
```

- Display only POs containing QC items  
- Product-wise grid for analysis report & internal doc attachments  
- Outcomes: Total Approve, Partial Approve/Reject, Total Reject  
- Enter QC parameter values per product  
- Select reject reasons; enter remarks  
- On approval, forward lines to GRN module  

## 10. Goods Received Note

Record receipt of goods, capture manufacturing/expiry dates, handle barcode stickers, invoice linking, and quantity enforcement.

```json
{\"brsDiagram\": {}}
```

- GRN Entry:  
  • Mandatory dates for expiry products  
  • Capture supplier invoice details  
  • Enforce PO line quantity limits  
  • Block receipts against expired or invalid POs  
- Barcode Printing: configurable copies per item  
- Invoice Handling: option for with/without invoice; update supplier balances only if invoiced  
- Batch Management: assign internal batch numbers; link to product and PO lines  

### Reports

No dedicated report screens are defined in Stock & Sales. Key report requirements are handled via dashboards and BI tools, including the Pending Approvals Dashboard (see Common Configuration) and may be extended in future phases.

# Accounts Receivable Module

This module manages customer credit transactions, ensuring accurate invoice posting, receipt processing, credit memo handling, and comprehensive reporting for aged balances and statements.

```json
{\"brsDiagram\": {}}
```

## 1. Customer Master File

Manages customer definitions, credit terms, and contact details.

```json
{\"brsDiagram\": {}}
```

Sample data:
| Customer ID   | Name             | Terms (Days) | Credit Limit | Region | Sales Rep | Status   |
|--------------:|------------------|-------------:|-------------:|-------|----------|----------|
| CUST001       | Alpha Corp       | 30           | 50000       | North  | John Doe | Active   |
| CUST002       | Beta Traders     | 45           | 75000       | East   | Jane Roe | Active   |
| CUST003       | Gamma Supplies   | 60           |100000       | South  | Jim Poe  | On Hold  |
| CUST004       | Delta Retail     | 30           | 25000       | West   | Anna Lee | Active   |
| CUST005       | Epsilon Foods    | 90           |150000       | North  | Bob Ray  | Active   |
| CUST006       | Zeta Beverages   | 30           | 80000       | East   | Lily May | Closed   |
| CUST007       | Eta Manufacturers| 60           |120000       | South  | Mark Jay | Active   |

- Create Customer:  
  • Inputs: Name, Address, Contact Info, Terms, Credit Limit, Region, Sales Rep  
  • Process: Validate mandatory fields; Check duplicate names; Assign Customer ID  
  • Outputs: Customer record; Audit log entry  
- Update Customer:  
  • Inputs: Customer ID, Updated fields  
  • Process: Validate changes; Apply updates; Log modifications  
  • Outputs: Updated customer record  
- Delete Customer:  
  • Inputs: Customer ID  
  • Process: Check open invoices/receipts; Soft-delete if none; Block otherwise  
  • Outputs: Deletion confirmation or block message  
- List Customers:  
  • Inputs: Filter by status, region, sales rep  
  • Process: Query and paginate  
  • Outputs: Customer grid  

## 2. AR Invoice Entry

Captures and posts customer invoices with line-level detail, taxes, and discounts.

```json
{\"brsDiagram\": {}}
```

Sample layout:
| Field         | Description                             |
|--------------|------------------------------------------|
| Invoice No   | System-generated unique identifier       |
| Customer ID  | Linked to Customer Master                |
| Date         | Invoice date (must be ≤ today)           |
| Due Date     | Date = Invoice Date + Terms Days         |
| Tax Code     | Selectable per line; default from settings |
| Discount %   | If applicable; auto-calculated on total  |
| Currency     | Default or customer preference           |
| Total Amount | Sum of line amounts + tax – discount     |

- Inputs: Customer ID, Invoice Date, Items (Product, Qty, Rate), Taxes, Discounts  
- Process:  
  1. Validate Customer status and credit limit  
  2. Calculate line amounts, taxes, discounts  
  3. Accumulate totals; Generate invoice number  
  4. Post to AR sub-ledger and GL via interface  
- Outputs: Invoice PDF; Ledger posting confirmation  

Business Rules:  
- Invoice Date cannot be in the future  
- Total AR balance must not exceed credit limit  
- Currency exchange rates applied at posting  

## 3. Customer Receipt Entry

Records customer payments, applies against open invoices, and handles over/under payments.

```json
{\"brsDiagram\": {}}
```

- Inputs: Receipt Date, Customer ID, Payment Method, Amount, Bank/Cash Account, Allocation details (Invoice No, Amount)  
- Process:  
  1. Validate open invoices  
  2. Allocate amounts; Calculate discounts/round-offs  
  3. Post receipt to AR and GL; Update customer balance  
  4. Handle unapplied amounts (suspense account)  
- Outputs: Receipt voucher; GL posting confirmation  

Business Rules:  
- Receipt Date ≤ Today  
- Overpayments stored in suspense account; Must clear within 30 days  

## 4. AR Credit Memo Entry

Issues credit memos for returns, billing errors, or adjustments.

```json
{\"brsDiagram\": {}}
```

- Inputs: Reference Invoice No, Reason Code, Date, Line items & amounts  
- Process:  
  1. Validate original invoice  
  2. Generate credit memo number  
  3. Post to AR and GL  
- Outputs: Credit memo document; Ledger update  

Business Rules:  
- Credit memos reduce open invoice balances  
- Cannot exceed original invoice amounts  

## 5. AR Aging Report

Provides aging buckets of outstanding receivables.

```json
{\"brsDiagram\": {}}
```

- Inputs: As-of Date, Aging intervals (e.g., 0–30, 31–60)  
- Process: Query open AR balances; Bucket by due date intervals  
- Outputs: Aging grid by customer; Export to PDF/Excel  

## 6. AR Ledger Report

Displays detailed AR transactions per customer.

```json
{\"brsDiagram\": {}}
```

- Inputs: Customer ID (optional), Date range  
- Process: Fetch invoices, receipts, memos; Sort by date  
- Outputs: Transaction ledger; Balance carry-forward  

## 7. Customer Statement Report

Generates customer-specific statements showing opening balance, transactions, and closing balance.

```json
{\"brsDiagram\": {}}
```

- Inputs: Customer ID, Statement period, Delivery method (Email/PDF)  
- Process: Compile AR ledger; Format statement  
- Outputs: Statement document; Email dispatch if configured  

# Accounts Payable Module

This module governs vendor-related transactions, from master data to invoice posting, payments, credit notes, and reporting on payables and aging.

```json
{\"brsDiagram\": {}}
```

## 1. Vendor Master File

Maintains vendor details, payment terms, and banking information.

```json
{\"brsDiagram\": {}}
```

Sample data:
| Vendor ID | Name            | Terms (Days) | Currency | Bank Account         | Contact     | Status   |
|----------:|-----------------|-------------:|---------|----------------------|-------------|----------|
| VEND001   | Acme Suppliers  | 30           | USD      | 123-456-789 (Bank A) | Alice King  | Active   |
| VEND002   | BuildIt Ltd     | 45           | EUR      | 987-654-321 (Bank B) | Bob Smith   | Active   |
| VEND003   | CoreWare Inc    | 60           | GBP      | 555-666-777 (Bank C) | Carol Doe   | On Hold  |
| VEND004   | DataLink        | 30           | USD      | 222-333-444 (Bank D) | Dan Lee     | Active   |
| VEND005   | EquipMart       | 60           | USD      | 888-999-000 (Bank E) | Emma White  | Closed   |
| VEND006   | FreshFoods      | 30           | USD      | 111-222-333 (Bank F) | Frank Hall  | Active   |
| VEND007   | GranCore        | 90           | EUR      | 444-555-666 (Bank G) | Grace Kim   | Active   |

- Create Vendor:  
  • Inputs: Name, Address, Terms, Bank Details, Currency, Contact  
  • Process: Validate uniqueness; Assign Vendor ID; Persist  
  • Outputs: New vendor record  
- Update Vendor:  
  • Inputs: Vendor ID, Updated fields  
  • Process: Validate; Update record; Log audit  
  • Outputs: Updated vendor record  
- Delete Vendor:  
  • Inputs: Vendor ID  
  • Process: Check open payables; Soft-delete or block  
  • Outputs: Confirmation or error  
- List Vendors:  
  • Inputs: Filter by status, currency  
  • Process: Query; Paginate  
  • Outputs: Vendor grid  

## 2. AP Invoice Entry

Records and posts vendor invoices, taxes, and rebates.

```json
{\"brsDiagram\": {}}
```

- Inputs: Vendor ID, Invoice Number, Date, Items (Product/Service, Qty, Rate), Tax Codes, Discounts  
- Process:  
  1. Validate vendor status; Invoice date ≤ Today  
  2. Calculate line totals, tax, discount  
  3. Accumulate totals; Generate AP reference  
  4. Post to AP sub-ledger and GL  
- Outputs: Invoice register; Posting confirmation  

Business Rules:  
- Duplicate invoice prevention via vendor+invoice number combination  
- Tax codes must match vendor jurisdiction  

## 3. AP Payment Entry

Captures payments to vendors, supports checks, electronic transfers, and advances.

```json
{\"brsDiagram\": {}}
```

- Inputs: Payment Date, Vendor ID, Payment Method, Bank Account, Amount, Allocation (Invoice Nos)  
- Process:  
  1. Validate open AP invoices  
  2. Allocate payment; Calculate early payment discounts  
  3. Generate payment document; Post to AP and GL  
- Outputs: Payment advice; GL posting confirmation  

Business Rules:  
- Payment date ≤ Today; Cannot exceed open AP balance  
- Early payment discounts applied automatically based on terms  

## 4. AP Credit Note Entry

Processes vendor credit notes for returns or adjustments.

```json
{\"brsDiagram\": {}}
```

- Inputs: Reference AP Invoice, Credit Note No, Date, Amount  
- Process:  
  1. Validate original invoice existence  
  2. Post credit note to AP and GL  
- Outputs: Credit note register; Ledger update  

Business Rules:  
- Credit note amount cannot exceed original AP invoice  

## 5. AP Aging Report

Lists outstanding vendor payables by aging buckets.

```json
{\"brsDiagram\": {}}
```

- Inputs: As-of Date, Buckets (0–30,31–60,61–90,>90)  
- Process: Query open AP balances; Bucket by due date  
- Outputs: Aging grid; Export options  

## 6. AP Ledger Report

Displays detailed vendor transaction history.

```json
{\"brsDiagram\": {}}
```

- Inputs: Vendor ID (optional), Date Range  
- Process: Fetch invoices, payments, credits; Sort chronologically  
- Outputs: Vendor ledger; Opening/closing balances  

## 7. Vendor Statement Report

Generates payable statements for vendors, showing transactions and balances.

```json
{\"brsDiagram\": {}}
```

- Inputs: Vendor ID, Statement Period, Delivery Method  
- Process: Compile AP ledger; Format statement  
- Outputs: Statement document; Email dispatch  

# Manufacturing Module

This module facilitates production planning and execution, from BOM and routing setup to work order processing and reporting on capacity and WIP.

```json
{\"brsDiagram\": {}}
```

## 1. Bill of Materials Master File

Defines product composition and component quantities.

```json
{\"brsDiagram\": {}}
```

Sample data:
| BOM ID  | Product ID | Version | Effective Date | Status   | Description           | Total Cost |
|--------:|------------|--------:|---------------|----------|-----------------------|-----------:|
| BOM001  | P001       | 1.0     | 2024-01-01    | Released | Smak Cola BOM         | 0.45       |
| BOM002  | P002       | 1.0     | 2024-01-01    | Released | Smak Diet Cola BOM    | 0.48       |
| BOM003  | P003       | 1.0     | 2024-01-05    | Released | Trade Orange BOM      | 0.30       |
| BOM004  | P004       | 2.0     | 2024-02-01    | Released | Raw Batch Milk BOM    | 0.70       |
| BOM005  | P005       | 1.0     | 2024-03-10    | Released | FillFast Juice BOM    | 0.65       |
| BOM006  | P006       | 1.0     | 2024-03-15    | Released | Snack Bite BOM        | 0.20       |
| BOM007  | P007       | 1.0     | 2024-04-01    | Released | Pulp Raw Mix BOM      | 4.50       |

- Create BOM: inputs (Product ID, Version, Components); process (validate, calculate cost); outputs (new BOM)  
- Update BOM: inputs (BOM ID, component changes); process (recalculate cost, validate version); outputs (updated BOM)  
- Delete BOM: inputs (BOM ID); process (check WO dependencies); outputs (status)  
- List BOMs: inputs (Product ID, Version); process (filter); outputs (BOM list)  

## 2. Routing Master File

Specifies manufacturing steps, work centers, and standard times.

```json
{\"brsDiagram\": {}}
```

Sample data:
| Routing ID | Operation Seq | Work Center | Std Time (min) | Description         | Status    | Setup Time (min) |
|-----------:|--------------:|-------------|---------------:|---------------------|-----------|-----------------:|
| ROUT001    | 10            | Mixer       | 15             | Initial mixing      | Released  | 5                |
| ROUT001    | 20            | Filler      | 10             | Fill bottles        | Released  | 2                |
| ROUT001    | 30            | Capper      | 5              | Cap placement       | Released  | 1                |
| ROUT002    | 10            | Mixer       | 20             | Diet mixing         | Released  | 5                |
| ROUT002    | 20            | Filler      | 12             | Fill bottles        | Released  | 2                |
| ROUT002    | 30            | Capper      | 6              | Cap placement       | Released  | 1                |
| ROUT003    | 10            | Blender     | 25             | Orange pulp blend   | Released  | 4                |

- Create Routing: inputs (Product ID, Ops Seq, Work Centers, Times); process (validate sequences); outputs (new routing)  
- Update Routing: inputs (Routing ID, changes); process (validate, save); outputs (updated routing)  
- Delete Routing: inputs (Routing ID); process (dependency check); outputs (status)  
- List Routings: inputs (Product ID); process (filter); outputs (routing steps)  

## 3. Work Order Entry

Initiates production orders based on demand.

```json
{\"brsDiagram\": {}}
```

- Inputs: WO Number (auto), Product ID, Quantity, Start Date, End Date  
- Process:  
  1. Validate BOM and routing availability  
  2. Check material availability  
  3. Reserve components; Generate WIP transaction  
- Outputs: Work order confirmation; Material reservation report  

Business Rules:  
- WO date range must be within planning horizon  
- Partial WO splits create child orders  

## 4. Material Issue Transaction

Issues components from inventory to WIP for a specific WO.

```json
{\"brsDiagram\": {}}
```

- Inputs: WO Number, Component List, Quantities  
- Process:  
  1. Validate available stock  
  2. Deduct inventory; Create stock issue postings  
  3. Update WO component status  
- Outputs: Issue note; WIP component consumption log  

Business Rules:  
- Cannot issue more than required  
- Backflush option at completion  

## 5. Production Completion Transaction

Completes production, moves finished goods to inventory, calculates variances.

```json
{\"brsDiagram\": {}}
```

- Inputs: WO Number, Completed Qty, Scrap Qty, Yield Qty  
- Process:  
  1. Validate WO and issued qty  
  2. Issue scrap; Post finished goods; Reverse WIP  
  3. Calculate cost variances  
- Outputs: Completion confirmation; Variance report  

Business Rules:  
- Negative scrap not allowed  
- Variances posted to cost-of-production accounts  

## 6. Production Schedule Report

Lists planned and released work orders by date.

```json
{\"brsDiagram\": {}}
```

- Inputs: Date range, Plant/Line filter  
- Process: Query WOs; Group by status and date  
- Outputs: Gantt-style schedule; Export to PDF/Excel  

## 7. WIP Report

Displays Work-in-Progress balances and statuses.

```json
{\"brsDiagram\": {}}
```

- Inputs: WO Number (optional), As-of Date  
- Process: Summarize WIP component consumption and FG receipts  
- Outputs: WIP summary grid; Detail drill-down  

# Petty Cash Module

This module manages petty cash transactions, vouchers, fund balances, and replenishment processes.

```json
{\"brsDiagram\": {}}
```

## 1. Petty Cash Fund Master File

Defines petty cash funds per location with limits and approvers.

```json
{\"brsDiagram\": {}}
```

Sample data:
| Fund ID | Location   | Custodian     | Limit   | Currency | Status   | Approval Hierarchy      |
|--------:|------------|---------------|--------:|----------|----------|------------------------|
| PCF001   | HQ Office  | John Cash     | 1000.00 | USD      | Active   | Custodian → Finance    |
| PCF002   | Plant A    | Mary Funds    | 2000.00 | USD      | Active   | Custodian → Plant Mgr  |
| PCF003   | Plant B    | Steve Chips   | 1500.00 | USD      | On Hold  | Custodian → Finance    |
| PCF004   | Warehouse  | Nancy Vault   | 500.00  | USD      | Active   | Custodian → Warehouse  |
| PCF005   | Branch X   | Alice Tills   | 800.00  | USD      | Active   | Custodian → Branch Mgr |
| PCF006   | Branch Y   | Bob Coins     | 1200.00 | USD      | Closed   | Custodian → Finance    |
| PCF007   | Plant C    | Carol Tokens  | 1800.00 | USD      | Active   | Custodian → Maintenance|

- Create Fund: inputs (Location, Custodian, Limit, Currency, Approvers); process (validate, save); outputs (new fund)  
- Update Fund: inputs (Fund ID, fields); process (validate, update); outputs (updated)  
- Delete Fund: inputs (Fund ID); process (check open vouchers); outputs (status)  
- List Funds: inputs (filters); process (query); outputs (grid)  

## 2. Petty Cash Voucher Entry

Captures petty cash expenditures with receipts and approvals.

```json
{\"brsDiagram\": {}}
```

- Inputs: Voucher No (auto), Fund ID, Date, Payee, Amount, Purpose, Receipts (attachments)  
- Process:  
  1. Validate fund balance  
  2. Assign voucher number; Post to petty cash ledger  
  3. Route for approvals per hierarchy  
- Outputs: Voucher record; Approval notification  

Business Rules:  
- Voucher amount ≤ remaining fund balance  
- Receipts mandatory for amounts > $50  

## 3. Petty Cash Replenishment Request

Requests replenishment when fund balance falls below threshold.

```json
{\"brsDiagram\": {}}
```

- Inputs: Fund ID, Current Balance, Requested Amount, Reason  
- Process:  
  1. Calculate threshold trigger  
  2. Generate replenishment request; Route to Finance  
- Outputs: Replenishment request; Email to Finance  

Business Rules:  
- Threshold = 20% of initial fund limit  
- Maximum replenishment = original fund limit  

## 4. Petty Cash Journal Report

Displays all petty cash vouchers and replenishments.

```json
{\"brsDiagram\": {}}
```

- Inputs: Fund ID (optional), Date Range  
- Process: Fetch vouchers, payments, replenishments; Compile journal  
- Outputs: Journal report; Export options  

## 5. Petty Cash Balance Report

Shows current balances and outstanding vouchers by fund.

```json
{\"brsDiagram\": {}}
```

- Inputs: Fund ID (optional), As-of Date  
- Process: Summarize transactions; Calculate balances  
- Outputs: Balance grid; Drill-down links  

# Sugar Tax Module

This module calculates and reports sugar tax liabilities based on product formulations and regulatory requirements.

```json
{\"brsDiagram\": {}}
```

## 1. Sugar Tax Rate Master File

Maintains sugar tax rates per product category and jurisdiction.

```json
{\"brsDiagram\": {}}
```

Sample data:
| Rate ID | Category      | Jurisdiction | Effective Date | Rate per Kg | Status   | Note               |
|--------:|---------------|-------------|---------------|-------------:|----------|--------------------|
| STR001   | 190 FRUIT     | Country A   | 2023-01-01    | 0.05         | Active   | Annual review      |
| STR002   | 190 MILK      | Country A   | 2023-01-01    | 0.04         | Active   |                    |
| STR003   | WATER         | Country A   | 2023-01-01    | 0.00         | Active   | Zero-rated         |
| STR004   | HOT & SPICY   | Country A   | 2024-01-01    | 0.06         | Active   | Adjusted for VAT   |
| STR005   | RAW MATERIAL  | Country A   | 2024-01-01    | 0.03         | Active   |                    |
| STR006   | TETRA         | Country A   | 2023-06-01    | 0.05         | Active   | Mid-year update    |
| STR007   | SNACK         | Country A   | 2023-01-01    | 0.07         | Active   | Includes packaging |

- Create Rate: inputs (Category, Jurisdiction, Effective Date, Rate); process (validate, save); outputs (new rate)  
- Update Rate: inputs (Rate ID, changed fields); process (version control); outputs (updated)  
- Delete Rate: inputs (Rate ID); process (dependency check); outputs (status)  
- List Rates: inputs (filters); process (query); outputs (rate grid)  

## 2. Sugar Tax Calculation Screen

Calculates sugar tax for products based on recipe and volume.

```json
{\"brsDiagram\": {}}
```

- Inputs: Product ID, Batch Size (kg), Sugar Content % (auto from QC data), Jurisdiction  
- Process:  
  1. Fetch sugar tax rate  
  2. Compute tax = Batch Size × Sugar % × Rate per Kg  
  3. Display calculation breakdown  
- Outputs: Tax amount; Calculation report  

Business Rules:  
- Use latest effective rate as of production date  
- If sugar content > 15%, surcharge of 10% on computed tax  

## 3. Sugar Tax Return Submission

Aggregates tax liabilities and prepares regulatory filings.

```json
{\"brsDiagram\": {}}
```

- Inputs: Period (Month/Quarter), Jurisdiction  
- Process:  
  1. Summarize tax per product and period  
  2. Validate against general ledger postings  
  3. Generate return file per regulatory format  
- Outputs: Submission document; Filing summary  

Business Rules:  
- Returns due within 15 days of period end  
- Late filings incur penalty calculations  

## 4. Sugar Tax Liability Report

Shows period-to-date and projected sugar tax liabilities.

```json
{\"brsDiagram\": {}}
```

- Inputs: Period, Jurisdiction  
- Process: Aggregate computed taxes; Compare actual vs projected  
- Outputs: Liability summary; Variance analysis  

## 5. Sugar Tax Return History Report

Lists past submissions, statuses, and payments.

```json
{\"brsDiagram\": {}}
```

- Inputs: Jurisdiction (optional), Year  
- Process: Query return records; Sort by date  
- Outputs: Returns history; Downloadable attachments  

# NOTES

1. Add comprehensive module sections for Accounts Receivable, Accounts Payable, Manufacturing, Petty Cash, and Sugar Tax, each with master files, transactions, reports, business rules, and process details as specified in the user notes.  
2. Restructure the Stock & Sales module to have clearly separated sub-sections: Common, Master Files, Transactions, and Reports, and ensure all details (business rules, formulas, approval flows) are included under the correct headings.  
3. Move any master files, screens, or transactions that belong to other modules out of Stock & Sales and into their respective new modules.  
4. Add an updated overview at the top of the document explaining the inclusion of all modules, the reconstruction rationale, and referencing the unedited user notes at the bottom for full context.  
5. Ensure every business rule, formula, screen and data validation requirement, report, master file structure, and process flow from the notes are captured accurately in the correct module section.  
6. Update or create a table of contents to accurately reflect all modules and sections as now covered by the document.  
7. Use professional sectioning and clear module boundaries throughout, following the detailed notes for organization and clarity.  
8. At the very end of the document, add a section titled \"NOTES\" and include the user's notes exactly as supplied, without shortening or paraphrasing.  
9. Apply all detailed requirements from the user's notes to their respective sections in the BRS, ensuring completeness and accuracy.