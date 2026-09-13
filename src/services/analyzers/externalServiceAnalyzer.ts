// ============================================================
// RepoInterview AI — External Service & Third-Party Integration Analyzer
// Distinguishes dependency declaration from active code usage.
// ============================================================

import type { ExternalService, FindingEvidence, RepositoryIngestionResult } from '../../types/domain.ts';

interface ServiceDefinition {
  name: string;
  purpose: string;
  packages: string[];
  codeKeywords: string[];
}

const KNOWN_SERVICES: ServiceDefinition[] = [
  { name: 'Stripe', purpose: 'Payment Processing & Billing', packages: ['stripe', '@stripe/stripe-js', '@stripe/react-stripe-js'], codeKeywords: ['stripe.checkout', 'stripe.paymentIntents', 'new Stripe('] },
  { name: 'AWS S3', purpose: 'Cloud Object Storage', packages: ['@aws-sdk/client-s3', 'aws-sdk'], codeKeywords: ['S3Client', 'PutObjectCommand', 's3.upload'] },
  { name: 'Resend', purpose: 'Transactional Email Delivery', packages: ['resend'], codeKeywords: ['new Resend(', 'resend.emails.send'] },
  { name: 'SendGrid', purpose: 'Transactional Email Delivery', packages: ['@sendgrid/mail'], codeKeywords: ['sgMail.send', 'sendgrid'] },
  { name: 'Cloudinary', purpose: 'Media Asset Management & CDN', packages: ['cloudinary'], codeKeywords: ['cloudinary.v2', 'cloudinary.uploader'] },
  { name: 'Twilio', purpose: 'SMS & Voice Communication', packages: ['twilio'], codeKeywords: ['twilio.messages.create', 'new Twilio('] },
  { name: 'OpenAI API', purpose: 'LLM & AI Completion Gateway', packages: ['openai'], codeKeywords: ['new OpenAI(', 'openai.chat.completions'] },
  { name: 'Anthropic API', purpose: 'Claude AI Reasoning & Inference', packages: ['@anthropic-ai/sdk'], codeKeywords: ['new Anthropic(', 'anthropic.messages.create'] },
];

export const externalServiceAnalyzer = {
  analyze(ingestion: RepositoryIngestionResult): ExternalService[] {
    const detectedServices: ExternalService[] = [];

    // Get all dependencies from package.json
    const pkgJson = ingestion.sourceFiles.find(
      f => f.path === 'package.json' || f.path.endsWith('/package.json')
    );

    let allDeps: Record<string, any> = {};
    if (pkgJson) {
      try {
        const parsed = JSON.parse(pkgJson.content);
        allDeps = { ...(parsed.dependencies || {}), ...(parsed.devDependencies || {}) };
      } catch {}
    }

    for (const service of KNOWN_SERVICES) {
      const matchingDep = service.packages.find(pkg => allDeps[pkg]);
      const evidence: FindingEvidence[] = [];

      if (matchingDep && pkgJson) {
        evidence.push({
          filePath: pkgJson.path,
          evidenceType: 'dependency_declaration',
          description: `${matchingDep} dependency declared in package.json`,
        });
      }

      // Check source files for active code usage
      let hasCodeUsage = false;
      for (const file of ingestion.sourceFiles) {
        for (const kw of service.codeKeywords) {
          if (file.content.includes(kw)) {
            hasCodeUsage = true;
            evidence.push({
              filePath: file.path,
              evidenceType: 'code_usage',
              description: `Active ${service.name} API usage (${kw}) in ${file.path}`,
            });
            break;
          }
        }
      }

      if (evidence.length > 0) {
        const status = hasCodeUsage ? 'service_usage_detected' : 'dependency_only';
        const confidence = hasCodeUsage ? 0.95 : 0.80;

        detectedServices.push({
          name: service.name,
          purpose: service.purpose,
          status,
          confidence,
          confidenceLevel: confidence >= 0.85 ? 'high' : 'medium',
          whyDetected: hasCodeUsage
            ? `Active integration confirmed with ${evidence.length} code invocation(s).`
            : `Dependency installed in package.json without direct code invocations in sampled files.`,
          evidence,
        });
      }
    }

    return detectedServices;
  },
};
