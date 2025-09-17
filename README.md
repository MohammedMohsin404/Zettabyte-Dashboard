# Zettabyte Dashboard

A professional dashboard built with **Next.js 15 (App Router + Turbopack)**, **Tailwind CSS v4**, **Framer Motion**, and **NextAuth (Google OAuth)**.  
Features include infinite scroll, grid/list toggle, search & sort, animated modals, and optimized API fetching.

---

## 🚀 Tech Stack
- **Next.js 15.5.3** with App Router & Turbopack
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** for animations
- **NextAuth.js** with Google Provider
- **Recharts** for charts/visualizations

---

## 📂 Project Structure
```
zettabyte-dashboard/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── posts/
│   │   └── page.tsx
│   └── users/
│       └── page.tsx
├── components/
│   ├── TopNav.tsx
│   ├── ClientLayout.tsx
│   ├── ChartLine.tsx
│   └── ...
├── hooks/
│   └── useFetch.ts
├── public/
├── styles/
├── .env.local
└── README.md
```

---

## ⚙️ Setup & Installation

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build && yarn start
```

---

## 🔑 Environment Variables (`.env.local`)

```ini
# API base (JSONPlaceholder demo)
NEXT_PUBLIC_API_BASE_URL=https://jsonplaceholder.typicode.com

# NextAuth Google OAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

For Vercel:
- Add the same keys in **Project Settings → Environment Variables**  
- Update `NEXTAUTH_URL` to your deployed URL (e.g. `https://your-app.vercel.app`)  
- Add Google OAuth redirect URI:  
  `https://your-app.vercel.app/api/auth/callback/google`

---

## 🛠️ Troubleshooting

### 1. `Invalid src prop on next/image`
Add to `next.config.js`:
```js
images: {
  domains: ["lh3.googleusercontent.com", "picsum.photos"],
},
```

### 2. `Argument of type 'string | null' is not assignable`
Always check URL before passing to hooks:
```ts
const postUrl = id ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/posts/${id}` : undefined;
```

### 3. `Module not found: Can't resolve 'recharts'`
```bash
yarn add recharts
```

### 4. Hydration / Overlapping Layout
Use **responsive Tailwind grids**:
```html
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

### 5. Fast Refresh ENOENT error
Clear `.next` and restart:
```bash
rm -rf .next
yarn dev
```

---

## 📊 Features
- Infinite scroll (IntersectionObserver + Load More fallback)
- Grid/List toggle view
- Search with debounce
- Sort by recent, title, or author
- Responsive Tailwind v4 layout
- Skeleton loaders + spinners
- Animated user detail modal

---

## 🚀 Deployment (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set `.env.local` values in **Vercel → Settings → Environment Variables**
4. Add Google OAuth redirect URI in Google Cloud Console
5. Deploy 🚀

---

## ✅ Best Practices
- Use `<Image />` from `next/image` for all images
- Define `width` + `height` props on `<Image>`
- Apply `suspense` for async components where needed
- Avoid overlapping UI with `min-h`, `overflow-hidden`, `grid` layouts
- Optimize API calls with `_limit`, `_page`, and caching

---

## 📜 License
MIT © 2025 Zettabyte Dashboard
