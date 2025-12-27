# Civix – Smart Civic Engagement Platform

🌐 **Live Demo:** https://civixcode.netlify.app/  
📦 **Repository:** https://github.com/rgiridhar1008/CodeNove-Hack-Ananta  

---

## About the Project

**Civix** is a smart civic engagement platform designed to empower citizens to report civic issues, track their resolution, and actively participate in local governance. It bridges the communication gap between citizens and authorities through transparency, accountability, and AI-powered insights.

---

## The Problem

Urban civic challenges such as potholes, waste management, and streetlight failures often suffer from:

- Fragmented and confusing reporting systems  
- Lack of transparency in resolution  
- Poor accountability  
- Limited citizen participation  

This results in delayed action and reduced trust in civic governance.

---

##  Our Solution

Civix provides a centralized digital platform that allows citizens to:

- Report issues with exact location and evidence  
- Track resolution progress in real-time  
- Engage in community decision-making  
- Enable authorities to act using data-driven insights  

---

##  Key Features

### 🗺️ Interactive Issue Map
View all reported issues on a live map with category and status filters.

### 📝 Grievance Reporting
Submit detailed reports with images, priority, and precise location.

### 📊 User Dashboard
Track all submitted issues and their current status.

### 🤖 AI-Powered Chatbot
Ask questions and receive real-time updates using Google Gemini AI.

### 🛡️ Admin Management
Admins can manage users, update issue statuses, and monitor activity.

### 🗳️ Community Voting
Create and participate in polls to influence local decisions.

### 🏅 Badge & Reward System
Encourages civic participation through recognition.

### 🌙 Light & Dark Mode
User-friendly interface with theme support.

---

##  Tech Stack

### Frontend
- Next.js  
- React  
- TypeScript  
- Tailwind CSS  
- ShadCN UI  

### Backend & Services
- Firebase Authentication  
- Cloud Firestore  
- Firebase Storage  
- Google Maps API  
- Genkit (Google AI)

---
##  Environment Variables

Create a `.env.local` file in the root directory of the project and add the following:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY


##  Running the Application

### Terminal 1 – Start the Web Application
```bash
npm run dev
## Project Structure

```
civix/
├── src/
│   ├── app/                # Next.js App Router pages
│   ├── components/         # Reusable React components (UI & features)
│   ├── firebase/           # Firebase configuration and hooks
│   ├── lib/                # Shared utilities, types, and actions
│   └── ai/                 # Genkit AI flows and configuration
├── public/                 # Static assets
├── .env.local              # Environment variables (untracked)
├── next.config.ts          # Next.js configuration
└── package.json            # Project dependencies and scripts
```

---
## Contact
Project Repository:
https://github.com/rgiridhar1008/CodeNove-Hack-Ananta

Live Application:
https://civixcode.netlify.app/
