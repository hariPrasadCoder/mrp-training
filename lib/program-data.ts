export type Week = {
  id: number;
  eyebrow: string;
  title: string;
  outcome: string;
  accent: "pink" | "blue" | "green" | "yellow" | "coral";
  status: "complete" | "current" | "locked";
};

export type WeekPlan = {
  weekNumber: number;
  goal: string;
  videos: string[];
  build: string[];
  submit: string[];
};

export type ProblemStatement = {
  id: string;
  category: string;
  title: string;
  statement: string;
  primaryUser: string;
  evidence: Array<{ label: string; url: string }>;
  buildPath: Array<{ week: number; outcome: string }>;
};

export const weeks: Week[] = [
  {
    id: 0,
    eyebrow: "Before we begin",
    title: "Choose the problem",
    outcome: "Arrive ready with your tools, research and a clear problem to solve.",
    accent: "coral",
    status: "current",
  },
  {
    id: 1,
    eyebrow: "MVP",
    title: "Build the first version",
    outcome: "Turn your problem into a small working product and ship it.",
    accent: "pink",
    status: "locked",
  },
  {
    id: 2,
    eyebrow: "RAG",
    title: "Add your own knowledge",
    outcome: "Make your product answer from real documents using RAG.",
    accent: "blue",
    status: "locked",
  },
  {
    id: 3,
    eyebrow: "AI agents",
    title: "Make it take action",
    outcome: "Give your product tools and a clear multi-step workflow.",
    accent: "green",
    status: "locked",
  },
  {
    id: 4,
    eyebrow: "Production",
    title: "Make it production-ready",
    outcome: "Observe, evaluate and polish your product for a final demo.",
    accent: "yellow",
    status: "locked",
  },
];

export const weekPlans: WeekPlan[] = [
  {
    weekNumber: 0,
    goal: "Complete onboarding and choose the problem you will build around.",
    videos: [],
    build: [],
    submit: [
      "A short report covering what you understood, existing solutions and the direction you want to explore",
    ],
  },
  {
    weekNumber: 1,
    goal: "Build and deploy the smallest useful version of your idea.",
    videos: [
      "Claude Code + GitHub workflow",
      "FastAPI + LangChain basics",
      "Supabase + Vercel: store and ship",
    ],
    build: [
      "Define one user and one core job",
      "Build the smallest end-to-end AI workflow",
      "Deploy it so someone else can try it",
    ],
    submit: ["Live product link", "GitHub repository", "Short reflection"],
  },
  {
    weekNumber: 2,
    goal: "Improve the same product with answers grounded in your own data.",
    videos: [
      "RAG + Pinecone fundamentals",
      "Build a RAG pipeline with LangChain",
      "A few practical advanced RAG patterns",
    ],
    build: [
      "Choose a small, useful document set",
      "Add ingestion, retrieval and grounded answers",
      "Test the feature with real questions",
    ],
    submit: ["Updated live product", "Updated repository", "Example RAG results"],
  },
  {
    weekNumber: 3,
    goal: "Add one useful agent workflow instead of chasing full autonomy.",
    videos: [
      "Agents, tool calling and guardrails",
      "LangGraph and common workflow patterns",
      "A few practical advanced LangGraph patterns",
    ],
    build: [
      "Choose one task that genuinely needs multiple steps",
      "Give the agent the minimum tools it needs",
      "Add a clear stop, fallback or approval point",
    ],
    submit: ["Working agent flow", "Updated repository", "Short workflow demo"],
  },
  {
    weekNumber: 4,
    goal: "Turn the four-week build into a reliable, presentable final product.",
    videos: [
      "Observability with Langfuse or LangSmith",
      "Evaluation basics",
      "LiteLLM, prompt caching and production deployment",
    ],
    build: [
      "Add tracing and inspect one real failure",
      "Create a small evaluation set",
      "Improve reliability, cost or speed and polish the experience",
    ],
    submit: [
      "Final live product",
      "Final repository and README",
      "Demo showing the problem, product and evidence that it works",
    ],
  },
];

export const problemStatements: ProblemStatement[] = [
  {
    id: "pantry-planner",
    category: "Food + everyday life",
    title: "Intelligent Food & Pantry Optimisation",
    statement:
      "People buy food with good intentions but lose track of what they already have, what needs using first and what meals fit their time and preferences. Build a helper that turns available ingredients and leftovers into a realistic meal plan and shopping list—without giving medical nutrition advice.",
    primaryUser: "A busy person or household trying to waste less food",
    evidence: [
      {
        label: "UNEP Food Waste Index 2024",
        url: "https://www.unep.org/resources/publication/food-waste-index-report-2024",
      },
      {
        label: "Review of household leftover behaviour",
        url: "https://doi.org/10.1016/j.appet.2023.106577",
      },
    ],
    buildPath: [
      { week: 1, outcome: "Suggest meals from a typed ingredient list" },
      { week: 2, outcome: "Ground suggestions in a trusted recipe collection" },
      { week: 3, outcome: "Create a plan and draft a shopping list with approval" },
      { week: 4, outcome: "Evaluate constraint-following, waste reduction and cost" },
    ],
  },
  {
    id: "meeting-follow-through",
    category: "Work + project management",
    title: "Meeting-to-Execution Intelligence",
    statement:
      "Teams leave meetings with decisions and actions spread across transcripts, notes and chat. Owners, deadlines and context are easily unclear. Build a helper that turns meeting material into reviewable decisions, action items and project updates.",
    primaryUser: "A small team, project lead or freelancer managing shared work",
    evidence: [
      {
        label: "Microsoft Work Trend Index meeting research",
        url: "https://www.microsoft.com/en-us/worklab/how-ai-can-help-build-more-intentional-meetings",
      },
      {
        label: "CHI research on meeting goals",
        url: "https://www.microsoft.com/en-us/research/wp-content/uploads/2024/01/chi24-774-authorcameraready.pdf",
      },
    ],
    buildPath: [
      { week: 1, outcome: "Extract decisions, owners and next steps from notes" },
      { week: 2, outcome: "Use project documents and past decisions as context" },
      { week: 3, outcome: "Draft tasks and follow-ups for human approval" },
      { week: 4, outcome: "Measure missed and invented actions, cost and latency" },
    ],
  },
  {
    id: "study-companion",
    category: "Students + learning",
    title: "Adaptive Learning & Study Orchestration",
    statement:
      "Students have deadlines, notes and course resources in different places, but still have to decide what to study, when to do it and whether they understand it. Build a study companion that creates a realistic plan and helps students learn from their own materials rather than completing assessed work for them.",
    primaryUser: "A school, university or independent learner",
    evidence: [
      {
        label: "OECD PISA 2022 self-directed learning findings",
        url: "https://www.oecd.org/en/publications/pisa-2022-results-volume-v_c2e44201-en/full-report/component-17.html",
      },
      {
        label: "EEF metacognition and self-regulation review",
        url: "https://educationendowmentfoundation.org.uk/education-evidence/evidence-reviews/metacognition-and-self-regulation",
      },
    ],
    buildPath: [
      { week: 1, outcome: "Turn goals and deadlines into a weekly study plan" },
      { week: 2, outcome: "Answer questions from course material with citations" },
      { week: 3, outcome: "Adapt the plan after check-ins and draft reminders" },
      { week: 4, outcome: "Evaluate grounded answers and useful study plans" },
    ],
  },
  {
    id: "research-navigator",
    category: "Research + evidence",
    title: "Evidence Discovery & Research Synthesis",
    statement:
      "Students and researchers face more papers than they can read closely. It is difficult to judge relevance, compare findings and preserve the link between a claim and its source. Build an evidence navigator that helps organise and inspect papers while keeping the human researcher in control.",
    primaryUser: "A student, analyst or researcher starting a literature review",
    evidence: [
      {
        label: "Research on scholarly information overload",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9291810/",
      },
      {
        label: "AHRQ review of machine-assisted screening",
        url: "https://www.ncbi.nlm.nih.gov/books/NBK550175/",
      },
    ],
    buildPath: [
      { week: 1, outcome: "Summarise and categorise a small paper list" },
      { week: 2, outcome: "Ask cited questions across selected papers" },
      { week: 3, outcome: "Draft a review workflow: import, screen and compare" },
      { week: 4, outcome: "Evaluate citation accuracy and missed relevant papers" },
    ],
  },
  {
    id: "life-admin",
    category: "Home + personal administration",
    title: "Personal Administration & Renewal Intelligence",
    statement:
      "Important bills, contracts, warranties and renewal dates are scattered across inboxes and documents. Build a private assistant that explains obligations, finds deadlines and prepares reviewable next steps without making legal or financial decisions for the user.",
    primaryUser: "A person or household managing recurring life admin",
    evidence: [
      {
        label: "OECD human-centred digital services",
        url: "https://www.oecd.org/en/publications/2026/06/digital-government-outlook_4585678e/full-report/building-human-centred-and-proactive-government-services-in-the-digital-age_7cc9d8c5.html",
      },
      {
        label: "UK research on contract understanding",
        url: "https://www.gov.uk/government/publications/contractual-terms-and-privacy-policies-how-to-improve-consumer-understanding",
      },
    ],
    buildPath: [
      { week: 1, outcome: "Extract dates, obligations and costs from one document" },
      { week: 2, outcome: "Answer cited questions across a private document folder" },
      { week: 3, outcome: "Draft reminders and next steps for user approval" },
      { week: 4, outcome: "Evaluate extraction accuracy, privacy and missed deadlines" },
    ],
  },
  {
    id: "home-energy",
    category: "Climate + household costs",
    title: "Household Energy Intelligence & Optimisation",
    statement:
      "Energy bills tell households what they used, but rarely turn that information into clear, realistic action. Build a helper that explains usage patterns, compares periods and recommends practical experiments while being honest about uncertainty and savings estimates.",
    primaryUser: "A household trying to understand and reduce energy use",
    evidence: [
      {
        label: "IEA behavioural interventions at home",
        url: "https://www.iea.org/articles/the-potential-of-behavioural-interventions-for-optimising-energy-use-at-home",
      },
      {
        label: "IEA digital tools for energy efficiency",
        url: "https://www.iea.org/articles/better-energy-efficiency-policy-with-digital-tools",
      },
    ],
    buildPath: [
      { week: 1, outcome: "Explain a bill and identify notable usage changes" },
      { week: 2, outcome: "Ground recommendations in trusted efficiency guidance" },
      { week: 3, outcome: "Create a monitored action plan with user check-ins" },
      { week: 4, outcome: "Evaluate calculation accuracy, usefulness and uncertainty" },
    ],
  },
  {
    id: "care-coordination",
    category: "Families + caregiving",
    title: "Family Care Coordination & Continuity",
    statement:
      "Families coordinating care often juggle appointments, questions, documents and updates across several people. Build a non-clinical coordination assistant that creates a shared, permission-aware view of what happened and what needs attention—without diagnosing or changing treatment.",
    primaryUser: "A family caregiver coordinating information and appointments",
    evidence: [
      {
        label: "CDC guidance on caregiver care plans",
        url: "https://www.cdc.gov/caregiving/guidelines/index.html",
      },
      {
        label: "National Academies family caregiving report",
        url: "https://www.nationalacademies.org/publications/23606",
      },
    ],
    buildPath: [
      { week: 1, outcome: "Organise appointments, questions and family updates" },
      { week: 2, outcome: "Retrieve cited information from approved care documents" },
      { week: 3, outcome: "Draft checklists and updates with explicit approval" },
      { week: 4, outcome: "Evaluate privacy, omissions and source-grounding" },
    ],
  },
  {
    id: "customer-signals",
    category: "Products + customer experience",
    title: "Customer Signal & Product Intelligence",
    statement:
      "Useful product feedback arrives through calls, tickets, surveys and reviews, making recurring pain points hard to see and easy to cherry-pick. Build a system that turns raw feedback into traceable themes and product opportunities while preserving the original customer evidence.",
    primaryUser: "A product manager, founder or customer-success team",
    evidence: [
      {
        label: "Productboard product insights survey",
        url: "https://info.productboard.com/rs/128-JHR-871/images/PE%20Survey%202021.pdf",
      },
      {
        label: "Research on automated user-feedback analysis",
        url: "https://arxiv.org/abs/2407.15519",
      },
    ],
    buildPath: [
      { week: 1, outcome: "Cluster a feedback set into traceable themes" },
      { week: 2, outcome: "Search feedback and cite the supporting customer voice" },
      { week: 3, outcome: "Draft an evidence-backed opportunity brief" },
      { week: 4, outcome: "Evaluate theme stability, coverage and hallucinations" },
    ],
  },
  {
    id: "public-service-navigation",
    category: "Public services + inclusion",
    title: "Public Service & Benefits Navigation",
    statement:
      "People often struggle to identify the right public service, understand official guidance and assemble the information needed for an application. Build a navigator that explains current official sources and prepares a personalised checklist without guaranteeing eligibility or submitting anything automatically.",
    primaryUser: "A resident trying to understand a public service or benefit",
    evidence: [
      {
        label: "OECD Digital Government Outlook",
        url: "https://www.oecd.org/en/publications/2026/06/digital-government-outlook_4585678e/full-report/building-human-centred-and-proactive-government-services-in-the-digital-age_7cc9d8c5.html",
      },
      {
        label: "OECD research on administrative burden",
        url: "https://www.oecd.org/en/publications/better-regulation-practices-across-the-european-union-2025_6f007516-en/full-report/keeping-rules-fit-for-purpose-through-evaluation-and-review_b4cdc80b.html",
      },
    ],
    buildPath: [
      { week: 1, outcome: "Turn a user situation into a clear service checklist" },
      { week: 2, outcome: "Answer questions with citations to current official pages" },
      { week: 3, outcome: "Draft an application-preparation workflow for approval" },
      { week: 4, outcome: "Evaluate freshness, citation accuracy and unsafe claims" },
    ],
  },
  {
    id: "inbox-action",
    category: "Work + personal productivity",
    title: "Inbox-to-Action Intelligence",
    statement:
      "High-volume inboxes mix requests, decisions, deadlines and low-value noise. Build an assistant that identifies what needs attention, explains why and drafts a reviewable action queue while keeping the user in control of every reply and external action.",
    primaryUser: "A professional, founder or team lead managing a busy inbox",
    evidence: [
      {
        label: "Microsoft 2024 Work Trend Index",
        url: "https://www.microsoft.com/en-us/worklab/work-trend-index/ai-at-work-is-here-now-comes-the-hard-part",
      },
      {
        label: "Microsoft research on digital debt",
        url: "https://www.microsoft.com/en-us/worklab/work-trend-index/will-ai-fix-work",
      },
    ],
    buildPath: [
      { week: 1, outcome: "Classify sample messages and extract actions and dates" },
      { week: 2, outcome: "Use policies and project context to explain priority" },
      { week: 3, outcome: "Draft replies, tasks and reminders for approval" },
      { week: 4, outcome: "Evaluate missed urgency, false alarms, privacy and tone" },
    ],
  },
];

export const onboardingItems = [
  {
    id: "profile",
    group: "Get connected",
    title: "Complete your learner profile",
    detail:
      "Tell us your current experience, availability and what success looks like.",
    meta: "5 min",
  },
  {
    id: "whatsapp",
    group: "Get connected",
    title: "Join your private WhatsApp group",
    detail:
      "This is where you, Hari and the support team communicate during the program.",
    meta: "2 min",
  },
  {
    id: "problem",
    group: "Understand the problem",
    title: "Choose a problem direction",
    detail:
      "Explore the ten researched options or bring a problem you already understand. You are choosing a direction, not committing to a final product.",
    meta: "15 min",
  },
  {
    id: "research",
    group: "Understand the problem",
    title: "Research the problem and existing solutions",
    detail:
      "Learn who has the problem, how they handle it today and where current solutions fall short.",
    meta: "60–90 min",
  },
  {
    id: "report",
    group: "Understand the problem",
    title: "Submit your understanding report",
    detail:
      "Summarise the problem, users, existing solutions, key gaps and the direction you want to explore.",
    meta: "45 min",
  },
  {
    id: "setup",
    group: "Builder setup",
    title: "Set up Python, Claude Code and GitHub",
    detail:
      "Confirm Python and Git work, sign in to GitHub and run Claude Code locally.",
    meta: "30 min",
  },
];
