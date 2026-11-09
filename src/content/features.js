// Public tool pages. Set live: true only when the tool actually works in the app.
export const features = [
  {
    slug: 'job-analyser',
    live: true,
    name: 'Job Description Analyser',
    tagline: 'Understand the job before you apply.',
    description:
      'Paste a job description and get it in plain English: what you would do, which requirements are essential, and which your experience already supports.',
    summary:
      'The Job Description Analyser breaks a pasted job description into what you would do, which requirements are essential and which are preferred, what common terms mean, and which requirements your own saved evidence already supports.',
    does: [
      'Lists what the role involves, taken from the job description',
      'Separates essential requirements from preferred ones',
      'Explains common job-description terms in plain English',
      'Compares each requirement with the evidence in your Career Profile',
      'Suggests what to prepare before you apply',
    ],
    steps: [
      'Paste the text of a job description.',
      'Read the plain-English summary and the list of requirements.',
      'See which requirements are backed by your evidence, which you added yourself, and which still need evidence.',
      'Build evidence for any gaps, then tailor your CV.',
    ],
    limits: [
      'It does not give you a match score or predict whether you will be hired.',
      'It cannot read vacancy links yet. You paste the text of the job description.',
      'It only uses what you have told it. It never invents experience for you.',
    ],
    faqs: [
      { q: 'Can I paste any job description?', a: 'Yes. Paste the text of any vacancy. Links are not supported yet, so copy the text from the page.' },
      { q: 'Does the Analyser tell me whether to apply?', a: 'No. It shows what the employer asks for and what evidence you have, so you can decide. It does not score you.' },
      { q: 'Who is it for?', a: 'Students, recent graduates, NYSC members and entry-level job seekers who find job descriptions confusing.' },
    ],
  },
  {
    slug: 'evidence-builder',
    live: false,
    name: 'Experience-to-Evidence Builder',
    tagline: 'Turn what you have done into proof of what you can do.',
    description:
      'Answer guided questions about a project, SIWES placement, internship or volunteering role, and turn it into clear, honest evidence for your CV.',
    summary:
      'The Experience-to-Evidence Builder asks guided questions about a project, SIWES placement, internship, volunteering role or leadership activity, then helps you write clear statements about what you personally did.',
    does: [
      'Asks questions that suit the type of experience',
      'Helps you explain your own part, not just the team’s',
      'Drafts a clear evidence statement from your answers',
      'Saves it to your Career Profile for the Analyser, CV Studio and Interview Practice',
    ],
    steps: [
      'Choose the type of experience.',
      'Answer the guided questions in your own words.',
      'Review the draft evidence statement and edit it.',
      'Save it to your Career Profile.',
    ],
    limits: [
      'It never invents responsibilities, results, numbers or employers.',
      'Suggested wording is a draft that you review and edit.',
      'It cannot verify your claims. You stay responsible for what you submit.',
    ],
    faqs: [
      { q: 'I have no work experience. Can I still use it?', a: 'Yes. School projects, SIWES, volunteering and student activities all count.' },
      { q: 'Where do my answers go?', a: 'They are saved in your Career Profile so other Pathora tools can use them.' },
    ],
  },
  {
    slug: 'cv-builder',
    live: false,
    name: 'CV Studio',
    tagline: 'Build a CV from your real evidence.',
    description:
      'Build a CV from your Career Profile, tailor it to a job without adding experience you do not have, save versions and export a clean PDF.',
    summary:
      'CV Studio builds a CV from your Career Profile, shows a live preview as you edit, tailors it to a specific job without adding experience you do not have, saves versions, and exports a clean PDF.',
    does: [
      'Builds a first draft from your Career Profile',
      'Shows a live preview as you edit',
      'Tailors a separate copy to a specific job',
      'Keeps saved versions so nothing is overwritten',
      'Exports a clean PDF',
    ],
    steps: [
      'Create a CV from your Career Profile.',
      'Edit each section and watch the preview update.',
      'Tailor a copy for a job you analysed.',
      'Check every line is true, then export.',
    ],
    limits: [
      'Tailoring reorders and rewords what you already have. It does not add skills or experience.',
      'Missing details are marked while you edit and never appear in the exported PDF.',
      'You confirm every statement is true before you export.',
    ],
    faqs: [
      { q: 'Can I keep more than one CV?', a: 'Yes. Tailoring to a job creates a separate CV, so your original stays unchanged.' },
      { q: 'Which format can I export?', a: 'PDF to start with.' },
    ],
  },
  {
    slug: 'interview-practice',
    live: false,
    name: 'Interview Practice',
    tagline: 'Practise answering in your own words.',
    description:
      'Practise interview questions in text and get specific feedback on relevance, clarity, structure and examples, with no scores or predictions.',
    summary:
      'Interview Practice lets you answer common, role-specific and experience-based questions in text, then gives specific feedback on relevance, clarity, structure and examples, without scores or predictions.',
    does: [
      'Offers common questions, questions about your experience and questions for a role',
      'Gives specific, constructive feedback on each answer',
      'Suggests a clearer version using only what you wrote',
      'Asks a follow-up question, and saves drafts so you can continue later',
    ],
    steps: [
      'Choose a role and the kind of questions.',
      'Type your answer at your own pace.',
      'Read the feedback and try again if you like.',
      'Review your session when you finish.',
    ],
    limits: [
      'It is text only for now. There is no voice or video.',
      'It does not score you or predict how a real interview will go.',
      'Suggested answers are drafts. They never add experience you did not describe.',
    ],
    faqs: [
      { q: 'Will it tell me if I would pass an interview?', a: 'No. Real interviews vary. It helps you practise and improve your answers.' },
      { q: 'Are my answers saved?', a: 'Yes. Drafts and finished answers are saved so you can continue and review later.' },
    ],
  },
  {
    slug: 'application-tracker',
    live: false,
    name: 'Application Tracker',
    tagline: 'Keep every application and next step in one place.',
    description:
      'Track the roles you have saved or applied for, with deadlines, next actions and notes. You update statuses yourself.',
    summary:
      'The Application Tracker keeps the roles you have saved or applied for in one place, with deadlines, next actions, notes and links to the CV you used. You update each status yourself.',
    does: [
      'Records company, role, dates, status, notes and next actions',
      'Shows what needs attention, such as overdue next actions and close deadlines',
      'Links the CV you used and the job analysis, if you have them',
      'Keeps a dated record of the changes you make',
    ],
    steps: [
      'Add a role you have saved or applied for.',
      'Set a status and, if you like, a next action with a date.',
      'Update the status as things change.',
      'Check what needs attention.',
    ],
    limits: [
      'Pathora does not check employers’ systems. A status changes only when you change it.',
      'Email reminders are not part of the first version. Due items show on your dashboard.',
    ],
    faqs: [
      { q: 'Does it find out if an employer has replied?', a: 'No. You record updates yourself.' },
      { q: 'Do I need a CV or job analysis first?', a: 'No. Both links are optional.' },
    ],
  },
]
