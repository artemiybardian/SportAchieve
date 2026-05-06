<div align="center">
  <h1>🏆 Sport Achieve TWA</h1>
  <p><b>Your Ultimate Fitness Companion inside Telegram!</b></p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Telegram-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram" />
  </p>

  <p>
    <i>A high-performance, feature-rich Telegram Mini App (TMA) designed to guide athletes through exercise machines and track progress.</i>
  </p>
</div>

---

## 🚀 Overview

**Sport Achieve** is a modern Telegram Mini App built with **React** and **TypeScript**. It provides users with detailed exercise machine instructions, including video previews, muscle group targeting, and proper breathing techniques, all within the seamless environment of Telegram.

### ✨ Key Features

- 🏋️ **Exercise Guides:** Comprehensive database of exercise machines with detailed steps.
- 📺 **Video Previews:** Visual demonstrations for better form and safety.
- 💪 **Muscle Targeting:** Know exactly which muscles you are working (Chest, Triceps, etc.).
- 🧘 **Breathing & Tempo:** Professional tips on breathing and movement speed.
- 👤 **User Profiles:** Personalized experience for every athlete.
- 💎 **TON Integration:** Built-in support for TON Connect.
- 🌙 **Adaptive UI:** Fully responsive design with Dark/Light mode support, matching Telegram's theme.

---

## 🛠️ Tech Stack

- **Framework:** [React 18](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Telegram UI](https://github.com/Telegram-Mini-Apps/TelegramUI)
- **SDK:** [@tma.js/sdk-react](https://docs.telegram-mini-apps.com/packages/tma-js-sdk-react)
- **State Management:** `@tma.js/sdk-react` Signals
- **Crypto:** [TON Connect](https://docs.ton.org/develop/dapps/ton-connect/overview)
- **Navigation:** `react-router-dom`

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js (Latest LTS recommended)
- `npm` (Required by the template)

### 2. Installation
```bash
npm install
```

### 3. Development
Run the app locally with HTTPS (recommended for Telegram):
```bash
npm run dev:https
```
*Note: You may be prompted for your sudo password to generate SSL certificates via `mkcert`.*

### 4. Build
```bash
npm run build
```

---

## 🚢 Deployment

The project is configured for easy deployment to **GitHub Pages**.

1. Update `homepage` in `package.json`.
2. Update `base` in `vite.config.ts`.
3. Run:
```bash
npm run deploy
```

For automated deployments, check the [GitHub Workflow](.github/workflows/github-pages-deploy.yml).

---

## 📱 Bot Configuration

To run this app in Telegram:
1. Create a new bot via [@BotFather](https://t.me/BotFather).
2. Set up a Mini App and point it to your deployment URL.
3. For local testing, use the `src/mockEnv.ts` to simulate the Telegram environment in your browser.

---

<div align="center">
  <p>Built with ❤️ for the Telegram Community</p>
  <p>
    <a href="https://docs.telegram-mini-apps.com/">Documentation</a> •
    <a href="https://t.me/devs_cis">Support Chat</a>
  </p>
</div>
