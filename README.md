# 🔐 OTI - One Time Information

OTI (One Time Information) is a modern web application designed for secure, one-time information sharing. It ensures safe sharing of sensitive information using end-to-end encryption.

## ✨ Features

- **🔒 End-to-End Encryption**: Securely protects your information using RSA encryption algorithm
- **⏳ Self-Destruct**: Shares automatically disappear after a specified time (5 minutes, 1 hour, 1 day, or 7 days)
- **🔑 Password Protection**: Add an extra layer of security with password protection
- **🚀 Multi-Worker Architecture**: Uses WorkerPool for CPU-intensive encryption operations
- **💨 Compression**: Shortens URLs with private key compression
- **👁️ Single View**: Each share can only be viewed once and is automatically deleted afterward

## 🏗️ Project Structure

```
OTI/
├── app/                      # Application code
│   ├── controllers/          # Controllers handling HTTP requests
│   ├── models/               # Database models
│   ├── services/             # Business logic services (EncryptionService, etc.)
│   │   ├── encryption_service.ts   # Provides encryption services
│   │   └── worker_pool.ts          # Manages worker threads
│   └── workers/              # Worker threads
│       └── encryption_worker.ts     # Performs encryption operations
├── config/                   # Application configuration
├── database/                 # Database migration and seed files
├── public/                   # Static files (CSS, JS, etc.)
├── resources/                # Frontend view files
│   └── views/                # Edge template files
├── tests/                    # Test files
└── package.json              # Project dependencies
```

## 🛠️ Technologies

- **Backend**: [AdonisJS](https://adonisjs.com/) - TypeScript-based Node.js web framework
- **Encryption**: [Node-RSA](https://www.npmjs.com/package/node-rsa) - RSA encryption/decryption
- **Database**: MySQL/SQLite/PostgreSQL
- **Frontend**: HTML, CSS, JavaScript
- **Validation**: [VineJS](https://vinejs.dev/) - Form validation
- **Multi-Threading**: Node.js `worker_threads` API

## 🚀 Worker Architecture

OTI uses a custom `WorkerPool` class to separate CPU-intensive encryption operations from the main thread. This architecture:

- Enables concurrent encryption operations without blocking the main thread
- Automatically creates worker threads based on the number of CPU cores
- Queues tasks for efficient resource utilization
- Provides a Promise-based interface for asynchronous operations

```typescript
// Example of using the worker pool
const result = await getWorkerPool().execute({
  operation: 'encrypt',
  text: 'Secret message',
});
```

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/username/OTI.git
cd OTI
```

2. Install dependencies:
```bash
npm install
```

3. Configure the `.env` file:
```
cp .env.example .env
```

4. Create the database:
```bash
node ace migration:run
```

5. Start the development server:
```bash
npm run dev
```

## 🔍 Usage

1. Navigate to `http://localhost:3333` in your browser
2. Click the "New Share" button
3. Enter the text you want to share
4. Set the validity period and optional password
5. Send the generated link to the recipient through a secure channel
6. The recipient can access the information by clicking the link and entering the password if required
7. The information is automatically destroyed after being viewed

## 📄 License

MIT
