# ShitPostr Frontend

A playful chat UI built with Vue 3, Vite, Pinia, and Vue Router. The app provides a complete unauthenticated/authenticated flow with registration, login, and a fully interactive chat surface powered by local storage.

## Features

- Email/password registration and login stored locally (for demo purposes only)
- Persistent user sessions with profile editing and avatar colour generation
- Multi-room chat experience with helper bot replies and live message stream
- Responsive layout with conversation search, room creation modal, and protected routes
- Vue Router navigation guards and Pinia-based state management

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser and create a new account to explore the chats.

## Available scripts

- `npm run dev` – start the Vite development server
- `npm run build` – produce an optimised production build
- `npm run preview` – preview the production build locally

## Notes

This project stores credentials and chat history in `localStorage` solely for demonstration. Do not use the code as-is for production authentication without a real backend and proper security hardening.
