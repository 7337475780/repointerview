// ============================================================
// RepoInterview AI — Fixture Data
// Realistic demo: Next.js SaaS with PostgreSQL, Prisma, Redis
// ============================================================

export const REPO = {
  name: 'notionify',
  owner: 'alexchen',
  fullName: 'alexchen/notionify',
  description: 'AI-powered workspace management platform built with Next.js 14, PostgreSQL, and Prisma ORM',
  url: 'https://github.com/alexchen/notionify',
  stars: 847,
  lastAnalyzed: '2 hours ago',
  analysisScore: 78,
  techStack: [
    { name: 'Next.js 14', category: 'frontend', color: '#4ADE80' },
    { name: 'TypeScript', category: 'language', color: '#60A5FA' },
    { name: 'PostgreSQL', category: 'database', color: '#A78BFA' },
    { name: 'Prisma ORM', category: 'orm', color: '#60A5FA' },
    { name: 'Redis', category: 'cache', color: '#F87171' },
    { name: 'NextAuth.js', category: 'auth', color: '#FBBF24' },
    { name: 'tRPC', category: 'api', color: '#D4714A' },
    { name: 'Tailwind CSS', category: 'styling', color: '#38BDF8' },
    { name: 'Vercel', category: 'deployment', color: '#FAF7F4' },
    { name: 'AWS S3', category: 'storage', color: '#FBBF24' },
  ],
  stats: {
    totalFiles: 342,
    linesOfCode: 28400,
    testCoverage: 64,
    apiRoutes: 38,
    components: 127,
    dbTables: 14,
  },
};

export const ARCHITECTURE_NODES = [
  { id: 'frontend', label: 'Next.js App', type: 'frontend', x: 400, y: 80, description: 'App Router, RSC, streaming' },
  { id: 'trpc', label: 'tRPC API', type: 'api', x: 240, y: 220, description: 'Type-safe RPC layer' },
  { id: 'auth', label: 'NextAuth.js', type: 'service', x: 560, y: 220, description: 'OAuth, JWT sessions' },
  { id: 'postgres', label: 'PostgreSQL', type: 'database', x: 180, y: 380, description: 'Primary data store' },
  { id: 'prisma', label: 'Prisma ORM', type: 'service', x: 340, y: 310, description: 'Query builder, migrations' },
  { id: 'redis', label: 'Redis', type: 'cache', x: 500, y: 380, description: 'Session cache, rate limiting' },
  { id: 's3', label: 'AWS S3', type: 'external', x: 660, y: 380, description: 'File uploads, assets' },
  { id: 'openai', label: 'OpenAI API', type: 'external', x: 620, y: 100, description: 'AI content generation' },
];

export const ARCHITECTURE_EDGES = [
  { from: 'frontend', to: 'trpc' },
  { from: 'frontend', to: 'auth' },
  { from: 'frontend', to: 'openai' },
  { from: 'trpc', to: 'prisma' },
  { from: 'trpc', to: 'redis' },
  { from: 'auth', to: 'redis' },
  { from: 'auth', to: 'postgres' },
  { from: 'prisma', to: 'postgres' },
  { from: 'trpc', to: 's3' },
];

export const QUESTIONS = [
  {
    id: 'q1',
    question: 'Why did you choose PostgreSQL over MongoDB for this project?',
    category: 'Database',
    difficulty: 'medium',
    probability: 92,
    tags: ['database', 'architecture', 'tradeoffs'],
    whyAsked: "Your project has 14 normalized tables with foreign key relationships and complex joins. Interviewers will probe whether this was a deliberate architectural decision or a default choice.",
    strongAnswer: "We chose PostgreSQL because our data model is highly relational — workspaces contain pages, pages contain blocks, blocks can reference other blocks. We needed ACID transactions to ensure consistency when moving pages between workspaces, which would be significantly more complex to implement correctly with MongoDB. PostgreSQL's JSONB columns let us handle the flexible block content structure without giving up relational integrity elsewhere. We also considered that the team had strong SQL familiarity and Prisma's PostgreSQL support is excellent.",
    evidence: {
      filename: 'prisma/schema.prisma',
      language: 'prisma',
      highlightLines: [3, 4, 12, 13, 14],
      code: `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Workspace {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  createdAt DateTime @default(now())
  
  pages     Page[]
  members   WorkspaceMember[]
  settings  WorkspaceSettings?
}

model Page {
  id          String   @id @default(cuid())
  title       String
  workspaceId String
  parentId    String?
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  parent      Page?     @relation("PageTree", fields: [parentId], references: [id])
  children    Page[]    @relation("PageTree")
  blocks      Block[]
}`,
    },
    followUp: [
      'How do you handle database migrations in production?',
      'What is your backup and recovery strategy?',
      'How do you approach query optimization as data grows?',
    ],
  },
  {
    id: 'q2',
    question: 'Walk me through your authentication architecture using NextAuth.js.',
    category: 'Security',
    difficulty: 'medium',
    probability: 88,
    tags: ['auth', 'security', 'sessions'],
    whyAsked: "You're using NextAuth with JWT sessions and Redis for session storage. Interviewers will test your understanding of the security tradeoffs between JWT and database sessions.",
    strongAnswer: "We use NextAuth.js with a hybrid approach: short-lived JWTs (15 minutes) for fast authentication checks on the edge, backed by Redis session storage for revocation capability. When a user logs in via OAuth (Google, GitHub), NextAuth creates a JWT and stores the full session in Redis with a 7-day TTL. The JWT contains only a session ID — not user data — so we can invalidate sessions server-side without waiting for JWT expiry. We refresh tokens silently using NextAuth's built-in JWT rotation.",
    evidence: {
      filename: 'src/lib/auth.ts',
      language: 'typescript',
      highlightLines: [8, 9, 10, 21, 22],
      code: `import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { redis } from '@/lib/redis'

export const authConfig = {
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Store session in Redis for revocation
      if (account) {
        await redis.set(
          \`session:\${token.sub}\`,
          JSON.stringify({ userId: token.sub, createdAt: Date.now() }),
          { ex: 7 * 24 * 60 * 60 }
        )
      }
      return token
    },
  },
}`,
    },
    followUp: [
      'How would you implement session revocation?',
      'What are the security implications of storing user data in JWTs?',
      'How do you handle token refresh for long-lived sessions?',
    ],
  },
  {
    id: 'q3',
    question: 'Why did you use tRPC instead of a traditional REST API or GraphQL?',
    category: 'API Design',
    difficulty: 'medium',
    probability: 85,
    tags: ['api', 'typescript', 'trpc', 'architecture'],
    whyAsked: "tRPC is a deliberate, opinionated choice. Interviewers want to understand whether you can articulate the tradeoffs versus REST and GraphQL.",
    strongAnswer: "tRPC gave us end-to-end type safety without a code generation step. Since the frontend and backend are in the same monorepo, tRPC's client automatically infers types from the server router — if I rename a field in the backend, TypeScript catches the breakage at the call site immediately. For our team of 3 developers, this eliminated an entire class of runtime API contract bugs. The alternative, GraphQL, would have required maintaining a schema, running codegen, and learning a new query language. REST would have required manually keeping OpenAPI specs in sync. tRPC's tradeoff is that it tightly couples client and server — which is acceptable for our monorepo architecture but would be wrong for a public API.",
    evidence: {
      filename: 'src/server/api/routers/page.ts',
      language: 'typescript',
      highlightLines: [1, 5, 10, 11],
      code: `import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

export const pageRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.page.findMany({
        where: { 
          workspaceId: input.workspaceId,
          deletedAt: null,
        },
        orderBy: { updatedAt: 'desc' },
        include: { _count: { select: { blocks: true } } },
      })
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(256),
      workspaceId: z.string(),
      parentId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.page.create({ data: { ...input, authorId: ctx.session.user.id } })
    }),
})`,
    },
    followUp: [
      'How would you expose a public API without tRPC?',
      'What happens when the frontend and backend teams diverge?',
      'How does tRPC handle file uploads?',
    ],
  },
  {
    id: 'q4',
    question: 'Explain your Redis caching strategy and cache invalidation approach.',
    category: 'Performance',
    difficulty: 'hard',
    probability: 79,
    tags: ['redis', 'caching', 'performance'],
    whyAsked: "Cache invalidation is notoriously difficult. Your codebase uses Redis for sessions and rate limiting — interviewers will probe whether you've thought through stale data scenarios.",
    strongAnswer: "We use Redis for three purposes: session storage, rate limiting, and workspace-level read caching. For read caching, we key by workspace ID and invalidate on any mutation in that workspace. We chose a simple cache-aside pattern rather than write-through because our write patterns are unpredictable. The risk with this approach is thundering herd on cache misses — we mitigate this with a short random TTL jitter. Rate limiting uses Redis sorted sets with a sliding window counter.",
    evidence: {
      filename: 'src/lib/cache.ts',
      language: 'typescript',
      highlightLines: [4, 14, 15],
      code: `import { redis } from './redis'

export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached) as T
  
  const data = await fetcher()
  
  // TTL jitter ±10% to prevent thundering herd
  const jitter = Math.floor(ttlSeconds * 0.1 * Math.random())
  await redis.set(key, JSON.stringify(data), { ex: ttlSeconds + jitter })
  
  return data
}

export async function invalidateWorkspace(workspaceId: string) {
  const keys = await redis.keys(\`workspace:\${workspaceId}:*\`)
  if (keys.length > 0) await redis.del(...keys)
}`,
    },
    followUp: [
      'How do you handle cache stampede on a popular workspace?',
      'What monitoring do you have for cache hit rates?',
      'When would you switch to a write-through strategy?',
    ],
  },
  {
    id: 'q5',
    question: 'How does your file upload architecture work, and what are its limitations?',
    category: 'Infrastructure',
    difficulty: 'medium',
    probability: 74,
    tags: ['aws', 's3', 'uploads', 'infrastructure'],
    whyAsked: "Direct-to-S3 uploads via presigned URLs is a common pattern — interviewers will test whether you understand why and what the failure modes are.",
    strongAnswer: "We use presigned URLs so the browser uploads directly to S3, bypassing our server. The flow is: client requests a presigned URL from our tRPC endpoint, server validates permissions and generates a 5-minute URL, client uploads directly to S3, then notifies our server with the S3 key to finalize. This keeps our server stateless for uploads and avoids paying egress costs twice. The limitations are: we can't do server-side validation of file contents (only MIME type), and if the client disconnects mid-upload, S3 can have orphaned incomplete multipart uploads — we handle this with an S3 lifecycle rule that cleans up incomplete uploads after 24 hours.",
    evidence: {
      filename: 'src/server/api/routers/upload.ts',
      language: 'typescript',
      highlightLines: [6, 7, 8, 9],
      code: `import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const uploadRouter = createTRPCRouter({
  getPresignedUrl: protectedProcedure
    .input(z.object({ filename: z.string(), contentType: z.string(), size: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (input.size > 50 * 1024 * 1024) throw new TRPCError({ code: 'BAD_REQUEST' })
      
      const key = \`uploads/\${ctx.session.user.id}/\${Date.now()}-\${input.filename}\`
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        ContentType: input.contentType,
        ContentLength: input.size,
      })
      
      const url = await getSignedUrl(s3, command, { expiresIn: 300 })
      return { url, key }
    }),
})`,
    },
    followUp: [
      'How would you implement virus scanning on uploaded files?',
      'What would you change if files needed to be private?',
      'How do you handle upload failures client-side?',
    ],
  },
  {
    id: 'q6',
    question: 'How did you implement real-time collaborative editing?',
    category: 'Architecture',
    difficulty: 'hard',
    probability: 71,
    tags: ['realtime', 'websockets', 'collaboration', 'crdt'],
    whyAsked: "Notion-like collaboration is technically complex. Interviewers will probe whether you understand the CAP theorem tradeoffs and conflict resolution strategies.",
    strongAnswer: "We use a server-authoritative operational transform approach with optimistic updates. Each block change is sent as an operation (insert, delete, update) to the server via WebSocket. The server applies the operation to PostgreSQL and broadcasts it to all connected clients in the same workspace via Redis pub/sub. We use Yjs on the client for conflict resolution — it implements CRDT semantics so operations can be applied in any order and converge to the same result. The limitation is eventual consistency — two users might briefly see different states during network partitions.",
    evidence: {
      filename: 'src/server/ws/collaboration.ts',
      language: 'typescript',
      highlightLines: [5, 15, 16],
      code: `import { Redis } from 'ioredis'
import * as Y from 'yjs'

const publisher = new Redis(process.env.REDIS_URL!)
const subscriber = new Redis(process.env.REDIS_URL!)

export function setupCollaboration(wss: WebSocketServer) {
  const docs = new Map<string, Y.Doc>()
  
  wss.on('connection', (ws, req) => {
    const pageId = req.url?.split('/').pop()
    if (!pageId) return ws.close()
    
    if (!docs.has(pageId)) docs.set(pageId, new Y.Doc())
    const doc = docs.get(pageId)!
    
    subscriber.subscribe(\`page:\${pageId}\`)
    subscriber.on('message', (_, msg) => {
      ws.send(msg) // broadcast to all connected clients
    })
    
    ws.on('message', async (data) => {
      await publisher.publish(\`page:\${pageId}\`, data.toString())
    })
  })
}`,
    },
    followUp: [
      'How does your system handle network partitions?',
      'What happens if two users simultaneously delete the same block?',
      'How would you scale this to 1000 concurrent editors on one document?',
    ],
  },
];

export const RECENT_INTERVIEWS = [
  {
    id: 'i1',
    date: '2024-01-15',
    duration: '24 min',
    questionsAnswered: 8,
    score: 74,
    improvement: +12,
    weakArea: 'Database architecture',
  },
  {
    id: 'i2',
    date: '2024-01-12',
    duration: '18 min',
    questionsAnswered: 6,
    score: 62,
    improvement: -3,
    weakArea: 'Security & auth',
  },
  {
    id: 'i3',
    date: '2024-01-09',
    duration: '31 min',
    questionsAnswered: 11,
    score: 65,
    improvement: +8,
    weakArea: 'Performance & caching',
  },
];

export const WEAK_AREAS = [
  { topic: 'Database query optimization', score: 48, questionCount: 5 },
  { topic: 'Security hardening', score: 55, questionCount: 7 },
  { topic: 'Distributed caching', score: 58, questionCount: 4 },
  { topic: 'Real-time architecture', score: 61, questionCount: 3 },
  { topic: 'API design tradeoffs', score: 70, questionCount: 8 },
];

export const ANALYSIS_STEPS = [
  { label: 'Reading repository structure', status: 'done' },
  { label: 'Detecting technologies', status: 'done' },
  { label: 'Understanding architecture', status: 'done' },
  { label: 'Mapping API surface', status: 'done' },
  { label: 'Analyzing database schema', status: 'active' },
  { label: 'Preparing interview questions', status: 'pending' },
];
