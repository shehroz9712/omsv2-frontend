# OMS Frontend — Next.js 15+ App Router Rebuild

Senior Next.js frontend rebuild migrating from Laravel Blade to **Next.js 15+ (App Router), React 19, TypeScript (Strict Mode), and Tailwind CSS**, natively integrated with the migrated **Python FastAPI backend**.

---

## 🚀 Key Highlights & Architectural Features

1. **Exact UI & Aesthetics Preservation**:
   - Preserved dark color system: `#0b0f19` body background, `#111827` secondary/sidebar, `#141c2e` panels, `#374151` borders, `#3b82f6` brand blue, `#10b981` emerald.
   - Clean responsive layouts for Mobile (Android/iOS touch targets), Tablet, Laptop, and Full HD Desktop POS displays.
   - Preserved local typography (Plus Jakarta Sans, JetBrains Mono, Noto Naskh Arabic).

2. **Web POS High-Speed Terminal (`/pos`)**:
   - Instant search and barcode scanner support with `F2` focus and `F9` checkout shortcuts.
   - Category filtering chips with touch scrolling.
   - Customer selection with real-time balance indicator.
   - Cart management, unit price controls, item discounts, order note.
   - Multi-mode checkout modal (Cash, Card, Bank Transfer, Customer Credit / On Account).
   - Cash received presets (`Rs 500`, `Rs 1,000`, `Rs 5,000`, `Exact`), instant change calculation.
   - Offline resilience indicator and printable thermal receipt invoices (`80mm` and `58mm`).

3. **POS Launcher Portal (`/pos-launcher`)**:
   - Platform environment detection (Android / iOS / Windows Desktop / Browser).
   - Deep-linking triggers (`intent://pos`, `quickorder://pos`) with fallback downloading for Android APK (`61.8 MB`) and Windows Desktop App package (`.zip`).

4. **Centralized Laravel-Envelope FastAPI Client (`src/lib/api/client.ts`)**:
   - Automatically unwraps standardized `{ statusCode, status, message, response: { data }, errors }` envelope.
   - Typed error extraction with field-level validation errors (`ApiError`).
   - Sanctum-compatible Bearer token persistence and auto-injected `X-Device-UUID` header.

5. **25+ Reusable Components (`src/components/`)**:
   - UI: `Button`, `LinkButton`, `Badge`, `Card`, `StatCard`, `Modal`, `DataTable`, `FilterBar`, `Pagination`, `EmptyState`, `Skeleton`, `Alert`, `Tabs`, `DefinitionList`.
   - Forms: `FormField`, `Input`, `Select`, `Textarea`, `Checkbox`.
   - Shared: `PermissionMatrix`.
   - Layout: `AppLayout` (with collapsible sidebar, status indicator, mobile drawer), `AuthLayout`, `PageHeader`.

---

## 📁 Directory Structure

```text
frontend/
├── public/
│   └── assets/
│       ├── fonts/          # Plus Jakarta Sans, JetBrains Mono, Noto Naskh Arabic
│       └── images/         # Logos and icons
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── admin/
│   │   │       ├── 2fa/challenge/page.tsx
│   │   │       └── confirm-auth/page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx                     # Auth guard & AppLayout
│   │   │   ├── page.tsx                       # Dashboard & KPIs
│   │   │   ├── products/                      # List, Create, Edit, Trash
│   │   │   ├── inventory/                     # Stock levels & Quick Adjust
│   │   │   ├── orders/                        # Orders, Detail, Review, Unassigned, Return
│   │   │   ├── returns/                       # RMA returns list & show
│   │   │   ├── customers/                     # Directory, Edit, Ledger, Merge
│   │   │   ├── devices/                       # Hardware list & Kill switch
│   │   │   ├── conflicts/                     # Overdraft sync queue
│   │   │   ├── import/                        # Catalog CSV batch importer
│   │   │   ├── audit/                         # Audit event trail
│   │   │   ├── settings/                      # System config & Invoice customizer
│   │   │   ├── users/                         # Staff accounts & permissions
│   │   │   ├── roles/                         # Role builder & Permission matrix
│   │   │   ├── reports/                       # Closing, Sales, Profit, Inventory, Receivables, Ops
│   │   │   └── health/                        # Telemetry probe & DB connection pool
│   │   ├── pos/page.tsx                       # Web POS Terminal
│   │   ├── pos-launcher/page.tsx              # Hardware launcher portal
│   │   ├── layout.tsx                         # Root layout & AuthProvider
│   │   ├── globals.css                        # Dark design tokens
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── not-found.tsx
│   ├── components/                            # 25 typed UI, Form, and Layout components
│   ├── context/AuthContext.tsx                # Auth state, login, 2FA, permissions
│   ├── lib/
│   │   ├── api/client.ts                      # Envelope unwrap client
│   │   ├── api/endpoints.ts                   # Verified FastAPI endpoint map
│   │   ├── api/errors.ts                      # Standard ApiError class
│   │   └── utils.ts                           # PKR currency & quantity formatting
│   └── types/                                 # Full TypeScript interfaces
├── tests/
│   └── api_client.test.ts                     # Vitest test suite
├── .env.example
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## 🛠️ Environment Configuration

Create `.env.local` inside `frontend/`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME="OMS by Shehroz"
NEXT_PUBLIC_ENABLE_OFFLINE_SYNC=true
```

---

## 💻 Running Locally

### Development Server
```bash
npm run dev
# App will run at http://localhost:3000
```

### Production Build & Type Checking
```bash
npm run build
npm run start
```

### Automated Testing
```bash
npm test
```
