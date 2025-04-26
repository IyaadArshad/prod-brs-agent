# Stock and Sales Module

## 1. Dashboard

The dashboard provides a centralized view of pending tasks and operational metrics, letting users quickly act on approvals, monitor deliveries, and access key reports.

```json
{\"brsDiagram\": {}}
```

**Pending Approvals Widget**

Short summary: Lists all transactions awaiting user approval, grouped by module and priority.

Inputs:
- Current user’s roles and group assignments
- Approval status filter = “Pending”

Process:
1. Query all transactions where status = “Pending” and approver group matches user
2. Sort by creation date ascending
3. Aggregate counts per module

Outputs:
- A table of pending items with:
  • Approval ID
  • Module Name
  • Created By
  • Created Date
  • Priority

Sample data:

| Approval ID | Module              | Created By | Created Date | Priority | Status  |
|-------------|---------------------|------------|--------------|----------|---------|
| APPR-001    | Purchase Order      | jdoe       | 2024-06-10   | High     | Pending |
| APPR-002    | QC Approval         | asmith     | 2024-06-11   | Medium   | Pending |
| APPR-003    | Goods Received Note | jdoe       | 2024-06-12   | Low      | Pending |
| APPR-004    | Damage Return       | bwong      | 2024-06-13   | High     | Pending |
| APPR-005    | Service Invoice     | asmith     | 2024-06-14   | Medium   | Pending |
| APPR-006    | Goods Transfer      | jdoe       | 2024-06-15   | Low      | Pending |
| APPR-007    | Invoice Entry       | bwong      | 2024-06-16   | High     | Pending |

**Lorry GPS Tracking Module**

Short summary: Displays live location and status of each delivery lorry on map and list.

Inputs:
- Lorry ID from GPS device feed
- Latitude, Longitude, Timestamp, Speed

Process:
1. Receive feed via secure endpoint every minute
2. Validate timestamp (reject future times)
3. Persist record in `lorry_tracking` table
4. Query latest coordinate per lorry for display

Outputs:
- Map markers showing real-time position
- List view with latest status per vehicle

Sample data:

| Lorry ID | Timestamp           | Latitude | Longitude | Speed (km/h) | Status   |
|----------|---------------------|----------|-----------|--------------|----------|
| LRY-001  | 2024-06-16 08:15:00 | 6.9271   | 79.8612   | 45           | En Route |
| LRY-002  | 2024-06-16 08:16:00 | 6.9275   | 79.8620   | 0            | Idle     |
| LRY-003  | 2024-06-16 08:17:00 | 6.9280   | 79.8630   | 60           | En Route |
| LRY-004  | 2024-06-16 08:18:00 | 6.9285   | 79.8640   | 30           | En Route |
| LRY-005  | 2024-06-16 08:19:00 | 6.9290   | 79.8650   | 0            | At Depot |
| LRY-006  | 2024-06-16 08:20:00 | 6.9295   | 79.8660   | 50           | En Route |
| LRY-007  | 2024-06-16 08:21:00 | 6.9300   | 79.8670   | 55           | En Route |

**Data Entry Period Control Module**

Short summary: Enforces start/end dates for data entry per module and user group.

Inputs:
- Module code (e.g., “PO”, “GRN”)
- User group ID
- Current system date

Process:
1. Retrieve allowed date range from `entry_period` table
2. Compare current date to range
3. Grant or deny data entry access

Outputs:
- Access flag: Allowed / Denied
- If denied, user sees \"Entry period closed for this module\"

**Audit Trail Viewer Module**

Short summary: Displays log of all user actions for compliance and troubleshooting.

Inputs:
- Date range
- Module filter
- User filter

Process:
1. Query `audit_log` table for matching records
2. Paginate by 50 entries per page
3. Group by action type for summary view

Outputs:
- Table with:
  • Timestamp
  • Username
  • Action (Create/Update/Delete/Approve)
  • Affected Record ID


## 2. Common Settings

This screen lets administrators configure global parameters—data entry windows, audit trail retention, material-issue permissions, and numerical precision—to align with company policy and legacy behavior.

```json
{\"brsDiagram\": {}}
```

**Form Fields & Validation**

| Field Name                   | Data Type | Required | Validation Rules                            | Editable By      |
|------------------------------|-----------|----------|---------------------------------------------|------------------|
| Data Entry Module            | Dropdown  | Yes      | Must select one of configured modules       | Admin Group      |
| User Group                   | Multi-select | Yes   | Must choose at least one user group         | Admin Group      |
| Start Date                   | Date      | Yes      | Cannot be in the past                       | Admin Group      |
| End Date                     | Date      | Yes      | Must be ≥ Start Date                        | Admin Group      |
| Audit Trail Retention (days) | Integer   | Yes      | 1–365                                       | Audit Admin      |
| Decimal Places               | Integer   | Yes      | 0–6                                         | Admin Group      |
| Material Issue Category      | Multi-select | No   | Values from `issue_category` master file    | Warehouse Admin  |

**Data Entry Period Control**

Inputs:
- Selected module
- Selected user groups
- Defined date range

Process:
1. Save to `entry_period` master table
2. Enforce checks on transaction screens

Outputs:
- New or updated period entry
- Confirmation message

**Material Issue Category Permission**

Inputs:
- Issue categories
- User group assignments

Process:
1. Map categories to groups in `issue_permission` table
2. Enforce permission on Material Issue screens

Outputs:
- Access granted/denied per category


## 3. Brand Master

Allows creation and maintenance of product brands—SMAK, TRADING, RAW MATERIAL, FILLING—forming the top level of the product hierarchy.

```json
{\"brsDiagram\": {}}
```

**Brand Management Modules**

**Add Brand**

Inputs:
- Brand Code (text, unique)
- Brand Name (text)
- Brand Type (enum: SMAK/TRADING/RAW MATERIAL/FILLING)
- Active Flag (checkbox)

Process:
1. Validate code uniqueness
2. Insert into `brand_master`

Outputs:
- New brand record
- Success or error message

**Edit Brand**

Inputs:
- Selected Brand Code
- Editable fields (Name, Type, Active)

Process:
1. Validate changes (e.g., type still in allowed list)
2. Update record

Outputs:
- Updated record
- Change log in audit trail

**Delete Brand**

Inputs:
- Selected inactive brand code

Process:
1. Check no products are linked
2. Mark as deleted or inactive

Outputs:
- Soft-delete flag set

**Sample Brands**

| Brand Code | Brand Name      | Brand Type    | Active | Created Date | Modified Date |
|------------|-----------------|---------------|--------|--------------|---------------|
| BR001      | Smak Original   | SMAK          | Yes    | 2024-01-10   | 2024-04-05    |
| BR002      | Trading Delight | TRADING       | Yes    | 2024-02-15   | 2024-05-01    |
| BR003      | RawEssence      | RAW MATERIAL  | No     | 2023-11-20   | 2024-03-12    |
| BR004      | FillMaster      | FILLING       | Yes    | 2024-03-08   | 2024-06-01    |
| BR005      | Smak Plus       | SMAK          | Yes    | 2024-01-25   | 2024-05-10    |
| BR006      | Trading Pro     | TRADING       | Yes    | 2024-02-28   | 2024-06-08    |
| BR007      | RawRich         | RAW MATERIAL  | No     | 2023-12-05   | 2024-04-20    |


## 4. Group Master

Manages sub-categories of brands—190 GLASS, WATER, PET, TETRA, RAW, SNACK, BITE—and links each to a brand.

```json
{\"brsDiagram\": {}}
```

**Group Management**

Inputs:
- Group Code (unique)
- Group Name (text)
- Brand Code (dropdown)
- Active Flag

Process:
1. Ensure brand exists and is active
2. Insert/update `group_master`

Outputs:
- List of all groups
- Audit entry

Sample data omitted for brevity (same pattern as Brand Master).


## 5. Category Master

Defines product categories—190 FRUIT, 190 MILK, WATER, TETRA, HOT & SPICY, KISSES—linked to a group.

```json
{\"brsDiagram\": {}}
```

Similar modules to Brand/Group with fields: Category Code, Name, Group Code, Active.


## 6. Subcategory Master

Captures the lowest level—MILK, FRUIT LABEL, LID, CONTAINER—linked to category only.

```json
{\"brsDiagram\": {}}
```

Fields: Subcategory Code, Name, Category Code, Active.


## 7. Product Master

Central screen for product definition, auto-populating brand/group from selected subcategory and handling QC flags, capacity, expiry, pricing tiers, WIP/Pulp mapping.

```json
{\"brsDiagram\": {}}
```

**Key Inputs**
- Product Code (unique)
- Name
- Subcategory Code (dropdown)
- Capacity (L or Kg)
- QC Flag (Yes/No)
- Expiry Required (Yes/No)
- Batch Type (Batch/FIFO)
- Pricing Levels (table upload)
- Conversion % for Pulp
- Validity Period Code

**Processes**
1. Auto-fill Brand & Group from hierarchy
2. Validate expiry rules
3. Upload multiple price levels via Excel parser
4. Save mapping for WIP/Pulp

**Outputs**
- Searchable product list
- Downloadable Excel template for price upload


## 8. QC Parameter Master

Maintains quality-check parameters for QC inspections.

```json
{\"brsDiagram\": {}}
```

Fields: Parameter Code, Name, Measurement Unit, Min/Max Values, Linked Products.


## 9. Purchase Order Entry

Allows creation of new purchase orders, enforcing QC vs non-QC separation, validity periods, certificate checks, and multi-level approvals.

```json
{\"brsDiagram\": {}}
```

**Inputs**
- PO Number (auto)
- Supplier Code
- Order Date
- Validity Period (dropdown)
- Line Items: Product, Quantity, QC Flag, Attached Certificate

**Validation**
- Reject mixed QC and non-QC in single PO
- Block if certificate required but not uploaded or expired

**Approval Workflow**
1. Data Entry → Purchasing Manager → Finance
2. Separate bulk-PO approval path

**Outputs**
- Email sent to supplier upon final approval with PO PDF
- Approval serial number recorded


## 10. Purchase Order Approval

Dedicated screen for managers to approve or reject POs with bulk-action and audit trail.

```json
{\"brsDiagram\": {}}
```

**Inputs**
- List of POs pending user’s approval
- Selection checkboxes
- Approval decision (Approve/Reject)
- Comments field

**Process**
1. Update `po_header`.`status` = Approved or Rejected
2. Record approver, timestamp, comments
3. On approval, trigger email and move to next approver or close

**Outputs**
- Updated PO status
- Notification to next role or originator


---

*This initial Business Requirements Specification covers the Stock & Sales Module’s core interfaces and workflows. Further screens for receiving, returns, sales, loading, invoicing, transfers, damage returns, and reporting will follow in subsequent iterations.*