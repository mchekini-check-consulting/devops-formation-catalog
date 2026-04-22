module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'chore', 'revert', 'ci'
    ]],
    'scope-enum': [2, 'always', [
      'api', 'database', 'docker', 'k8s', 
      'handlers', 'models', 'middleware', 'docs', 'config', 'git'
    ]],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 100]
  }
};