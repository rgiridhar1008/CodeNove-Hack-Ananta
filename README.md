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
## 👤 User Dashboard Guide (Citizen)

### How to Access
1. Log in using a regular (non-admin) account.
2. Click **“My Grievances”** in the navigation bar.

### What You Can Do
- View a personalized dashboard with your total reports and resolved issues  
- Track the status of each grievance (Pending, In Progress, Resolved)  
- See priority levels and expected resolution dates  
- Filter and sort issues by category or status  

---

## 🛠️ Admin Dashboard Guide

### How to Access
1. Log in using an **admin account**.
2. Click **“Admin Dashboard”** in the navigation bar.

### Admin Capabilities
- View all grievances submitted by all users  
- See who reported each issue  
- Update issue status (Pending → In Progress → Resolved)  
- Automatically award a **Civic Contributor Badge** when an issue is resolved  
- Delete duplicate or invalid complaints  

---

## 🔐 Admin Login (Demo Access)

Use the following credentials to access admin features:

**Email:** `giridharlearn@gmail.com`  
**Password:** `giridhar`

> ⚠️ These credentials are for **demo/testing purposes only**.

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
## Running the Application

This application requires two services to be running simultaneously: the Next.js web app and the Genkit AI service. You will need two separate terminals.

**Terminal 1: Start the Web App**

In your first terminal, run the following command to start the Next.js development server:

```bash
npm run dev
```

This will make your application available at `http://localhost:9002`.

**Terminal 2: Start the AI Service**

In a second terminal, run the following command to start the Genkit AI service, which powers the chatbot and other AI features:

```bash
npm run genkit:watch
```

This service will run in the background and automatically reload if you make changes to the AI flows.

---

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
