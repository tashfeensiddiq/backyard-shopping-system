# Backyard Shopping System

A hyperlocal online shopping platform designed to connect customers with local shops and boutiques, making it easier to discover products and shop from businesses in their neighbourhood.

## About the Project

Backyard Shopping System aims to bring local shopping into a single online platform. Customers will be able to explore local stores, browse products, and eventually place orders for local delivery.

The project focuses on supporting local businesses by providing a digital storefront and a convenient shopping experience.

## How the System Works

The platform is designed around three main components:

- **Customers:** Browse local shops and their products through the platform.
- **Local Shops:** Businesses showcase their products and make them available to customers.
- **Backend API:** Manages shop data, products, database interactions, and the communication between the frontend and database.

### System Workflow

1. Shops are registered and stored in the database.
2. Each shop can have products associated with it.
3. The backend retrieves shop information and related data.
4. The frontend communicates with the backend through API endpoints.
5. Customers will be able to browse shops and products through the user interface.
6. Future functionality will support ordering, payment processing, and delivery tracking.

## Technology Stack

### Backend
- **Python** – Backend development
- **FastAPI** – REST API development
- **SQLAlchemy** – ORM and database interaction
- **MySQL** – Relational database
- **Pydantic** – Data validation
- **PyMySQL** – MySQL database driver

### Frontend
- **React**
- **TypeScript**
- **Vite**
- **CSS**

## Project Structure

```text
backyard-shopping-system/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── database.py
│   │   └── main.py
│   ├── create_tables.py
│   ├── seed_data.py
│   ├── test_db.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   └── ...
├── .gitignore
└── README.md
```

## Backend Setup

### 1. Clone the repository

```bash
git clone https://github.com/tashfeensiddiq/backyard-shopping-system.git
cd backyard-shopping-system
```

### 2. Create a virtual environment

```bash
python3 -m venv .venv
```

Activate the virtual environment on macOS/Linux:

```bash
source .venv/bin/activate
```

### 3. Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Configure the database

Install and start MySQL Server.

Create a MySQL database for the project, then create a `.env` file inside the backend directory.

Example configuration:

```env
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=backyard_shopping
```

Replace the credentials with your actual MySQL configuration.

### 5. Test the database connection

```bash
python test_db.py
```

### 6. Create database tables

```bash
python create_tables.py
```

### 7. Insert demo data

```bash
python seed_data.py
```

### 8. Start the backend server

```bash
uvicorn app.main:app --reload
```

The backend API will be available at:

- API: http://127.0.0.1:8000
- Interactive API documentation: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc
- Health check: http://127.0.0.1:8000/health

## API Documentation

FastAPI automatically generates interactive API documentation.

The Swagger interface allows developers to:

- View available API endpoints.
- Inspect request and response structures.
- Submit API requests directly.
- Test backend functionality without a frontend.

Visit http://127.0.0.1:8000/docs after starting the backend.

## Development Status

The project is currently under active development.

Current development focuses on:

- Backend API setup using FastAPI.
- MySQL database integration.
- SQLAlchemy ORM models.
- Shop data management.
- API routing and service organization.
- Development and demo data setup.

Planned development includes:

- Product catalog management.
- Product sizes, variants, and inventory.
- Customer accounts and authentication.
- Shopping cart and order management.
- Payment processing.
- Local delivery management and tracking.

## Contributors

Developed as a collaborative software development project.

---

