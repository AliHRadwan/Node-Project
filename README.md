# Bookly - Online Bookstore

> A full-stack e-commerce platform for browsing, purchasing, and downloading e-books, with Stripe payments, AI-powered chat assistance, and a comprehensive admin dashboard.

---

## ITI - ITP Full-stack Node.js 2025/2026 R1 New Capital

### ITI Project - Group 2

| # | Team Member |
|---|------------|
| 1 | Ali Hamed Elsayed Radwan |
| 2 | Youssef Hany Abdelaaty Abbas |
| 3 | Muhammed Ali Muhammed Ibrahim |
| 4 | Ali Gamal Abdullah |
| 5 | Mohamed Aboelkhair |
| 6 | Amr Ezzat |

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## Overview

**Bookly** is an online bookstore built as a full-stack application with a Node.js/Express backend and an Angular frontend. Users can browse books, filter by category and price, add items to a cart, pay with Stripe, and download purchased e-books. Authors can apply to publish their own books, and admins have a full dashboard for managing inventory, orders, and users.

### Key Highlights

- **E-book Store**: Browse, search, and filter books by category, author, and price range
- **Stripe Payments**: Secure checkout with Stripe-hosted payment pages, webhooks, and coupon support
- **Author Platform**: Users can apply to become authors, upload books (cover images + PDF), and manage their catalog
- **AI Chatbot**: Integrated chat assistant powered by OpenAI / Groq for customer support
- **Real-time Notifications**: WebSocket-based notifications for new book releases
- **Admin Dashboard**: Manage books, orders, authors, and users from a single panel
- **Email Notifications**: Verification emails, login alerts, order confirmations, and password resets

---

## Features

### Customer Features
- **User Registration & Login** with email verification
- **Book Catalog** with search, category filters, price range filters, and sorting
- **Book Detail Pages** with reviews, ratings, and stock info
- **Shopping Cart** with quantity management and stock validation
- **Checkout** with saved address selection, new address creation, and coupon codes
- **Stripe Payment** integration with success/failure handling
- **Digital Library** to download purchased e-books as PDF
- **User Profile** with address management, order history, and password change
- **Account Deletion & Restoration** flow

### Author Features
- **Author Application** with admin approval workflow
- **Author Profile** page with published books
- **Book Upload** with cover image and PDF file (via AWS S3)

### Admin Features
- **Dashboard** with order and book management
- **Author Review** system (approve, reject, revoke authors)
- **Book Management** (create, edit, deactivate books)
- **Order Management** with status tracking
- **Category Management**

### Integration Features
- **Stripe Webhooks** for reliable payment processing
- **AWS S3** for file storage (book covers and PDFs)
- **Redis** for caching and rate limiting
- **WebSocket** for real-time new book notifications
- **Cron Jobs** for reservation expiry and scheduled tasks
- **Swagger / OpenAPI** documentation

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           CLIENTS                               │
├──────────────────┬──────────────────┬───────────────────────────┤
│   Web Browser    │   AI Chatbot     │   Stripe Webhooks         │
└────────┬─────────┴────────┬─────────┴──────────┬────────────────┘
         │                  │                    │
         ▼                  ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ANGULAR FRONTEND (SPA)                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐ │
│  │   Home /   │  │   Cart /   │  │   User     │  │   Admin   │ │
│  │  Catalog   │  │  Payment   │  │  Profile   │  │ Dashboard │ │
│  └────────────┘  └────────────┘  └────────────┘  └───────────┘ │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP / WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXPRESS.JS BACKEND (API)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐ │
│  │   Auth   │ │  Books   │ │  Orders  │ │   Payments/Stripe  │ │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├────────────────────┤ │
│  │  Users   │ │ Authors  │ │   Cart   │ │   File Upload/DL   │ │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├────────────────────┤ │
│  │ Profiles │ │ Reviews  │ │Categories│ │   AI Chat (Groq)   │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────────┘ │
└──────┬──────────────┬──────────────┬──────────────┬─────────────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│  MongoDB   │ │   Redis    │ │  AWS S3    │ │  Stripe    │
│ (Database) │ │  (Cache)   │ │ (Storage)  │ │ (Payments) │
└────────────┘ └────────────┘ └────────────┘ └────────────┘
```

---

## Project Structure

```
Node-Project/
├── backend/                        # Node.js / Express API
│   ├── server.js                   # Entry point
│   ├── config/
│   │   ├── db.js                   # MongoDB connection
│   │   ├── redis.js                # Redis connection
│   │   ├── stripe.js               # Stripe configuration
│   │   ├── s3.js                   # AWS S3 configuration
│   │   ├── multer.js               # File upload config
│   │   ├── rateLimiter.js          # Rate limiting
│   │   └── logger.js               # Winston logger
│   ├── controllers/
│   │   ├── authController.js       # Login / Logout
│   │   ├── registerController.js   # Registration & email verification
│   │   ├── profileController.js    # User profile & addresses
│   │   ├── bookController.js       # Book CRUD & search
│   │   ├── authorController.js     # Author management
│   │   ├── categoryController.js   # Category CRUD
│   │   ├── cart.controller.js      # Shopping cart
│   │   ├── orderController.js      # Order management
│   │   ├── reviewController.js     # Book reviews
│   │   ├── uploadController.js     # File uploads (S3)
│   │   ├── downloadController.js   # E-book downloads
│   │   └── verifyemail.js          # Email verification
│   ├── models/
│   │   ├── User.js                 # User schema
│   │   ├── Book.js                 # Book schema
│   │   ├── Author.js               # Author schema
│   │   ├── Category.js             # Category schema
│   │   ├── Order.js                # Order schema
│   │   ├── cart.model.js           # Cart schema
│   │   ├── Payment.js              # Payment schema
│   │   ├── reviewModel.js          # Review schema
│   │   ├── Token.js                # Verification / reset tokens
│   │   └── Session.js              # User sessions
│   ├── routes/                     # Express route definitions
│   ├── middleware/                  # JWT auth, role check, caching
│   ├── validators/                 # Joi validation schemas
│   ├── services/                   # Email services
│   ├── utils/                      # WebSocket, cron jobs, reservations
│   ├── webhooks/                   # Stripe webhook handler
│   └── swagger/                    # OpenAPI 3.0 documentation
│
├── frontend/                       # Angular 20 SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── components/     # Header, Footer, Chatbot, Discount
│   │   │   │   ├── services/       # Auth, Book, Cart, Toast, etc.
│   │   │   │   ├── guards/         # Auth & Admin route guards
│   │   │   │   ├── interceptors/   # HTTP auth interceptor
│   │   │   │   └── models/         # TypeScript interfaces
│   │   │   ├── features/
│   │   │   │   ├── home/           # Home page & book catalog
│   │   │   │   ├── book-detail/    # Book detail & reviews
│   │   │   │   ├── cart/           # Cart, Payment, Success/Failed
│   │   │   │   ├── dashboard/      # Admin dashboard (books, orders)
│   │   │   │   ├── account/        # User profile & settings
│   │   │   │   ├── author-profile/ # Author profile page
│   │   │   │   ├── registeration/  # User registration
│   │   │   │   ├── review-authors/ # Admin author review
│   │   │   │   ├── about/          # About page
│   │   │   │   └── contact/        # Contact page
│   │   │   ├── shared/             # Shared components & modules
│   │   │   └── login/              # Login page
│   │   ├── environments/           # Environment configuration
│   │   └── styles.css              # Global styles
│   └── angular.json                # Angular CLI configuration
│
├── package.json                    # Root dependencies
└── README.md                       # This file
```

---

## Tech Stack

### Backend (Node.js)
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime Environment |
| Express 5 | Web Framework |
| MongoDB + Mongoose | Database & ODM |
| Redis | Caching & Rate Limiting |
| JWT (jsonwebtoken) | Authentication |
| Stripe | Payment Processing |
| AWS S3 | File Storage (covers & PDFs) |
| Nodemailer | Email Service |
| Joi | Request Validation |
| WebSocket (ws) | Real-time Notifications |
| Winston | Logging |
| Swagger UI | API Documentation |
| OpenAI / Groq | AI Chat Assistant |

### Frontend (Angular)
| Technology | Purpose |
|------------|---------|
| Angular 20 | Frontend Framework |
| Angular Material | UI Component Library |
| Bootstrap 5 | Responsive Layout & Utilities |
| Bootstrap Icons | Icon Set |
| RxJS | Reactive Programming |
| TypeScript | Type-safe Development |

---

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** 18+ and npm
- **MongoDB** 6.0+ (or a MongoDB Atlas cluster)
- **Redis** 7+ (or a managed Redis instance)
- **Git**

You will also need accounts/keys for:
- **Stripe** (payment processing)
- **AWS S3** (file storage)
- **Gmail** or SMTP provider (email sending)
- **OpenAI** or **Groq** (AI chatbot, optional)

---

## Installation & Setup

### Clone the Repository

```bash
git clone https://github.com/your-repo/Node-Project.git
cd Node-Project
```

### Backend Setup

1. **Install root dependencies:**
   ```bash
   npm install
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Create environment file:**
   Create a `.env` file in the project root with the required variables (see [Environment Variables](#environment-variables)).

4. **Start MongoDB and Redis:**
   Ensure both MongoDB and Redis are running locally, or configure connection strings for remote instances.

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API URL:**
   Edit `src/environments/environment.ts` to point to your backend:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:3000/api',
     siteName: 'Bookly Bookstore'
   };
   ```

---

## Running the Application

### Start All Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
ng serve
```

### Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:3000/api |
| API Documentation (Swagger) | http://localhost:3000/api/docs |

---

## API Documentation

The API is documented using OpenAPI 3.0 (Swagger).

### Viewing Documentation

1. **Swagger UI**: Navigate to `http://localhost:3000/api/docs` (non-production only)
2. **Raw YAML**: See `backend/swagger/swagger.yaml`

### API Endpoints Overview

| Category | Endpoints |
|----------|-----------|
| Auth | Register, Login, Logout, Email Verification |
| Password | Forgot Password, Reset Password, Change Password |
| Profile | Get/Update Profile, Add/Update/Delete Address |
| Books | CRUD, Search, Filter, Best Sellers |
| Authors | Apply, Approve/Reject/Revoke, List, Profile |
| Categories | CRUD |
| Cart | Get, Add, Update, Remove, Clear |
| Orders | Place, Cancel, List, Details |
| Payments | Stripe Checkout, Webhooks |
| Reviews | Create, List by Book |
| Upload | Image & PDF Upload (S3) |
| Download | Download Purchased Books |
| Chat | AI Chat Assistant |

---

## Environment Variables

### Backend (.env)

```env
# Server
HOST=http://localhost
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:4200

# Database
MONGO_URI=mongodb://localhost:27017/bookly

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Authentication
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_S3_BUCKET=your_bucket_name

# Email (Gmail / SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# AI Chatbot (optional)
GROQ_API_KEY=your_groq_api_key
```

### Frontend (environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  siteName: 'Bookly Bookstore'
};
```

---

## Security

- JWT-based authentication with session management
- Passwords hashed with bcrypt (10 salt rounds)
- Email verification required before login
- Rate limiting on authentication endpoints
- Role-based access control (User, Author, Admin)
- Joi input validation on all API requests
- CORS configured for allowed origins
- Stripe webhook signature verification

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is developed as part of an ITI project and is for educational purposes.

---

<p align="center">
  Made with care by ITI Group 2
</p>
