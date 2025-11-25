# 📊 SHIPMATE - Master Data Database Structure

**Version:** 1.0  
**Last Updated:** November 22, 2025  
**System:** KPI/Shipmate Logistics Platform

---

## 🎯 Quick Overview

This document describes all **master data tables** in the Shipmate system. Master data is the core reference information used across the entire application for pricing, logistics, and operations.

**Key Points:**
- All tables use auto-incrementing IDs
- Timestamps (created_at, updated_at) track changes
- Active flags allow soft deletion
- Foreign keys maintain data integrity

---

## 📋 Master Data Tables

### 1️⃣ **Unit of Measures** - `unit_of_measures`

**Purpose:** Track all measurement units (kg, meters, liters, etc.)

| Field | Type | Required | Example |
|-------|------|----------|---------|
| id | Integer | ✅ | 1 |
| name | Text | ✅ | "Kilogram" |
| symbol | Text | ✅ | "kg" |
| category | Text | ✅ | Weight, Length, Volume, Count |
| base_uom | Integer | ❌ | 1 (links to parent unit) |
| conversion_factor | Decimal | ✅ | 1.0000 |
| created_at | Timestamp | ✅ | 2025-01-01 10:00:00 |
| updated_at | Timestamp | ✅ | 2025-01-01 10:00:00 |

**Real Examples:**
```
• Kilogram (kg) - Category: Weight
• Meter (m) - Category: Length
• Cubic Meter (m³) - Category: Volume
• Pieces (PCS) - Category: Count
```

---

### 2️⃣ **Tax Codes** - `tax_codes`

**Purpose:** Manage all tax rates and configurations

| Field | Type | Required | Example |
|-------|------|----------|---------|
| id | Integer | ✅ | 1 |
| tax_code | Text (Unique) | ✅ | "IGST18" |
| tax_name | Text | ✅ | "IGST 18%" |
| rate | Decimal | ✅ | 18.00 |
| tax_type | Text | ✅ | IGST, CGST, SGST, VAT |
| applicability | Text | ✅ | Sale, Purchase, Both |
| jurisdiction | Text | ❌ | "India" |
| effective_from | Date | ✅ | 2025-01-01 |
| effective_to | Date | ❌ | NULL (ongoing) |
| is_active | Boolean | ✅ | true |

**Real Examples:**
```
• IGST 18% - Applicable on sales in India
• CGST 9% + SGST 9% - Component taxes
• VAT 20% - UK/EU applicable
```

---

### 3️⃣ **Charges** - `charges`

**Purpose:** Define all types of charges (Freight, Handling, Documentation, etc.)

| Field | Type | Required | Example |
|-------|------|----------|---------|
| id | Integer | ✅ | 1 |
| charge_code | Text (Unique) | ✅ | "FREIGHT_AIR" |
| charge_name | Text | ✅ | "Air Freight Charge" |
| charge_type | Text | ✅ | "Freight", "Handling", "Doc" |
| default_uom_id | Integer FK | ✅ | 1 (points to unit_of_measures) |
| default_tax_id | Integer FK | ✅ | 1 (points to tax_codes) |
| default_fixed_rate_inr | Decimal | ❌ | 100.00 |
| description | Text | ❌ | "Charge for air freight" |
| is_active | Boolean | ✅ | true |

**Real Examples:**
```
• FREIGHT_AIR - Measured in KG, IGST 18%
• HANDLING_FEE - Fixed at ₹500, IGST 18%
• DOCUMENTATION - Fixed at ₹300, SGST 9%
• SECURITY_SURCHARGE - Measured in KG, IGST 18%
```

---

### 4️⃣ **Container Types** - `container_types`

**Purpose:** Define available container types for shipments

| Field | Type | Required | Example |
|-------|------|----------|---------|
| container_type_id | Integer | ✅ | 1 |
| container_code | Text (Unique) | ✅ | "20FT" |
| description | Text | ✅ | "20-Foot Container" |
| is_active | Boolean | ✅ | true |

**Real Examples:**
```
• 20FT - 20-foot shipping container
• 40FT - 40-foot shipping container
• 40HC - 40-foot high cube container
• FCL - Full Container Load
• LCL - Less than Container Load
```

---

### 5️⃣ **Locations** - `locations`

**Purpose:** Track all ports, airports, warehouses, and distribution centers

| Field | Type | Required | Example |
|-------|------|----------|---------|
| id | Integer | ✅ | 1 |
| code | Text (Unique) | ✅ | "INBLR" |
| name | Text | ✅ | "Bangalore Port" |
| city | Text | ❌ | "Bangalore" |
| country | Text | ✅ | "India" |
| type | Text | ✅ | AIR, SEA, port, airport, warehouse |
| description | Text | ❌ | "Major port in South India" |
| is_active | Boolean | ✅ | true |

**Real Examples:**
```
• INDXB (Delhi Airport) - Type: AIR
• INMAA1 (Mumbai Port) - Type: SEA
• INBLR (Bangalore) - Type: Distribution Center
• SGPSIN (Singapore Port) - Type: SEA
• USNYC (New York Port) - Type: SEA
```

---

### 6️⃣ **Suppliers (Vendors)** - `suppliers`

**Purpose:** Store vendor/supplier master information

| Field | Type | Required | Example |
|-------|------|----------|---------|
| id | Integer | ✅ | 1 |
| supplier_id | Text (Unique) | ✅ | "VEN001" |
| name | Text | ✅ | "XYZ Logistics Ltd" |
| contact_person | Text | ❌ | "John Doe" |
| email | Text | ❌ | "john@xyzlogistics.com" |
| phone | Text | ❌ | "+91-9999999999" |
| gst_vat_number | Text | ❌ | "27AAAXXX1234X1Z5" |
| city | Text | ❌ | "Mumbai" |
| state | Text | ❌ | "Maharashtra" |
| country | Text | ❌ | "India" |
| payment_terms | Text | ❌ | "Net 30" |
| lead_time_days | Integer | ✅ | 3 |
| preferred_currency | Text | ✅ | "USD" |
| rating_score | Decimal | ✅ | 4.50 |
| is_active | Boolean | ✅ | true |

**Real Examples:**
```
• VEN001: ABC Air Cargo - Rating: 4.8/5, Lead Time: 2 days
• VEN002: DEF Shipping - Rating: 4.2/5, Lead Time: 5 days
• VEN003: GHI Express - Rating: 3.9/5, Lead Time: 1 day
```

---

### 7️⃣ **Payment Terms** - `payment_terms`

**Purpose:** Define payment terms offered to customers

| Field | Type | Required | Example |
|-------|------|----------|---------|
| id | Integer | ✅ | 1 |
| name | Text (Unique) | ✅ | "Net 30" |
| code | Text (Unique) | ✅ | "NET30" |
| type | Text | ✅ | net, cod, prepaid, partial |
| days_to_pay | Integer | ✅ | 30 |
| discount_percentage | Decimal | ✅ | 0.00 |
| discount_days | Integer | ✅ | 0 |
| description | Text | ❌ | "Payment due within 30 days" |
| is_active | Boolean | ✅ | true |

**Real Examples:**
```
• COD (Cash on Delivery) - Payment: Immediate
• NET30 (Net 30) - Payment: 30 days
• NET60 (Net 60) - Payment: 60 days
• PREPAID (Prepaid) - Payment: Before shipment
• 2/10 NET30 - 2% discount if paid within 10 days, otherwise 30 days
```

---

### 8️⃣ **Items** - `items`

**Purpose:** Product/item master catalog

| Field | Type | Required | Example |
|-------|------|----------|---------|
| id | Integer | ✅ | 1 |
| item_code | Text (Unique) | ✅ | "ITEM001" |
| sku | Text (Unique) | ✅ | "SKU-12345" |
| name | Text | ✅ | "Electronic Control Unit" |
| description | Text | ❌ | "ECU for automotive" |
| category | Text | ✅ | "Electronics", "Machinery", "Raw Materials" |
| unit_of_measure_id | Integer FK | ✅ | 1 (points to unit_of_measures) |
| default_cost | Decimal | ✅ | 500.00 |
| default_price | Decimal | ✅ | 750.00 |
| weight | Decimal | ❌ | 2.50 (in kg) |
| length | Decimal | ❌ | 30.00 (in cm) |
| width | Decimal | ❌ | 20.00 (in cm) |
| height | Decimal | ❌ | 15.00 (in cm) |
| hsn_sac | Text | ❌ | "8534.31.00" (Indian tax code) |
| active_flag | Boolean | ✅ | true |
| version | Integer | ✅ | 1 |

**Real Examples:**
```
• ITEM001: Electronic Control Unit
  - Cost: ₹500, Price: ₹750, Weight: 2.5kg
  
• ITEM002: Steel Coil
  - Cost: ₹5000, Price: ₹7500, Weight: 500kg
  
• ITEM003: Pharmaceutical Tablet
  - Cost: ₹10, Price: ₹15, Weight: 0.5g
```

---

### 9️⃣ **Charge Rules** - `charge_rules`

**Purpose:** Define which charges apply based on logistics mode and terms

| Field | Type | Required | Example |
|-------|------|----------|---------|
| id | Integer | ✅ | 1 |
| mode | Text | ✅ | AIR, SEA, ROAD, RAIL |
| movement | Text | ✅ | IMPORT, EXPORT, DOMESTIC |
| terms | Text | ✅ | EXW, FOB, CIF, DDP, DAP |
| charge_id | Integer FK | ✅ | 1 (points to charges) |
| is_active | Boolean | ✅ | true |
| notes | Text | ❌ | "Freight surcharge for air cargo" |

**Real Examples:**
```
Rule 1: AIR + EXPORT + FOB → FREIGHT_AIR charge applies
Rule 2: SEA + IMPORT + CIF → FREIGHT_SEA charge applies
Rule 3: ROAD + DOMESTIC + DAP → FREIGHT_ROAD charge applies
```

---

### 🔟 **Margin Rules** - `margin_rules`

**Purpose:** Configure profit margins on charges for different customers

| Field | Type | Required | Example |
|-------|------|----------|---------|
| id | Integer | ✅ | 1 |
| precedence | Integer | ✅ | 1 |
| charge_id | Integer FK | ❌ | 1 (NULL = all charges) |
| customer_id | Integer FK | ❌ | 5 (NULL = all customers) |
| margin_percentage | Decimal | ✅ | 15.00 |
| margin_fixed_inr | Decimal | ✅ | 0.00 |
| is_active | Boolean | ✅ | true |
| notes | Text | ❌ | "Standard margin for premium customers" |

**Real Examples:**
```
Rule 1: All Charges + Customer ABC = 15% margin
Rule 2: FREIGHT_AIR + All Customers = 20% margin
Rule 3: HANDLING_FEE + Customer XYZ = ₹500 fixed markup
```

---

### 1️⃣1️⃣ **Exchange Rates** - `exchange_rates`

**Purpose:** Track currency exchange rates over time

| Field | Type | Required | Example |
|-------|------|----------|---------|
| id | Integer | ✅ | 1 |
| from_currency | Text | ✅ | "USD" |
| to_currency | Text | ✅ | "INR" |
| rate | Decimal | ✅ | 83.50 |
| inverse_rate | Decimal | ✅ | 0.0120 |
| effective_date | Date | ✅ | 2025-01-01 |
| expiry_date | Date | ❌ | NULL (ongoing) |
| source | Text | ✅ | "manual", "api", "bank" |
| status | Text | ✅ | "active", "inactive" |

**Real Examples:**
```
• USD to INR: 1 USD = 83.50 INR (effective 2025-01-01)
• EUR to INR: 1 EUR = 90.25 INR (effective 2025-01-01)
• GBP to INR: 1 GBP = 105.50 INR (effective 2025-01-01)
```

---

### 1️⃣2️⃣ **Cost Components** - `cost_components`

**Purpose:** Break down item costs into components (Material, Labour, Overhead, etc.)

| Field | Type | Required | Example |
|-------|------|----------|---------|
| id | Integer | ✅ | 1 |
| item_id | Integer FK | ✅ | 1 (points to items) |
| component_type | Text | ✅ | Material, Labour, Overhead, Packaging, Logistics |
| unit_cost | Decimal | ✅ | 100.00 |
| quantity_factor | Decimal | ✅ | 1.0 |
| currency | Text | ✅ | "USD" |
| effective_from | Date | ✅ | 2025-01-01 |
| effective_to | Date | ❌ | NULL (ongoing) |

**Real Examples:**
```
Item: Electronic Control Unit (Cost: ₹500)
├─ Material Cost: ₹300 (effective 2025-01-01)
├─ Labour Cost: ₹100 (effective 2025-01-01)
├─ Overhead: ₹70 (effective 2025-01-01)
└─ Packaging: ₹30 (effective 2025-01-01)
```

---

## 🔗 How Data Relates (Entity Relationships)

```
┌──────────────────────────────────────────────────────────┐
│                     UNIT OF MEASURES                      │
│  (kg, meters, liters, pieces, etc.)                      │
└────────┬──────────────────────────────────┬──────────────┘
         │                                  │
         ▼                                  ▼
    CHARGES                              ITEMS
    (Freight,               ◄─────────────(Product
     Handling, etc)                        Catalog)
         │                                  │
         ├─────────────┬──────────────────┤
         │             │                  │
         ▼             ▼                  ▼
    CHARGE_RULES   MARGIN_RULES    COST_COMPONENTS
    (Which charges  (Profit          (Material,
     apply where)   margins)         Labour, etc)


TAX_CODES          LOCATIONS          SUPPLIERS
(Tax rates)   ◄────(Ports,      ◄────(Vendors,
              │    Airports,          Services)
              │    Warehouses)
              │
              ▼
            CHARGES
            
PAYMENT_TERMS      EXCHANGE_RATES
(Payment modes)    (Currency rates)
```

---

## 📊 Typical Usage Example

### Scenario: Creating a Quotation

1. **Select Items** from `items` table
2. **Apply Charges** using rules from `charge_rules`:
   - Mode: AIR
   - Movement: EXPORT
   - Terms: FOB
   - → Applicable charges: FREIGHT_AIR, DOCUMENTATION
3. **Apply Margin** using `margin_rules`:
   - Customer ABC gets 15% margin on all charges
4. **Convert Currency** using `exchange_rates`:
   - Supplier quotes in USD → Convert to INR
5. **Calculate Tax** using `tax_codes`:
   - IGST 18% on all charges
6. **Final Price** = (Base Rate + Markup) × Tax Rate

---

## ✅ Data Integrity Rules

- **Primary Keys**: Every table has a unique `id`
- **Foreign Keys**: Links between tables are enforced
- **Unique Constraints**: Codes are unique (no duplicates)
- **Status Flags**: `is_active` allows hiding inactive data
- **Timestamps**: `created_at` and `updated_at` track changes
- **Date Ranges**: Effective dates control when data is valid

---

## 🚀 Quick Stats

| Table Name | Typical Count | Purpose |
|-----------|--------------|---------|
| unit_of_measures | 20-30 | System setup |
| tax_codes | 10-50 | Tax management |
| charges | 50-100 | Operational costs |
| container_types | 10-20 | Logistics config |
| locations | 50-200 | Global network |
| suppliers | 50-500 | Vendor master |
| payment_terms | 5-15 | Payment options |
| items | 500-5000+ | Product catalog |
| charge_rules | 100-500 | Business logic |
| margin_rules | 50-500 | Pricing strategy |
| exchange_rates | 100+ | Currency data |
| cost_components | 500-5000+ | Item costing |

---

## 📝 Notes for Implementation

✅ **Foreign Key Relationships** ensure data consistency  
✅ **Indexes** on frequently searched fields for performance  
✅ **Soft Deletion** using `is_active` flags  
✅ **Audit Trail** with `created_at` and `updated_at`  
✅ **Multi-Currency** support with exchange rates  
✅ **Historical Data** with effective date ranges  
✅ **Flexible Rules** engine for charging and margins  

---



**For questions or updates, contact the development team.**
