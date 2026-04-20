[![Netlify Status](https://api.netlify.com/api/v1/badges/967e4407-40fe-4f0f-b941-0822b4a26adb/deploy-status)](https://app.netlify.com/sites/bueboka/deploys)

# 🏹 Bueboka - Archery Companion App

Bueboka is a comprehensive application for archers who want to keep track of their shooting sessions, equipment, and results. The app is designed to be simple and quick to use, helping archers improve their technique through detailed statistics and analysis.

This repository contains the web application, which serves as both a landing page and a fully functional companion web platform for Bueboka.

## 🎯 Project Scope

### Current Status

The website has evolved from a simple landing page into a full-featured web application that complements the mobile experience. It currently offers:

- **User Authentication**: Secure signup and login functionality.
- **My Page**: A personalized dashboard for users.
- **Practice & Competition Logging**: Register and manage shooting sessions directly on the web.
- **Sight Marks Calculation**: Advanced ballistics calculator for generating sight marks based on equipment metrics.
- **Equipment Management**: Track bows and arrows configurations.
- **Statistics**: Visual insights into shooting performance.
- **Sponsorship & Support**: Dedicated sections for contributors and sponsors.

### Mobile App Integration

The web platform is designed to work seamlessly with the Bueboka mobile app ecosystem, sharing the same database and user accounts to provide a synchronized experience across devices.

## ✨ Features

### Key Features

- **Training Log**: Log training sessions with details on distance, target type, weather conditions, and notes.
- **Competition Tracker**: Record competition results, including placement, scores, and round details.
- **Sight Mark Tools**:
  - Manage bow specifications (sight radius, peep height, etc.).
  - Calculate precise sight marks for different distances using an integrated ballistics engine.
  - Generate and print sight mark charts.
- **Equipment Manager**: Keep an inventory of bows and arrows, including detailed specifications like weight, diameter, and measurements.
- **Achievements**: Unlock badges and milestones based on activity and performance.
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile browsers.
- **Dark Mode**: (Temporarily disabled for redesign) Support for light and dark themes.

### Community & Support

- **Sponsorship Program**: Information for corporate partners.
- **Voluntary Contributions**: Easy way to support the volunteer-driven project via Vipps.
- **Feedback System**: Integrated tool for users to report bugs or request features.

## 🛠 Technology Stack

- **Frontend Framework**: [Next.js 16](https://nextjs.org/) - React-based fullstack framework
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: CSS Modules with modern CSS variables
- **Database**: [Prisma](https://www.prisma.io/) ORM with PostgreSQL
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **State Management**: React Hooks and Context API
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/) (replacing FontAwesome)
- **Monitoring**: [Sentry](https://sentry.io/) for error tracking
- **Deployment**: [Netlify](https://www.netlify.com/) for continuous deployment
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Code Quality**: ESLint and Prettier

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Git** for version control
- **Docker** (optional, for local database setup)

### Installation

1. **Clone repository**

   ```bash
   git clone https://github.com/yourusername/bueboka-web.git
   cd bueboka-web
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

4. **Database Setup**

   If using Docker for local Postgres:

   ```bash
   npm run db:up
   npm run prisma:migrate
   npm run seed:local  # Optional: Seed with test data
   ```

5. **Start development server**

   ```bash
   npm run dev
   ```

6. **Open browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🤝 Contributing

Contributions are welcome! Please read `CONTRIBUTING.md` for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.
Navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## API Documentation

We provide interactive API docs powered by Swagger UI:

- OpenAPI spec: `GET /api/openapi`
- Interactive docs: visit `/api/docs` in your browser.

Update the OpenAPI spec in `app/api/openapi/route.ts` as you add or change endpoints. Keep the spec minimal and focused on public routes.

## 🤝 Contributing

We welcome contributions from everyone! Please read our [Contributing Guidelines](CONTRIBUTING.md)
and [Code of Conduct](CODE_OF_CONDUCT.md) before getting started.

## 🌟 Related Projects

- **[Bueboka Mobile App](https://github.com/haakonhelmenrusas/Bueboka)** - Den opprinnelige React Native-appen

## 🎯 Community and Support

- **Issues**: Rapporter bugs eller foreslå features via GitHub Issues
- **Discussions**: Delta i diskusjoner om prosjektets retning
- **Social Media**: Følg oss for oppdateringer (lenker kommer)
- - **Code of Conduct**: Please read our [Code of Conduct](CODE_OF_CONDUCT.md)

## 📈 Roadmap

### Phase 1: Foundation (Current)

- ✅ Landingsside med app-informasjon
- ✅ Responsivt design
- ✅ Deployment pipeline
- ✅ User authentication
- ✅ Sponsor/partner program
- ✅ Basic shooting session logging
- ✅ Statistics dashboard
- ✅ Equipment management
- ✅ Competition tracking

### Phase 2: Engagement (Q4 2025)

- 🔄 Community features
- 🔄 Advanced analytics
- 🔄 Mobile/web synchronization

### Phase 3: Web App (Early 2026)

- 🔄 Social features
- 🔄 Gamification
-

## 🤝 Sponsors and Partners

Interested in sponsoring or partnering with Bueboka? We're always looking for organizations that share our passion for
archery and technology innovation.

**Contact us**: [sponsorship@bueboka.no](mailto:sponsorship@bueboka.no)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Contact

- **Project Maintainer**: [Haakon Helmen Rusås](https://github.com/haakonhelmenrusas)
- **Email**: contact@bueboka.no
- **Website**: [bueboka.no](https://bueboka.no)

## ⚖️ Copyright Notice

This project is intended for educational and community purposes. While the code is open source, the Bueboka brand and
associated assets are protected by copyright.

- **Code**: Open source under MIT License
- **Brand Assets**: Copyright © 2025 Bueboka. All rights reserved.
- **Content**: Some content may be subject to copyright restrictions

By contributing to this project, you agree to license your contributions under the same terms.

---

**Made with ❤️ for the archery community**
