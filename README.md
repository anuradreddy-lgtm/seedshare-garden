# 🌱 SeedShare-Garden

A RESTful backend API for managing community garden plots, gardeners, and plot leases.

## 🚀 Technologies Used

- Node.js
- Express.js
- SQLite
- better-sqlite3
- Postman

## 📁 Project Structure

```text
SeedShare-Garden/
├── database/
│   ├── database.js
│   └── seedshare.db
├── server.js
├── package.json
├── package-lock.json
├── README.md
└── SeedShare-Garden-API-Testing.json
```

## ⚙️ Installation and Setup

1. Clone or download this project.
2. Open the project folder in VS Code.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the server:

   ```bash
   node server.js
   ```

5. Open the API:

   ```text
   http://localhost:3000
   ```

## 🔗 API Endpoints

### Server & Database

| Method | Endpoint |
|---|---|
| `GET` | `/` |
| `GET` | `/test-db` |

### Gardeners

| Method | Endpoint |
|---|---|
| `GET` | `/api/gardeners` |
| `POST` | `/api/gardeners` |

### Plots

| Method | Endpoint |
|---|---|
| `POST` | `/api/plots` |
| `GET` | `/api/plots` |
| `GET` | `/api/plots/:id` |
| `PUT` | `/api/plots/:id` |
| `DELETE` | `/api/plots/:id` |
| `GET` | `/api/plots?soil=Loam` |

### Leases

| Method | Endpoint |
|---|---|
| `POST` | `/api/leases` |
| `GET` | `/api/leases` |

## 🧪 API Testing

The project APIs are tested using Postman.

The exported collection is:

`SeedShare-Garden-API-Testing.json`

It contains requests for:

- Server and database connectivity
- Gardeners
- Plots
- Leases
- Input validation
- Error handling
- Additional rule testing

## ✨ Features

- Gardener management
- Garden plot management
- Plot search by soil type
- Lease creation and listing
- SQL JOIN operations
- Input validation
- Foreign key constraints

## 👨‍💻 Project

**Project Name:** SeedShare-Garden

**Backend:** Node.js and Express.js

**Database:** SQLite
