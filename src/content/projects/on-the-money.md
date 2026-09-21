---
name: "On The Money"
title: "Stop Splitting Finances Across Five Apps: Build Your Own"
description: "On The Money is a self-hosted personal finance tracker that allows you to track your net worth, monitor transactions/account balances, and run Monte Carlo retirement projections while keeping your data private. Accounts can be linked via Plaid, giving real-time, hands-off tracking of your finances."
stack: ["Java 17 / Spring Boot 3.3", "TypeScript / React", "PostgreSQL", "C++17 / Monte Carlo Engine", "Docker"]
gif: "onthemoney-demo.gif"
href: "https://github.com/nickczak/OnTheMoney-Finance-Tracker"
liveHref: "https://onthemoney.site"
readingTime: 6
date: "08.31.2026"
---

## Origin

For a long time, I wanted full visibility into my finances from a single app without handing my data to a third party — with the acknowledged exception of Plaid, which probably had my information anyway. I was tired of splitting my finances across five-plus apps, so I decided to build my own tool for tracking, specifically, my net worth. Big companies run their backends on Java and Spring Boot and use C++ for intensive, fast trading algorithms, so I decided to do the same — and honestly, I wanted to learn Spring Boot anyway, and I already knew Java.

## Building On The Money

### An iOS Native Application
My first plan was the backend in Java with Spring Boot, paired with a native iOS frontend in Swift. I wanted an app I could sideload onto my phone and use that way, so I learned Swift and built the UI with SwiftUI while getting familiar with how the framework thinks. Before long, AI was generating most of the calls into libraries I didn't understand, and it started to feel unmanageable — the app was drifting outside the project's scope. So once I started learning TypeScript at ZiTip, I switched the frontend to React Native.

### The Plaid Backend
The features I've always loved in finance apps are the ones that do the work for you: link your bank, and the app automatically tracks your transactions and account balances. I first ran into Plaid while hooking up Robinhood (which I don't use anymore — don't use it), and it was exactly what I wanted here. I also wanted a Monte Carlo retirement-projection feature, another favorite of mine, so I planned for that too.

I worked through Plaid's docs to understand how the API talks to an application, then implemented that flow in Spring Boot. The timing worked out well — I was learning security and cryptography at the time, which gave me what I needed to encrypt the Plaid access tokens with AES-256-GCM (a mode built on CTR) instead of storing them in plain text.

### The Monte Carlo Engine
I started this project by building the core finance logic in C++, figuring it would be the fastest option for any calculation. I soon realized that was overkill for simple math — the overhead of moving data between a separate engine and the API would outweigh the calculation itself — so those stay in Java. My first idea for bridging the two was JNI, but that turned into a setup and maintenance headache, especially as logic started moving into the Java backend. OS pipes turned out to be the sweet spot: the C++ engine and Spring Boot talk through pipes with JSON, and the engine stays independently buildable and testable. That pays off where it counts — the C++ engine runs 10,000+ Monte Carlo simulation paths for retirement projections in seconds.

### The New Frontend
The frontend was scrapped and rebuilt in React Native. It was my first time working with a React-style frontend, so I learned how to structure components, use hooks, and manage state. But I kept thinking about how well QuickQuill worked as a PWA on my phone — a React and Tailwind CSS web app would carry far less overhead than React Native, and it would be a more conventional setup overall. So I migrated it again, this time to a plain React web app. It felt like the right call: one codebase focused purely on the web instead of juggling mobile platforms, and solid experience building a web app with React and Tailwind CSS.

### Deployment
I Dockerized the whole system and deployed it to a VPS on Google Cloud Compute Engine. These cheap VPSs are great for small projects and give you full control, but they can be a headache because they're so slow — and especially after unexpected charges forced me to move QuickQuill's hosting, I'm not sure I'd willingly use one again.

## What I Learned

- **Spring Boot & REST**
  - Keeping the backend boring is a discipline: thin controllers, services that own the logic, and repositories that just persist. That split is what let the API grow without fighting me.
  - A plain REST/JSON contract is a feature — because both halves of the app were simple on purpose, the frontend and backend never drifted apart.
  - Spring Data JPA and Hibernate for database interaction — understanding what's happening under the hood matters more than the convenience of the annotations.
- **Database Design with JPA**
  - Money is `BigDecimal`, never floating point — balances must not drift, and combining `@Positive` amounts with an explicit transaction `type` keeps deposits and withdrawals unambiguous.
  - Idempotency by constraint: a unique `plaid_transaction_id` on transactions means re-syncing updates the row instead of duplicating it. Design for re-runs — your data will be re-synced.
  - Skipping `@OneToMany` collections. Hanging every table off a `user_id` foreign key and joining by explicit ids made per-user data isolation nearly free.
  - Letting Hibernate auto-generate the schema (`ddl-auto=update`) gets you moving fast, but it's a convenience I'd hand back to proper migrations once real users exist.
- **Security & Cryptography**
  - Secrets at rest are only safe if encrypted at rest: Plaid `access_token`s stored as AES-256-GCM ciphertext and decrypted only server-side, right before use.
  - Defense in depth is layers, not a lock — `@JsonIgnore` so the token can never serialize to the frontend, and a standing rule to never log it.
  - Auth that ships today but can grow tomorrow: BCrypt password hashing and expiring UUID session tokens instead of JWTs — no re-architecture needed to add more later.
  - Cryptography isn't as scary as it sounds once you learn how the pieces combine — AES-GCM is really CTR mode with an authentication tag.
- **External Integrations: Plaid & FinnHub**
  - The whole Plaid flow is a token handshake: a `link_token` to open Link, a single-use `public_token` as proof of linking, exchanged server-side for the permanent `access_token`.
  - Keep the exchange on the backend — the `client_secret` never leaves the server, which is what keeps banking credentials out of the browser entirely.
  - Webhooks over polling: Plaid pings the backend when a transaction posts or a balance changes, so syncs happen only when there's something new — no wasted calls, no rate-limit drama.
  - The generated Plaid SDK dragged in OkHttp, Retrofit, and Gson for a single integration — calling the API directly kept the dependency tree honest.
  - Reading an API's docs carefully is a real skill: understanding how Plaid talks to an app before writing code is why the Spring Boot implementation went smoothly.
- **React & Tailwind CSS**
  - Components, hooks, and state — my first real React-style frontend, and the discipline of a small component kit (`Card`, `StatTile`, `Button`) meant new screens looked right by construction.
  - You don't need a chart library when three primitives suffice: a hand-rolled SVG `AreaChart` with tabular numerals matched the engraving aesthetic in a way a widget never would.
  - Hot reload is a superpower — style a screen and see it instantly, which makes iterating on the UI dramatically faster than the native build loop.
  - Building the same product across Swift, React Native, and React is the fastest way to learn what each approach actually costs — and why the PWA (like QuickQuill) won.
  - Thinking about UI differently on a phone versus the web: one codebase, focused purely on the web, with no platform juggling.
- **C++ Where Speed Matters**
  - When C++ earns its keep: `std::normal_distribution` and `std::accumulate` driving 10,000+ Monte Carlo simulation paths in seconds — that's native compute paying off.
  - Streaming between C++ and Java over OS pipes with JSON is a surprisingly clean bridge that keeps the engine independently buildable and testable with Catch2.
  - JNI looked elegant and turned out to be a setup and maintenance headache — an interop bridge only works if it doesn't own your life.
  - "Fastest language" is the wrong instinct for a simple calculation — the cost of streaming across a process boundary outweighs the math itself.
- **Deployment & Operations**
  - Dockerizing the whole system — frontend, backend, database — behind nginx made the app reproducible and portable.
  - Cheap VPS hosting is a real trade: full control and a low price, but slow machines and operational friction — and after unexpected charges forced me to move QuickQuill, I know its limits.
  - Self-hosting is a stance: when the whole stack is yours, your financial data isn't a line item in someone else's business.

## Where It Stands
I have the finance tracker I've wanted to build for a long time, and it works well. Plaid is integrated into the backend, and I can link my bank accounts to the app and have it automatically track my transactions and account balances. The Monte Carlo retirement projection feature runs 10,000+ simulation paths in seconds. The frontend is built with React and Tailwind CSS, and it works well on both mobile and desktop. The app is deployed to a VPS, and I can access it from anywhere.