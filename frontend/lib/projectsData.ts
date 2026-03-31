export interface Project {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  status: 'Active' | 'Completed' | 'In Development';
  techStack: string[];
  overview: string;
  problemStatement: string;
  solutionApproach: string;
  keyFeatures: string[];
  githubUrl?: string;
  liveUrl?: string;
}

export const projects: Project[] = [
  {
    id: '1',
    slug: 'code-halcon',
    name: 'Code Halcon',
    shortDescription: 'AI-powered autonomous bug detection and resolution engine.',
    status: 'Active',
    techStack: ['Next.js', 'TypeScript', 'GSAP', 'OpenAI'],
    overview: 'Code Halcon is an intelligent system designed to act as an ever-watchful observer over modern codebases, detecting deep architectural flaws and security vulnerabilities before they hit production.',
    problemStatement: 'Modern CI/CD pipelines catch syntax errors and basic linting issues, but fail to understand complex business logic flaws or cross-service architectural misalignments until they cause production incidents.',
    solutionApproach: 'By deploying a continuous analysis engine powered by advanced LLMs, Code Halcon builds a deep semantic understanding of the entire repository. It surfaces highly contextualized, actionable insights wrapped in a cinematic, zero-noise interface.',
    keyFeatures: [
      'Semantic codebase ingestion and mapping',
      'Real-time vulnerability prediction',
      'Automated PR review and remediation suggestions',
      'Cinematic data visualization interface'
    ],
    liveUrl: 'https://halcon.example.com',
  },
  {
    id: '2',
    slug: 'origin-pi',
    name: 'Origin Pi',
    shortDescription: 'Decentralized distributed computing network for AI training workloads.',
    status: 'Completed',
    techStack: ['Rust', 'Solana', 'React', 'WebGPU'],
    overview: 'Origin Pi establishes a peer-to-peer compute grid that aggregates idle consumer GPU and CPU power to train large-scale artificial intelligence models at a fraction of traditional cloud costs.',
    problemStatement: 'AI researchers and startups face prohibitive infrastructure costs when scaling model training, relying entirely on centralized GPU clusters controlled by a few major providers.',
    solutionApproach: 'Origin Pi decentralizes the training process by introducing a lightweight, containerized node architecture. Contributors earn network tokens in exchange for providing verified computational cycles.',
    keyFeatures: [
      'Cryptographically verified compute proofs',
      'Dynamic workload balancing and sharding',
      'Low-latency peer discovery protocol',
      'Web-based node dashboard'
    ],
    githubUrl: 'https://github.com/example/origin-pi',
  },
  {
    id: '3',
    slug: 'nexus-vault',
    name: 'Nexus Vault',
    shortDescription: 'Enterprise-grade identity and secrets management architecture.',
    status: 'In Development',
    techStack: ['Go', 'PostgreSQL', 'gRPC', 'Next.js'],
    overview: 'Nexus Vault provides zero-trust identity brokering and secret rotation for microservice environments, designed strictly for high-compliance financial and healthcare infrastructure.',
    problemStatement: 'Secret sprawl and hardcoded credentials remain the leading cause of enterprise breaches. Existing vault solutions are overly complex to deploy and maintain in highly dynamic Kubernetes environments.',
    solutionApproach: 'A streamlined, API-first vault that uses short-lived, dynamically generated credentials for service-to-service authentication, eliminating static secrets entirely.',
    keyFeatures: [
      'Dynamic short-lived credential generation',
      'Transparent sidecar injection for K8s',
      'Comprehensive audit logging and SIEM integration',
      'Role-based access control (RBAC) engine'
    ]
  }
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
