# 🐼 Hungry Panda: Rusty's Food Guide

A real-time, voice-and-video AI avatar that recommends places to eat. Talk to **Rusty**, a red panda foodie, and every time he recommends a restaurant, the app automatically opens it on Google Maps.

<!-- Add a screenshot or short GIF of a conversation here -->

## What it does
- Click **"Ask Rusty!"** to start a live voice and video conversation with an animated red panda avatar
- Tell Rusty what you're craving and where you are
- Rusty recommends spots conversationally and **calls a tool** to open each recommendation in Google Maps
- A **"Recently Recommended"** list keeps track of every place Rusty suggested

## How it works
```
User clicks "Ask Rusty!"
   ↓
Next.js API route (server) creates a real-time avatar session with the Runway API
   ↓  (API key stays on the server, never exposed to the browser)
Polls until the session is READY, then returns session credentials
   ↓
Browser joins the live voice + video call with the avatar
   ↓
User speaks → avatar responds in persona
   ↓
When recommending a place, the avatar calls the open_google_maps tool
   ↓
Browser receives the tool event → opens Google Maps + updates the history list
```

## Agent design
- **Persona & instructions:** Rusty's personality, tone, and behavior are defined in a system prompt, including an opening script that asks for cuisine and location
- **Tool calling:** a custom `open_google_maps` tool with a structured `query` parameter (place name + city). The agent is instructed to call it every time it recommends a specific place, which connects the conversation to a real-world action
- **Secure session setup:** the API key lives only in a server-side route; the browser only receives a short-lived session ID and key
- **Reliability:** session creation polls for readiness with a 30-second timeout and clear handling of failed or cancelled sessions
- **User-initiated start:** the call begins only when the user clicks, rather than auto-starting on page load

## Tech stack
- **Next.js 15**, **React 19**, **TypeScript**
- **Runway Avatars SDK** (`@runwayml/sdk`, `@runwayml/avatars-react`) for the real-time conversational avatar
- **Google Maps** search URLs for place lookup

## What I'd improve next
- Ground recommendations in live place data (e.g., Google Places API) so the agent only suggests venues that exist and are open now
- Add evaluation: a test set of user requests to check recommendation quality and tool-call accuracy
- Remember user preferences (cuisine, dietary needs, neighborhood) across sessions

## Run it locally
```bash
npm install
cp .env.example .env.local   # then add your own Runway API key
npm run dev
```
Then open http://localhost:3000. You'll need a Runway API key and your own custom avatar ID (set in `app/page.tsx`).
