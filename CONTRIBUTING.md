# Contributing to Cost Engine

Thank you for your interest in contributing to the Cost Engine project! 🎉

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please be respectful and constructive in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/cost-engine.git
   cd cost-engine
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/jozrftamson/cost-engine.git
   ```

## Development Setup

### Prerequisites

- Node.js 20+ LTS
- PostgreSQL 16+
- Docker (optional, for local development)
- Git

### Installation

```bash
# Install dependencies
npm install

# Start PostgreSQL (using Docker)
docker-compose up -d postgres redis

# Run database migrations
npm run db:migrate

# Seed test data (optional)
npm run db:seed

# Start development server
npm run dev
```

### Project Structure

```
cost-engine/
├── apps/           # Applications (API, Worker, Dashboard)
├── packages/       # Shared packages
├── actions/        # GitHub Actions
├── docs/           # Documentation
└── infrastructure/ # Infrastructure configs
```

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/jozrftamson/cost-engine/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)
   - Screenshots if applicable

### Suggesting Features

1. Check [existing feature requests](https://github.com/jozrftamson/cost-engine/issues?q=is%3Aissue+label%3Aenhancement)
2. Create a new issue with:
   - Clear use case
   - Proposed solution
   - Alternative solutions considered
   - Impact on existing functionality

### Adding New Providers

To add a new AI provider adapter:

1. Create a new directory in `packages/providers/src/`
2. Implement the `CostProviderAdapter` interface
3. Add tests
4. Update documentation
5. Add default pricing data

Example:

```typescript
// packages/providers/src/mistral/mistral-adapter.ts
import { CostProviderAdapter } from '@cost-engine/core';

export class MistralAdapter implements CostProviderAdapter {
  getProviderName(): string {
    return 'mistral';
  }
  
  // Implement other methods...
}
```

## Pull Request Process

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Write clean, readable code
   - Follow coding standards
   - Add tests
   - Update documentation

3. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```
   
   Use [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting)
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**:
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template
   - Link related issues

6. **Code Review**:
   - Address review comments
   - Push additional commits if needed
   - Keep the PR focused and small

7. **Merge**:
   - Once approved, a maintainer will merge your PR
   - Delete your feature branch after merge

## Coding Standards

### TypeScript

- Use TypeScript for all code
- Enable strict mode
- Define types explicitly
- Avoid `any` type
- Use interfaces for public APIs

### Code Style

- Use Prettier for formatting
- Use ESLint for linting
- Follow existing code patterns
- Keep functions small and focused
- Write self-documenting code

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Classes**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `PascalCase` (no `I` prefix)

### Example

```typescript
// Good
export class PricingEngine implements PricingEngineInterface {
  private readonly cache: Map<string, PricingConfig>;
  
  async calculateCost(usage: UsageData): Promise<CostResult> {
    // Implementation
  }
}

// Bad
export class pricing_engine {
  private cache: any;
  
  async calc(u: any): Promise<any> {
    // Implementation
  }
}
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

### Writing Tests

- Write tests for all new features
- Maintain test coverage above 80%
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

Example:

```typescript
import { describe, it, expect } from 'vitest';
import { PricingEngine } from './pricing-engine';

describe('PricingEngine', () => {
  it('should calculate cost correctly for OpenAI GPT-4', async () => {
    // Arrange
    const engine = new PricingEngine(mockRepository);
    const usage = { input_tokens: 1000, output_tokens: 500 };
    
    // Act
    const result = await engine.calculateCost(usage, mockPricing);
    
    // Assert
    expect(result.total_cost).toBe(0.045);
  });
});
```

## Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Document complex logic
- Include examples in comments

Example:

```typescript
/**
 * Calculate cost based on usage and pricing configuration
 * 
 * @param usage - Token usage data
 * @param pricing - Pricing configuration
 * @returns Cost calculation result with breakdown
 * 
 * @example
 * ```typescript
 * const result = await engine.calculateCost(
 *   { input_tokens: 1000, output_tokens: 500 },
 *   pricingConfig
 * );
 * console.log(result.total_cost); // 0.045
 * ```
 */
async calculateCost(
  usage: UsageData,
  pricing: PricingConfig
): Promise<CostCalculationResult> {
  // Implementation
}
```

### Documentation Files

- Update README.md for user-facing changes
- Update docs/ for technical documentation
- Add examples for new features
- Keep documentation in sync with code

## Questions?

- 💬 Join our [Discord](https://discord.gg/cost-engine)
- 📧 Email: support@cost-engine.example.com
- 🐛 Open an [Issue](https://github.com/jozrftamson/cost-engine/issues)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Cost Engine! 🚀
