# 🚀 AsyncAI Content Summarization Service

A production-grade, asynchronous backend service that summarizes text or URL-based content using Google Gemini LLM with queue-based processing, Redis caching, and intelligent cost optimization.

## 📌 Overview

This project demonstrates a **senior-level backend architecture** for handling slow, expensive AI operations asynchronously. Instead of blocking API requests for 2-10 seconds while waiting for LLM responses, the system:

1. **Accepts requests instantly** and returns a job ID
2. **Processes jobs in the background** using a dedicated worker
3. **Caches results** to eliminate redundant LLM calls
4. **Scales horizontally** by adding more workers

### Why This Architecture Matters

- **LLM calls are slow**: Gemini can take 2-10 seconds per request
- **URL fetching is unreliable**: Network timeouts, DNS failures, slow servers
- **API responsiveness is critical**: Users expect sub-second response times
- **Cost control is essential**: Every LLM token costs money

**Solution**: Asynchronous, queue-based processing with intelligent caching.

---

## 🧠 High-Level Architecture

```
┌─────────┐
│ Client  │
└────┬────┘
     │
     ▼
┌─────────────────────┐
│  POST /submit       │ ◄── Creates Job (status: queued)
│  Express API Server │ ◄── Returns jobId immediately
└──────────┬──────────┘
           │
           ▼
      ┌──────────┐
      │ Database │
      │ (Postgres)│
      └─────┬────┘
           │
           ▼
      ┌─────────┐
      │ BullMQ  │ ◄── Job added to queue
      │ (Redis) │
      └────┬────┘
           │
           ▼
┌──────────────────────┐
│ Background Worker    │
├──────────────────────┤
│ 1. Pick job from queue
│ 2. Check Redis cache │
│    ├─ HIT → Return   │
│    └─ MISS ↓         │
│ 3. Fetch URL (if URL)│
│ 4. Extract text      │
│ 5. Call Groq LLM    │
│ 6. Save to cache + DB│
└──────────────────────┘
           │
           ▼
      ┌─────────┐
      │  Redis  │ ◄── Cache (inputHash → summary)
      │  Cache  │     TTL: 1 hour
      └─────────┘
           │
           ▼
┌─────────────────────┐
│ GET /status/:jobId  │ ◄── Poll for status
│ GET /result/:jobId  │ ◄── Fetch summary
└─────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js (JavaScript) | Backend runtime |
| **Framework** | Express.js | HTTP API server |
| **Database** | PostgreSQL | Job persistence |
| **Driver** | pg (node-postgres) | Fast, non-blocking DB driver |
| **Queue** | BullMQ | Redis-based job queue |
| **Cache** | Redis | Duplicate request caching |
| **Worker** | BullMQ Worker | Background job processor |
| **LLM** | Groq (Llama 3.1) | Ultra-fast AI summarization |
| **HTTP Client** | Axios | URL content fetching |
| **HTML Parser** | Cheerio | Text extraction from HTML |

---

## 📂 Project Structure

```
AsyncAI-summarizer/
├── src/
│   ├── server.js              # HTTP server startup
│   ├── app.js                 # Express app & middleware
│   ├── routes/
│   │   ├── submit.js          # POST /submit - Create job
│   │   ├── status.js          # GET /status/:jobId
│   │   ├── result.js          # GET /result/:jobId
│   │   └── health.js          # GET /health - Health check
│   ├── workers/
│   │   └── jobWorker.js       # BullMQ background worker
│   └── lib/
│       ├── pg.js              # PostgreSQL pool setup
│       ├── redis.js           # Redis client connection
│       ├── queue.js           # BullMQ queue configuration
│       ├── llm.js             # Groq LLM integration
│       └── urlFetcher.js      # URL fetching & HTML parsing
├── .env                       # Environment variables (gitignored)
├── .env.example               # Example environment config
├── package.json
└── README.md
```

---

## ⚙️ Prerequisites

Ensure the following are installed on your system:

- **Node.js** (v18+ recommended) - [Install](https://nodejs.org/)
- **PostgreSQL** (v14+) - [Install](https://www.postgresql.org/download/)
- **Redis** (v6+) - [Install](https://redis.io/download)
- **Gemini API Key** - [Get from Google AI Studio](https://ai.google.dev/)

### Verify Installations

```bash
# Check Node.js
node --version  # Should be v18+

# Check PostgreSQL
psql --version

# Check Redis
redis-cli --version
```

---

## 🚀 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone <repository-url>
cd AsyncAI-summarizer
```

### 2️⃣ Install Dependencies

```bash
npm install
```

**Installed packages:**
- `express` - Web framework
- `@prisma/client` - Database ORM
- `bullmq` - Job queue
- `redis` - Cache client
- `dotenv` - Environment variables
- `@google/generative-ai` - Gemini SDK
- `axios` - HTTP client
- `cheerio` - HTML parser

### 3️⃣ Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
# Server Configuration
PORT=3000

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/asyncai_db?schema=public"

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Google Gemini Configuration
GEMINI_API_KEY=AIzaSy-your-actual-api-key-here
```

⚠️ **Security Note**: Never commit `.env` to version control!

### 4️⃣ Setup PostgreSQL Database

```bash
# Create the database
createdb asyncai_db

# Or using psql
psql postgres
CREATE DATABASE asyncai_db;
\q
```

### 5️⃣ Run Prisma Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

This creates the `Job` table with the following schema:

```prisma
model Job {
  id           String    @id @default(uuid())
  inputType    InputType // 'url' or 'text'
  inputHash    String    // SHA-256 hash for caching
  status       JobStatus @default(queued)
  originalUrl  String?
  originalText String?
  summary      String?
  errorMessage String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}
```

### 6️⃣ Start Redis

```bash
redis-server
```

Verify Redis is running:

```bash
redis-cli PING
# Expected output: PONG
```

---

## ▶️ Running the Application

**This application requires 3 separate processes running concurrently:**

### Terminal 1: API Server

```bash
npm run dev
# or
node src/server.js
```

**Expected output:**
```
Server running on port 3000
```

**API Server handles:**
- Job submission (`POST /submit`)
- Status polling (`GET /status/:jobId`)
- Result retrieval (`GET /result/:jobId`)

### Terminal 2: Background Worker

```bash
npm run worker
# or
node src/workers/jobWorker.js
```

**Expected output:**
```
[Worker] Initializing BullMQ worker...
[Worker] Worker started and listening for jobs
```

**Worker responsibilities:**
- Pull jobs from BullMQ queue
- Fetch URL content (if inputType = 'url')
- Extract clean text from HTML
- Call Gemini LLM for summarization
- Update job status and results in DB
- Cache results in Redis

### Terminal 3: Redis Server

```bash
redis-server
```

**Redis is used for:**
- BullMQ job queue backend
- Summary caching (inputHash → summary)

---

## 🔁 API Documentation

### 1. Submit Text for Summarization

**Endpoint:** `POST /submit`

**Request Body:**
```json
{
  "text": "Node.js is a JavaScript runtime built on Chrome's V8 engine. It is designed to build scalable network applications and is widely used for backend development in modern systems."
}
```

**Response (201 Created):**
```json
{
  "jobId": "a2962f7b-1235-4703-a479-1f5ab8a10c5e",
  "status": "queued"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/submit \
  -H "Content-Type: application/json" \
  -d '{"text":"Node.js is a JavaScript runtime built on Chrome V8 engine. It is designed to build scalable network applications and is widely used for backend development in modern systems."}'
```

---

### 2. Submit URL for Summarization

**Endpoint:** `POST /submit`

**Request Body:**
```json
{
  "url": "https://en.wikipedia.org/wiki/Node.js"
}
```

**Response (201 Created):**
```json
{
  "jobId": "9172b7f2-f20a-4454-a848-f55312a0abd6",
  "status": "queued"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/submit \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

**Validation:**
- Exactly one of `text` or `url` must be provided
- Both provided → `400 Bad Request`
- Neither provided → `400 Bad Request`
- Empty values → `400 Bad Request`

---

### 3. Check Job Status

**Endpoint:** `GET /status/:jobId`

**Response (200 OK):**
```json
{
  "jobId": "a2962f7b-1235-4703-a479-1f5ab8a10c5e",
  "status": "processing"
}
```

**Possible status values:**
- `queued` - Job created, waiting in queue
- `processing` - Worker is actively processing
- `completed` - Summary generated successfully
- `failed` - Error occurred (check `/result` for error details)

**cURL Example:**
```bash
curl http://localhost:3000/status/a2962f7b-1235-4703-a479-1f5ab8a10c5e
```

---

### 4. Get Final Result

**Endpoint:** `GET /result/:jobId`

**Response - Completed (200 OK):**
```json
{
  "jobId": "a2962f7b-1235-4703-a479-1f5ab8a10c5e",
  "status": "completed",
  "summary": "Node.js functions as a powerful JavaScript runtime environment. It is notably built upon the high-performance Chrome V8 engine, allowing JavaScript to execute outside a web browser. The core design philosophy behind Node.js centers on enabling the creation of scalable network applications. This means it is well-suited for handling a large number of concurrent connections and growing workloads efficiently. Consequently, Node.js has gained significant popularity across the development landscape. It is widely employed for backend development tasks within a multitude of modern software systems.",
  "completedAt": "2025-12-25T22:08:42.107Z"
}
```

**Response - Still Processing (200 OK):**
```json
{
  "jobId": "a2962f7b-1235-4703-a479-1f5ab8a10c5e",
  "status": "processing"
}
```

**Response - Failed (200 OK):**
```json
{
  "jobId": "failed-job-id",
  "status": "failed",
  "errorMessage": "Request timeout"
}
```

**cURL Example:**
```bash
curl http://localhost:3000/result/a2962f7b-1235-4703-a479-1f5ab8a10c5e
```

---

### 5. Health Check

**Endpoint:** `GET /health`

**Response (200 OK):**
```json
{
  "status": "ok"
}
```

---

## 🧠 Design Decisions & Rationale

### 🔹 Why Background Workers?

**Problem:**
- LLM calls take 2-10 seconds
- URL fetching can timeout or fail
- Blocking the API would cause 504 Gateway Timeouts

**Solution:**
- API creates job record and returns immediately
- Worker processes jobs asynchronously in the background
- Client polls for results

**Benefits:**
- ✅ API remains fast (<100ms response time)
- ✅ No request timeouts
- ✅ Retry logic can be added later
- ✅ Workers can be scaled independently

---

### 🔹 Why BullMQ (instead of DB polling)?

**Problem with DB Polling:**
```javascript
// ❌ BAD: DB polling approach
setInterval(async () => {
  const jobs = await db.job.findMany({ status: 'queued' });
  // Process jobs...
}, 1000); // Polls DB every second
```

**Issues:**
- Heavy database load
- Race conditions (multiple workers picking same job)
- Inefficient resource usage
- Delays in job processing

**Solution: BullMQ**
```javascript
// ✅ GOOD: Event-driven queue
const worker = new Worker('queue-name', async (job) => {
  // Process job instantly when available
});
```

**Benefits:**
- ✅ Push-based (jobs processed instantly)
- ✅ Atomic job claiming (no race conditions)
- ✅ Built-in retries, priorities, rate limiting
- ✅ Easy horizontal scaling (add more workers)

---

### 🔹 Why Redis Cache?

**Problem:**
- User submits same article twice
- Calling Gemini for duplicate content wastes money

**Solution:**
```javascript
// Generate hash from input
const inputHash = crypto.createHash('sha256').update(input).digest('hex');

// Check cache first
const cached = await redis.get(inputHash);
if (cached) return cached; // ✅ Cache HIT → $0 cost

// Cache MISS → Call LLM
const summary = await gemini.summarize(text);
await redis.set(inputHash, summary, { EX: 3600 }); // Cache for 1 hour
```

**Benefits:**
- ✅ **Cost savings**: Duplicate requests = $0
- ✅ **Speed**: Cached results returned in <10ms
- ✅ **Idempotency**: Same input always produces same output

**Cache Strategy:**
- **Key**: SHA-256 hash of input content
- **Value**: Generated summary
- **TTL**: 1 hour (balance between cost and freshness)

---

### 🔹 Why Gemini LLM?

**Comparison with alternatives:**

| Model | Speed | Cost | Context Length | Best For |
|-------|-------|------|---------------|----------|
| **Gemini 2.5 Flash** | ⚡ Fast | 💰 Cheap | 1M tokens | ✅ **Our use case** |
| GPT-4 Turbo | 🐌 Slow | 💸 Expensive | 128K tokens | Complex reasoning |
| GPT-3.5 Turbo | ⚡ Fast | 💰 Cheap | 16K tokens | Short content only |
| Claude 3 Haiku | ⚡ Fast | 💰 Cheap | 200K tokens | Great alternative |

**Why Gemini 2.5 Flash:**
- ✅ Fast response time (1-3 seconds)
- ✅ Cost-efficient
- ✅ Handles long articles (1M token limit)
- ✅ Good summarization quality

---

### 🔹 Why Content Trimming (4000 chars)?

**Problem:**
- Webpages can be huge (100KB+)
- LLM pricing is per-token
- Very long inputs can cause API errors

**Solution:**
```javascript
const MAX_LENGTH = 4000;
if (text.length > MAX_LENGTH) {
  text = text.substring(0, MAX_LENGTH) + '...';
}
```

**Benefits:**
- ✅ **Cost control**: Prevents token explosion
- ✅ **Reliability**: Avoids context length errors
- ✅ **Quality**: LLMs work better with focused content
- ✅ **Speed**: Shorter inputs = faster responses

**4000 characters ≈ 1000 tokens**

---

### 🔹 Why URL Fetching in Worker (not API)?

**Bad Approach (API layer):**
```javascript
// ❌ This blocks the API for 5-10 seconds
app.post('/submit', async (req, res) => {
  const html = await axios.get(url); // SLOW!
  const summary = await gemini(html); // SLOW!
  res.json({ summary }); // Client waits 10+ seconds
});
```

**Good Approach (Worker layer):**
```javascript
// ✅ API returns instantly
app.post('/submit', (req, res) => {
  const job = await createJob();
  await queue.add({ jobId: job.id });
  res.json({ jobId, status: 'queued' }); // <100ms
});

// Worker handles slow operations
worker.process(async (job) => {
  const html = await axios.get(url); // Worker waits, not API
  const summary = await gemini(html);
  await updateJob(summary);
});
```

**Benefits:**
- ✅ API never blocks
- ✅ Timeout protection (10s limit in worker)
- ✅ Error isolation (worker failure doesn't crash API)

---

## ❌ Failure Handling & Error Cases

The system **never crashes** on failures. All errors are handled gracefully.

### Handled Error Cases:

| Error | Example | Behavior |
|-------|---------|----------|
| **Invalid URL** | `malformed://url` | Job marked as `failed`, error saved to DB |
| **URL Not Found** | DNS resolution fails | `errorMessage = "URL not found"` |
| **Timeout** | Slow server (>10s) | `errorMessage = "Request timeout"` |
| **Empty Content** | Webpage has no text | `errorMessage = "No readable text found"` |
| **LLM API Error** | Invalid API key | `errorMessage = "Invalid Gemini API key"` |
| **LLM Rate Limit** | Too many requests | `errorMessage = "Gemini rate limit exceeded"` |
| **Redis Failure** | Redis server down | Worker continues (processes job, skips cache) |

### Error Handling Code:

```javascript
try {
  const summary = await summarizeTextWithLLM(text);
  await updateJob({ status: 'completed', summary });
} catch (error) {
  console.error(`[Worker] Job ${jobId} failed:`, error.message);
  
  await updateJob({
    status: 'failed',
    errorMessage: error.message
  });
}
```

**Worker never crashes - it logs the error and continues processing other jobs.**

---

## 🧪 Testing & Validation

### Test 1: Text Summarization (Cache MISS)

```bash
# Submit text
curl -X POST http://localhost:3000/submit \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Node.js is a JavaScript runtime built on Chrome V8 engine. It is designed to build scalable network applications and is widely used for backend development in modern systems."
  }'

# Response:
# {"jobId":"a2962f7b-1235-4703-a479-1f5ab8a10c5e","status":"queued"}
```

**Expected Worker Logs:**
```
[Worker] Picked job from queue: a2962f7b-1235-4703-a479-1f5ab8a10c5e
[Worker] Cache MISS for job a2962f7b-1235-4703-a479-1f5ab8a10c5e
[Worker] Job a2962f7b-1235-4703-a479-1f5ab8a10c5e completed
```

**Fetch Result:**
```bash
curl http://localhost:3000/result/a2962f7b-1235-4703-a479-1f5ab8a10c5e
```

**Response:**
```json
{
  "jobId": "a2962f7b-1235-4703-a479-1f5ab8a10c5e",
  "status": "completed",
  "summary": "Node.js functions as a powerful JavaScript runtime environment..."
}
```

✅ **Gemini LLM called successfully**

---

### Test 2: Cache HIT (No LLM Call)

```bash
# Submit THE SAME text again
curl -X POST http://localhost:3000/submit \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Node.js is a JavaScript runtime built on Chrome V8 engine. It is designed to build scalable network applications and is widely used for backend development in modern systems."
  }'

# Response:
# {"jobId":"c9776c13-9da9-46e7-8c17-b5165cb04590","status":"queued"}
```

**Expected Worker Logs:**
```
[Worker] Picked job from queue: c9776c13-9da9-46e7-8c17-b5165cb04590
[Worker] Cache HIT for job c9776c13-9da9-46e7-8c17-b5165cb04590
```

✅ **No Gemini call, instant completion, cost = $0**

---

### Test 3: URL Summarization

```bash
# Submit URL
curl -X POST http://localhost:3000/submit \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

# Response:
# {"jobId":"9172b7f2-f20a-4454-a848-f55312a0abd6","status":"queued"}
```

**Expected Worker Logs:**
```
[Worker] Picked job from queue: 9172b7f2-f20a-4454-a848-f55312a0abd6
[Worker] Cache MISS for job 9172b7f2-f20a-4454-a848-f55312a0abd6
[Worker] Job 9172b7f2-f20a-4454-a848-f55312a0abd6 completed
```

**Fetch Result:**
```bash
curl http://localhost:3000/result/9172b7f2-f20a-4454-a848-f55312a0abd6
```

**Response:**
```json
{
  "status": "completed",
  "summary": "The 'Example Domain' is a designated internet domain specifically created for use in documentation..."
}
```

✅ **URL fetched, HTML parsed, text extracted, Gemini summarization successful**

---

### Test 4: Failure Case (Invalid API Key)

**Setup:**
```bash
# Edit .env
GEMINI_API_KEY=invalid_key

# Restart worker
node src/workers/jobWorker.js
```

**Submit Job:**
```bash
curl -X POST http://localhost:3000/submit \
  -H "Content-Type: application/json" \
  -d '{"text":"Test text"}'
```

**Expected Worker Logs:**
```
[Worker] Job <jobId> failed: Invalid Gemini API key
```

**Check Result:**
```bash
curl http://localhost:3000/result/<jobId>
```

**Response:**
```json
{
  "status": "failed",
  "errorMessage": "Invalid Gemini API key"
}
```

✅ **Graceful failure handling, worker continues running**

---

## 🐛 Troubleshooting

### Issue: `Port 3000 already in use`

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill

# Or use a different port
PORT=4000 node src/server.js
```

---

### Issue: `Redis connection failed`

**Error:**
```
[Worker] Redis connection error: ECONNREFUSED
```

**Solution:**
```bash
# Start Redis server
redis-server

# Verify Redis is running
redis-cli PING
# Expected: PONG
```

---

### Issue: `Database connection error`

**Error:**
```
PrismaClientInitializationError: Can't reach database server
```

**Solution:**
```bash
# Check PostgreSQL is running
pg_isready

# Verify DATABASE_URL in .env
DATABASE_URL="postgresql://user:password@localhost:5432/asyncai_db?schema=public"

# Test connection
psql $DATABASE_URL
```

---

### Issue: `Worker not processing jobs`

**Symptoms:**
- Jobs stuck in `queued` status
- No logs from worker

**Solution:**
```bash
# Verify worker is running
# Terminal should show:
[Worker] Worker started and listening for jobs

# Check BullMQ connection
# Verify REDIS_URL matches in both API and worker

# Check queue name consistency
# src/lib/queue.js should export same QUEUE_NAME used in worker
```

---

## 📊 Performance Metrics

### API Response Times

| Endpoint | Response Time | Notes |
|----------|--------------|-------|
| `POST /submit` | <100ms | Creates job, returns jobId |
| `GET /status/:id` | <50ms | Database query |
| `GET /result/:id` | <50ms | Database query |

### Worker Processing Times

| Operation | Time | Notes |
|-----------|------|-------|
| Cache HIT | <10ms | Redis lookup |
| Cache MISS (text) | 2-4s | Gemini LLM call |
| Cache MISS (URL) | 3-8s | URL fetch + LLM |
| URL fetch timeout | 10s | Configurable in `urlFetcher.js` |

### Cost Optimization

**Without caching:**
- 1000 duplicate requests = 1000 LLM calls = $X

**With caching:**
- 1000 duplicate requests = 1 LLM call + 999 cache hits = $0.001X

**Savings: ~99.9% for duplicate content**

---

## 🚀 Deployment & Production Considerations

### Environment-Specific Configs

**Development:**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://localhost:5432/asyncai_dev
REDIS_URL=redis://localhost:6379
```

**Production:**
```env
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://prod-db-url:5432/asyncai_prod
REDIS_URL=redis://prod-redis-url:6379
GEMINI_API_KEY=<production-key>
```

### Scaling Horizontally

**Add More Workers:**
```bash
# Terminal 1
node src/workers/jobWorker.js

# Terminal 2
node src/workers/jobWorker.js

# Terminal 3
node src/workers/jobWorker.js
```

BullMQ automatically distributes jobs across all workers.

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
CMD ["node", "src/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/asyncai
      - REDIS_URL=redis://redis:6379
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - db
      - redis
  
  worker:
    build: .
    command: node src/workers/jobWorker.js
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/asyncai
      - REDIS_URL=redis://redis:6379
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:14
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: asyncai
  
  redis:
    image: redis:7-alpine
```

### Monitoring & Observability

Add logging, metrics, and monitoring:

**Recommended tools:**
- **Winston/Pino**: Structured logging
- **Prometheus**: Metrics collection
- **Grafana**: Dashboard visualization
- **Sentry**: Error tracking
- **DataDog**: APM (Application Performance Monitoring)

---

## 🎯 Interview Talking Points

When discussing this project in interviews, emphasize:

### 1. Asynchronous Architecture
> "I designed an async, queue-based architecture to handle slow LLM operations without blocking the API. The system uses BullMQ for reliable job distribution and can scale horizontally by adding more workers."

### 2. Cost Optimization
> "I implemented intelligent caching using Redis with SHA-256 hashing. This reduces LLM costs by ~99% for duplicate requests while maintaining a 1-hour TTL for freshness."

### 3. Reliability & Error Handling
> "The system handles all failure cases gracefully - timeout protection, network errors, invalid URLs, LLM API failures. Workers never crash; they log errors and continue processing."

### 4. Production-Ready Design
> "I applied production-grade patterns: separation of concerns, environment-based configuration, database migrations with Prisma, graceful shutdown handling, and horizontal scalability."

### 5. Technology Choices
> "I chose Gemini 2.5 Flash for cost-efficiency and speed, BullMQ over database polling for event-driven processing, and Cheerio for lightweight HTML parsing."

---

## 🔮 Future Enhancements

Potential improvements for V2:

- [ ] Add retry logic with exponential backoff
- [ ] Implement rate limiting per user/IP
- [ ] Add job priorities (urgent vs normal)
- [ ] Support batch processing (multiple URLs at once)
- [ ] Add webhook notifications when jobs complete
- [ ] Implement job result expiration (auto-delete old jobs)
- [ ] Add authentication & user accounts
- [ ] Add metrics dashboard (Grafana)
- [ ] Support for more LLM providers (OpenAI, Claude)
- [ ] PDF and document summarization
- [ ] Multi-language support
- [ ] Summary length customization (short/medium/long)

---

## 📝 License

MIT License - feel free to use for learning and portfolio purposes.

---

## 🙏 Acknowledgments

Built as a **senior-level backend engineering demonstration** showcasing:
- Asynchronous processing patterns
- Queue-based architecture
- LLM integration
- Cost optimization strategies
- Production-ready code quality

---

## 📧 Contact

For questions or feedback about this project, please reach out!

---

**🚀 This project demonstrates production-grade async AI system design with scalability, reliability, and cost control.**
