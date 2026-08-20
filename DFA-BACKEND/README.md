# Digital Forensic Security Server (DFA-BACKEND)

A secure backend system built with Node.js and Express that implements **DFA-AOKGE** (Authentication with Optimal Key Generation Encryption) for digital forensic evidence tracking and management.

## 🌟 Core Features

- **DFA-AOKGE Implementation:** Secure authentication with optimal key generation.
- **Multi-Key Homomorphic Encryption (MKHE):** Advanced cryptographic operations on encrypted data.
- **Enhanced Equilibrium Optimizer (EEO):** Optimized key handling and cryptographic processes.
- **Secure Block Verification (SBVM):** Robust validation of block integrity within the chain.
- **Blockchain Evidence Tracking:** Immutable and verifiable logging of digital forensic evidence.
- **JWT Authentication:** Secure user sessions and endpoint protection.

## 🛠️ Tech Stack

- **Framework:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **Security & Crypto:** bcryptjs, crypto-js, jsonwebtoken, tweetnacl, uuid
- **File Handling:** multer
- **Other Utilities:** axios, cors, dotenv

## 📂 Project Structure

```
├── config/             # Database and environment configurations
├── controllers/        # Core business logic for endpoints
├── middleware/         # Custom middlewares (e.g., auth handler)
├── models/             # Mongoose schemas (User, Evidence, BlockchainRecord)
├── routes/             # API route definitions (auth, evidence)
├── utils/              # Helper utilities (Blockchain logic, etc.)
├── server.js           # Express app entry point & initialization
├── package.json        # Dependencies and scripts
└── .env                # Environment variables configuration
```

## 🔌 Key API Endpoints

### Authentication (`/api/auth`)
Handles user registration, login, and session management using JWT.

### Evidence (`/api/evidence`)
Manages the secure upload, retrieval, and blockchain-backed tracking of digital forensic evidence.

### Blockchain & System (`/api/health`, `/api/blockchain/*`)
- `GET /api/health` - Server health check.
- `GET /api/blockchain/stats` - Fetch statistics of the internal blockchain.
- `GET /api/blockchain/verify` - Verify the integrity of the blockchain records.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+ recommended)
- MongoDB running locally or a MongoDB Atlas connection string

### Installation
1. Clone the repository and navigate to the project root:
   ```bash
   cd DFA-BACKEND
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration
Create a `.env` file in the root directory and specify your configurations (e.g., `PORT`, MongoDB URI, JWT Secret).

### Running the Server
- **Development Mode:**
  ```bash
  npm run dev
  ```
- **Production Mode:**
  ```bash
  npm start
  ```

## 🛡️ Security & Integrity
The server emphasizes strong security measures, initializing a genesis block during the first startup and rigorously verifying the chain integrity via SBVM on subsequent operations.
