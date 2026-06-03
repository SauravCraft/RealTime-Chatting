# 💬 KeyChat — Netlify Edition

A fully anonymous real-time messaging platform that deploys on **Netlify** without any traditional backend server.

## 🚀 Architecture (Netlify-Compatible)

| Original | Netlify Edition |
|---|---|
| Node.js + Express server | Netlify Serverless Functions |
| Socket.IO WebSockets | **Ably** Realtime (free tier) |
| Local file storage | Base64 embedded in messages |
| In-memory room state | Ably channel history + localStorage |

---

## ⚡ Deploy in 5 Minutes

### Step 1 — Get a Free Ably API Key

1. Go to **[ably.com](https://ably.com)** and sign up (free)
2. Create a new app
3. Copy your **API Key** (looks like `xxxxxx.xxxxxx:xxxxxxxxxxxxxxxx`)

### Step 2 — Deploy to Netlify

**Option A: One-click via Netlify UI**
1. Fork/upload this project to GitHub
2. Go to [app.netlify.com](https://app.netlify.com) → "New site from Git"
3. Connect your repo
4. Build settings are auto-detected from `netlify.toml`

**Option B: Netlify CLI**
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### Step 3 — Add Your Ably Key

In Netlify dashboard:
1. Go to **Site Settings → Environment Variables**
2. Add: `ABLY_API_KEY` = `your-key-from-step-1`
3. Redeploy the site

That's it! Your KeyChat is live. 🎉

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Add local env file
echo "ABLY_API_KEY=your-ably-key-here" > .env

# Start dev server
npx netlify dev
```

Opens at `http://localhost:8888`

---

## 📁 Project Structure

```
keychat-netlify/
├── netlify.toml              # Netlify config (build + redirects)
├── package.json
├── netlify/
│   └── functions/
│       ├── ably-auth.js      # Issues Ably auth tokens (keeps key secret)
│       └── rooms.js          # Room creation + key validation
└── public/
    └── index.html            # Complete frontend (single file, no build step)
```

---

## ✨ Features

### Chat
- **No login** — random username auto-generated
- Public global chat room
- Private key-based rooms
- Real-time messaging via Ably
- Typing indicators
- Message reactions (❤️ 👍 😂 😮 🔥 + more)
- Reply to messages
- Edit & delete your messages
- Pin messages
- Message history (last 100 per channel)

### Files
- Drag & drop file sharing
- Paste images directly (Ctrl+V)
- Image/video preview
- Document downloads
- Up to 5MB per file (embedded as base64)

### Rooms
- Create rooms → get Room ID + Room Key
- Join with ID + Key only
- Room owner controls: rename, lock/unlock, kick users, regenerate key, delete
- Live member list

### UI
- Dark theme (Discord-inspired)
- Mobile responsive
- Emoji picker (7 categories)
- Message search
- Right-click context menu
- Auto-avatar colors

---

## 🔒 Security

- **Ably API key is never exposed to the frontend** — only the serverless function holds it
- The frontend gets short-lived **auth tokens** from `/api/ably-auth`
- Room keys validated server-side via `/api/rooms`
- XSS protection via HTML escaping
- File size limit (5MB)

---

## 🆓 Free Tier Limits

### Ably Free Plan
- 200 peak connections
- 6 million messages/month
- 100 channels
- Sufficient for a small to medium community

### Netlify Free Plan
- 100GB bandwidth/month
- 125,000 function invocations/month
- Plenty for a personal or community project

---

## 🔧 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ABLY_API_KEY` | **Yes** | Your Ably API key (server-side only) |

---

## 📦 Dependencies

- `ably` — Realtime SDK (server-side, for token generation)
- `uuid` — Unique ID generation
- Frontend uses Ably CDN (no npm install needed for frontend)

---

## 🔄 Differences from Original (Node.js Version)

| Feature | Original | Netlify Edition |
|---|---|---|
| File size limit | 50MB | 5MB (base64 in messages) |
| File storage | Server disk | Embedded in messages |
| Room persistence | Server memory | Ably history + localStorage |
| Connection | WebSocket (Socket.IO) | Ably managed WebSocket |
| Deploy | VPS/Node.js host | Any static host + Netlify Functions |

---

## 🚀 Upgrade Path

For production use, consider:
- **Cloudinary** for file storage (free 25GB)
- **PlanetScale** or **Supabase** for persistent message storage
- **Ably Pro** for higher limits
