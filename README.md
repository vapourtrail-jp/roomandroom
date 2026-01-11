# Roomandroom

A high-performance, visually stunning website base built with **Next.js** and **Three.js**.

## 🚀 Features

- **Next.js 15 (App Router)**: Modern React framework for the best developer experience.
- **Three.js Integration**: Using `@react-three/fiber` and `@react-three/drei` for immersive 3D experiences.
- **Premium Design System**: Glassmorphism, refined typography (Outfit), and smooth animations with Vanilla CSS.
- **Cloudflare Ready**: Optimized for deployment on Cloudflare Pages.

## 🛠️ Tech Stack

- **Framework**: Next.js
- **3D Engine**: Three.js
- **React Wrappers**: Fiber, Drei
- **Styling**: Vanilla CSS (Global & Modules)
- **Deployment**: Targeting Cloudflare Pages

## 🏁 Getting Started

First, install dependencies:

```bash
npm install
```

Second, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the 3D scene.

## ☁️ Deployment to Cloudflare Pages

### Option 1: Static Export (Recommended for simple sites)

Update `next.config.ts`:
```typescript
const nextConfig = {
  output: 'export',
  // ... other config
}
```
Then run:
```bash
npm run build
```
And upload the `out` directory to Cloudflare Pages.

### Option 2: Next-on-Pages (For SSR/API Routes)

1. Install the adapter:
```bash
npm install -D @cloudflare/next-on-pages
```
2. Run the build command:
```bash
npx @cloudflare/next-on-pages
```
3. Deploy the `.vercel/output/static` (or equivalent) to Cloudflare.

## 📁 Project Structure

- `src/app/`: Next.js App Router pages and layouts.
- `src/components/`: Reusable React components.
- `src/components/Experience.tsx`: The 3D world content.
- `src/components/Scene.tsx`: The Canvas container and environment setup.
