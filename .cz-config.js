module.exports = {
  types: [
    { value: 'feat', name: 'feat:     A new feature' },
    { value: 'fix', name: 'fix:      A bug fix' },
    { value: 'docs', name: 'docs:     Documentation only changes' },
    { value: 'style', name: 'style:    Code style changes (white-space, formatting, etc)' },
    { value: 'refactor', name: 'refactor: A code change that neither fixes a bug nor adds a feature' },
    { value: 'perf', name: 'perf:     A code change that improves performance' },
    { value: 'test', name: 'test:     Adding missing tests' },
    { value: 'chore', name: 'chore:    Changes to build process or auxiliary tools' },
    { value: 'revert', name: 'revert:   Revert to a commit' },
    { value: 'ci', name: 'ci:       CI related changes' },
    { value: 'cd', name: 'cd:       Cd related changes' },
    { value: 'normalize', name: 'Norme:       uniformisation related changes' },

  ],
  scopes: [
    { name: 'api' },
    { name: 'database' },
    { name: 'docker' },
    { name: 'k8s' },
    { name: 'handlers' },
    { name: 'models' },
    { name: 'middleware' },
    { name: 'docs' },
    { name: 'config' },
    { name: 'git' }
  ],
  allowTicketNumber: false,
  isTicketNumberRequired: false,
  ticketNumberPrefix: 'TICKET-',
  ticketNumberRegExp: '\\d{1,5}',
  messages: {
    type: "Select the type of change you're committing:",
    scope: '\nDenote the SCOPE of this change (optional):',
    customScope: 'Denote the SCOPE of this change:',
    subject: 'Write a SHORT, IMPERATIVE tense description of the change:\n',
    body: 'Provide a LONGER description of the change (optional). Use "|" to break new line:\n',
    breaking: 'List any BREAKING CHANGES (optional):\n',
    footer: 'List any ISSUES CLOSED by this change (optional). E.g.: #31, #34:\n',
    confirmCommit: 'Are you sure you want to proceed with the commit above?'
  },
  allowCustomScopes: true,
  allowBreakingChanges: ['feat', 'fix'],
  skipQuestions: ['body', 'footer'],
  subjectLimit: 100
};
