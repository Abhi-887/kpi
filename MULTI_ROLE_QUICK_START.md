# 🚀 Quick Start Guide - Multi-Role System

## Access the System

### 1️⃣ Role Selector Page
```
http://localhost:8000/select-role
```
Beautiful UI showing all 6 roles with colors, descriptions, and icons.

### 2️⃣ Direct Role Logins
```
http://localhost:8000/login/super_admin
http://localhost:8000/login/admin
http://localhost:8000/login/customer
http://localhost:8000/login/vendor
http://localhost:8000/login/supplier
http://localhost:8000/login/purchase
```

---

## 🔑 Test User Credentials

| Role | Email | Password | Color |
|------|-------|----------|-------|
| Super Admin | `superadmin@shipmate.local` | `password` | Violet |
| Admin | `admin@shipmate.local` | `password` | Slate |
| Customer | `customer@shipmate.local` | `password` | Blue |
| Vendor | `vendor@shipmate.local` | `password` | Amber |
| Supplier | `supplier@shipmate.local` | `password` | Emerald |
| Purchase Manager | `purchase@shipmate.local` | `password` | Orange |

---

## ✨ What You'll See

### Login Page (Color-Coded)
- Different colored logo background per role
- Custom title: "Log in to [Role] Dashboard"
- Colored submit button matching role

### Dashboard (After Login)
- Same dashboard UI for all roles (currently)
- Role info visible in sidebar header
- Can add role-specific widgets later

### Sidebar Menu
- Currently shows standard menu for all roles
- Can be enhanced to show role-specific items

---

## 🔧 Code Files to Know

### Backend
- **Roles**: `app/Enums/UserRole.php` - All role definitions
- **Config**: `app/Services/RoleService.php` - Role configurations
- **Users**: `app/Models/User.php` - Now has role_slug field
- **Auth**: `app/Http/Controllers/Auth/RoleLoginController.php` - Login routing

### Frontend
- **Role Selector**: `resources/js/Pages/role-login-selector.tsx` - Landing page
- **Login Form**: `resources/js/Pages/auth/login.tsx` - Now role-aware
- **Config**: `resources/js/utils/role-config.ts` - Frontend role menu

---

## 🛠️ Commands Useful

### Reseed Users
```bash
php artisan db:seed --class=RoleUserSeeder
```

### Check Users in DB
```bash
php artisan tinker
> User::pluck('email', 'role_slug')
```

### Build Frontend
```bash
npm run build  # Production
npm run dev    # Development with watch
```

### Test Server
```bash
php artisan serve
# Accessible at http://localhost:8000
```

---

## 🎨 How Role Theming Works

### Color Codes
```
Super Admin  → Violet  (#7c3aed)
Admin        → Slate   (#64748b)
Customer     → Blue    (#3b82f6)
Vendor       → Amber   (#d97706)
Supplier     → Emerald (#10b981)
Purchase     → Orange  (#ea580c)
```

### Where Colors Appear
- Login page hero section (logo background)
- Login button color
- Can extend to sidebar accents (TODO)
- Can extend to dashboard headers (TODO)

---

## 📱 UX Flow

1. User visits `/select-role`
   ↓
2. Sees 6 role cards with descriptions
   ↓
3. Clicks their role (e.g., "Customer")
   ↓
4. Redirected to `/login/customer` with blue theme
   ↓
5. Enters email & password
   ↓
6. Logs in → Dashboard with role metadata
   ↓
7. Sidebar shows user is logged in with role info

---

## 🔐 Security Notes

- All roles are in `UserRole` enum (type-safe)
- `role_slug` is cast to enum in User model
- Route protection via `user_role` middleware
- Can chain: `middleware('auth', 'user_role:admin,super_admin')`

---

## 🎯 Future Enhancements

### Phase 1 (Ready Now)
- ✅ Role-specific login theming
- ✅ Test users seeded
- ✅ Role enum with colors
- ✅ Backend role service

### Phase 2 (Easy Add-ons)
- 🔲 Role-specific sidebars
- 🔲 Role-specific dashboards
- 🔲 Feature flags per role
- 🔲 Role-based API responses

### Phase 3 (Optional)
- 🔲 Permission system (per role)
- 🔲 Custom role creation (admin UI)
- 🔲 Role templates
- 🔲 Audit logging per role

---

## ❓ Troubleshooting

### "Address already in use :8000"
```bash
lsof -i :8000  # Find process
kill -9 <PID>  # Kill it
php artisan serve
```

### Users not seeding
```bash
php artisan migrate:fresh --seed
# Or just the role seeder:
php artisan db:seed --class=RoleUserSeeder
```

### Frontend not updating
```bash
npm run build  # Rebuild CSS/JS
# Or if on dev mode:
npm run dev    # Watch mode will rebuild
```

### Login page not themed
- Check `roleConfig` is being passed from controller
- Check `role_slug` matches an enum value
- Browser cache? Try incognito mode

---

## 📚 Documentation Files

- **Full Details**: `MULTI_ROLE_SYSTEM.md` - Complete implementation guide
- **This File**: `MULTI_ROLE_QUICK_START.md` - Quick reference

---

## 🎉 You're All Set!

Visit `http://localhost:8000/select-role` and test out all roles!

Any questions? Check `MULTI_ROLE_SYSTEM.md` for detailed architecture info.
