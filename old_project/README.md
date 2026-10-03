# ⚡ Energy Ledger AI

**Precision Calorie & Fitness Tracker powered by Google Gemini 2.5 Vision API**

Snap meal photos for instant multimodal macro analysis or scan gym machines for automated MET-based calorie burn calculations — all directly in the browser with zero server setup required.

🔗 **Live Demo:** https://prashant371.github.io/energy-ledger/  
💻 **GitHub:** https://github.com/prashant371/energy-ledger

---

## 🌟 Overview

**Energy Ledger AI** (also known as *Iron Log*) is an AI-native fitness & nutrition web application designed for athletes, bodybuilders, and fitness enthusiasts. Traditional calorie tracking requires tedious manual food searches and arbitrary workout estimations. Energy Ledger AI eliminates this friction by leveraging computer vision to analyze meal photos and gym equipment in real-time.

Built as a high-performance single-page web app (SPA), it interfaces directly with **Google's Gemini Vision API** for multimodal image analysis while maintaining complete client-side data privacy through LocalStorage.

---

## 🚀 Key Features

- **🥗 Multimodal Meal Scanner**: Upload or capture food photos. Gemini 2.5 Vision analyzes the image, identifies food items, estimates total calories, calculates macronutrients (Protein, Carbs, Fats), and outputs a Nutritional Health Score (1–100).
- **🏋️ Gym Equipment & Machine Scanner**: Point your camera at any fitness equipment (treadmill, leg press, cable crossover, rowing machine). The vision model identifies the machine, estimates MET (Metabolic Equivalent of Task) values, calculates burned calories per duration, and provides exercise form tips.
- **⚡ Precision BMR & TDEE Calculator**: Calculates Basal Metabolic Rate via the **Mifflin-St Jeor Equation** and adjusts Total Daily Energy Expenditure (TDEE) based on activity multipliers and fitness goals (*Cut -500 kcal, Maintain, Bulk +500 kcal*).
- **📊 Daily Energy Ledger**: Real-time visual tracking of net energy balance:
  \[ \text{Net Calorie Balance} = \text{Calories Consumed} - \text{Calories Burned} \]
  Visual progress bars track macros against daily target goals.
- **🤖 Gemini AI Fitness Coach**: Interactive AI coach chat pre-conditioned with your profile metrics (age, height, weight, fitness goal) and real-time daily log context for personalized nutrition advice.
- **🔊 Procedural Web Audio API Sound FX**: Custom audio feedback on UI actions (button clicks, scan completions, item deletions) synthesized in real-time without external audio files.
- **💾 LocalStorage Sync & Security**: Complete offline persistence of profile data, macro logs, and chat history. API keys are stored locally in the browser and never transmitted to third-party proxy servers.
- **🎨 Dark Cyber-Industrial Aesthetic**: High-contrast, athletic HUD UI built with custom CSS variables, glassmorphism cards, glowing status indicators, and an HTML5 Canvas particle background.

---

## 🛠 Tech Stack

| Component | Technology |
|---|---|
| **AI / Multimodal Vision** | Google Gemini 2.5 Vision API (`gemini-2.5-flash` / `gemini-1.5-flash`) |
| **Frontend Framework** | Single-Page Web App (Vanilla HTML5 / CSS3 / JavaScript ES6+) |
| **Typography & Styling** | Google Fonts (*Bebas Neue*, *Barlow Condensed*, *Share Tech Mono*) + CSS Variables |
| **Graphics & FX** | HTML5 Canvas API (Particle system) + CSS Glow Effects |
| **Audio** | Web Audio API (Procedural Synthesizer for UI sound effects) |
| **Persistence** | Browser `localStorage` API |
| **Deployment** | GitHub Pages (Static Client-Side Web App) |

---

## 🧠 Technical Architecture & Engineering Highlights

```
┌─────────────────────────────────────────────────────────┐
│              Browser Client (index.html)                 │
│                                                         │
│  ┌─────────────────┐ ┌────────────────┐ ┌─────────────┐  │
│  │ BMR/TDEE Engine │ │ Camera / Image │ │ Web Audio   │  │
│  │ (Mifflin-St)    │ │ FileReader     │ │ Synthesizer │  │
│  └────────┬────────┘ └───────┬────────┘ └─────────────┘  │
└───────────┼──────────────────┼──────────────────────────┘
            │                  │ Base64 Image Payload
            ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│            Google Gemini 2.5 Vision API                 │
│                                                         │
│  • Food Prompt ──► Structured Macro JSON Analysis       │
│  • Gym Prompt  ──► Machine ID + MET Burn Rate + Form    │
│  • Chat Prompt ──► Context-Aware Fitness Coach          │
└─────────────────────────────────────────────────────────┘
```

### 1. Vision Analysis & System Prompt Engineering
The application converts uploaded image files or camera canvas snapshots to Base64 payloads and sends them alongside strict structured JSON prompts:

- **Meal Prompt**: Mandates output containing estimated total calories, breakdown per item, macro distribution in grams, and a health rating score.
- **Machine Prompt**: Mandates identification of gym equipment, primary target muscle group, MET score, estimated calories burned per 15/30/60 mins, and execution form points.

### 2. Mifflin-St Jeor BMR & TDEE Calculations
$$\text{BMR}_{\text{male}} = (10 \times \text{weight}_{\text{kg}}) + (6.25 \times \text{height}_{\text{cm}}) - (5 \times \text{age}_{\text{years}}) + 5$$
$$\text{BMR}_{\text{female}} = (10 \times \text{weight}_{\text{kg}}) + (6.25 \times \text{height}_{\text{cm}}) - (5 \times \text{age}_{\text{years}}) - 161$$
$$\text{TDEE} = \text{BMR} \times \text{Activity Multiplier}$$

### 3. Pure Client-Side Security Architecture
To maintain maximum privacy and zero backend hosting overhead:
- The user provides their own Gemini API key (or utilizes pre-configured environment credentials).
- Requests pass directly from `window.fetch()` to Google's official Gemini endpoint (`https://generativelanguage.googleapis.com/v1beta/models/...`).
- No proxy server, database, or backend container retains user photos or health logs.

---

## 💻 Running Locally

Since **Energy Ledger AI** is a static client-side application, running it locally requires no build step or package manager!

### Quick Start
1. Clone the repository:
   ```bash
   git clone https://github.com/prashant371/energy-ledger.git
   cd energy-ledger
   ```
2. Open `index.html` directly in your browser:
   - Double-click `index.html` **OR**
   - Serve using VS Code **Live Server** extension / `python -m http.server 8000`.
3. Click **API Key** in the header and paste your [Google Gemini API Key](https://aistudio.google.com/).

---

## 🚀 Future Roadmap

- [ ] Barcode scanner integration for packaged food items.
- [ ] Export daily energy logs to CSV / JSON for data visualization.
- [ ] Multi-day historical chart trends powered by Chart.js.
- [ ] Apple HealthKit / Google Fit sync integration.

---

## 📄 License

This project is open source under the [MIT License](LICENSE).
