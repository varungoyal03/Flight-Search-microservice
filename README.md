
# ✈️ Flight Booking Microservices

A distributed flight booking system built using a microservices architecture. It features isolated services for authentication, flight inventory, transactional bookings, and asynchronous email notifications.

## 🔗 Project Resources
* [System Docs & Architecture (Notion)](https://flight-microservices.notion.site/) - Contains High-Level Design (HLD), DB Diagrams, and documentation for all 4 services.
* [API Documentation (Postman)](https://documenter.getpostman.com/view/45885092/2sBXVig9sT#d2b2a2e1-7f6a-4102-933c-01123b8d6443) - API routes, payloads, and mock responses.

## 📦 Microservices Repositories
1. [Auth & API Gateway Service](https://github.com/varungoyal03/flight-auth-microservice)
2. [Flight Search Service](https://github.com/varungoyal03/Flight-Search-microservice) *(This Repository)*
3. [Booking Service](https://github.com/varungoyal03/flight-booking-microservice)
4. [Notification Service](https://github.com/varungoyal03/Flight-Notification-service)

---

## 🏗️ Services Overview
1. **Auth & API Gateway:** Centralized entry point, rate limiting, and JWT authentication.
2. **Flight Search Service:** Manages airplanes, airports, and flight inventory with O(1) seat lookups.
3. **Booking Service:** Orchestrates distributed transactions (Saga pattern) and cron-based seat releases.
4. **Notification Service:** Asynchronously consumes RabbitMQ queues to dispatch user emails.

---

## 📂 Folder Structure (`src/`)
This project strictly follows the Controller-Service-Repository pattern:
* `config/`: Setup for environment variables (`dotenv`), loggers (`winston`), and message queues.
* `routes/`: API endpoint registrations.
* `middlewares/`: Request interceptors, authenticators, and payload validators.
* `controllers/`: Receives requests, passes data to services, and formats standard API responses.
* `services/`: Core business logic and external service integrations.
* `repositories/`: Database interaction layer using Sequelize ORM.
* `utils/`: Reusable helpers, standard response objects, and custom error classes.

---

## 🛠️ Local Setup Instructions

Each microservice follows the same standard setup process. To run any of the services locally:

**1. Clone the repository:**
```bash
git clone <repository_url>
cd <repository_folder>
2. Install dependencies:

Bash
npm install
3. Configure Environment Variables:
Create a .env file in the root directory. To run the base server, it only requires the port:

Code snippet
PORT=3000
4. Database Setup (Sequelize ORM):
Ensure your local MySQL server is running and your database credentials are updated in src/config/config.json. Then, initialize the database:

Bash
cd src
npx sequelize db:create
npx sequelize db:migrate
npx sequelize db:seed:all
cd ..
5. Start the Development Server:

Bash
npm run dev
