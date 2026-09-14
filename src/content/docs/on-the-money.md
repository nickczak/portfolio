---
title: "On The Money — Technical Documentation"
description: "Architecture, data model, and design decisions behind the On The Money self-hosted finance tracker and its Monte Carlo engine."
project: "on-the-money"
stack: ["Java 17 / Spring Boot 3.3", "TypeScript / React", "PostgreSQL", "C++17 / Monte Carlo Engine", "Docker"]
updated: "08.31.2026"
---

## Architecture Overview

On The Money is a self-hosted personal finance system centered on a **Java / Spring Boot REST API** backed by PostgreSQL. A **C++17 engine** holds the Monte Carlo retirement simulation logic. A **React** frontend provides the dashboard.

The C++ engine communicates with the Java backend by streaming data over OS pipes using JSON — chosen over JNI to avoid setup overhead and tight coupling.

## Data Model

PostgreSQL stores accounts, transactions, and net worth history via Spring Data JPA / Hibernate.

The system relies on manual transaction and balance entry (cutting out third-party aggregators), with a plan to add Plaid integration for automatic syncing. Market data currently comes from FinnHub, with a possible move to Plaid data later.

## The Monte Carlo Engine

The simulation runs **10,000+ paths** for retirement projections in seconds.

I initially built the core finance logic in C++ assuming I would stream everything through the engine, but quickly found that overhead was unnecessary for simple calculations — so simple math lives in Java. The C++ engine is reserved for the genuinely compute-heavy Monte Carlo work, using `std::normal_distribution` and `std::accumulate` under the hood.

## Cross-Language Communication

Two paths exist. For the Monte Carlo output, the C++ engine streams results to the Java backend via OS pipes and JSON serialization.

JNI was considered and rejected — the setup overhead and tight coupling made it worse than a clean streaming boundary. This mirrors the same decision pattern used in QuickQuill.

## Frontend

The frontend started as a native SwiftUI iOS app, then moved to React (after learning TypeScript) and finally to a React web app with Tailwind CSS. The PWA approach removes app-store reload and sideload friction — QuickQuill proved the pattern works well on a phone.

## Deployment

The entire system is Dockerized and deployed to a VPS, similar to QuickQuill, but only the executables are copied rather than the whole repository.

Cheap VPSs offer full control but can be slow and a headache to operate — a tradeoff I'm evaluating for future hosting choices.

## Design Rationale

Self-hosting is the core design constraint: data never touches a third-party aggregator, and the tradeoff is manual entry or CSV import.

Keeping the Monte Carlo engine as its own service means it can be scaled, run on different hardware, or swapped for a more sophisticated model without touching the main API.
