# KPI System - 16 Modules Complete

## Module Overview

### Core Modules (1-6)
| # | Module | Purpose | Status |
|---|--------|---------|--------|
| 1 | RBAC | 6 roles, 11 permissions, auth gates | ✅ |
| 2 | Shipments | 5,175+ records, tracking, export | ✅ |
| 3 | Rate Cards | Pricing tiers, 50 samples | ✅ |
| 4 | Quotes | Quote generation from orders | ✅ |
| 5 | Customers | 71 customers, 160 addresses | ✅ |
| 6 | Orders | Full CRUD, order tracking | ✅ |

### Business Modules (7-12)
| # | Module | Purpose | Status |
|---|--------|---------|--------|
| 7 | Invoicing | 150 invoices, 500+ items | ✅ |
| 8 | Dashboard | 14 KPIs, 4 charts, Recharts | ✅ |
| 9 | Integration | 5 API simulators (FedEx, UPS, DHL, Stripe, PayPal) | ✅ |
| 10 | Notifications | 3 channels (Email, SMS, InApp), preferences | ✅ |
| 11 | Settings | 13 global configs, tabbed UI | ✅ |
| 12 | Audit Logs | Full tracking, filtering, CSV export | ✅ |

### Pricing Modules (13-16)
| # | Module | Purpose | Status |
|---|--------|---------|--------|
| 13 | Price Comparison | Login ID tracking, rate card comparison, 10 samples | ✅ |
| 14 | Forwarding Prices | Origin/destination, 3 service types, 30 samples | ✅ |
| 15 | Courier Prices | Carriers (FedEx, UPS, DHL), 25 samples | ✅ |
| 16 | Packaging Prices | 4 types, 4 sizes, bulk pricing, 20 samples | ✅ |

## Key Features

### Backend
- ✅ Laravel 12 with Eloquent ORM
- ✅ Service layer with factory pattern
- ✅ 20+ models with relationships
- ✅ 4 controllers with CRUD
- ✅ Full validation & error handling
- ✅ 13 database migrations
- ✅ 85+ seeded sample records

### Frontend
- ✅ React 19 + TypeScript
- ✅ Inertia.js integration
- ✅ 40+ React pages
- ✅ Tailwind CSS v4
- ✅ Dark mode support
- ✅ 14 Shadcn UI components
- ✅ Responsive design

### Database
- ✅ 20 tables total
- ✅ Proper relationships
- ✅ Foreign key constraints
- ✅ Indexes on query columns

## Quick Stats

- **Total Models**: 20+
- **Total Controllers**: 16
- **Total React Pages**: 40+
- **Database Records**: 5,500+
- **Build Size**: 363.19 kB (107.35 kB gzipped)
- **Build Time**: ~5.2 seconds

## URLs

- Dashboard: `/dashboard`
- Shipments: `/shipments`
- Rate Cards: `/rate-cards`
- Customers: `/customers`
- Orders: `/orders`
- Invoices: `/invoices`
- Quotes: `/quotes`
- Integrations: `/integrations/carriers`
- Notifications: `/notifications`
- Settings: `/admin/settings` (admin only)
- Audit Logs: `/audit-logs` (admin only)
- Price Comparison: `/price-comparisons`
- Forwarding Prices: `/forwarding-prices`
- Courier Prices: `/courier-prices`
- Packaging Prices: `/packaging-prices`

## Data Summary

| Type | Count |
|------|-------|
| Shipments | 5,175 |
| Invoices | 150 |
| Customers | 71 |
| Orders | 100+ |
| Rate Cards | 50 |
| Forwarding Prices | 30 |
| Courier Prices | 25 |
| Packaging Prices | 20 |
| Price Comparisons | 10 |

---

**Status**: ✅ All 16 modules complete, tested, and deployed to GitHub

## Database Schema

### Users & Auth
```
users
├── id, name, email, password
├── email_verified_at, two_factor_secret
├── role_id (FK → roles)
└── timestamps

roles
├── id, name
├── has_many → role_permissions
└── timestamps

permissions
├── id, name, description
└── timestamps

role_permission (pivot)
├── role_id (FK)
├── permission_id (FK)
└── timestamps
```

### Customers & Addresses
```
customers
├── id, name, email, phone
├── company, industry, country
└── timestamps

customer_addresses
├── id, customer_id (FK)
├── address_type (billing/shipping)
├── street, city, state, zip_code, country
└── timestamps
```

### Logistics
```
shipments
├── id, shipment_number, customer_id (FK)
├── origin, destination
├── weight, dimensions (L×W×H)
├── status (pending/in_transit/delivered/exception)
├── carrier, tracking_number
├── base_freight, surcharge, total_cost
└── timestamps

rate_cards
├── id, name, origin_country, destination_country
├── service_type, base_rate, per_kg_rate
├── min_weight, max_weight
└── timestamps

quotes
├── id, quote_number, customer_id (FK)
├── shipment_details, estimated_cost
├── status, valid_until
└── timestamps
```

### Orders & Invoicing
```
orders
├── id, order_number, customer_id (FK)
├── order_date, status
├── total_amount, payment_status
└── timestamps

invoices
├── id, invoice_number, order_id (FK)
├── user_id (FK), issue_date, due_date
├── subtotal, tax, total
├── status (draft/sent/paid/overdue)
└── timestamps

invoice_items
├── id, invoice_id (FK)
├── description, quantity, unit_price
├── line_total
└── timestamps
```

### Integrations
```
carrier_integrations
├── id, user_id (FK)
├── carrier_type (FedEx/UPS/DHL)
├── api_key, api_secret (encrypted)
├── is_active
└── timestamps

payment_gateway_integrations
├── id, user_id (FK)
├── gateway_type (Stripe/PayPal)
├── merchant_id, api_key (encrypted)
├── is_active
└── timestamps
```

### Communications
```
notifications
├── id, user_id (FK)
├── type (ShipmentCreated/Delivered/etc)
├── channel (Email/SMS/InApp)
├── status (Pending/Sent/Failed/Read)
├── subject, message, metadata (JSON)
└── timestamps

notification_preferences
├── id, user_id (FK)
├── notification_type
├── channel, enabled, frequency
└── timestamps
```

### Configuration & Audit
```
system_settings
├── id, key (unique)
├── value, type (string/boolean/integer/json)
├── category (general/email/shipping/payment/advanced)
└── timestamps

audit_logs
├── id, user_id (FK)
├── action (create/update/delete/view/export)
├── model_type, model_id
├── old_values, new_values (JSON)
├── ip_address, user_agent
└── timestamps
```

### Pricing
```
price_comparisons
├── id, user_id (FK), rate_card_id (FK)
├── login_id (unique), our_price
├── competitor_price, price_difference
├── status, notes
└── timestamps

comparison_items
├── id, price_comparison_id (FK)
├── service_name, our_rate
├── competitor_rate, difference
└── timestamps

forwarding_prices
├── id, name, origin_country, destination_country
├── service_type (Standard/Express/Economy)
├── base_price, per_kg_price, per_cbm_price
├── handling_fee, transit_days, is_active
└── timestamps

courier_prices
├── id, name, carrier_name (FedEx/UPS/DHL)
├── service_type (Standard/Express/Overnight)
├── base_price, per_kg_price, surcharge
├── coverage_area, transit_days, is_active
└── timestamps

packaging_prices
├── id, name, package_type (Box/Envelope/Tube)
├── size_category (Small/Medium/Large/XL)
├── length, width, height, max_weight
├── unit_price, bulk_price_5, bulk_price_10
├── material (Cardboard/Plastic/Wood), is_active
└── timestamps
```

### System
```
sessions
├── id, user_id (FK), ip_address
├── user_agent, payload
└── last_activity

cache
├── key (unique), value, expiration
└── timestamps

failed_jobs
├── id, uuid, connection, queue
├── payload, exception, failed_at
└── timestamps
```

## Key Relationships
- User → many Roles
- Customer → many Addresses, Orders, Shipments
- Order → many Invoices, Items
- Shipment → many TrackingEvents
- Invoice → many Items
- RateCard → many Quotes
- User → many AuditLogs
- User → many Notifications
- PriceComparison → many ComparisonItems
