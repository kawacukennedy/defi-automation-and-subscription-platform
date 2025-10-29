# Contributing to FlowFi

Thank you for your interest in contributing to FlowFi! This document provides guidelines and information for contributors.

## Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. By participating, you agree to:

- Be respectful and inclusive
- Focus on constructive feedback
- Accept responsibility for mistakes
- Show empathy towards other contributors
- Help create a positive community

## How to Contribute

### 1. Find an Issue

- Check [GitHub Issues](https://github.com/kawacukennedy/defi-automation-and-subscription-platform/issues) for open tasks
- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to indicate you're working on it

### 2. Fork and Clone

```bash
git clone https://github.com/your-username/defi-automation-and-subscription-platform.git
cd defi-automation-and-subscription-platform
git checkout -b feature/your-feature-name
```

### 3. Set Up Development Environment

Follow the [Setup Guide](Setup.md) to configure your development environment.

### 4. Make Changes

- Write clear, concise commit messages
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass

### 5. Submit a Pull Request

- Push your changes to your fork
- Create a Pull Request with a clear description
- Reference any related issues
- Wait for review and address feedback

## Development Guidelines

### Code Style

#### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Prefer `const` over `let`, arrow functions
- Use meaningful variable and function names

#### React Components
```typescript
// Good
interface Props {
  userId: string;
  onUpdate: (user: User) => void;
}

export default function UserProfile({ userId, onUpdate }: Props) {
  // Component logic
}

// Avoid
function userprofile(props) {
  // Component logic
}
```

#### API Design
- Use RESTful conventions
- Include proper error handling
- Add input validation
- Document endpoints in [API.md](API.md)

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Testing
- `chore`: Maintenance

Examples:
```
feat(auth): add wallet authentication
fix(api): resolve workflow creation bug
docs(readme): update installation instructions
```

### Branch Naming

```
feature/description-of-feature
bugfix/description-of-bug
hotfix/critical-fix
docs/update-documentation
```

### Testing

#### Unit Tests
```bash
# Backend
cd backend
npm test

# Frontend (when implemented)
cd frontend
npm test
```

#### Integration Tests
```bash
npm run test:integration
```

#### Smart Contract Tests
```bash
flow test
```

### Documentation

- Update README.md for significant changes
- Add JSDoc comments for new functions
- Update API documentation for endpoint changes
- Include examples in documentation

## Pull Request Process

### Before Submitting
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] Branch is up to date with main

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots of UI changes

## Checklist
- [ ] Code follows project standards
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes
```

### Review Process
1. Automated checks run (linting, tests)
2. Code review by maintainers
3. Address feedback and iterate
4. Approval and merge

## Issue Reporting

### Bug Reports
Use the bug report template:

```markdown
**Describe the bug**
Clear description of the issue

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., macOS]
- Browser: [e.g., Chrome]
- Version: [e.g., 1.0.0]
```

### Feature Requests
Use the feature request template:

```markdown
**Is your feature request related to a problem?**
Description of problem

**Describe the solution**
What you want to happen

**Describe alternatives**
Alternative solutions considered

**Additional context**
Any other context
```

## Project Structure

```
├── frontend/              # Next.js frontend
│   ├── src/
│   │   ├── app/          # App router pages
│   │   ├── components/   # Reusable components
│   │   └── lib/          # Utilities
├── backend/               # Node.js backend
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── models/           # Database models
│   └── middleware/       # Express middleware
├── contracts/             # Cadence smart contracts
├── docs/                  # Documentation
├── specs/                 # Specifications
└── README.md
```

## Communication

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For general questions
- **Discord**: For real-time communication

## Recognition

Contributors are recognized through:
- GitHub contributor statistics
- NFT achievements on the platform
- Leaderboard rankings
- Special mentions in release notes

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (ISC).

## Questions?

Feel free to ask questions in [GitHub Discussions](https://github.com/kawacukennedy/defi-automation-and-subscription-platform/discussions) or reach out to the maintainers.

Thank you for contributing to FlowFi! 🚀