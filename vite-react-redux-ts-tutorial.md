# Vite + React + Redux Toolkit + TypeScript — A Working Tutorial

This walks through a complete, modern setup: scaffolding, TS config, the Vite config, Redux Toolkit with typed hooks, async data (thunks and RTK Query), env vars, path aliases, testing with Vitest, and the build pipeline.

A note on versions: the workflow below is stable across **Vite 5+**, **Redux Toolkit 2.x**, **react-redux 9.x**, and **React 18/19**. The one version-gated thing is the `.withTypes()` hook API, which needs react-redux ≥ 9. Pin/check current versions when you scaffold — none of the patterns here change with minor bumps.

---

## 1. Prerequisites

- **Node** ≥ 18 (20+ recommended — some tooling and `import.meta.dirname` want 20.11+).
- A package manager: `npm`, `pnpm`, or `yarn`. Examples use `npm`.

```bash
node -v   # confirm 18+
```

---

## 2. Scaffold the project

Vite ships a first-class React + TypeScript template. The `--` separates npm's args from the create-vite args.

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev
```

`react-ts` uses the SWC-free Babel plugin by default. If you want faster builds, `react-swc-ts` is the same template backed by `@vitejs/plugin-react-swc`. Either is fine; SWC is faster, Babel has broader plugin support.

The dev server starts on `http://localhost:5173` with HMR already wired up.

---

## 3. What got generated

```
my-app/
├─ public/                 # static assets served as-is at /
├─ src/
│  ├─ assets/
│  ├─ App.tsx
│  ├─ App.css
│  ├─ index.css
│  ├─ main.tsx             # app entry — mounts React
│  └─ vite-env.d.ts        # ambient types for Vite (import.meta.env, asset imports)
├─ index.html              # the real entry point — note the <script type="module">
├─ package.json
├─ tsconfig.json           # references-only root config
├─ tsconfig.app.json       # config for your src/ code
├─ tsconfig.node.json      # config for vite.config.ts and other node-side files
├─ vite.config.ts
└─ eslint.config.js        # flat ESLint config
```

Two things worth internalizing here:

- **`index.html` is the entry**, not a `src/index.js`. Vite serves it directly and resolves the `<script type="module" src="/src/main.tsx">` from it. You can add `<link>`/`<meta>` here as usual.
- **The tsconfig is split** via project references. Your application code is governed by `tsconfig.app.json`; node-context files (the Vite config itself) by `tsconfig.node.json`. The root `tsconfig.json` just references both. This matters when you add compiler options — put app options in `tsconfig.app.json`, not the root.

---

## 4. TypeScript configuration

Open `tsconfig.app.json`. It's already strict, which is what you want. The relevant pieces:

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",   // lets you import without extensions, like Vite does
    "jsx": "react-jsx",              // no need to import React in every file
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "isolatedModules": true,         // each file compiles standalone — required by Vite/esbuild
    "verbatimModuleSyntax": true,    // forces explicit `import type` for type-only imports
    "noEmit": true                   // tsc only type-checks; Vite/esbuild does the transpiling
  },
  "include": ["src"]
}
```

A couple of consequences you'll hit:

- **`verbatimModuleSyntax: true`** means you must write `import type { Foo }` for anything used only as a type. Mixing values and types in one statement is allowed (`import { thing, type Thing }`), but a pure-type import left as a plain `import` will error. This is why the Redux examples below use `import type { PayloadAction }`.
- **`isolatedModules`** disallows things like `const enum` and re-exporting a type with plain `export { Type }` — use `export type { Type }`.

Because `noEmit` is set, **`tsc` never produces JS** — it's purely your type checker. The actual transform is esbuild (dev) / Rollup (build). That's why a type error won't break `npm run dev` by default; the dev server transpiles per-file and ignores type errors. You catch them via your editor, `tsc --noEmit`, or the build step. More on that in §15.

---

## 5. The Vite config

`vite.config.ts` starts minimal:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

`defineConfig` is just for editor intellisense — the config is a plain object. Common additions:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,        // default is 5173
    open: true,        // auto-open the browser
    proxy: {
      // forward /api/* to a backend during dev — avoids CORS, keeps relative URLs
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: true,   // ship sourcemaps (or 'hidden' to upload without referencing)
    outDir: 'dist',
  },
})
```

The **dev proxy** is the cleanest way to talk to a local backend: your fetch calls hit `/api/users`, Vite rewrites them to `http://localhost:8080/api/users`, and you avoid CORS entirely. In production you'd typically serve the API under the same origin or set a base URL via env (§13).

If you need different config per command, the functional form gives you `mode`:

```ts
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // mode is 'development' | 'production' | your custom --mode
}))
```

---

## 6. Path aliases (`@/...` imports)

You want `import Button from '@/components/Button'` instead of `'../../../components/Button'`. This requires telling **both** Vite (for bundling) **and** TypeScript (for type resolution).

### Option A — define in both places (explicit)

In `vite.config.ts`, using an ESM-safe path (don't reach for `__dirname` — it isn't defined in an ESM config):

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

Then in `tsconfig.app.json`:

```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
    // ...keep the rest
  }
}
```

### Option B — define once with a plugin (DRY)

`vite-tsconfig-paths` reads your tsconfig `paths` and applies them to Vite, so you only declare aliases in one place:

```bash
npm i -D vite-tsconfig-paths
```

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
})
```

Now aliases live only in `tsconfig.app.json`. For teams I lean toward Option B — one source of truth, no drift between the two files.

---

## 7. Install Redux Toolkit

Redux Toolkit (RTK) is the official, batteries-included way to write Redux. Don't hand-roll action types/creators or pull in plain `redux` — RTK wraps all of it.

```bash
npm install @reduxjs/toolkit react-redux
```

Recommended structure (the RTK convention is feature folders):

```
src/
├─ app/
│  ├─ store.ts
│  └─ hooks.ts
└─ features/
   └─ counter/
      ├─ counterSlice.ts
      └─ Counter.tsx
```

---

## 8. Create the store

```ts
// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '@/features/counter/counterSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
})

// Inferred types — never hand-write these
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

`configureStore` gives you the Redux DevTools connection, `redux-thunk`, and a serializability/immutability dev check for free. **`RootState` and `AppDispatch` are derived from the store**, so they stay correct automatically as you add slices — you never maintain a separate type definition.

---

## 9. Typed hooks

Don't import the raw `useDispatch`/`useSelector` in components — they're untyped and you'll lose `RootState` inference. Make pre-typed versions once:

```ts
// src/app/hooks.ts
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'

// react-redux 9+ — the modern, clean form
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
```

If you're on react-redux 8 (no `.withTypes`), the equivalent older idiom is:

```ts
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
```

From here on, every component imports `useAppDispatch`/`useAppSelector` and gets full typing of state and dispatchable thunks.

---

## 10. Write a slice

`createSlice` generates the action creators and action types from the reducer keys, and lets you write "mutating" logic that Immer turns into immutable updates under the hood.

```ts
// src/features/counter/counterSlice.ts
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface CounterState {
  value: number
}

const initialState: CounterState = {
  value: 0,
}

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1          // looks mutating; Immer makes it immutable
    },
    decrement: (state) => {
      state.value -= 1
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload
    },
  },
})

export const { increment, decrement, incrementByAmount } = counterSlice.actions
export default counterSlice.reducer
```

The `PayloadAction<number>` annotation is what types `action.payload` and, transitively, the generated `incrementByAmount` action creator so callers must pass a number.

---

## 11. Provide the store

Wrap the app in `<Provider>` in your entry file:

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from '@/app/store'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
```

---

## 12. Use state in a component

```tsx
// src/features/counter/Counter.tsx
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { increment, decrement, incrementByAmount } from './counterSlice'

export function Counter() {
  const count = useAppSelector((state) => state.counter.value)
  const dispatch = useAppDispatch()

  return (
    <div>
      <button onClick={() => dispatch(decrement())}>-</button>
      <span>{count}</span>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
    </div>
  )
}
```

`state.counter.value` is fully typed — `state` is `RootState`, autocomplete works, and a typo is a compile error. Drop `<Counter />` into `App.tsx` and the dev server hot-reloads it.

---

## 13. Async logic

You have two idiomatic options. For arbitrary side effects use a **thunk**; for *server data fetching/caching* prefer **RTK Query**, which eliminates most of the loading/caching boilerplate.

### 13a. createAsyncThunk (general async)

```ts
// src/features/users/usersSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

interface User { id: string; name: string }

interface UsersState {
  entity: User | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
}

const initialState: UsersState = { entity: null, status: 'idle' }

export const fetchUserById = createAsyncThunk(
  'users/fetchById',
  async (userId: string) => {
    const res = await fetch(`/api/users/${userId}`)
    if (!res.ok) throw new Error('Request failed')
    return (await res.json()) as User
  },
)

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.entity = action.payload   // typed as User
      })
      .addCase(fetchUserById.rejected, (state) => {
        state.status = 'failed'
      })
  },
})

export default usersSlice.reducer
```

Dispatch it like any action: `dispatch(fetchUserById('42'))`. Because `useAppDispatch` is typed against the store's `dispatch`, it knows this thunk is dispatchable and returns a promise you can `await`/`unwrap()`.

### 13b. RTK Query (server data — preferred for fetching)

RTK Query generates hooks with caching, deduplication, and loading/error state, so you stop writing `status` machinery by hand.

```ts
// src/features/api/apiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface User { id: string; name: string }

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL }),
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users',
    }),
  }),
})

export const { useGetUsersQuery } = apiSlice
```

Wire its reducer and middleware into the store:

```ts
// src/app/store.ts (additions)
import { apiSlice } from '@/features/api/apiSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
})
```

Then in a component the whole fetch-lifecycle is one hook:

```tsx
function UserList() {
  const { data, isLoading, isError } = useGetUsersQuery()
  if (isLoading) return <p>Loading…</p>
  if (isError) return <p>Failed to load.</p>
  return <ul>{data?.map((u) => <li key={u.id}>{u.name}</li>)}</ul>
}
```

Rule of thumb: **RTK Query for talking to APIs, slices/thunks for client state and non-fetch side effects.**

---

## 14. Environment variables

Vite exposes env vars on `import.meta.env`, but **only those prefixed `VITE_`** (so you can't accidentally leak server secrets to the bundle). They're loaded from `.env` files at the project root.

```bash
# .env
VITE_API_URL=https://api.example.com
```

```ts
const apiUrl = import.meta.env.VITE_API_URL
```

Files are loaded by mode: `.env`, `.env.local` (gitignored), `.env.development`, `.env.production`. Add `.env.local` to `.gitignore` (the template already does).

Give them types so `import.meta.env.VITE_API_URL` is `string`, not `any`. Extend `src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // add each VITE_ var here
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

Built-in flags you also get: `import.meta.env.DEV`, `.PROD`, `.MODE`, `.BASE_URL`.

---

## 15. Type checking and the build gap

This trips people up: **`npm run dev` does not type-check.** esbuild strips types per-file for speed and never looks at the whole program. So a type error shows red in your editor but the dev server keeps running.

Where you actually catch type errors:

1. Your editor (the TS language server).
2. A standalone check: `tsc -b` (uses the project references) or `tsc --noEmit`.
3. **The build script**, which the template wires to run `tsc` first:

```jsonc
// package.json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",   // tsc -b fails the build on type errors
  "preview": "vite preview",
  "lint": "eslint ."
}
```

Add a dedicated `"typecheck": "tsc -b --noEmit"` script and run it in CI so a type error can't slip into a deploy.

---

## 16. Linting

The template ships a **flat config** (`eslint.config.js`). It already includes the TS and React Hooks rules. To make it type-aware (catches misused promises, unsafe `any`, etc.), switch the TS preset to the type-checked variant:

```js
// eslint.config.js (sketch)
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // ...
  tseslint.configs.recommendedTypeChecked,   // instead of `recommended`
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
)
```

Type-aware linting is slower but worth it on a real codebase. Run `npm run lint`.

---

## 17. Testing with Vitest

Vitest is the natural choice — it reuses your Vite config and transforms, so there's no separate Babel/Jest pipeline to maintain, and it's fast.

```bash
npm i -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Add a `test` block to the Vite config. The triple-slash reference pulls in the `test` types:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,            // use describe/it/expect without importing
    environment: 'jsdom',     // DOM for component tests
    setupFiles: './src/test/setup.ts',
  },
})
```

```ts
// src/test/setup.ts
import '@testing-library/jest-dom'
```

If you used `globals: true`, also add Vitest's globals to your TS types so `expect`/`describe` are recognized — add `"vitest/globals"` to the `types` array in `tsconfig.app.json`.

A component test, including how to render with the Redux store:

```tsx
// src/features/counter/Counter.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './counterSlice'
import { Counter } from './Counter'

function renderWithStore() {
  const store = configureStore({ reducer: { counter: counterReducer } })
  return render(
    <Provider store={store}>
      <Counter />
    </Provider>,
  )
}

describe('Counter', () => {
  it('increments when + is clicked', async () => {
    renderWithStore()
    await userEvent.click(screen.getByText('+'))
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
```

Note the pattern: **build a fresh store per test** so tests don't share state. Add scripts:

```jsonc
"scripts": {
  "test": "vitest",          // watch mode
  "test:run": "vitest run",  // one-shot, for CI
  "coverage": "vitest run --coverage"
}
```

---

## 18. Build and preview

```bash
npm run build     # tsc -b && vite build  →  dist/
npm run preview   # serves dist/ locally to smoke-test the production build
```

`vite build` uses Rollup: tree-shaking, minification, code-splitting, and hashed filenames for cache-busting. The output in `dist/` is static — host it on anything (Netlify, S3+CloudFront, nginx, etc.).

Two production gotchas:

- **SPA routing / `base`.** If you deploy under a subpath, set `base: '/my-subpath/'` in the config so asset URLs resolve. And for client-side routers, configure the host to fall back to `index.html` for unknown routes, or deep links 404.
- **`preview` is not a production server.** It's only for verifying the build locally — don't use it to serve real traffic.

To inspect bundle size, add `rollup-plugin-visualizer` to `plugins` and open the generated treemap after a build.

---

## 19. Gotchas worth remembering

- **Type errors don't block dev** (§15) — rely on the editor + a CI `tsc -b`.
- **`__dirname` is undefined** in an ESM `vite.config.ts` — use `fileURLToPath(new URL(...))` or `import.meta.dirname` (Node 20.11+).
- **`verbatimModuleSyntax`** forces `import type` for type-only imports — expect it and write them.
- **Only `VITE_`-prefixed env vars** reach the client. A missing value silently becomes `undefined`; type them in `vite-env.d.ts` to catch typos.
- **Static assets:** files in `public/` are served verbatim at `/` (reference as `/logo.png`); files imported from `src/` (`import logo from './logo.png'`) get hashed and bundled. Use `public/` only for things that must keep a stable URL.
- **Aliases must be set in two systems** (§6) — Vite resolves the bundle, TS resolves the types. `vite-tsconfig-paths` collapses that to one source of truth.

---

## Minimal end-to-end checklist

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app && npm install
npm install @reduxjs/toolkit react-redux
npm i -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom vite-tsconfig-paths
# add store.ts, hooks.ts, a slice, wrap App in <Provider>
# add test{} + tsconfigPaths() to vite.config.ts, paths{} to tsconfig.app.json
npm run dev
```

That's the full loop — scaffold, typed store + hooks, async via thunk or RTK Query, env vars, aliases, tests, and a production build.
