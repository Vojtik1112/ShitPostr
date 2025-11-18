# ShitPostr Frontend

A bathroom-wall inspired chat UI built with Vue 3, Vite, Pinia, and Vue Router. The experience leans fully into the
porcelain comedy: stalls instead of rooms, janitor bots cheering you on, and a palette pulled straight from the finest
tile work. The app provides a complete unauthenticated/authenticated flow with registration, login, and a fully
interactive chat surface powered by local storage.

## Features

- Email/password registration and login stored locally (for demo purposes only)
- Persistent user sessions with profile editing and avatar colour generation
- Multi-stall chat experience with helper bot replies and live message stream
- Smart sidebar with unread tracking, filtered views, and message preview metadata
- Responsive layout with conversation search, room creation modal, and protected routes
- Vue Router navigation guards and Pinia-based state management

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser and create a new account to explore the stalls.

## Available scripts

- `npm run dev` – start the Vite development server
- `npm run build` – produce an optimised production build
- `npm run preview` – preview the production build locally

## Notes

This project stores credentials and chat history in `localStorage` solely for demonstration. Do not use the code as-is
for production authentication without a real backend and proper security hardening (and maybe a real facilities team).
