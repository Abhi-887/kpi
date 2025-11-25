# 👥 SHIPMATE - User & Customer Module Documentation

**Version:** 1.0  
**Last Updated:** November 22, 2025  
**System:** KPI/Shipmate Logistics Platform

---

## 📑 Table of Contents
1. [Module Overview](#module-overview)
2. [User Module Structure](#user-module-structure)
3. [Customer Module Structure](#customer-module-structure)
4. [User-Role Hierarchy](#user-role-hierarchy)
5. [Relationships & Connections](#relationships--connections)
6. [Business Rules & Constraints](#business-rules--constraints)
7. [Real-World Examples](#real-world-examples)

---

## 🎯 Module Overview

The User & Customer module manages two distinct entities:

| Entity | Purpose | Scope |
|--------|---------|-------|
| **User** | Internal system users with roles & permissions | Staff, Managers, Admins |
| **Customer** | External business customers/clients | Companies, Individuals, Importers/Exporters |

**Key Relationships:**
- Users authenticate and manage the system
- Customers are the business entities that place orders
- Users can interact with multiple Customers
- Customers may have multiple addresses (billing, shipping)

---

## 👤 User Module Structure

### **Users Table** - `users`

**Purpose:** Store internal system users with authentication credentials.

| Field | Type | Required | Unique | Constraints | Description |
|-------|------|----------|--------|-------------|-------------|
| `id` | BigInteger | ✅ | ✅ | PRIMARY KEY | Auto-incremented user ID |
| `name` | String | ✅ | ❌ | | User's full name |
| `email` | String | ✅ | ✅ | UNIQUE | User's email address |
| `email_verified_at` | Timestamp | ❌ | ❌ | NULLABLE | Email verification timestamp |
| `password` | String | ✅ | ❌ | HASHED | Encrypted password |
| `remember_token` | String | ❌ | ❌ | NULLABLE | Session remember token |
| `two_factor_secret` | String | ❌ | ❌ | NULLABLE | 2FA secret key |
| `two_factor_recovery_codes` | Text | ❌ | ❌ | NULLABLE | 2FA recovery codes |
| `two_factor_confirmed_at` | Timestamp | ❌ | ❌ | NULLABLE | 2FA activation timestamp |
| `created_at` | Timestamp | ✅ | ❌ | | Account creation time |
| `updated_at` | Timestamp | ✅ | ❌ | | Last profile update |

**Indexes:**
- `email` (UNIQUE)
- `created_at`

**Real Examples:**
```
User 1: John Doe
├─ Email: john.doe@shipmate.com
├─ Status: Active (email verified)
└─ 2FA: Enabled

User 2: Sarah Smith
├─ Email: sarah.smith@shipmate.com
├─ Status: Active (email verified)
└─ 2FA: Disabled
```

---

### **Roles Table** - `roles`

**Purpose:** Define user roles and permissions groups.

| Field | Type | Required | Unique | Constraints | Description |
|-------|------|----------|--------|-------------|-------------|
| `id` | BigInteger | ✅ | ✅ | PRIMARY KEY | Auto-incremented role ID |
| `name` | String | ✅ | ✅ | UNIQUE | Role display name |
| `slug` | String | ✅ | ✅ | UNIQUE | URL-friendly identifier |
| `description` | Text | ❌ | ❌ | NULLABLE | Role description & permissions |
| `created_at` | Timestamp | ✅ | ❌ | | Role creation time |
| `updated_at` | Timestamp | ✅ | ❌ | | Last modification time |

**Real Examples:**
```
Role 1: Admin
├─ Slug: admin
├─ Description: "Full system access, all operations"
└─ Permissions: Everything

Role 2: Manager
├─ Slug: manager
├─ Description: "Manage quotations, pricing, approvals"
└─ Permissions: Quotations, Approvals, Reports

Role 3: Executive
├─ Slug: executive
├─ Description: "Approve quotations and manage customers"
└─ Permissions: Approvals, Customer Management

Role 4: User
├─ Slug: user
├─ Description: "Create quotations and view reports"
└─ Permissions: Quotations, Viewing

Role 5: Viewer
├─ Slug: viewer
├─ Description: "Read-only access"
└─ Permissions: View Reports, View Data
```

---

### **Role-User Mapping** - `role_user` (Junction Table)

**Purpose:** Link users to one or more roles (many-to-many relationship).

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `id` | BigInteger | ✅ | PRIMARY KEY | Auto-incremented ID |
| `user_id` | BigInteger FK | ✅ | CASCADE DELETE | References users table |
| `role_id` | BigInteger FK | ✅ | CASCADE DELETE | References roles table |
| `created_at` | Timestamp | ✅ | | Assignment time |
| `updated_at` | Timestamp | ✅ | | Last update time |

**Constraints:**
- UNIQUE on (user_id, role_id) - User can't have duplicate roles
- FK: user_id → users.id (CASCADE)
- FK: role_id → roles.id (CASCADE)

**Real Examples:**
```
Mapping 1: John Doe → Admin + Manager roles
├─ user_id: 1
├─ role_id: 1 (Admin)
└─ role_id: 2 (Manager)

Mapping 2: Sarah Smith → Manager role
├─ user_id: 2
└─ role_id: 2 (Manager)

Mapping 3: Bob Johnson → User role
├─ user_id: 3
└─ role_id: 4 (User)
```

---

## 🏢 Customer Module Structure

### **Customers Table** - `customers`

**Purpose:** Store external customer/client information.

| Field | Type | Required | Unique | Constraints | Description |
|-------|------|----------|--------|-------------|-------------|
| `id` | BigInteger | ✅ | ✅ | PRIMARY KEY | Auto-incremented customer ID |
| `company_name` | String | ✅ | ✅ | UNIQUE, INDEXED | Company/Business name |
| `customer_type` | Enum | ✅ | ❌ | DEFAULT: 'business' | Type: individual, business, corporate |
| `email` | String | ✅ | ✅ | UNIQUE, INDEXED | Customer email address |
| `phone` | String | ✅ | ❌ | | Primary contact number |
| `secondary_phone` | String | ❌ | ❌ | NULLABLE | Alternate contact number |
| `registration_number` | String | ❌ | ❌ | NULLABLE | Business registration/company registration |
| `tax_id` | String | ❌ | ❌ | NULLABLE | GST/VAT/Tax ID |
| `payment_term_id` | BigInteger FK | ❌ | ❌ | NULLABLE, NULLONDELETE | Links to payment_terms table |
| `credit_limit` | Decimal(12,2) | ✅ | ❌ | DEFAULT: 0 | Maximum credit allowed |
| `used_credit` | Decimal(12,2) | ✅ | ❌ | DEFAULT: 0 | Currently used credit |
| `status` | Enum | ✅ | ❌ | DEFAULT: 'active', INDEXED | Status: active, inactive, suspended |
| `last_order_date` | Timestamp | ❌ | ❌ | NULLABLE | Date of most recent order |
| `total_orders` | Integer | ✅ | ❌ | DEFAULT: 0 | Total orders placed |
| `primary_contact_name` | String | ❌ | ❌ | | Primary contact person name |
| `website` | String | ❌ | ❌ | NULLABLE | Company website URL |
| `notes` | Text | ❌ | ❌ | NULLABLE | Internal notes about customer |
| `created_at` | Timestamp | ✅ | ❌ | | Customer record creation time |
| `updated_at` | Timestamp | ✅ | ❌ | | Last modification time |

**Indexes:**
- company_name (UNIQUE)
- email (UNIQUE)
- customer_type
- status
- last_order_date

**Virtual Attribute:**
- `available_credit` = credit_limit - used_credit

**Real Examples:**
```
Customer 1: ABC Logistics Pvt Ltd
├─ Type: Business
├─ Email: info@abclogistics.com
├─ Phone: +91-9876543210
├─ Status: Active
├─ Tax ID: 27AABCU9234E1Z3
├─ Credit Limit: ₹500,000
├─ Used Credit: ₹150,000
├─ Available Credit: ₹350,000
├─ Total Orders: 45
└─ Last Order: 2025-11-20

Customer 2: XYZ Trading Company
├─ Type: Corporate
├─ Email: procurement@xyztrading.com
├─ Phone: +91-8765432109
├─ Status: Active
├─ Tax ID: 27AAXYZ5678E1Z2
├─ Credit Limit: ₹1,000,000
├─ Used Credit: ₹450,000
├─ Available Credit: ₹550,000
├─ Total Orders: 120
└─ Last Order: 2025-11-21

Customer 3: John Smith (Individual)
├─ Type: Individual
├─ Email: john.smith@email.com
├─ Phone: +91-7654321098
├─ Status: Active
├─ Credit Limit: ₹50,000
├─ Used Credit: ₹0
├─ Available Credit: ₹50,000
├─ Total Orders: 2
└─ Last Order: 2025-10-15
```

---

### **Customer Addresses Table** - `customer_addresses`

**Purpose:** Store multiple addresses for each customer (billing, shipping, etc.).

| Field | Type | Required | Unique | Constraints | Description |
|-------|------|----------|--------|-------------|-------------|
| `id` | BigInteger | ✅ | ✅ | PRIMARY KEY | Auto-incremented address ID |
| `customer_id` | BigInteger FK | ✅ | ❌ | CONSTRAINED, CASCADE | References customers table |
| `address_type` | Enum | ✅ | ❌ | DEFAULT: 'shipping', INDEXED | Type: billing, shipping, both |
| `street_address` | String | ✅ | ❌ | | Street address line 1 |
| `street_address_2` | String | ❌ | ❌ | NULLABLE | Street address line 2 |
| `city` | String | ✅ | ❌ | INDEXED | City name |
| `state_province` | String | ❌ | ❌ | NULLABLE | State/Province |
| `postal_code` | String | ❌ | ❌ | NULLABLE | ZIP/Postal code |
| `country` | String | ✅ | ❌ | INDEXED | Country name or code |
| `latitude` | Decimal(10,8) | ❌ | ❌ | NULLABLE | GPS latitude coordinate |
| `longitude` | Decimal(11,8) | ❌ | ❌ | NULLABLE | GPS longitude coordinate |
| `is_primary` | Boolean | ✅ | ❌ | DEFAULT: false | Default address flag |
| `notes` | Text | ❌ | ❌ | NULLABLE | Address-specific notes |
| `created_at` | Timestamp | ✅ | ❌ | | Address creation time |
| `updated_at` | Timestamp | ✅ | ❌ | | Last modification time |

**Indexes:**
- customer_id
- address_type
- city
- country

**Real Examples:**
```
Customer: ABC Logistics Pvt Ltd
├─ Address 1: Bangalore Office (Shipping)
│  ├─ Street: 123 Tech Park, MG Road
│  ├─ City: Bangalore
│  ├─ State: Karnataka
│  ├─ Country: India
│  ├─ Postal Code: 560001
│  ├─ Latitude: 12.9716
│  ├─ Longitude: 77.5946
│  └─ Is Primary: true
│
├─ Address 2: Mumbai Warehouse (Billing)
│  ├─ Street: 456 Business Center, Fort
│  ├─ City: Mumbai
│  ├─ State: Maharashtra
│  ├─ Country: India
│  ├─ Postal Code: 400001
│  └─ Is Primary: false
│
└─ Address 3: Delhi Facility (Both)
   ├─ Street: 789 Trade Hub, Noida
   ├─ City: Delhi
   ├─ State: NCR
   ├─ Country: India
   ├─ Postal Code: 110070
   └─ Is Primary: false
```

---

## 🏗️ User-Role Hierarchy

### **Role Hierarchy Structure**

```
┌─────────────────────────────────────────────────────────┐
│                    SYSTEM ADMIN                         │
│  • Full system access                                  │
│  • Create/Manage users and roles                       │
│  • System configuration                               │
│  • View all data and reports                          │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┬──────────────┐
        │                         │              │
        ▼                         ▼              ▼
    ┌───────────┐          ┌──────────┐    ┌──────────┐
    │ MANAGER   │          │EXECUTIVE │    │ BUSINESS │
    │           │          │          │    │ ANALYST  │
    │ • Manage  │          │ • Approve│    │          │
    │   Pricing │          │   Quotes │    │ • Create │
    │ • Create  │          │ • Manage │    │   Reports│
    │   Charges │          │   Margin │    │ • Analyze│
    │ • Approve │          │   Rules  │    │   Data   │
    │   Quotes  │          │ • View   │    │ • View   │
    │ • View    │          │   Reports│    │  Reports │
    │   Reports │          └──────────┘    └──────────┘
    └────┬──────┘
         │
         ▼
    ┌──────────┐
    │   USER   │
    │          │
    │ • Create │
    │   Quotes │
    │ • View   │
    │   own    │
    │  Reports │
    └──────────┘
         │
         ▼
    ┌──────────┐
    │  VIEWER  │
    │          │
    │ • Read   │
    │   only   │
    │ • View   │
    │   Data   │
    └──────────┘
```

### **Standard Roles**

#### 1. **Admin** (System Administrator)
- **Slug:** `admin`
- **Access Level:** 100% (Unrestricted)
- **Responsibilities:**
  - User management (create, edit, delete)
  - Role assignments
  - System configuration
  - Master data management
  - Full audit access

#### 2. **Manager** (Operations Manager)
- **Slug:** `manager`
- **Access Level:** 80%
- **Responsibilities:**
  - Create quotations
  - Manage charges and rules
  - Approve quotations
  - Manage pricing rules
  - View operational reports
  - Customer management

#### 3. **Executive** (Business Executive/Director)
- **Slug:** `executive`
- **Access Level:** 75%
- **Responsibilities:**
  - Quotation approvals
  - Margin rule management
  - Customer relationship management
  - Executive reports & dashboards
  - Cannot modify system settings

#### 4. **User** (Standard User/Executive)
- **Slug:** `user`
- **Access Level:** 50%
- **Responsibilities:**
  - Create quotations
  - Submit for approval
  - View own created records
  - Basic reporting

#### 5. **Viewer** (Read-Only Viewer)
- **Slug:** `viewer`
- **Access Level:** 25%
- **Responsibilities:**
  - View reports
  - View master data
  - No creation or modification rights

---

## 🔗 Relationships & Connections

### **Relationship Diagram**

```
┌─────────────────────────────────────────────────────────┐
│                    USERS TABLE                          │
│ id | name | email | password | ...                     │
└──────────────┬──────────────────────────────────────────┘
               │ (One-to-Many)
               │ 1 User → Many Sessions
               ▼
    ┌─────────────────────┐
    │  SESSIONS TABLE     │
    │ id | user_id | ... │
    └─────────────────────┘

┌──────────────────────────────────────────────────────────┐
│              ROLE_USER TABLE (Many-to-Many)              │
│ id | user_id | role_id | created_at | updated_at        │
└──────┬───────────────────┬──────────────────────────────┘
       │                   │
   (FK)│                   │(FK)
       │                   │
       ▼                   ▼
┌──────────────────┐    ┌─────────────────────────────┐
│  USERS TABLE     │    │     ROLES TABLE             │
│                  │    │                             │
│ 1: John (Admin)  │    │ 1: Admin                    │
│ 2: Sarah (Mgr)   │    │ 2: Manager                  │
│ 3: Bob (User)    │    │ 3: Executive                │
└──────────────────┘    │ 4: User                     │
                        │ 5: Viewer                   │
                        └─────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│              CUSTOMERS TABLE                             │
│ id | company_name | email | phone | payment_term_id ... │
└─────────┬──────────────────────────────┬────────────────┘
          │ (One-to-Many)                │ (Many-to-One)
          │                              │
          ▼                              ▼
┌──────────────────────────────┐    ┌──────────────────┐
│ CUSTOMER_ADDRESSES TABLE     │    │ PAYMENT_TERMS    │
│                              │    │                  │
│ 1: Bangalore (Shipping)      │    │ 1: Net 30        │
│ 2: Mumbai (Billing)          │    │ 2: Net 60        │
│ 3: Delhi (Both)              │    │ 3: COD           │
└──────────────────────────────┘    └──────────────────┘

Additional Relationships:

Customers → Orders
Customers → Invoices
Customers → Quotations
Customers → Margin Rules (optional)

Users → Notifications
Users → Quotation Approvals
Users → Audit Logs
```

### **Key Relationship Rules**

| Relationship | Type | Cardinality | Cascade | Description |
|-------------|------|-------------|---------|-------------|
| User → Roles | Many-to-Many | N:N | CASCADE | Users can have multiple roles |
| User → Sessions | One-to-Many | 1:N | CASCADE | One user, multiple sessions |
| User → Notifications | One-to-Many | 1:N | CASCADE | Notifications for users |
| Customer → Addresses | One-to-Many | 1:N | CASCADE | One customer, multiple addresses |
| Customer → Payment Term | Many-to-One | N:1 | NULL | Payment term is optional |
| Customer → Orders | One-to-Many | 1:N | CASCADE | Customer places multiple orders |
| Customer → Invoices | One-to-Many | 1:N | CASCADE | Customer receives invoices |
| Customer → Margin Rules | One-to-Many | 1:N | CASCADE | Optional pricing rules |

---

## 📋 Business Rules & Constraints

### **User Module Rules**

✅ **Email Uniqueness**
- Each user must have a unique email
- Email is used as the primary identifier for login

✅ **Password Security**
- Passwords are hashed using bcrypt
- Never stored in plain text
- Password reset tokens are time-limited

✅ **Role Assignment**
- Users can have multiple roles
- At least one role must be assigned to active users
- Role changes are tracked

✅ **Two-Factor Authentication (2FA)**
- Optional but recommended for sensitive roles
- Uses time-based one-time passwords (TOTP)
- Recovery codes provided for backup access

✅ **Email Verification**
- New users should verify their email
- Verified users can perform critical actions
- Unverified users have limited access

### **Customer Module Rules**

✅ **Company Name Uniqueness**
- Each company must have a unique name
- Prevents duplicate customer records

✅ **Email Uniqueness**
- Each customer must have a unique email
- Used as primary contact method

✅ **Credit Management**
- Credit limit is set per customer
- Used credit cannot exceed credit limit
- Available credit = Credit Limit - Used Credit

✅ **Address Management**
- Each customer must have at least one address
- Multiple addresses can be marked as primary
- Addresses are deleted when customer is deleted

✅ **Customer Status**
- **Active**: Normal operations allowed
- **Inactive**: No new orders
- **Suspended**: Temporarily blocked, often due to credit issues

✅ **Customer Type**
- **Individual**: Single person, small credit limit
- **Business**: Medium-sized business
- **Corporate**: Large organization with higher limits

### **Data Validation Rules**

| Field | Validation | Error Message |
|-------|-----------|---------------|
| User Email | RFC 5322 format | "Invalid email format" |
| User Password | Min 8 chars, 1 uppercase, 1 number | "Password too weak" |
| Customer Email | RFC 5322 format | "Invalid email format" |
| Customer Phone | 10-15 digits | "Invalid phone number" |
| Credit Limit | Positive decimal | "Credit limit must be > 0" |
| Used Credit | Cannot exceed credit_limit | "Used credit exceeds limit" |
| Tax ID | Matches jurisdiction format | "Invalid tax ID format" |

---

## 💡 Real-World Examples

### **Example 1: User Registration & Role Assignment**

**Scenario:** New employee John joins the company as a Manager

```
Step 1: Create User
├─ Name: John Doe
├─ Email: john.doe@shipmate.com
├─ Password: Hashed(SecurePass@123)
└─ Created: 2025-11-20 10:30:00

Step 2: Assign Roles
├─ Role 1: Manager (full quotation access)
├─ Role 2: User (basic operations)
└─ Assignment Date: 2025-11-20 10:35:00

Step 3: Enable 2FA
├─ Generate Secret: 4F3R7K9N2M5B8X1J
├─ Recovery Codes: [code1, code2, ...]
└─ Status: Enabled

Step 4: Send Welcome Email
├─ Subject: "Welcome to Shipmate!"
├─ Link: Password setup link
└─ 2FA Setup: Instructions

Result: John can now:
✓ Log in with email + password + 2FA
✓ Create quotations
✓ Manage charges
✓ Approve pending quotations
✓ Access manager dashboard
```

---

### **Example 2: Customer Registration & Address Setup**

**Scenario:** New logistics company ABC registers as a customer

```
Step 1: Create Customer
├─ Company Name: ABC Logistics Pvt Ltd
├─ Type: Business
├─ Email: info@abclogistics.com
├─ Phone: +91-9876543210
├─ Tax ID: 27AABCU9234E1Z3
├─ Credit Limit: ₹500,000
├─ Payment Terms: Net 30
├─ Status: Active
└─ Created: 2025-11-20 14:15:00

Step 2: Add Primary Address (Shipping)
├─ Type: Shipping
├─ Street: 123 Tech Park, MG Road
├─ City: Bangalore
├─ State: Karnataka
├─ Country: India
├─ Postal Code: 560001
├─ GPS: 12.9716°N, 77.5946°E
└─ Is Primary: true

Step 3: Add Secondary Address (Billing)
├─ Type: Billing
├─ Street: 456 Business Center, Fort
├─ City: Mumbai
├─ State: Maharashtra
├─ Country: India
├─ Postal Code: 400001
└─ Is Primary: false

Step 4: Welcome Notification
├─ Email sent to: info@abclogistics.com
├─ Subject: "Your Shipmate Account is Ready!"
├─ Content: Account details and first steps
└─ Sent: 2025-11-20 14:20:00

Result: ABC Logistics can now:
✓ View quotations
✓ Place orders
✓ Use credit limit (₹500,000)
✓ Pay on Net 30 terms
✓ Receive shipments at Bangalore office
✓ Receive bills at Mumbai office
```

---

### **Example 3: User Authentication Flow**

**Scenario:** Manager Sarah logs in

```
Step 1: Login Form
├─ Email: sarah.smith@shipmate.com
└─ Password: ••••••••

Step 2: System Validation
├─ Check: Email exists in users table ✓
├─ Check: Email is verified ✓
├─ Check: Password hash matches ✓
├─ Check: 2FA is enabled ✓
└─ Status: Credentials valid

Step 3: 2FA Challenge
├─ Send OTP to registered authenticator app
├─ User enters: 234567
├─ Check: OTP is valid & not expired ✓
└─ Status: 2FA passed

Step 4: Load User Session
├─ Create session record in sessions table
├─ Load user roles: [Manager, User]
├─ Load permissions from roles
├─ Set session timeout: 8 hours
└─ Status: Session created

Step 5: Redirect to Dashboard
├─ Dashboard loads with Manager's view
├─ Access: All quotations, approvals, reports
├─ UI: Customized for Manager role
└─ Status: Login complete

Session expires after:
├─ 8 hours of activity, OR
├─ Browser/tab closed, OR
├─ Logout button clicked

Result: Sarah is authenticated and can:
✓ View all quotations
✓ Approve quotations
✓ Manage pricing
✓ View reports
✗ Cannot delete users
✗ Cannot change system settings
```

---

### **Example 4: User-Customer Interaction Flow**

**Scenario:** Employee Bob creates a quotation for ABC Logistics customer

```
Timeline:

T1: Bob (User) logs in
├─ Email: bob.johnson@shipmate.com
├─ Role: User
└─ Status: Authenticated

T2: Bob selects customer
├─ Searches: "ABC Logistics"
├─ Selects: Customer ID 1
└─ Loads: Company info + available credit

T3: Bob views customer details
├─ Company: ABC Logistics Pvt Ltd
├─ Status: Active
├─ Credit Limit: ₹500,000
├─ Used Credit: ₹150,000
├─ Available Credit: ₹350,000
├─ Primary Address: Bangalore (Shipping)
├─ Last Order: 2025-11-15
└─ Total Orders: 45

T4: Bob creates quotation
├─ Customer: ABC Logistics (ID: 1)
├─ Items: Electronics items
├─ Charges: Freight, Handling, Documentation
├─ Total: ₹95,000 (within available credit)
├─ Submitted by: Bob (User)
└─ Created: 2025-11-21 09:30:00

T5: Manager Sarah reviews
├─ Status: Pending Approval
├─ Submitted by: Bob
├─ Customer: ABC Logistics
├─ Amount: ₹95,000
├─ Action: Sarah approves

T6: Quotation approved
├─ Approved by: Sarah (Manager)
├─ Approval Date: 2025-11-21 10:15:00
├─ Email sent to: info@abclogistics.com
├─ Status: Active Quotation

Result:
✓ Customer ABC Logistics receives quotation
✓ Updated used_credit: ₹245,000 (was ₹150,000)
✓ Available credit: ₹255,000
✓ Quotation active for 30 days
✓ Bob gains experience points
✓ Sarah's approval is logged in audit trail
```

---

### **Example 5: Customer Credit Limit Scenario**

**Scenario:** XYZ Trading Company approaches their credit limit

```
Initial State:
├─ Company: XYZ Trading Company
├─ Credit Limit: ₹1,000,000
├─ Used Credit: ₹900,000
└─ Available Credit: ₹100,000

New Order Request: ₹150,000
├─ Available: ₹100,000
├─ Required: ₹150,000
├─ Shortfall: ₹50,000
└─ Status: REJECTED - Insufficient credit

Management Action Options:

Option 1: Increase Credit Limit
├─ Approved by: Manager
├─ New Limit: ₹1,200,000
├─ New Available: ₹300,000
├─ Order: ₹150,000
└─ Status: APPROVED

Option 2: Partial Payment
├─ Customer pays: ₹100,000
├─ Used Credit: ₹800,000 (was ₹900,000)
├─ Available: ₹200,000
├─ Order: ₹150,000
└─ Status: APPROVED

Option 3: Wait for Invoice Payment
├─ Pending invoices: ₹120,000
├─ Expected payment date: 2025-11-30
├─ Current available: ₹100,000
├─ Order: ₹150,000
└─ Status: REJECTED - Ask to try after payment

Audit Trail Updated:
├─ Timestamp: 2025-11-21 11:45:00
├─ Action: Credit limit change / Payment received
├─ Changed by: Manager ID
├─ Old Value: ₹1,000,000
└─ New Value: ₹1,200,000
```

---

## 🔐 Security Best Practices

✅ **For Users:**
- Enable 2FA for all accounts
- Use strong passwords (8+ chars, uppercase, numbers, symbols)
- Never share credentials
- Logout after each session
- Review login history regularly

✅ **For Customers:**
- Verify customer email before activation
- Validate tax IDs and registration numbers
- Monitor credit limit usage
- Track payment history
- Review address changes

✅ **For Admins:**
- Audit all role changes
- Monitor user activity
- Regular security audits
- Backup customer data
- Implement IP whitelisting if possible

---

## 📊 Quick Statistics

| Metric | Value |
|--------|-------|
| Typical Admin Users | 2-5 |
| Typical Manager Users | 5-20 |
| Typical Employee Users | 20-100+ |
| Typical Customers | 50-500+ |
| Addresses per Customer | 1-5 |
| Roles per User | 1-3 |
| Active Sessions per User | 1-3 |

---

## 🤝 Sharing with Clients

**Key Points to Highlight:**

✅ **User Management**
- Role-based access control
- Multiple role support
- 2FA security
- Activity logging

✅ **Customer Management**
- Flexible customer types
- Multiple address support
- Credit limit management
- Payment terms configuration

✅ **Data Security**
- Password encryption
- Session management
- Email verification
- Audit trails

✅ **Scalability**
- Support for 100+ users
- Support for 1000+ customers
- Efficient address management
- Flexible role system

---

**For questions or updates, contact the development team.**
