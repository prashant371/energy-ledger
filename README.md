# ⚡ Energy Ledger AI

> **Precision Calorie & Fitness Tracker powered by Google Gemini 2.5 Vision API**

A premium, single-page web app that lets you snap photos of meals or gym equipment and instantly get AI-estimated nutritional data and calorie burn — all in your browser.

---

## ✨ Features

- **🥗 Scan Food** — Upload or live-snap meal photos for AI-estimated calories, macros (protein/carbs/fat), and a health score
- **🏋️ Scan Gym Machines** — Point your camera at any fitness equipment; Gemini identifies it and calculates calories burned using MET values
- **⚡ BMR/TDEE Calculator** — Mifflin-St Jeor equation with activity-level multipliers and goal-based calorie targets
- **📊 Daily Energy Ledger** — Running log of logged meals and workouts with net calorie balance tracking
- **🤖 Gemini Coach Chat** — Real-time AI fitness coach that knows your daily log and goals
- **🔊 Sound FX** — Subtle Web Audio API synth feedback on interactions
- **💾 LocalStorage Sync** — Profile and log data persist between sessions

---

## 🚀 Getting Started

Just open `index.html` in any modern browser — no build step needed!

```bash
# Optional: serve locally with Python
python -m http.server 8080
```

Then visit `http://localhost:8080`

---

## 🔑 API Key

This app uses the **Google Gemini 2.5 Flash** API for multimodal vision analysis.

- Your API key is pre-configured in the app
- You can update it anytime via the **⚙️ API Key** button in the top bar
- Get your own key at: [Google AI Studio](https://aistudio.google.com/)

---

## 🛠️ Tech Stack

- **Vanilla HTML/CSS/JS** — Zero dependencies, zero build tooling
- **Google Gemini 2.5 Flash API** — Vision + text generation
- **Web Audio API** — Synth sound effects
- **LocalStorage** — Persistent state

---

## 📸 Screenshots

_Single-file SPA — just open and use_

---

## 📄 License

MIT — free to use and modify.
