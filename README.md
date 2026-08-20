# ForensicChain

ForensicChain is a secure digital evidence management platform built to handle the upload, storage, and auditing of digital forensic evidence. The system ensures the integrity of investigation data through custom encryption algorithms and an internal blockchain ledger, providing an immutable chain of custody for every piece of evidence.

## Core Features

* **Secure File Storage:** Evidence files are encrypted before being uploaded to AWS S3.
* **Cryptographic Integrity:** Uses Multi-Key Hashing Encryption (MKHE) and SHA-256 to ensure files remain tamper-proof.
* **Internal Blockchain Ledger:** Every action (upload, access, modification) is recorded as a block. If evidence is tampered with, the blockchain verification fails.
* **Authentication & RBAC:** Integrates Firebase for user verification and issues JWTs for session management. Includes role-based access control (Admin, Investigator, Manager) and a Secure Block Verification Mechanism (SBVM).
* **Chain of Custody:** Maintains a strict, auditable timeline of who accessed or modified what and when.
* **Dockerized Environment:** The entire application (frontend, backend, database) is containerized for consistent deployments.

## Tech Stack

* **Frontend:** React.js, Tailwind CSS, Vite
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **Storage:** AWS S3
* **Auth:** Firebase Auth, JWT
* **Infrastructure:** Docker, Docker Compose

## Prerequisites

Before running the project locally, ensure you have the following installed:
* [Docker and Docker Compose](https://docs.docker.com/get-docker/)
* [Node.js](https://nodejs.org/) (if running outside of Docker)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sarthak0905/ForensicChain_.git
   cd ForensicChain_
   ```

2. **Environment Configuration**
   You need to set up environment variables for both the frontend and backend. 

   Create a `.env` file in the `DFA-BACKEND` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://mongodb:27017/digital-forensic
   JWT_SECRET=your_super_secret_jwt_key
   
   # AWS S3 Configuration
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_S3_BUCKET_NAME=your_bucket_name
   
   # Firebase Admin
   FIREBASE_SERVICE_ACCOUNT_PATH=./path-to-firebase-adminsdk.json
   ```

   Create a `.env` file in the `DFA-FRONTEND` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   
   # Firebase Client Config
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. **Run with Docker**
   The easiest way to spin up the project is using Docker Compose. From the root directory, run:
   ```bash
   docker-compose up --build
   ```
   
   Once the containers are running:
   * Frontend will be available at `http://localhost:3000`
   * Backend API will be available at `http://localhost:5000`

## Project Structure

* `/DFA-FRONTEND` - React application source code, components, and pages.
* `/DFA-BACKEND` - Express server handling business logic, API routes, cryptography, and blockchain interactions.
* `docker-compose.yml` - Orchestrates the frontend, backend, and a local MongoDB instance.

## License

This project is open-source and available under the MIT License.
