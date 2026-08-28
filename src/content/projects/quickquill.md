---
name: "QuickQuill"
title: "Why I Built a Writing Tool for Distraction-Free Authors"
description: "A distraction-free writing environment engineered for long-form authors who demand ownership of their work. Real-time collaborative editing runs on a CRDT sync layer backed by a durable Postgres event log, ensuring zero content loss under any failure mode."
stack: ["TypeScript / Angular 21", "Java / Spring Boot", "PostgreSQL", "C++17 / Crow", "Docker"]
href: "https://github.com/nickczak/QuickQuill-Dictionary-SpellChecker"
gif: "quickquill-demo.gif"
liveHref: "https://quickquill.ink"
---

## The Problem

Long-form writers face a persistent tension between distraction-free simplicity and the collaborative features modern workflows demand. Existing tools either strip away collaboration entirely or bury the writing experience under menus and toolbars. Writers also worry about data ownership — cloud-first editors lock content behind proprietary APIs, and local-only editors sacrifice real-time sync.

QuickQuill was built to resolve this: a minimal, focused writing environment that supports real-time collaboration without compromising on content ownership or offline resilience.

## Architecture

The system is split into four layers:

- **Frontend** — An Angular 21 SPA with a single-pane editor surface. No chrome, no sidebars during active writing. The UI stays out of the way until you need it.
- **Backend API** — A Spring Boot service handling document CRUD, user auth, and session management. Stateless and horizontally scalable.
- **Sync Engine** — A C++17 service built on Crow that implements CRDT-based conflict resolution. Operations are serialized as events and appended to a Postgres event log, giving every edit a durable, replayable history.
- **Data Layer** — PostgreSQL stores both the current document state (materialized from the event log) and the raw event stream. This dual-write approach allows fast reads and full auditability.

The CRDT layer was the most technically demanding piece. Rather than using an off-the-shelf library, the conflict resolution logic was implemented from scratch to maintain control over the operational transform semantics and keep the binary footprint small.

## Key Decisions

**C++ for the sync engine.** The CRDT logic is CPU-bound and latency-sensitive. A native service eliminates garbage collection pauses and gives predictable sub-millisecond operation merging, which matters when multiple users are typing simultaneously.

**Event sourcing over state sync.** Storing edits as an immutable event log rather than overwriting document state means every change is auditable, reversible, and recoverable. If a client disconnects mid-edit, the server can replay from the last acknowledged event.

**Angular over lighter frameworks.** For a tool that might grow into a full writing platform, Angular's opinionated structure and dependency injection system pay off at scale. The initial overhead was worth the long-term maintainability.

## Results

QuickQuill runs at [quickquill.ink](https://quickquill.ink) with real-time collaboration supporting multiple simultaneous editors. The CRDT engine handles conflict resolution transparently — even under network partitions, documents converge correctly once connectivity is restored. The event-sourced backend means zero content loss across any failure mode.
