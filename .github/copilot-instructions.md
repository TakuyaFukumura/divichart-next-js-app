# GitHub Copilot Instructions

This file provides context and guidelines for GitHub Copilot when working with the divichart-next-js-app repository.

## Project Overview

divichart-next-js-app is a Next.js application for visualizing dividend data. The application reads dividend data from CSV files and displays them using interactive charts.

## Technology Stack

- **Next.js 16.1.6** with App Router (React 19.2.4)
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **Recharts** for chart visualization
- **PapaParse** for CSV parsing
- **Jest** with React Testing Library for testing
- **ESLint** for code quality

## Project Structure

```
├── public/
│   └── data/                # CSV data files (Shift-JIS encoded)
├── src/
│   └── app/
│       ├── components/      # React components
│       │   ├── DarkModeProvider.tsx
│       │   └── Header.tsx
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
├── __tests__/               # Test files mirroring src structure
└── package.json
```

## Development Guidelines

### Code Style

1. **TypeScript**: Use strict typing. Define proper interfaces and types.
2. **React Components**: Use functional components with hooks.
3. **Client Components**: Mark components with `'use client'` directive when using hooks or browser APIs.
4. **Naming Conventions**: 
   - Components: PascalCase (e.g., `DarkModeProvider.tsx`)
   - Files: camelCase for utilities, PascalCase for components
   - Variables: camelCase

### File Encoding

- CSV files in `public/data/` use **Shift-JIS** encoding
- Use `TextDecoder('shift-jis')` when reading CSV files

### Environment Variables

- Use `NEXT_PUBLIC_` prefix for client-side environment variables
- Example: `NEXT_PUBLIC_USD_TO_JPY_RATE` for exchange rate configuration

### Styling

- Use Tailwind CSS utility classes
- Support dark mode with `dark:` prefix classes
- Ensure responsive design with mobile-first approach

### Testing

- Place tests in `__tests__/` directory mirroring the `src/` structure
- Use Jest with React Testing Library
- Mock external dependencies (e.g., localStorage, fetch)
- Run tests: `npm test`
- Watch mode: `npm run test:watch`
- Coverage: `npm run test:coverage`

### Build and Development

- Development server: `npm run dev` (uses Turbopack)
- Build: `npm run build`
- Lint: `npm run lint`
- Production server: `npm start`

### CI/CD

- GitHub Actions workflow runs on every push
- Checks: ESLint, TypeScript compilation, Jest tests, build verification
- Node.js version: 20.x

## Code Patterns

### CSV Data Processing

When working with dividend CSV data:
- Expected columns: `入金日`, `受取通貨`, `受取金額[円/現地通貨]`
- Date format: `YYYY/MM/DD`
- Currency conversion: USD dividends converted to JPY using configurable rate

### Dark Mode

- Use `useDarkMode` hook from `DarkModeProvider`
- Store preference in localStorage
- Apply `dark` class to root element

### Chart Components

- Use Recharts components (`LineChart`, `BarChart`, etc.)
- Wrap charts in `ResponsiveContainer` for responsive sizing
- Provide both line and bar chart options

## Common Tasks

### Adding a New Component

1. Create component file in `src/app/components/`
2. Add 'use client' directive if using hooks or browser APIs
3. Create corresponding test file in `__tests__/src/app/components/`
4. Export component with proper TypeScript types

### Modifying Data Processing

1. Update type definitions for CSV data
2. Modify parsing logic in page.tsx
3. Update tests to cover new logic
4. Ensure backward compatibility with existing CSV files

### Styling Changes

1. Use Tailwind utility classes
2. Add dark mode variants where applicable
3. Test on mobile and desktop viewports
4. Follow existing color scheme and spacing

## Dependencies

### Adding Dependencies

- Use `npm install` for new packages
- Update package.json with specific versions
- Dependabot runs monthly to check for updates
- Run tests and build after adding dependencies

### Security

- Dependabot configured for GitHub Actions and npm packages
- Monthly security checks every Monday at 09:00 JST
- Review and approve security-related pull requests promptly

## Documentation

When making significant changes:
- Update README.md if it affects usage or setup
- Add JSDoc comments for complex functions
- Update this copilot-instructions.md if it affects development workflow

## Language

- Documentation and comments: Primarily Japanese (日本語)
- Code: English (variable names, function names, etc.)
- README and user-facing content: Japanese
