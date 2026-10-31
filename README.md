# SkinLoop AI
### Understand Your Skin. Find Your Look. Shop Smarter.

SkinLoop AI is a personal skincare intelligence and beauty platform that helps users understand their skin, build personalized routines, explore makeup options, and make informed beauty purchasing decisions.

Instead of focusing only on skin scanning or product recommendations, SkinLoop AI brings skincare tracking, ingredient compatibility, environmental insights, controlled experiments, and purchase intelligence into one platform.

## ✨ Key Features

### 1. AI Skin Analysis
- Skin analysis workflow with image upload.
- Skin metrics including hydration, texture, redness, spots, oil balance, radiance, and elasticity.
- Skin analysis report and personalized guidance.
- Demo simulation mode for evaluation when live YouCam credentials are unavailable.

### 2. Personalized Skincare
- Personalized morning and evening routines.
- Product recommendations based on skin profile and preferences.
- My Shelf to track products already owned.
- Ingredient compatibility and conflict checker.

### 3. Makeup Intelligence
- Foundation and shade finder.
- Candidate shade comparison.
- Makeup Studio and saved looks.
- Budget-conscious beauty recommendations.

### 4. Environmental Intelligence
- Weather-based skincare suggestions.
- UV exposure guidance.
- Air-quality insights.
- Environmental recommendations for skincare routines.

### 5. Skin Experiment Lab
- Track controlled skincare experiments.
- Monitor daily observations.
- Record missed routine days and irritation.
- Compare changes over an experiment period.

### 6. Skin Trigger Detective
- Explore patterns between reported skin changes and environmental or lifestyle factors.
- Examine relationships involving humidity, sleep, and routine changes.
- Present observational insights without claiming that correlation proves causation.

### 7. Smart Beauty Purchase Simulator
- Detect potentially redundant purchases.
- Check ingredient conflicts with existing routines.
- Estimate product cost per day.
- Track monthly skincare budget.
- Support wishlist, approval, deferral, and rejection decisions.

### 8. AI Beauty Concierge
- Skincare and ingredient guidance.
- Routine assistance.
- Product and shelf-related queries.
- Actionable recommendations.

## 💡 What Makes SkinLoop AI Different?

SkinLoop AI is designed as a personal skincare intelligence and experiment platform rather than just a skin-scanning application.

Its distinguishing capabilities include:

- **Experiment-driven skincare:** Users can track structured routine experiments.
- **Trigger investigation:** Users can explore possible relationships between lifestyle, environmental conditions, and skin observations.
- **Purchase intelligence:** Users can evaluate whether a product is necessary before spending money.
- **Existing-product-first recommendations:** The platform considers products already owned before suggesting new purchases.

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS 4 |
| Backend | Node.js, Express |
| AI | Google Gemini API |
| Skin analysis integration | YouCam Skin AI S2S API |
| Weather data | Open-Meteo |
| PWA | Vite PWA / Workbox |
| Testing | TypeScript-based automated test suites |

## 🏗️ Architecture

```text
User
  |
  v
React + TypeScript Frontend
  |
  v
Express Backend
  |
  +---- Google Gemini API
  |
  +---- YouCam Skin AI API
  |
  +---- Open-Meteo Weather API
  |
  v
Application Services
  |
  +---- Recommendation Engine
  +---- Ingredient Checker
  +---- Skin Experiment Lab
  +---- Skin Trigger Detective
  +---- Purchase Simulator
  +---- Storage Service
```

## 🚀 Getting Started

### Prerequisites
- Node.js
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/sunithasudhagar/SkinLoop-AI.git
cd SkinLoop-AI/skinloop_work
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create your local `.env` file using `.env.example` as the reference.

```bash
copy .env.example .env
```

Add the API credentials required by the integrations you want to enable. Never commit your actual `.env` file or expose API secrets.

### 4. Start the application

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 🧪 Testing

Run the automated test suites:

```bash
npm run lint
npm run build
npm run test:all
```

The project test suites cover:
- Core application and recommendation logic.
- Storage and persistence.
- Ingredient compatibility.
- Weather intelligence.
- AI companion workflows.
- YouCam integration validation.
- Skin Experiment Lab.
- Skin Trigger Detective.
- Purchase Simulator.

**Latest shared test results:** Main audit tests passed; Companion Engine: 33 passed; YouCam integration: 25 passed; Differentiation tests: 23 passed, with zero failures in those reported suites.

## 🔌 API Integration and Demo Mode

SkinLoop AI includes a YouCam Skin AI server-side integration.

The live YouCam workflow requires valid API credentials. When those credentials are unavailable, the application provides a demo simulation workflow for evaluation.

**Important:** Simulated results are demonstration data and must not be interpreted as actual YouCam API analysis or medical diagnosis.

## 🔐 Privacy and Safety

- Keep API credentials on the server.
- Do not commit `.env` files or private credentials.
- Treat skin-analysis outputs as informational, not medical diagnoses.
- Ingredient compatibility guidance is not a substitute for professional medical advice.
- Skin Trigger Detective presents observational patterns, not proven causal relationships.

## 🔮 Future Scope

- Complete live YouCam API activation.
- Expand real-world product catalogue integrations.
- Improve longitudinal skin progress analytics.
- Add more personalized experiment templates.
- Expand product and shade matching capabilities.

## 👩‍💻 Project

**Project:** SkinLoop AI  
**Repository:** https://github.com/sunithasudhagar/SkinLoop-AI

*Understand your skin. Make informed choices. Build a smarter beauty routine.*

---

**Disclaimer:** SkinLoop AI is a skincare and beauty assistance platform. It does not diagnose, treat, or prevent medical conditions.
