# E-Commerce REST API

A backend API for an online store, featuring JWT authentication with role-based access control, a searchable product catalog, and transactional order checkout. Built with Node.js, Express, TypeScript, PostgreSQL and Prisma.

## Features

- **Authentication:** registration and login with bcrypt-hashed passwords and signed JWTs (15-minute expiry)
- **Role-based access control:** `USER` and `ADMIN` roles, with admin-only routes
- **Security:** Helmet security headers, CORS restricted to a trusted origin, and login rate limiting (5 attempts per 15 minutes)
- **Products:** paginated listing with case-insensitive name search; admin-only creation
- **Orders:** checkout runs inside a single Prisma `$transaction` that validates products, deducts stock atomically, calculates the total on the server and rolls everything back on failure
- **Relational data model:** `User`, `Product`, `Order` and `OrderItem` with one-to-many and many-to-many relations

## Tech Stack

| Layer           | Technology                                             |
| --------------- | ------------------------------------------------------ |
| Runtime         | Node.js                                                |
| Framework       | Express 5                                              |
| Language        | TypeScript                                             |
| Database        | PostgreSQL                                             |
| ORM             | Prisma (with `@prisma/adapter-pg`)                     |
| Auth & Security | jsonwebtoken, bcrypt, helmet, cors, express-rate-limit |

## Project Structure

```
prisma/
  schema.prisma        # Data models and relations
  migrations/          # SQL migrations
src/
  controllers/         # Request validation and HTTP responses
  middleware/          # authenticateToken, authorizeRole
  routes/              # Route definitions
  services/            # Business logic and database access
  prisma.ts            # Prisma client instance
  index.ts             # App entry point
```

The code follows a **Routes → Controllers → Services** separation of concerns.

## API Endpoints

| Method | Endpoint                   | Access        | Description                                     |
| ------ | -------------------------- | ------------- | ----------------------------------------------- |
| POST   | `/api/auth/register`       | Public        | Create a new account                            |
| POST   | `/api/auth/login`          | Public        | Log in and receive a JWT                        |
| GET    | `/api/auth/profile`        | Authenticated | Get the logged-in user's data                   |
| GET    | `/api/auth/admindashboard` | Admin         | Admin-only test route                           |
| GET    | `/api/products`            | Public        | List products (`?page=1&limit=10&search=shirt`) |
| POST   | `/api/products`            | Admin         | Create a product                                |
| POST   | `/api/orders`              | Authenticated | Place an order                                  |

Protected routes expect the header `Authorization: Bearer <token>`.

### Example: place an order

Request:

```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [{ "productId": 1, "quantity": 2 }]
}
```

Response `201 Created`:

```json
{
  "id": 1,
  "total": "200",
  "userId": 5,
  "orderItems": [{ "id": 1, "orderId": 1, "productId": 1, "quantity": 2 }]
}
```

If the stock is not enough, or a product does not exist, the API responds with `400` and the whole operation is rolled back.

## Getting Started

### Prerequisites

- Node.js
- A running PostgreSQL instance

### Installation

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
npm install
```

### Environment variables

Copy `.env.example` to `.env` and fill in the values:

| Variable       | Description                                         |
| -------------- | --------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string                        |
| `JWT_SECRET`   | Secret used to sign JWTs (use a long random string) |

### Database setup

```bash
npx prisma migrate dev
npx prisma generate
```

### Run the server

```bash
npm run dev
```

The API runs on `http://localhost:3000`.

### Creating an admin

New accounts are created with the `USER` role. To promote an account, open Prisma Studio, find the user and change `role` to `ADMIN`:

```bash
npx prisma studio
```

## Scripts

| Script          | Description                    |
| --------------- | ------------------------------ |
| `npm run dev`   | Start the server in watch mode |
| `npm run build` | Compile TypeScript to `dist/`  |
| `npm start`     | Run the compiled build         |

## Design Decisions

- **Prices come from the database, never from the client.** The order total is calculated on the server with `Decimal` to avoid floating-point errors.
- **Stock is deducted with a conditional update** (`stock >= quantity`), so two customers buying the last item at the same time cannot oversell it.
- **Errors are split by cause:** client mistakes return `400`, missing or invalid tokens return `401`/`403`, and unexpected failures return `500`.

## Roadmap

- Redis caching for catalog endpoints
- Docker and Docker Compose setup
- Automated tests and a CI pipeline with GitHub Actions
