// ============================================================
// RepoInterview AI — Marketing & Landing Demo Fixtures ONLY
// Used exclusively for the interactive product demo on marketing pages (/)
// NOT used for in-app user workspaces.
// ============================================================

export const DEMO_REPO = {
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

export const DEMO_QUESTIONS = [
  {
    id: 'q1',
    category: 'Database',
    difficulty: 'medium',
    probability: 92,
    question: 'Why did you choose PostgreSQL over MongoDB for this project?',
    whyAsked:
      'The project implements a relational workspace model with strict foreign keys between Workspaces, Pages, and User roles.',
    strongAnswer:
      'We chose PostgreSQL because Notionify requires strong relational integrity between Workspaces, Pages, and Permissions with ACID transactions. Document databases like MongoDB would require complex manual relationship handling and could lead to orphaned pages during concurrent tree reorganizations.',
    evidence: {
      filename: 'prisma/schema.prisma',
      language: 'prisma',
      highlightLines: [4, 5, 12, 13],
      code: `model Page {
  id          String    @id @default(cuid())
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  parentId    String?
  parent      Page?     @relation("PageHierarchy", fields: [parentId], references: [id])
  children    Page[]    @relation("PageHierarchy")
  title       String
  content     Json?
  createdAt   DateTime  @default(now())
}`,
    },
    followUp: [
      'How would you handle deep hierarchical page tree queries in PostgreSQL without hitting recursion limits?',
      'What indexing strategy did you apply to the parentId and workspaceId foreign keys?',
    ],
    tags: ['database', 'postgresql', 'prisma', 'schema-design'],
  },
  {
    id: 'q2',
    category: 'Security',
    difficulty: 'medium',
    probability: 88,
    question: 'Walk me through your authentication architecture using NextAuth.js.',
    whyAsked: 'Authentication is configured with JWT strategies and custom Prisma session adapters.',
    strongAnswer:
      'We use NextAuth.js configured with JWT session strategy to minimize database session queries on edge API routes while maintaining session invalidation via Redis token blacklisting.',
    evidence: {
      filename: 'src/lib/auth.ts',
      language: 'typescript',
      highlightLines: [3, 4, 8, 9],
      code: `export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  providers: [
    GitHubProvider({ clientId: env.GITHUB_ID, clientSecret: env.GITHUB_SECRET }),
    GoogleProvider({ clientId: env.GOOGLE_ID, clientSecret: env.GOOGLE_SECRET }),
  ],
};`,
    },
    followUp: [
      'How do you revoke compromised JWT sessions before their expiration time?',
      'Why did you select the PrismaAdapter rather than purely stateless token verification?',
    ],
    tags: ['security', 'auth', 'nextauth', 'jwt'],
  },
  {
    id: 'q3',
    category: 'API Design',
    difficulty: 'medium',
    probability: 85,
    question: 'Why did you use tRPC instead of a traditional REST API or GraphQL?',
    whyAsked: 'tRPC is used across all client-server communication without intermediate schema definitions.',
    strongAnswer:
      'tRPC provides end-to-end type safety directly from our backend TypeScript router definitions to our frontend React components without build-time code generation, reducing API contract bugs and schema sync drift.',
    evidence: {
      filename: 'src/server/api/routers/page.ts',
      language: 'typescript',
      highlightLines: [4, 5, 6, 7],
      code: `export const pageRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.page.findUnique({ where: { id: input.id } });
    }),
});`,
    },
    followUp: [
      'How does tRPC handle public-facing third party API consumption if you need to expose endpoints to external developers?',
      'How do you handle batching and request deduplication in tRPC React queries?',
    ],
    tags: ['api-design', 'trpc', 'typescript', 'architecture'],
  },
];
