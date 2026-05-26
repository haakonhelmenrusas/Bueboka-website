[![Netlify Status](https://api.netlify.com/api/v1/badges/967e4407-40fe-4f0f-b941-0822b4a26adb/deploy-status)](https://app.netlify.com/sites/bueboka/deploys)

# Bueboka - Archery Companion App

Bueboka is an application for archers who want to keep track of their shooting sessions, equipment, and results. The app is designed to be simple and quick to use, helping archers improve their technique through detailed statistics and analysis.

This repository contains the **web application**, which serves as both a landing page and a fully functional companion web platform. It shares a database and user accounts with the [Bueboka mobile app](https://github.com/haakonhelmenrusas/Bueboka) to provide a synchronized experience across devices.

## Features

- **Training Log** — Log training sessions with details on distance, target type, weather conditions, and notes.
- **Competition Tracker** — Record competition results, including placement, scores, and round details.
- **Sight Mark Tools** — Manage bow specifications, calculate precise sight marks using an integrated ballistics engine, and generate printable sight mark charts.
- **Equipment Manager** — Keep an inventory of bows and arrows, including detailed specifications.
- **Statistics** — Visual insights into shooting performance with time-series breakdowns.
- **Achievements** — Unlock badges and milestones based on activity and performance.
- **Public Profiles** — Optionally share your profile and stats with the community.
- **User Authentication** — Secure signup/login with email, Google OAuth, and session sync across web and mobile.
- **Feedback System** — Integrated tool for users to report bugs or request features.
- **Responsive Design** — Fully optimized for desktop, tablet, and mobile browsers.

## Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (React 19)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: CSS Modules with modern CSS variables
- **Database**: [Prisma](https://www.prisma.io/) ORM with PostgreSQL
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **Monitoring**: [Sentry](https://sentry.io/) for error tracking
- **Deployment**: [Netlify](https://www.netlify.com/)
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint, Prettier, Husky

## Getting Started

### Prerequisites

- **Node.js** (version 22 or higher)
- **npm** (comes with Node.js)
- **Podman** or Docker (for local database setup)

### Installation

1. **Clone repository**

   ```bash
   git clone https://github.com/haakonhelmenrusas/Bueboka-website.git
   cd Bueboka-website
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration (Database URL, Auth secrets, etc.)
   ```

4. **Database setup**

   Start a local PostgreSQL instance using Podman (or Docker):

   ```bash
   podman compose up -d db
   npm run prisma:migrate
   npm run seed  # Optional: seed with test data
   ```

5. **Start development server**

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## API Documentation

See [docs/API.md](docs/API.md) for the full REST API reference. The API is consumed by both this web client and the [Bueboka mobile app](https://github.com/haakonhelmenrusas/Bueboka).

## Mobile App Integration

The web platform shares its backend and database with the **[Bueboka mobile app](https://github.com/haakonhelmenrusas/Bueboka)** (React Native / Expo). Users have a single account that works across both platforms, with language preferences and all data kept in sync.

## Sponsors and Partners

Interested in sponsoring or partnering with Bueboka? Visit our [sponsors page](https://bueboka.no/sponsing) for more information.

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before getting started.

## License

This project is open source and available under the [MIT License](LICENSE).

- **Code**: Open source under MIT License
- **Brand Assets**: Copyright © 2026 Bueboka. All rights reserved.

## Contact

- **Project Maintainer**: [Haakon Helmen Rusås](https://github.com/haakonhelmenrusas)
- **Email**: kontakt@bueboka.no
- **Website**: [bueboka.no](https://bueboka.no)
