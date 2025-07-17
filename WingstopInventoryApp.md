# Product Requirements Document (PRD): Inventory App

## 1. Introduction/Overview

The Inventory App is designed to help fast-food restaurant locations (e.g., Wingstop) efficiently track, manage, and forecast their on-hand stock of food ingredients, supplies, and materials. By replacing pen‑and‑paper inventory logs with a responsive web and native mobile solution, store-level users can record counts more accurately, view historical trends, receive reorder suggestions, and compare stock levels across multiple locations. The goal is to minimize stock-outs, reduce waste, and streamline ordering preparation.

## 2. Goals

* **Eliminate stock-outs:** Ensure critical items never run out by providing timely reorder alerts.
* **Improve forecasting accuracy:** Offer flexible forecasting horizons (weekly, monthly/seasonal, or custom) with manual override.
* **Streamline data entry:** Enable fast, validated on‑hand count submissions via mobile/web—online or offline.
* **Centralize multi-location insights:** Compare inventories side‑by‑side, view aggregated trends, and identify low‑stock heatmaps.
* **Support future extensibility:** Provide placeholders for cost tracking and vendor integrations without blocking MVP delivery.

## 3. User Stories

1. **As a shift lead**, I want to enter today's count for each item so that I can report accurate on‑hand stock.
2. **As a store manager**, I want to modify the master inventory list (add/remove items, categories, units) so that new sauces or supplies are tracked.
3. **As a store clerk**, I want to work offline at peak hours and sync later so that I can keep counting even with poor connectivity.
4. **As a regional admin**, I want to compare stock levels across all stores in a heatmap so I can prioritize urgent restocks.
5. **As a store manager**, I want to receive in‑app reminders twice weekly to perform counts so I never miss a scheduled inventory check.
6. **As a shift lead**, I want to see suggested order quantities and a CSV/XLSX export of purchase lists so I can manually submit orders to vendors.

## 4. Functional Requirements

1. **Inventory Item Management**
   1.1. Create/edit/delete items with fields: name, unit of measure (each, weight, volume, case, etc.), category, par level, reorder increment, vendor/SKU.
   1.2. Categorize items (e.g., Produce, Paper Goods, Cleaners).
2. **Count Entry & Editing**
   2.1. Submit on‑hand counts via mobile/web with numeric validation.
   2.2. Edit past submissions; system logs author, helpers, and timestamp.
   2.3. Track borrowed transfers from other stores.
3. **Offline Mode**
   3.1. Allow count entry offline; queue submissions and sync automatically when online.
   3.2. Enable read‑only access to the latest data while offline.
4. **Scheduling & Notifications**
   4.1. Configure recurring inventory events twice per week (e.g., Mon & Thu) with in‑app reminders.
   4.2. Allow manual reminders for ad‑hoc counts.
   4.3. Enable users to set ordering dates per event.
5. **Forecasting & Order Suggestions**
   5.1. Calculate usage: previous count + received stock − current count.
   5.2. Generate suggested order = max(par level − current count, 0), rounded to reorder increment.
   5.3. Support forecasting horizons: weekly, monthly/seasonal, custom (e.g., next 2 weeks, 6 months).
   5.4. Allow manual override of suggestions.
6. **Reporting & Exports**
   6.1. Dashboard: due/overdue counts, key usage metrics, low‑stock heatmap.
   6.2. Historical usage & variance reports (daily/weekly/monthly).
   6.3. Compare inventories across stores: side‑by‑side tables, trend charts, heatmaps.
   6.4. Export purchase orders and count data in CSV and Excel (.xlsx).
7. **Security & Access Control**
   7.1. Username/password authentication.
   7.2. Role‑based permissions: clerk (edit own store), manager (edit & view), admin (all locations).
   7.3. End‑to‑end encryption: TLS in transit, encryption at rest.
8. **System & Performance**
   8.1. Responsive UI: page load < 2s, real‑time search filters.
   8.2. RESTful API backend for integrations and future extensibility.
   8.3. Scalable design: support 1,000+ items per location, multiple locations.
   8.4. Modular codebase with automated tests for maintainability.

## 5. Non-Goals (Out of Scope)

* Automatic order placement via vendor APIs or EDI.
* Detailed cost tracking or invoice reconciliation (placeholder only).
* Barcode/RFID or other automated scanning methods.
* Multi‑warehouse transfer workflows beyond simple borrow/loan entries.

## 6. Design Considerations (Optional)

* Follow Wingstop branding guidelines (colors, typography).
* Use a mobile‑first, responsive layout; support both iOS & Android native shells.
* Provide intuitive CRUD modals for item management and bulk CSV/XLSX imports.

## 7. Technical Considerations

### Technology Stack
* **Frontend**: React.js with TypeScript for type safety and modern development experience
* **Backend**: FastAPI with Python for high-performance, async-capable API development
* **Package Manager**: UV for fast Python dependency management and virtual environments
* **Database ORM**: SQLModel for type-safe database interactions combining SQLAlchemy and Pydantic
* **Database**: SQLite for development, PostgreSQL for production
* **Authentication**: JWT tokens with FastAPI security utilities
* **API Documentation**: Automatic OpenAPI/Swagger documentation via FastAPI

### Architecture
* **Frontend-Backend Separation**: React.js SPA communicating with FastAPI REST API
* **Type Safety**: Full TypeScript on frontend, SQLModel/Pydantic on backend
* **Development Workflow**: UV for Python dependencies, npm/yarn for React dependencies
* **Deployment**: Containerized deployment with Docker for both frontend and backend

## 8. Success Metrics

* **Adoption:** 90% of scheduled counts completed on time within the first month.
* **Accuracy:** <5% discrepancy between physical counts and system records over 3 months.
* **Forecast Precision:** Suggestions within ±10% of actual usage for 80% of items over 4 weeks.
* **User Satisfaction:** >4/5 average rating in manager feedback surveys.

## 9. Open Questions

1. Which days of the week should default scheduling use (e.g., Mon/Thu)?
2. What file naming conventions should CSV/XLSX exports follow?
3. Is there an existing authentication service we must integrate with, or will we build one from scratch?
4. Are there any regulatory or audit requirements for data retention beyond 1 year?
