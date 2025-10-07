# 🍰 Bake Server - SaaS Marketplace for Bakers

A **TypeScript + Express + Prisma** backend for a SaaS platform that allows **bakers to sell products online** and buyers to browse, order, and pay. Includes features like **shops, products, categories, orders, payments, ratings, favorites, carts, and nutritional information**.

---

## 🏗 Project Stack

- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL (via Prisma ORM)
- **Authentication & Authorization:** Role-based (`BUYER`, `SELLER`, `ADMIN`)
- **Environment Management:** `dotenv`
- **Security:** `helmet`, `cors`
- **Dev Tools:** `nodemon`, `ts-node`, TypeScript

---

## ⚡ Features

### Users

- Roles: **BUYER, SELLER, ADMIN**
- Profile: Name, Email, Password, Phone, Avatar
- Addresses for delivery
- Manage carts, orders, favorites

### Shops

- Owned by **sellers**
- Name, description, contact info
- Products attached to shop

### Products

- Categories
- Ingredients list
- Images & thumbnails
- Nutritional info (Protein, Carbs, Fat, etc.)
- Ratings & reviews
- Favorites

### Orders & Payments

- Cart per buyer
- Orders with items and snapshots of prices
- Payments with status and methods
- Order statuses: PENDING, PAID, SHIPPED, DELIVERED, CANCELLED

### Additional

- Timestamps for all entities
- Normalized schema to avoid repetition
- Production-ready Prisma relations

---

## 🗂 Project Structure

```
bake-server/
├─ prisma/
│  └─ schema.prisma      # Prisma schema
├─ src/
│  ├─ config/
│  │  └─ prisma.ts       # Prisma client
│  ├─ routes/            # Express routes
│  ├─ controllers/       # Business logic
│  └─ server.ts          # Express server entry
├─ .env                  # Environment variables
├─ package.json
├─ tsconfig.json
├─ nodemon.json
└─ README.md
```

---

## ⚙ Setup Instructions

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/tushar-behera15/bake-server.git
cd bake-server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/bake_db?schema=public"
PORT=5000
```

### 3. Setup Prisma & Database

```bash
npx prisma generate         # Generate Prisma client
npx prisma migrate dev      # Run migrations
```

Optional: Open Prisma Studio to view data:

```bash
npx prisma studio
```

### 4. Start Development Server

```bash
npm run dev
```

Server runs at: `http://localhost:4000`

### 5. Build & Start for Production

```bash
npm run build
npm start
```

---

## 📦 Scripts

```json
"scripts": {
  "dev": "nodemon --exec ts-node src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev"
}
```

---

## 🔒 Dependencies

**Runtime**

- `express` — Web framework
- `cors` — Cross-Origin Resource Sharing
- `helmet` — Security headers
- `dotenv` — Environment variables
- `@prisma/client` — Prisma ORM

**Dev**

- `typescript`
- `ts-node`
- `nodemon`
- `@types/node`
- `@types/express`
- `@types/cors`
- `@types/helmet`

---

## 📝 Notes

- Products can have multiple ingredients, images, and nutritional values
- Orders snapshot product price to avoid historical changes
- Users can add favorites and rate products
- Schema is normalized for production readiness

---

## 📚 References

- [Prisma Docs](https://www.prisma.io/docs/)
- [Express Docs](https://expressjs.com/)
- [Node.js Docs](https://nodejs.org/en/docs/)
