// ============================================================
// RepoInterview AI — RAG-Grounded Interview Question Service
// Orchestrates:
// 1. Repository Document Chunking
// 2. Embedding Generation & Vector Storage (MongoDB Atlas)
// 3. Category-Specific Semantic Context Retrieval
// 4. Grounded AI Question Generation based strictly on retrieved code
// ============================================================

import { chunkingService } from './chunkingService.js';
import { embeddingService } from './embeddingService.js';
import { vectorStoreService } from './vectorStoreService.js';
import { retrievalService } from './retrievalService.js';
import { aiService } from '../services/aiService.js';
import { INTERVIEW_CATEGORIES } from '../templates/promptTemplates.js';

const CATEGORY_SEARCH_QUERIES = {
  'Project Explanation': 'application entry point package manifest overall architecture description README',
  'Technical': 'component state management hooks asynchronous data flows state synchronization',
  'Database': 'database schema models connection queries ORM prisma mongoose sql entities',
  'API': 'HTTP REST routes api endpoints controllers handlers request validation status codes',
  'Architecture': 'architectural layer separation modules dependencies server client router',
  'Security': 'authentication tokens JWT session cookies authorization security middleware password',
  'Scalability': 'caching redis concurrency bottlenecks performance load optimization',
  'HR Project': 'complex error handling edge cases algorithmic trade-offs debugging challenge',
};

export const ragQuestionService = {
  /**
   * Index repository files into the vector database
   * @param {string} repositoryId
   * @param {Array<object>} files
   * @returns {Promise<{ totalChunks: number, mode: string }>}
   */
  async indexRepository(repositoryId, files = []) {
    console.log(`\n📚 [RAG] Indexing repository "${repositoryId}" (${files.length} files)...`);

    // 1. Chunk all repository files
    const chunks = chunkingService.chunkRepository(files, repositoryId);
    console.log(`🧩 [RAG] Generated ${chunks.length} semantic code chunks`);

    // 2. Generate embeddings for all chunks
    const chunkTexts = chunks.map(c => `${c.header}\n${c.content}`);
    const embeddings = await embeddingService.generateBatchEmbeddings(chunkTexts);

    // 3. Attach embeddings to chunk objects
    const embeddedChunks = chunks.map((chunk, index) => ({
      ...chunk,
      embedding: embeddings[index],
    }));

    // 4. Store in MongoDB Atlas Vector Search / Vector Store
    const storeResult = await vectorStoreService.storeChunks(repositoryId, embeddedChunks);
    console.log(`✅ [RAG] Stored ${storeResult.storedCount} chunks in Vector DB (${storeResult.mode} mode)\n`);

    return {
      totalChunks: chunks.length,
      mode: storeResult.mode,
      repositoryId,
    };
  },

  /**
   * Generate RAG-Grounded Questions across categories using retrieved code evidence
   * @param {object} analysisData Complete repository analysis payload
   * @param {Array<object>} files Extracted files
   * @param {object} [options={}]
   * @returns {Promise<object>}
   */
  async generateRAGQuestions(analysisData, files = [], options = {}) {
    const repositoryId = analysisData.repository?.fullName || analysisData.repository?.name || 'repo-default';

    // 1. Ensure repository is indexed in Vector Store
    await this.indexRepository(repositoryId, files);

    const requestedCategories = options.categories || INTERVIEW_CATEGORIES;
    const questions = [];
    const evidenceSummary = {};

    console.log(`🔍 [RAG] Retrieving grounded code contexts for ${requestedCategories.length} categories...`);

    for (const category of requestedCategories) {
      const queryText = CATEGORY_SEARCH_QUERIES[category] || category;

      // 2. Retrieve top-K relevant code chunks for this category
      const retrievedChunks = await retrievalService.retrieveContext(repositoryId, queryText, {
        topK: options.topK || 3,
      });

      evidenceSummary[category] = retrievedChunks.map(c => ({
        filePath: c.filePath,
        lines: `${c.startLine}-${c.endLine}`,
        score: c.score,
        symbols: c.symbols,
      }));

      // 3. Format grounded code context block
      const formattedContext = retrievalService.formatContextForPrompt(retrievedChunks);

      // 4. Create RAG-grounded prompt for this specific category
      const ragUserPrompt = `
You are an expert technical interviewer. Generate ONE high-caliber, in-depth "${category}" interview question grounded STRICTLY in the following retrieved code evidence from the candidate's repository.

RETRIEVED CODE EVIDENCE:
${formattedContext}

REQUIREMENTS:
1. Ground the question directly in the retrieved code, file paths (\`${retrievedChunks[0]?.filePath || 'source'}\`), and line numbers.
2. Formulate a comprehensive, senior-level expected answer that analyzes the candidate's actual implementation, trade-offs, and failure modes.
3. Include 2 probing follow-up questions.

OUTPUT JSON FORMAT:
{
  "question": "...",
  "category": "${category}",
  "difficulty": "Hard",
  "expectedAnswer": "...",
  "followUpQuestions": ["...", "..."]
}
`.trim();

      // 5. Generate question using AI service
      const generatedList = await aiService.generateInterviewQuestions(
        {
          ...analysisData,
          customPrompt: ragUserPrompt,
        },
        {
          categories: [category],
          countPerCategory: 1,
        }
      );

      if (generatedList.length > 0) {
        const q = generatedList[0];
        questions.push({
          ...q,
          category,
          evidenceFiles: retrievedChunks.map(c => ({
            filePath: c.filePath,
            lines: `${c.startLine}-${c.endLine}`,
            relevanceScore: Math.round((c.score || 1) * 100),
          })),
        });
      }
    }

    return {
      repository: analysisData.repository,
      summary: analysisData.summary,
      totalQuestions: questions.length,
      ragPipeline: {
        vectorStore: vectorStoreService.getStats(repositoryId),
        groundedEvidenceCount: Object.values(evidenceSummary).reduce((acc, list) => acc + list.length, 0),
        evidenceSummary,
      },
      questions,
    };
  },
};
