# Agital.soft GmbH E-commerce Platform

A full-stack e-commerce application built with Vue.js (frontend) and NestJS (backend).

## Quick Start

### Installation & Setup

From the root directory, run:

```bash
# Install dependencies for both client and server
npm run install:all

# Seed the database with sample data
npm run seed

# Or run both in one command
npm run setup
```

### Development

Start both client and server in development mode:

```bash
npm run dev
```

This will start:

- **Client (Vue.js)**: http://localhost:5173
- **Server (NestJS)**: http://localhost:4000

The client connects to the server at `http://localhost:4000` by default.
You can modify this in `/client/src/api/axios.ts` if needed.

## API Documentation

Once the server is running, visit:

- Swagger UI: http://localhost:4000/api

## Testing

Tests are located in the `server/tests` directory and cover unit and integration tests for controllers, services, and
repositories.

```bash
# Run server tests
npm run test

# Run tests with coverage
cd server && npm run test:cov

```

## Database Seeding

The seed script creates:

- 20 sample users
- 25 sample products
- 250 sample reviews

```bash
npm run seed
```

## Development Workflow

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agita-e-com
   ```

2. **Install dependencies**
   From the root directory, run the command below:
   ```bash
   npm run install:all
   ```
   Alternatively, you can install client and server dependencies separately:
   ```bash
   npm run install:client
   npm run install:server
   ```
   or you can navigate to each directory and run `npm install`:
   ```bash
   cd client
   npm install
   
   cd ../server
   npm install
   ```


3. **Set up environment variables**
    - Create `.env` file in `server/` directory
    - Add your MongoDB connection string and JWT secrets
    - Example `.env` content:
      ```env
      JWT_SECRET=your_jwt_secret
      JWT_EXPIRATION=1h
      JWT_REFRESH_EXPIRATION=3d
      JWT_REFRESH_SECRET=your_refresh_jwt_secret

      DB_PASSWORD=your_db_password
      DB_USERNAME=your_db_username
      DATABASE_URL=your_database_url

      PORT=4000

      BCRYPT_ROUNDS=10
      ```
    - Client is kept lean and therefore does not require environment variables for this project. If you need to change
      the API base URL, you can modify it in `client/src/api/axios.ts`.

4. **Seed the database**
   ```bash
   npm run seed
   ```

