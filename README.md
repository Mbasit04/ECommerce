# E-Commerce Web Application

A full-stack **E-Commerce web application** built with **ASP.NET Core Web API** for the
backend, **React (Vite)** for the frontend, **SQL Server** for persistence, and
**Stripe** as a payment gateway. The application supports three distinct user roles
(**Admin**, **Seller**, and **Customer**) with role-based authorization enforced
across every endpoint.

---

## Table of Contents

1. [Features](#features)
2. [User Roles](#user-roles)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
   - [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [Authentication & Authorization](#authentication--authorization)
8. [API Overview](#api-overview)
9. [Payment Integration](#payment-integration)
10. [Order & Shipping Flow](#order--shipping-flow)
11. [Future Improvements](#future-improvements)
12. [Author](#author)

---

## Features

### Customer
- Browse products, filter by category, search
- View product details with deal/discount prices
- Add / update / remove items from cart
- Checkout with **Cash on Delivery (COD)** or **Stripe** (PKR)
- View personal order history with full details
- Track order status and shipping tracking number
- Cancel orders (when allowed by status)
- Request refund
- Submit product feedback (1–5 stars + comment)
- Chat with the seller of a product
- Manage profile and password

### Seller
- Manage seller profile and password
- Add, edit, soft-delete, and view own products
- Manage product stock (increase / decrease with reason log)
- View per-product and full stock-movement history
- Create / edit / soft-delete product deals (discount %)
- View dashboard (total products, orders, sales, stock, pending orders)
- View orders for products they sell
- Add tracking number to a shipping record
- Mark orders as **Shipped** and **Delivered** with timestamps
- Customer messaging inbox

### Admin
- Full user management (create / edit / soft-delete admins, sellers, customers)
- Category management
- Global product and stock oversight
- View / update any order's status
- View every transaction / payment across the platform
- Initiate refunds (Stripe API)

---

## User Roles

The system enforces **three distinct roles**. Each role has its own controller namespace
under `/api/Admin`, `/api/Seller`, `/api/Customer`. Cross-role access is blocked both at
the controller level (`[Authorize(Roles = "...")]`) and at the service level.

| Role       | Auth route                          | Capabilities (summary)                             |
|------------|-------------------------------------|----------------------------------------------------|
| **Admin**    | `/api/Admin/*`                      | Full platform management                           |
| **Seller**   | `/api/Seller/*`                     | Own products, stock, orders, shipping, deals       |
| **Customer** | `/api/Customer/*`                   | Browse, cart, checkout, orders, refunds, feedback  |

---

## Tech Stack

### Backend
- **ASP.NET Core 10.0** Web API
- **C#**
- **Entity Framework Core** (SQL Server provider)
- **Microsoft SQL Server** (LocalDB for development)
- **BCrypt.Net** for password hashing
- **JWT Bearer** authentication
- **Stripe.net** SDK (PaymentIntents, Refunds, Webhooks)
- **Swagger / Swashbuckle** for API exploration

### Frontend
- **React 18** with **Vite 6** as the build tool
- **React Router v7**
- **Axios** for HTTP
- **Bootstrap 5.3** + custom CSS
- **React Toastify** for notifications
- **Stripe React Elements** (`@stripe/react-stripe-js`) — `<PaymentElement />`

---

## Project Structure

```
ECommerce/
│
├── Backend/
│   └── ECommerce.API/
│       ├── Configuration/        # StripeSettings, etc.
│       ├── Controllers/          # Admin / Auth / Categories / Customer / Orders /
│       │                         #   Payments / Products / Seller / Stock / Deals
│       ├── Data/                 # ApplicationDbContext + EF migrations
│       ├── DTOs/                 # Request / response shapes, grouped by domain
│       ├── Helpers/
│       ├── Interfaces/           # Service contracts
│       ├── Migrations/           # EF Core generated migrations
│       ├── Models/               # User, Product, Order, OrderItem, Payment,
│       │                         #   Transaction, Shipping, Refund, Feedback, …
│       ├── Services/             # Business logic for each controller
│       ├── appsettings.json
│       ├── appsettings.Development.json
│       └── Program.cs
│
├── Frontend/
│   └── ecommerce-frontend/
│       ├── public/
│       ├── src/
│       │   ├── api/              # Axios clients
│       │   ├── components/       # Reusable UI components (Navbar, Sidebar, …)
│       │   ├── context/          # AuthContext, CartContext
│       │   ├── pages/            # Customer / Seller / Admin pages
│       │   ├── services/         # service.js, stripe.js, …
│       │   ├── App.jsx
│       │   └── main.jsx
│       ├── .env                  # VITE_API_URL, VITE_STRIPE_PUBLISHABLE_KEY
│       ├── package.json
│       └── vite.config.js
│
├── .gitignore
└── README.md   ← this file
```

---

## Getting Started

### Prerequisites

- **.NET SDK 10.0** (`dotnet --version`)
- **Node.js 18+** and **npm** (or pnpm/yarn)
- **SQL Server LocalDB** (ships with Visual Studio) or any SQL Server instance
- **Stripe account** in test mode (publishable + secret keys)

---

### Backend Setup

1. Open a terminal and navigate to the backend project:

   ```powershell
   cd D:\ECommerce\Backend\ECommerce.API
   ```

2. Restore NuGet packages:

   ```powershell
   dotnet restore
   ```

3. Update the connection string in `appsettings.json` (default already targets LocalDB):

   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=ECommerceDB;Trusted_Connection=True;TrustServerCertificate=True;"
   }
   ```

4. Apply existing migrations (creates schema + role seeds):

   ```powershell
   dotnet ef database update
   ```

   If `dotnet-ef` is not installed once:

   ```powershell
   dotnet tool install --global dotnet-ef
   ```

5. Configure Stripe keys in `appsettings.Development.json`:

   ```json
   {
     "Stripe": {
       "SecretKey":        "sk_test_...",
       "PublishableKey":   "pk_test_...",
       "WebhookSecret":    "whsec_..."
     }
   }
   ```

6. Run the API:

   ```powershell
   dotnet run
   ```

   The backend will start on **https://localhost:7210** by default. Swagger UI is
   exposed at **https://localhost:7210/swagger**.

---

### Frontend Setup

1. Open a new terminal and navigate to the frontend project:

   ```powershell
   cd D:\ECommerce\Frontend\ecommerce-frontend
   ```

2. Install dependencies:

   ```powershell
   npm install
   ```

3. Configure environment variables in `.env`:

   ```env
   VITE_API_URL=https://localhost:7210/api
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

4. Start the dev server:

   ```powershell
   npm run dev
   ```

   Vite serves the SPA at **http://localhost:5173**.

---

### Database Setup

The project uses **EF Core code-first migrations**. After editing any model,
generate a new migration:

```powershell
cd D:\ECommerce\Backend\ECommerce.API
dotnet ef migrations add MigrationName
dotnet ef database update
```

Seed data on first run:

- Three roles: **Admin**, **Seller**, **Customer**
- No users — register through `/api/Auth/register` or via Swagger

---

## Running the Application

Start **both** processes in separate terminals:

| Terminal | Command                          | URL                          |
|----------|----------------------------------|------------------------------|
| Backend  | `dotnet run` (in `Backend/ECommerce.API`) | `https://localhost:7210/swagger` |
| Frontend | `npm run dev` (in `Frontend/ecommerce-frontend`) | `http://localhost:5173`       |

CORS is configured to allow the dev origin `http(s)://localhost:5173`.

---

## Authentication & Authorization

- All protected endpoints require a **Bearer JWT** token issued by `/api/Auth/login`.
- The token embeds the user's numeric id and role claim.
- Controllers enforce role-based authorization:

  ```csharp
  [ApiController]
  [Route("api/[controller]")]
  [Authorize(Roles = "Customer")]
  public class CustomerController : ControllerBase { … }

  [Authorize(Roles = "Seller")]
  public class SellerController : ControllerBase { … }

  [Authorize(Roles = "Admin")]
  public class AdminController : ControllerBase { … }
  ```

- Cross-tenant isolation: services re-check ownership before returning/updating
  any row owned by another role (e.g. customer cannot read another customer's
  order; seller cannot ship another seller's order).

- Passwords are stored using **BCrypt** with per-user salts.

---

## API Overview

Open `https://localhost:7210/swagger` to explore every endpoint. Highlights:

| Controller           | Base route             | Purpose                                |
|----------------------|------------------------|----------------------------------------|
| `AuthController`     | `/api/Auth`            | Register / login / forgot / reset      |
| `AdminController`    | `/api/Admin`           | Admin-only management                  |
| `SellerController`   | `/api/Seller`          | Seller products, stock, deals, shipping |
| `CustomerController` | `/api/Customer`        | Cart, checkout, orders, feedback, chat |
| `OrdersController`   | `/api/Orders`          | Cross-role order ops                   |
| `PaymentsController` | `/api/Payment`         | Stripe PaymentIntent, confirm-checkout, **webhook** |
| `ProductsController` | `/api/Products`        | Public product listing                 |
| `CategoriesController` | `/api/Categories`   | Public categories                      |
| `DealsController`    | `/api/Deals`           | Public deals                           |
| `StockController`    | `/api/Stock`           | Admin stock ops                        |

---

## Payment Integration

### Stripe

- **Currency**: `pkr`
- **Flow**:
  1. Customer chooses *Stripe* at checkout.
  2. Frontend `POST /api/Payment/create-intent` → backend creates a real
     Stripe `PaymentIntent` and returns `clientSecret`.
  3. Frontend `<PaymentElement />` collects card details and confirms.
  4. On success, frontend `POST /api/Payment/confirm-checkout` finalizes the
     order on our side (Order, Payment, Transaction records).
- **Webhook**: `POST /api/Payment/webhook`
  - Receives `payment_intent.succeeded`, `payment_intent.payment_failed`,
    `charge.refunded`.
  - Signature verified via `Stripe-Signature` header + `Stripe.WebhookSecret`.
  - Shared idempotent handler (`HandleStripePaymentSucceededAsync`) ensures the
    same payment intent can never create a duplicate order/payment/transaction.
- **Test cards**:
  - Success: `4242 4242 4242 4242` (any future date, any CVC, any ZIP)
  - Decline: `4000 0000 0000 0002`

### COD (Cash on Delivery)
- Order is created with `PaymentStatus = Pending`.
- Seller marks the order's payment as `Paid` via
  `PUT /api/Payment/cod/{orderId}/mark-paid`.

---

## Order & Shipping Flow

```
Customer places Order
        ↓
Order Status = Pending  (or Confirmed once paid)
        ↓
Seller sees Order
        ↓
Seller enters Tracking Number
        ↓
PUT /api/Seller/shipping/{orderId}/ship
        ↓
OrderStatus = Shipped + ShippedAt timestamp
        ↓
Customer can track order
        ↓
PUT /api/Seller/shipping/{orderId}/deliver
        ↓
OrderStatus = Delivered + DeliveredAt timestamp
```

Shipping endpoints (Seller role):
- `GET    /api/Seller/shipping`
- `GET    /api/Seller/shipping/{orderId}`
- `PUT    /api/Seller/shipping/{orderId}/tracking`
- `PUT    /api/Seller/shipping/{orderId}/ship`
- `PUT    /api/Seller/shipping/{orderId}/deliver`

---

## Future Improvements

- Product reviews beyond a single feedback (e.g. verified-buyer-only)
- Image upload pipeline for products (currently public URL)
- Wishlist / saved-for-later
- Multi-seller cart split shipments
- Web push / email notifications for order status changes
- Stripe **live mode** rollout (requires PKR-supported Stripe account / region
  configuration)
- Production deployment (Docker, CI/CD, hosted SQL Server / Postgres)
- Audit log table for admin actions
- Rate-limiting on auth endpoints

---

## Author

Built by **Ammar Aziz** — a full-stack learning project covering React,
ASP.NET Core, EF Core, JWT, Stripe, and role-based access control end to end.

---

> For issues, questions, or contributions, please open an issue or PR on the
> GitHub repository.
