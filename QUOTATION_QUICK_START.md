# Quotation Module - Quick Start Guide

## 🚀 Getting Started

### 1. Access the Module

Navigate to the sidebar → **Sales & Operations** → **Quotations**

You'll see three main entry points:
- **All Quotations** - View and manage quotations (Module 22)
- **Create New** - Create new quotation (Module 19)
- **Pending Approval** - Review pending approvals (Module 23)

### 2. Create a New Quotation (Module 19)

1. Click **"Create New"** button
2. Select a customer from the dropdown
3. Enter shipment details:
   - **Mode**: AIR, SEA, ROAD, or RAIL
   - **Movement**: IMPORT, EXPORT, or DOMESTIC
   - **Incoterms**: EXW, FCA, CPT, CIP, DAP, DDP, FOB, CFR, CIF
4. Select origin and destination ports/locations
5. Add dimensions in the grid:
   - Length (cm), Width (cm), Height (cm)
   - Number of pieces
   - Weight per piece (kg)
   - System calculates: CBM, Volumetric Weight, Chargeable Weight
6. Click **"Save Draft"** to save, or **"Get Costs"** to proceed

### 3. Get Costs (Costing Module - Module 20)

After creating or opening a draft quotation:

1. Click **"Prepare for Costing"** button
2. System automatically:
   - Determines applicable charges (ChargeEngine)
   - Fetches all vendor rates (RateEngine)
   - Converts to INR with current rates (ExchangeRateEngine)
   - Selects Rank 1 (cheapest) vendor
3. Review the costing grid:
   - Each row = one charge
   - Green highlight = Rank 1 (selected) vendor
   - See all vendor options in dropdown
4. Override vendor selections if needed
5. Click **"Finalize Costs"** button

### 4. Approval Workflow (Conditional)

**The system auto-determines if approval is needed:**
- ✅ **Approve automatically** if: Cost ≤ ₹10,000 AND Margin ≥ 10%
- ⏳ **Require approval** if: Cost > ₹10,000 OR Margin < 10%

**If approval required:**
- Quotation moves to **"Pending Approval"** status
- Manager goes to **"Pending Approval"** sidebar link
- Reviews quotation with cost & margin breakdown
- Clicks **"Approve"** (with optional comments) OR **"Reject"** (with mandatory reason)
- If rejected: Returns to Draft status
- If approved: Proceeds to Pricing

### 5. Build Pricing (Pricing Module - Module 21)

1. System shows cost breakdown with suggested sale prices
2. Salesperson can override individual line prices
3. System auto-recalculates:
   - Margin % on each override
   - Total margin for entire quotation
   - Tax based on charge type
4. Add general comments/notes if needed
5. Click **"Finalize Pricing"** to send quotation
6. Status changes to **"Sent"**

### 6. Manage Quotations (Management Module - Module 22)

From the **"All Quotations"** view:

**Search & Filter:**
- Search by Quote ID or Customer name
- Filter by Status (Draft, Pending Costing, Pending Approval, Sent, Won, Lost)
- Filter by Mode (AIR, SEA, ROAD, RAIL)
- Filter by Movement (IMPORT, EXPORT, DOMESTIC)

**Actions:**
- 👁️ **View** - Open quotation details
- 📋 **Duplicate** - Clone as new Draft (same customer/shipment)
- ✅ **Mark Won** - Close quotation as successful
- ❌ **Mark Lost** - Close quotation as unsuccessful
- 🗑️ **Delete** - Remove draft quotation only

### 7. Track Progress

View quotation status in the table:
- **Draft** - Being created
- **Pending Costing** - Waiting for cost finalization
- **Pending Approval** - Awaiting manager review
- **Sent** - Quotation delivered to customer
- **Won** - Customer accepted
- **Lost** - Customer rejected

## 📊 Calculation Examples

### Volumetric Weight Calculation

For AIR freight:
```
Dimensions: 100cm × 50cm × 50cm
Divisor: 167 (for AIR)
Volumetric Weight = (100 × 50 × 50) / 167 = 1,497.60 kg
Actual Weight: 10 kg
Chargeable Weight: MAX(10, 1,497.60) = 1,497.60 kg ✓
```

For SEA freight:
```
Divisor: 1,000 (for SEA)
Volumetric Weight = (100 × 50 × 50) / 1,000 = 250 kg
Actual Weight: 10 kg
Chargeable Weight: MAX(10, 250) = 250 kg ✓
```

### Margin Calculation

```
Total Cost: ₹5,000
Total Sale Price: ₹6,500
Margin = ((6,500 - 5,000) / 5,000) × 100 = 30%
```

### Multi-Currency Example

```
Vendor charges: USD 100 per kg
Chargeable Weight: 500 kg
Exchange Rate: USD 1 = ₹83 INR
Total Cost = 100 × 500 × 83 = ₹4,150,000
```

## 🎨 UI Features

### Status Badge Colors
- **Draft** - Gray
- **Pending Costing** - Blue  
- **Pending Approval** - Yellow
- **Sent** - Purple
- **Won** - Green
- **Lost** - Red

### Real-time Calculations
- Dimensions grid auto-calculates CBM and volumetric weight
- Pricing grid auto-recalculates margin % on price override
- Summary cards show live totals

### Responsive Design
- Works on desktop, tablet, and mobile
- Sidebar collapses on small screens
- Dark mode support

## ⚙️ System Integration

The Quotation Module integrates with:

1. **ChargeEngine** - Determines applicable charges for mode/movement/terms
2. **RateEngine** - Fetches vendor rates matching shipment parameters
3. **MarginEngine** - Calculates suggested sale prices based on margin rules
4. **TaxCalculationEngine** - Computes GST on charges
5. **ExchangeRateEngine** - Provides currency conversion rates
6. **Customer Database** - Links quotations to customers
7. **User Management** - Tracks creator and salesperson

## 🔒 Access Control

The module respects authentication:
- Must be logged in to access
- Features available to authenticated users
- Manager-only features for approval workflow (extensible with roles)

## 📝 Notes

- Quotations support soft delete (audit trail preservation)
- All vendor options stored in JSON for audit trail
- Exchange rates captured at costing time (frozen for comparison)
- Quotations can be duplicated to create similar ones
- Lost quotations stay in system for reporting

## 🐛 Troubleshooting

**Issue: Dimensions aren't calculating**
- Ensure you've entered all three dimensions (L, W, H)
- Check that values are numeric
- Reload the page

**Issue: Costing takes time**
- First costing request fetches from all vendors (API calls)
- Subsequent requests use cached rates
- Large shipments with many charges take longer

**Issue: Approval not triggered**
- Check if Cost ≤ ₹10,000 AND Margin ≥ 10%
- If yes, approval is skipped automatically
- If no, check "Pending Approval" sidebar link

## 📞 Support

For issues or questions:
1. Check the QUOTATION_MODULE_SUMMARY.md for technical details
2. Review the controller code in app/Http/Controllers/
3. Check the React components in resources/js/Pages/Quotations/

---

**Happy Quoting! 🎉**
