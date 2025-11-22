![Sixty Banner](docs/banner.png)

# Sixty

A seamless post-booking solution for SIXT, delivering the same exceptional quality as in-store. Enjoy a fast, intuitive experience with personalized recommendations for your journey.

## Overview

Sixty is an AI-powered chat interface that enhances the rental car pickup experience. Built for **hackaTUM 2025**, it brings the personal touch of in-store interactions to the digital realm, helping customers customize and improve their rental experience right before pickup.

## Inspiration

We wanted to create a truly personalized experience for every customer — something that feels like speaking to a real person at the SIXT counter. In a physical rental location, the staff can upsell, guide customers, and help them get the best experience possible. With digital rental car processes, this personal interaction is mostly lost.

Our goal is simple:

> **Bring back the human, personal experience to the digital pickup process — and improve the UX of getting your rental car from SIXT.**

## Features

- **AI-Powered Assistant**: Natural language chat interface powered by OpenAI
- **Real-Time Integration**: Connects to the production SIXT API for live offers and addon options
- **Personalized Recommendations**: AI agent analyzes booking details to provide tailored suggestions
- **Mobile-First Design**: Optimized for mobile use, with desktop support
- **Seamless UX**: Unified experience between custom UI and AI agent interactions

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone git@github.com:paulkoehlerdev/sixty.git
cd sixty
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
   - Create a `.env` file in the root directory
   - Add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. Run the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

6. Deploy to Cloudflare Workers:
```bash
npm run deploy
```

### Try It Live

Experience Sixty directly at: **[http://sixty.twentyfivesoftware.workers.dev/](http://sixty.twentyfivesoftware.workers.dev/)**

> [!NOTE]
> The experience works on desktop, but it is optimized for **mobile** use.

## Tech Stack

Built with **React**, **TypeScript**, **Cloudflare Workers**, and **OpenAI API**. The frontend uses **Tailwind CSS**, **shadcn/ui**, and **Radix UI**, while the backend runs on **Cloudflare Workers** with **Durable Objects** for state management.

## Architecture

The system integrates:
- **SIXT API**: Fetches real offers and addon options
- **AI Agent**: Processes booking details and user queries to provide personalized assistance
- **Custom UI**: Seamless interface that unifies chat interactions with product displays

This is a modern take on a well-known problem, powered by natural language interaction as the new "device."

## The Team

This project was built during **hackaTUM 2025** by:

- **Simon Weckler**
- **Matthias Kirstein**
- **Paul Köhler**

## What We Learned

- Integrating AI Agents into custom UI experiences
- Making AI interactions feel unified and natural
- Balancing real-time API calls with user experience
- Building mobile-first interfaces with modern React patterns

## Accomplishments

We're proud that the project already delivers real, meaningful results and feels great to use — even though it still needs optimization for speed and stability. The first time we went through the full interaction flow with the Agent was a truly rewarding moment.

## What's Next

- **Full Booking Integration**: The entire booking process could take place in the chat interface
- **Performance Optimization**: Further improvements to speed and stability
- **Enhanced Personalization**: More sophisticated AI recommendations based on user history
- **Multi-language Support**: Expand to serve customers in multiple languages
- **Voice Assistant**: Add voice interaction capabilities for hands-free experience

Beyond that… we'll see where it goes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.