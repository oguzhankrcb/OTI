![image](https://github.com/user-attachments/assets/9a826cc7-68e1-4453-9453-524b9a1e4e2a)

# 🔐 OTI - One Time Information

OTI (One Time Information) is a modern web application designed for secure, one-time information sharing. It ensures safe sharing of sensitive information using client-side encryption.

## ✨ Features

- **🔒 Client-Side Encryption**: All encryption happens entirely in your browser - no passwords or unencrypted data are ever transmitted to the server
- **⏳ Self-Destruct**: Shares automatically disappear after a specified time (5 minutes, 1 hour, 1 day, or 7 days)
- **🔑 Password Protection**: Add an extra layer of security with password protection
- **💨 Compression**: Private keys are compressed for shorter URLs and improved user experience
- **👁️ Single View**: Each share can only be viewed once and is automatically deleted afterward
- **🧹 Automatic Cleanup**: Scheduled tasks automatically remove expired shares from the database
- **🛡️ Rate Limiting**: Protects against abuse by limiting request rates using Redis
- **📦 Modern Asset Building**: Uses Vite for optimized frontend assets bundling

## 🏗️ Project Structure

```
OTI/
├── app/                      # Application code
│   ├── controllers/          # Controllers handling HTTP requests
│   ├── models/               # Database models
│   └── services/             # Business logic services
│       └── scheduler/        # Scheduler for background tasks
│           ├── scheduler.ts  # Scheduler implementation
│           └── tasks/        # Background tasks
│               └── clean_expired_shares.ts   # Task to remove expired shares
├── config/                   # Application configuration
├── database/                 # Database migration and seed files
├── public/                   # Static files and compiled assets
├── resources/                # Frontend resources
│   ├── css/                  # CSS styles
│   ├── js/                   # Client-side JavaScript
│   │   ├── app.js           # Main JavaScript entry point
│   │   ├── encryption.js    # Client-side encryption utilities
│   │   └── helpers/         # Helper utilities
│   └── views/                # Edge template files
├── tests/                    # Test files
├── vite.config.ts            # Vite configuration
└── package.json              # Project dependencies
```

## 🛠️ Technologies

- **Backend**: [AdonisJS](https://adonisjs.com/) - TypeScript-based Node.js web framework
- **Client-Side Encryption**: [JSEncrypt](https://github.com/travist/jsencrypt) - RSA encryption/decryption in the browser
- **Compression**: [Pako](https://github.com/nodeca/pako) - zlib port for compression/decompression
- **Database**: MySQL/SQLite/PostgreSQL
- **Frontend**: HTML, CSS, JavaScript
- **Asset Building**: [Vite](https://vitejs.dev/) - Next generation frontend tooling
- **Validation**: [VineJS](https://vinejs.dev/) - Form validation
- **Task Scheduling**: [node-cron](https://www.npmjs.com/package/node-cron) - Cron-style job scheduling
- **Rate Limiting**: [@adonisjs/limiter](https://docs.adonisjs.com/guides/security/rate-limiting) - Request rate limiting
- **Redis**: [Redis](https://redis.io/) - In-memory data store used for rate limiting

## 🔒 Client-Side Encryption Architecture

OTI uses a client-side encryption architecture to ensure maximum security:

- RSA key pair generation happens directly in the user's browser
- Data is encrypted before transmission to the server
- The server never has access to unencrypted data or private keys
- Private keys are compressed to create shorter, more user-friendly URLs
- Decryption also happens entirely in the client browser

```javascript
// Example of client-side encryption
const encrypted = Encryption.encrypt(secretText, publicKey);

// Client-side decryption
const decrypted = Encryption.decrypt(encryptedText, privateKey);
```

## 🛡️ Rate Limiting

OTI implements rate limiting to protect against abuse and ensure fair resource usage:

- **Redis-backed**: Uses Redis for distributed rate limiting across multiple instances
- **Route protection**: Limits the number of requests to sensitive routes
- **Customizable limits**: Configure different thresholds for various endpoints
- **Graceful handling**: Custom error pages for rate-limited requests

```typescript
// Example of route with rate limiting middleware
router
  .group(() => {
    router.get('', [SharesController, 'index'])
    router.post('', [SharesController, 'store'])
  })
  .prefix('/share')
  .use(throttle) // Apply rate limiting
```

## ⏰ Scheduler Architecture

OTI implements a job scheduler to handle background tasks like cleaning up expired shares. Key features:

- **Scheduled Tasks**: Cron-based scheduling for automated maintenance tasks
- **Task isolation**: Each task is encapsulated in its own class with a defined schedule and handler
- **Automatic cleanup**: Expired shares are automatically removed every 15 minutes
- **Configurable**: Can be enabled/disabled via environment variables

```typescript
// Example of a scheduled task implementation
export default class CleanExpiredShares implements Task {
  public schedule = '*/15 * * * *'; // Run every 15 minutes
  
  public async handle(): Promise<void> {
    // Find and delete expired shares
    const now = DateTime.now().toSQL();
    const expiredShares = await SecretShare.query().where('expires_at', '<', now);
    // Delete shares...
  }
}
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
# To enable the scheduler, set START_SCHEDULER=true
# For rate limiting, configure Redis connection
# REDIS_HOST=127.0.0.1
# REDIS_PORT=6379
# LIMITER_STORE=redis
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
