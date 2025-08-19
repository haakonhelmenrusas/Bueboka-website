# 🤝 Contributing to Bueboka

Vi ønsker bidrag fra alle! Bueboka er et open source-prosjekt som har som mål å forbedre bueskyttersportens digitale
verktøy.

## Table of Contents

- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Community Guidelines](#community-guidelines)

## How to Contribute

### Ways to Contribute

- 🐛 **Report bugs** - Help us identify and fix issues
- 💡 **Suggest features** - Share ideas for new functionality
- 📝 **Improve documentation** - Help make our docs clearer
- 🎨 **Design improvements** - Enhance UI/UX
- 💻 **Code contributions** - Implement features and fixes
- 🧪 **Testing** - Help test new features and report issues
- 🌐 **Translations** - Help make Bueboka accessible globally

### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/bueboka-web.git
   cd bueboka-web
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Start development server**:
   ```bash
   npm run dev
   ```

## Development Setup

### Prerequisites

- **Node.js** (version 22 or higher)
- **npm** (comes with Node.js)
- **Git** for version control

### Environment Setup

1. **Copy environment template**:
   ```bash
   cp .env.example .env.local
   ```

2. **Configure environment variables**:
   Edit `.env.local` with your local configuration

3. **Database setup** (when applicable):
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### Development Workflow

1. **Make your changes** following our coding standards
2. **Test your changes** locally
3. **Run linting and formatting**:
   ```bash
   npm run lint
   npm run format
   ```
4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request**

## Coding Standards

### TypeScript Guidelines

- **Use TypeScript** for all new code
- **Define interfaces** for all props and data structures
- **Avoid `any` type** - use specific types or `unknown`
- **Use strict mode** - ensure type safety

### React Best Practices

- **Use functional components** with hooks
- **Prefer named exports** over default exports
- **Keep components small** and focused on a single responsibility
- **Use proper prop typing** with TypeScript interfaces
- **Handle loading and error states** appropriately

### Code Style

- **Formatting**: Code is automatically formatted with Prettier
- **Linting**: Follow ESLint rules configured in the project
- **Variable naming**: Use descriptive, camelCase names
- **Function naming**: Use verb-noun combinations (e.g., `getUserData`)
- **Component naming**: Use PascalCase for components

### Commit Message Convention

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
feat: add user registration form fix: resolve mobile navigation issue docs: update API documentation style: format code
with prettier

## Pull Request Process

### Before Submitting

- [ ] Code follows project coding standards
- [ ] All tests pass (when implemented)
- [ ] Code is formatted with Prettier
- [ ] ESLint passes without errors
- [ ] Documentation is updated if needed
- [ ] Self-review completed

### Pull Request Template

When creating a PR, please include:

**Title**: Use a descriptive title following commit convention

**Description**:

- What does this PR do?
- Why is this change needed?
- Any breaking changes?
- Screenshots for UI changes

**Testing**:

- How has this been tested?
- What browsers/devices were tested?

**Checklist**:

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors or warnings

### Review Process

1. **Automated checks** must pass (linting, formatting)
2. **Code review** by maintainers
3. **Testing** in development environment
4. **Approval** and merge by code owners

## Issue Guidelines

### Bug Reports

When reporting bugs, please include:

- **Clear title** describing the issue
- **Steps to reproduce** the bug
- **Expected behavior** vs actual behavior
- **Environment details** (browser, OS, device)
- **Screenshots** if applicable
- **Console errors** if any

### Feature Requests

For new features, please provide:

- **Clear description** of the feature
- **Use case** - why is this needed?
- **Proposed solution** or implementation ideas
- **Alternative solutions** considered
- **Additional context** or examples

### Question Guidelines

- **Search existing issues** before asking
- **Use descriptive titles**
- **Provide context** about what you're trying to achieve
- **Include relevant code** if applicable

## Community Guidelines

### Communication

- **Be respectful** and inclusive
- **Use English** for issues and PRs (Norwegian OK for discussions)
- **Be constructive** in feedback and criticism
- **Help others** when you can

### Code Review Etiquette

- **Be kind and constructive** in reviews
- **Explain reasoning** behind suggestions
- **Acknowledge good work** when you see it
- **Ask questions** instead of making demands

### Getting Help

- **Check documentation** first
- **Search existing issues** for similar problems
- **Use GitHub Discussions** for general questions
- **Tag maintainers** only when necessary

## Development Resources

### Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://reactjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

### Design Resources

- [Penpot Design System](https://www.penpot.com) (link when available)

## Recognition

Contributors will be recognized in:

- **README.md** - Hall of fame for significant contributions
- **Release notes** - Feature/fix attribution
- **Social media** - Shout-outs for major contributions

## Questions?

If you have questions about contributing, feel free to:

- **Open a Discussion** on GitHub
- **Contact maintainers** via email
- **Join our community** (links when available)

---

**Thank you for contributing to Bueboka! 🏹**

Every contribution, no matter how small, helps make Bueboka better for the entire archery community.