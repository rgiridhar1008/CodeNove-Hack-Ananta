
# Civix - A Smart Civic Engagement Platform


---

### Table of Contents

- [About The Project](#about-the-project)
  - [The Problem](#the-problem)
  - [Our Solution](#our-solution)
- [Key Features](#key-features)
- [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Contact](#contact)

---

## About The Project

**Civix** is a digital platform designed to empower citizens of Hyderabad to report civic issues, track their resolution, and engage with local governance. It provides a single, transparent dashboard that bridges the gap between citizens and municipal authorities, fostering accountability and data-driven improvements.

### The Problem

Civic issues such as potholes, waste management, street lighting, and sanitation often suffer from:

- **Fragmented Reporting**: Multiple, confusing portals for different civic bodies.
- **Lack of Transparency**: No clear visibility into issue status or resolution timelines.
- **No Accountability**: Difficulty in tracking who is responsible or escalating issues.
- **Limited Citizen Participation**: Public apathy due to a perceived lack of impact.

As a result, issues remain unresolved for long periods, leading to citizen frustration and a decline in community well-being.

### Our Solution

Civix simplifies and unifies civic issue reporting by offering:

- **Geo-tagged Grievance Submission**: Pinpoint issues on a map for precise location data.
- **Real-time Status Tracking**: Follow the progress from submission to resolution.
- **Photo-based Evidence**: Upload images to provide clear, visual proof.
- **Data-Driven Dashboards**: Provide authorities with analytics to identify recurring problems and prioritize resources.

---

## Key Features

- **🗺️ Interactive Issue Map**: Visualize all reported grievances on a live map.
- **📝 Grievance Reporting**: A simple, intuitive form to report issues with details, priority, and location.
- **📊 User Dashboard**: Track the status of all your reported issues in one place.
- **🤖 AI-Powered Chatbot**: Get real-time status updates on your issues by asking our AI assistant.
- **🛡️ Admin Management**: User role management for assigning admin privileges.
- **🗳️ Community Voting System**: Admins can create polls for community-driven decision-making.
- **🏅 Badge & Reward System**: Earn badges for contributing to your community.
- **🌙 Light & Dark Mode**: Themed for your viewing preference.

---

## Built With

- **[Next.js](https://nextjs.org/)**: React framework for production.
- **[React](https://react.dev/)**: JavaScript library for building user interfaces.
- **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework.
- **[Shadcn UI](https://ui.shadcn.com/)**: Re-usable components built using Radix UI and Tailwind CSS.
- **[Firebase](https://firebase.google.com/)**: For authentication, Firestore database, and storage.
- **[Genkit (Google AI)](https://firebase.google.com/docs/genkit)**: Powers the AI chatbot and other generative AI features.
- **[TypeScript](https://www.typescriptlang.org/)**: For strong typing and improved code quality.

---

## Getting Started with VS Code

To run this application locally for development, please follow these steps.

### Prerequisites

- [Node.js](https://nodejs.org/en) (v18 or later recommended)
- [Visual Studio Code](https://code.visualstudio.com/)

### Installation

1.  Clone the repository to your local machine.
2.  Open the project folder in Visual Studio Code.
3.  Open the integrated terminal (**View** > **Terminal** or `Ctrl+\``) and run the following command to install the required packages:
    ```bash
    npm install
    ```

### Environment Variables

The `GrievanceForm` and `IssueMap` components require a Google Maps API key to display maps.

1.  Create a new file named `.env.local` in the root of your project directory.
2.  Add your Google Maps API key to this file:
    ```
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_API_KEY"
    ```
    Replace `"YOUR_GOOGLE_MAPS_API_KEY"` with your actual API key from the [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials). Ensure the **Maps JavaScript API** is enabled for your project.

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

Project Link: [https://github.com/your-username/civix](https://github.com/your-username/civix)
