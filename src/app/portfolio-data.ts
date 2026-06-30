export interface JNode {
  id: string;
  kind: string;
  x: number;
  y: number;
  icon: string;
  tag: string;
  title: string;
  sub: string;
  items: string[];
}

export interface JStop {
  node?: string;
  x?: number;
  y?: number;
  scale: number;
  code: string;
  caption: string;
}

export const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Recognition', href: '#recognition' },
  { label: 'Education', href: '#education' },
  { label: 'Contact', href: '#contact' },
];

export const PM_SKILLS = [
  'Agile & Scrum', 'Sprint Planning', 'Sprint Retrospective', 'Stand-up Facilitation',
  'Stakeholder Management', 'Risk Management', 'Timeline Management', 'Scope Management',
  'Resource Allocation', 'Multi-Project Coordination', 'SDLC', 'Kanban',
  'Requirement Analysis', 'Client Communication', 'AI-Assisted Sprint Planning'
];

export const TECH_SKILLS = [
  { category: 'Frontend', items: ['Angular', 'TypeScript', 'HTML5', 'Responsive Design'] },
  { category: 'Backend', items: ['.NET Core', 'REST APIs', 'Microservices', 'Strapi'] },
  { category: 'Database', items: ['PostgreSQL', 'MySQL', 'SQL Server'] },
  { category: 'AI & Tools', items: ['Claude AI', 'ChatGPT', 'Prompt Engineering', 'AI-Assisted Testing'] },
  { category: 'DevOps & Collab', items: ['Jira', 'Git', 'GitHub', 'GitLab', 'VS Code'] },
  { category: 'Concepts', items: ['System Design', 'API Integration', 'RBAC', 'Microservices Architecture', 'Performance Optimization'] },
];

export const EXPERIENCES = [
  {
    role: 'Project Manager / Full Stack Developer',
    company: 'Ionob Innovations LLP',
    period: 'Feb 2025 – May 2026',
    current: true,
    bullets: [
      'Managed 2–3 simultaneous enterprise software projects end-to-end using Agile/Scrum methodologies',
      'Facilitated sprint planning, daily stand-ups, and retrospectives while coordinating cross-functional teams',
      'Integrated Claude AI and ChatGPT into daily delivery workflow, reducing boilerplate generation time by ~40%',
      'Used AI tools to auto-generate API documentation, test cases, and sprint retrospective summaries',
      'Applied prompt engineering to build reusable AI workflows for debugging and requirements clarification',
      'Owned database design and query optimization in SQL Server across multiple project deliverables',
    ]
  },
  {
    role: 'Software Developer (Project Coordination & Delivery)',
    company: 'Redefine Technologies',
    period: 'Mar 2024 – Jan 2025',
    current: false,
    bullets: [
      'Contributed to SATTVA, an enterprise Environmental & Risk Management System',
      'Coordinated delivery of compliance management, hazard assessment, and sustainability tracking modules',
      'Participated in Agile development cycles, supporting sprint planning and frontend deliverables',
      'Built responsive Angular/TypeScript UI components for enterprise compliance workflows',
      'Integrated REST APIs ensuring consistent delivery across frontend and backend workstreams',
    ]
  },
  {
    role: 'Software Developer (Module Ownership)',
    company: 'Ionob Innovations LLP',
    period: 'Dec 2021 – Jan 2024',
    current: false,
    bullets: [
      'Owned delivery of ERP modules for manpower and rental management systems',
      'Designed and implemented RESTful APIs and microservices using Angular and .NET Core',
      'Drove performance improvements through optimized architecture and MySQL Server query tuning',
      'Awarded Employee of the Year 2023 for consistent delivery performance',
      'Received Quick Learner Award for rapidly adapting to new technologies',
    ]
  },
];

export const PROJECTS = [
  {
    name: 'SATTVA — Environmental & Risk Management System',
    stack: ['Angular', 'Strapi', 'PostgreSQL', 'REST APIs'],
    description: 'Enterprise-grade environmental and risk management platform with real-time data handling for compliance and hazard tracking.',
    bullets: [
      'Coordinated delivery of compliance management, hazard & risk assessment, and sustainability tracking modules',
      'Collaborated cross-functionally to scope and enhance system functionality across sprints',
      'Improved risk tracking and compliance reporting efficiency for enterprise operations',
    ],
    icon: 'fa-leaf'
  },
  {
    name: 'World Star ERP System',
    stack: ['Angular', '.NET Core', 'MySQL Server', 'REST APIs'],
    description: 'Full-scale ERP system covering manpower management, rental operations, and business resource management.',
    bullets: [
      'Coordinated end-to-end delivery of ERP modules for manpower and rental management',
      'Drove architectural refactoring that improved system scalability and performance',
      'Streamlined business operations and resource management workflows',
    ],
    icon: 'fa-layer-group'
  },
];

export const SOCIAL_LINKS = [
  { icon: 'fa-brands fa-linkedin',  label: 'LinkedIn',  url: 'https://www.linkedin.com/in/manu-k-binu-613b081b9' },
  { icon: 'fa-brands fa-github',    label: 'GitHub',    url: 'https://github.com/manukbinu' },
  { icon: 'fa-brands fa-instagram', label: 'Instagram', url: 'https://www.instagram.com/__mr___mysterious___' },
  { icon: 'fa-solid fa-envelope',   label: 'Email',     url: 'mailto:mail4manukbinu@gmail.com' },
];

export const AWARDS = [
  { icon: 'fa-trophy', title: 'Employee of the Year 2023', desc: 'Ionob Innovations LLP' },
  { icon: 'fa-bolt',   title: 'Quick Learner Award',       desc: 'Ionob Innovations LLP' },
];

// Career rendered as a software system-map (node graph) on a 3000×2000 canvas.
export const JOURNEY_NODES: JNode[] = [
  { id: 'origin', kind: 'hero', x: 1500, y: 1000, icon: 'fa-terminal',
    tag: 'root@manu:~$', title: 'Manu K Binu', sub: 'IT Project Manager · Software Engineer', items: [] },
  { id: 'r2021', kind: 'role', x: 700, y: 560, icon: 'fa-code',
    tag: 'module.load("2021")', title: 'Software Developer', sub: 'Ionob Innovations · Dec 2021',
    items: ['Owned ERP modules end-to-end', 'Angular + .NET Core REST APIs', 'Employee of the Year 2023'] },
  { id: 'r2024', kind: 'role', x: 760, y: 1440, icon: 'fa-diagram-project',
    tag: 'module.load("2024")', title: 'Delivery & Coordination', sub: 'Redefine Technologies · Mar 2024',
    items: ['SATTVA ESG & risk platform', 'Agile sprint delivery', 'Angular UI components'] },
  { id: 'r2025', kind: 'role', x: 2120, y: 540, icon: 'fa-user-gear',
    tag: 'module.load("2025")', title: 'Project Manager', sub: 'Ionob Innovations · Feb 2025',
    items: ['2–3 concurrent projects', 'AI-powered delivery (~60% faster)', 'SQL Server architecture'] },
  { id: 'skills', kind: 'skills', x: 2500, y: 1080, icon: 'fa-layer-group',
    tag: 'import { stack }', title: 'Tech & PM Stack', sub: 'What I build with',
    items: ['Agile · Scrum · Kanban', 'Angular · TypeScript', '.NET Core · REST · SQL', 'Claude AI · ChatGPT'] },
  { id: 'projects', kind: 'project', x: 1560, y: 1640, icon: 'fa-rocket',
    tag: '$ deploy --prod', title: 'Enterprise Projects', sub: 'Shipped at scale',
    items: ['SATTVA — ESG & Risk Management', 'World Star ERP System'] },
  { id: 'awards', kind: 'award', x: 2280, y: 1620, icon: 'fa-trophy',
    tag: 'achievement.unlock()', title: 'Recognition', sub: 'Awarded & celebrated',
    items: ['Employee of the Year 2023', 'Quick Learner Award', '3-Year Work Anniversary'] },
  { id: 'contact', kind: 'cta', x: 1040, y: 1720, icon: 'fa-paper-plane',
    tag: '$ connect --now', title: "Let's build together", sub: 'UAE · Available immediately',
    items: ['mail4manukbinu@gmail.com'] },
];

export const JOURNEY_TOUR: JStop[] = [
  { node: 'origin',  scale: 1.5,  code: '$ whoami',            caption: 'Manu K Binu — where the journey begins' },
  { x: 1500, y: 1000, scale: 0.5, code: '$ git log --graph',  caption: '4+ years, mapped as one connected system' },
  { node: 'r2021',   scale: 1.25, code: '> 2021',             caption: 'It started with code — owning ERP modules' },
  { node: 'r2024',   scale: 1.25, code: '> 2024',             caption: 'Coordinating enterprise ESG delivery' },
  { node: 'r2025',   scale: 1.25, code: '> 2025',             caption: 'Leading delivery as Project Manager' },
  { node: 'skills',  scale: 1.15, code: 'import *',           caption: 'A full PM + engineering stack' },
  { node: 'projects',scale: 1.2,  code: 'deploy()',           caption: 'Enterprise platforms, shipped at scale' },
  { node: 'awards',  scale: 1.3,  code: 'unlock()',           caption: 'Recognised for delivery & leadership' },
  { node: 'contact', scale: 1.4,  code: 'connect()',          caption: "Let's build something — get in touch" },
];
