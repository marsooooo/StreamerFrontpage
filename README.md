# Streamer Frontpage (Peaxy)

This repository contains the source code for a custom streamer frontpage application. It provides an interactive hub for viewers to watch the live stream, view available emotes, and check the marble race leaderboard. I tried to keep it as reusable as possible for personal purposes but this project was mainly made for the twitch streamer Peaxy and both our property. You can view the production build on https://peaxy.fr

## Technologies Used

### Frontend
- **React**: UI library for building the interface.
- **Vite**: Fast build tool and development server.
- **TypeScript**: Static typing for better code quality.
- **Tailwind CSS**: Utility-first CSS framework for styling.

### Backend
- **Node.js & Express**: Simple server to handle API requests and serve data.

## External APIs
- **Twitch Embed API**: Used to embed the live Twitch player directly into the application.
- **Google API**: Used to fetch recent youtube videos from a channel and retrieve data from an online Google Sheet.

## Getting Started

### Prerequisites
- Node.js (v14 or higher recommended)
- npm or yarn

### Installation

1. Install dependencies:
   \`\`\`bash
   npm install
   cd server
   npm install
   \`\`\`

### Running the Application

1. Start the development server (Frontend):
   \`\`\`bash
   npm run dev
   \`\`\`
   or to create the build folder (/dist)
   \`\`\`bash
   npm run build
   \`\`\`

2. Start the backend server:
   \`\`\`bash
   npm run server
   \`\`\`

The application will be available at `http://localhost:5173` (default Vite port).
