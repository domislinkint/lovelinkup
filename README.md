# 💕 LoveLinkUp
**Match Makers** — A Progressive Web App (PWA) for intelligent matchmaking

---

## 📱 Overview

LoveLinkUp is an installable Progressive Web App that combines intelligent matchmaking with a user-friendly monetization model. The app is designed to remove initial paywalls while providing optional, transparent upgrades and a self-managed advertising portal.

### Key Features

✨ **Core Matchmaking**
- AI-assisted profile matching
- Real-time match suggestions
- User profiles with media support

🚀 **Progressive Web App**
- Install directly from a supported browser
- Offline support with service workers
- Fast, app-like experience
- Cross-platform compatibility

💰 **Fair Monetization**
- Optional micro-transactions
- Gradual premium feature unlocks
- User-controlled advertising portal
- Transparent pricing

📢 **Self-Managed Ad Portal**
- Text, image, video, carousel, and interactive ad formats
- AI-assisted copy suggestions
- File and video uploads
- Paystack integration
- Fair-price suggestions

🔐 **Firebase Authentication**
- Email/password authentication
- Google sign-in
- Password reset emails
- Persistent browser sessions
- Firebase ID-token verification for protected backend routes

---

## 🛠️ Tech Stack

### Frontend
- React with Vite
- Firebase Authentication
- Service Workers and Web App Manifest
- Responsive, mobile-first CSS/Tailwind CSS
- IndexedDB for offline data where appropriate

### Backend
- Node.js and Express
- Firebase Admin SDK for server-side token verification
- REST API
- PostgreSQL or MongoDB for application data
- Paystack API integration

### AI/ML
- Content-based and collaborative matching
- LLM-assisted ad generation
- Predictive price suggestions

### Deployment
- Vercel, Netlify, AWS, or Firebase Hosting
- Cloudflare CDN
- Docker and GitHub Actions

---

## 📦 Project Structure

```text
lovelinkup/
├── public/
│   ├── manifest.json
│   └── service-worker.js
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── matching.js
│   │   ├── payment.js
│   │   └── ai.js
│   ├── utils/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── backend/
│   └── server.js
├── tests/
├── docs/
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or later recommended
- npm
- A Firebase project
- A Paystack account for payments
- PostgreSQL or MongoDB if persistence is enabled
- Google Ads account (optional)

### Installation

```bash
git clone https://github.com/domislinkint/lovelinkup.git
cd lovelinkup
npm install
```

#### Create the environment file on Windows

The original `cp` command is for macOS/Linux. In Command Prompt, use:

```bat
copy .env.example .env.local
```

In PowerShell, use:

```powershell
Copy-Item .env.example .env.local
```

If the copy command reports that the file cannot be found, confirm that `.env.example` exists by running `dir`. If it does not exist in your checkout, create `.env.local` manually from the variables below. Never commit `.env.local` or real credentials.

### Run the frontend

```bash
npm run dev
```

The Vite development server normally runs at `http://localhost:5173`.

### Run the backend separately

```bash
npm run backend
```

The API normally runs at `http://localhost:3000`. Run `npm run` to see the scripts available in your local checkout.

---

## 🔐 Firebase Authentication

LoveLinkUp uses Firebase Authentication for identity management. Firebase handles credential storage, provider flows, email delivery, token refresh, and session persistence. The LoveLinkUp backend must still verify every Firebase ID token before accepting authenticated requests.

### 1. Create and configure a Firebase project

1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Create a project or select an existing project.
3. Add a Web app from **Project settings → Your apps**.
4. Copy the web configuration values into `.env.local`.
5. Open **Build → Authentication → Sign-in method**.
6. Enable the providers required by the application:
   - Email/password
   - Google, including a support email
   - Any additional provider only after its redirect and privacy requirements are configured
7. Add local and production domains under **Authentication → Settings → Authorized domains**. Add `localhost` for local development.
8. Configure password-reset and email-verification templates under **Authentication → Templates**.

Firebase web configuration values are intended to identify the Firebase project; they are not a replacement for Firebase Security Rules or backend authorization. Do not place service-account private keys in frontend environment variables.

### 2. Firebase frontend environment variables

Add these values to `.env.local`:

```env
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

Vite exposes variables prefixed with `VITE_` to browser code. Therefore, only Firebase web configuration belongs here. Keep server secrets such as `FIREBASE_PRIVATE_KEY` and `PAYSTACK_SECRET_KEY` server-side.

### 3. Install the Firebase client SDK

```bash
npm install firebase
```

Create `src/services/firebase.js`:

```js
import { initializeApp } from 'firebase/app'
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// Keep the user signed in across browser restarts.
export const authReady = setPersistence(auth, browserLocalPersistence)
```

### 4. Authentication service

Create or adapt `src/services/auth.js`:

```js
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth, authReady } from './firebase'

const googleProvider = new GoogleAuthProvider()

export async function registerWithEmail({ name, email, password }) {
  await authReady
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  if (name) await updateProfile(credential.user, { displayName: name })
  await sendEmailVerification(credential.user)
  return credential.user
}

export async function loginWithEmail(email, password) {
  await authReady
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export async function loginWithGoogle() {
  await authReady
  const credential = await signInWithPopup(auth, googleProvider)
  return credential.user
}

export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email)
}

export function logout() {
  return signOut(auth)
}
```

### 5. Observe authentication state

Use `onAuthStateChanged` near the application root or in an authentication context. Always unsubscribe when the component unmounts:

```jsx
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './services/firebase'

export function useCurrentUser() {
  const [user, setUser] = useState(undefined)

  useEffect(() => onAuthStateChanged(auth, setUser), [])
  return user
}
```

`undefined` can represent the initial loading state, `null` represents signed out, and a Firebase user object represents signed in. Protect routes only after the initial loading state has resolved.

### 6. Send the Firebase ID token to the backend

Firebase automatically refreshes tokens on the client. Before an authenticated API request, obtain the current ID token and send it as a bearer token:

```js
import { auth } from './firebase'

export async function authorizedFetch(url, options = {}) {
  const user = auth.currentUser
  if (!user) throw new Error('You must be signed in')

  const idToken = await user.getIdToken()
  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${idToken}`)
  headers.set('Content-Type', 'application/json')

  return fetch(url, { ...options, headers })
}
```

Never trust an email address, user ID, or role supplied directly in a request body. Derive the authenticated user identity from the verified token on the server.

### 7. Verify tokens in the Express backend

Install the Admin SDK:

```bash
npm install firebase-admin
```

Create a server-only Firebase Admin initialization module. Use Application Default Credentials in hosted environments where possible. For local development, use a service-account JSON file outside the repository and point `GOOGLE_APPLICATION_CREDENTIALS` to it, or load the equivalent credentials from a secret manager.

```js
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

if (!getApps().length) initializeApp({ credential: applicationDefault() })
export const adminAuth = getAuth()
```

Protect Express routes with middleware:

```js
import { adminAuth } from './firebase-admin.js'

export async function requireAuth(req, res, next) {
  const authorization = req.headers.authorization || ''
  const match = authorization.match(/^Bearer (.+)$/)

  if (!match) return res.status(401).json({ error: 'Missing bearer token' })

  try {
    req.user = await adminAuth.verifyIdToken(match[1])
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
```

Example protected route:

```js
app.get('/api/profile', requireAuth, async (req, res) => {
  res.json({ uid: req.user.uid, email: req.user.email })
})
```

For custom claims such as `admin`, set them only from trusted server code and check them after token verification. Do not expose Admin SDK credentials in the browser.

### 8. Firestore and Storage security

If Firestore or Firebase Storage is used, enable authentication-aware Security Rules before production. Rules are an additional authorization layer; they do not replace backend token verification.

Example Firestore rules for users reading and updating only their own profile:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, create, update: if request.auth != null
        && request.auth.uid == userId;
      allow delete: if false;
    }
  }
}
```

Review rules with the Firebase Emulator Suite before deploying. Restrict file types and sizes in Storage Rules, validate uploads on the backend, and never allow public writes by default.

### 9. Account lifecycle and production checklist

- Require email verification before sensitive actions where appropriate.
- Provide password reset and sign-out controls.
- Handle deleted, disabled, and unverified accounts gracefully.
- Use HTTPS in production and configure the exact authorized domains.
- Rate-limit registration, login, password reset, and profile endpoints.
- Do not log passwords, ID tokens, refresh tokens, or service-account credentials.
- Keep Firebase web configuration separate from server secrets.
- Test popup and redirect sign-in on every supported browser and mobile PWA mode.
- Enable App Check where appropriate and monitor Authentication usage and audit logs.
- Back up and review Firestore/Storage rules before each release.

### Firebase troubleshooting

- **`auth/unauthorized-domain`**: add the current host to Firebase Authentication authorized domains.
- **Popup blocked or closed**: use a user-initiated button and provide a redirect-based fallback for mobile browsers.
- **`auth/operation-not-allowed`**: enable the provider in Firebase Console.
- **Backend returns 401**: verify the request has `Authorization: Bearer <ID_TOKEN>` and that the backend uses the matching Firebase project credentials.
- **Environment values are undefined**: restart Vite after changing `.env.local`, and confirm frontend variables use the `VITE_` prefix.
- **Password email is not received**: check Firebase email templates, the recipient spam folder, and the authorized sender configuration.

---

## 🔑 Environment Variables

```env
# Frontend API
VITE_API_URL=http://localhost:3000

# Firebase Web App configuration
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Backend only — never expose these as VITE_ variables
GOOGLE_APPLICATION_CREDENTIALS=C:\path\outside\repository\firebase-service-account.json
PAYSTACK_SECRET_KEY=your_paystack_secret_key
OPENAI_API_KEY=your_openai_key
AI_MODEL=gpt-4
DATABASE_URL=postgresql://user:password@localhost:5432/lovelinkup
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=use-a-long-random-value-if-the-application-uses-jwt
```

`.env.local` is intentionally ignored by Git. Use `.env.example` as a template and replace placeholders locally.

---

## 💡 Core Features Explained

### AI-powered matchmaking

Matches can combine profile compatibility, interest overlap, demographic preferences, and behavioral signals. Any production scoring system should be tested for bias, explainability, abuse, and user consent.

```javascript
const compatibilityScore = (profile1, profile2) => {
  const interests = calculateInterestOverlap(profile1, profile2)
  const demographics = calculateDemographicFit(profile1, profile2)
  const behavioral = calculateBehavioralMatch(profile1, profile2)

  return (interests * 0.4) + (demographics * 0.35) + (behavioral * 0.25)
}
```

### Self-managed advertising

Users can create text, image, video, carousel, and interactive ads. Validate uploads, sanitize text, enforce content moderation, and keep payment and advertising authorization on the server.

### Fair pricing

Pricing suggestions should be transparent, bounded, and reviewable. Never charge a user based on a hidden or discriminatory attribute.

---

## 🔐 Security & Privacy

- Firebase Authentication manages sign-in credentials and identity tokens.
- Backend routes verify Firebase ID tokens before accessing private data.
- Firestore and Storage rules must deny unauthorized access by default.
- Messages and personal data require appropriate encryption and retention controls.
- Follow applicable GDPR, CCPA, and local privacy requirements.
- Use Paystack's hosted/payment APIs without handling raw card details.
- Rate-limit authentication, messaging, uploads, and payment endpoints.
- Provide account deletion and data export processes where required.

The security claims above describe required controls and should not be interpreted as a claim that every control is already implemented in the starter scaffold.

---

## 🗃️ Database Schema (Overview)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  firebase_uid VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE,
  profile_data JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE matches (
  id UUID PRIMARY KEY,
  user_id_1 UUID,
  user_id_2 UUID,
  compatibility_score FLOAT,
  created_at TIMESTAMP
);

CREATE TABLE user_ads (
  id UUID PRIMARY KEY,
  user_id UUID,
  format VARCHAR,
  content JSONB,
  pricing DECIMAL,
  status VARCHAR,
  created_at TIMESTAMP
);
```

Use the Firebase `uid` as the stable identity mapping when synchronizing Firebase users with an application database. Do not use an email address as the primary identity key.

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Install dependencies and run the application locally.
4. Write tests for new behavior.
5. Commit with a conventional commit message.
6. Push the branch and open a Pull Request.

Do not commit `.env.local`, Firebase service-account files, API keys, payment secrets, or user data.

---

## 📈 Roadmap

- [x] Core PWA scaffold
- [ ] Firebase Authentication UI and account flows
- [ ] User profiles and verification
- [ ] Matching algorithm
- [ ] Ad portal MVP
- [ ] Payment integration
- [ ] AI ad generation
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] Video chat integration
- [ ] Advanced filters and preferences

---

## 📞 Support & Contact

- **Support email**: [support@domislink.com](mailto:support@domislink.com)
- **GitHub Issues**: [github.com/domislinkint/lovelinkup/issues](https://github.com/domislinkint/lovelinkup/issues)
- **Documentation**: [docs.lovelinkup.app](https://docs.lovelinkup.app)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Firebase for authentication infrastructure
- Paystack for payment infrastructure
- OpenAI for AI capabilities
- The open-source community

---

**LoveLinkUp** — Making meaningful connections, one match at a time. 💕
