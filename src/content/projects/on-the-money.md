---
name: "On The Money"
title: "Stop Splitting Finances Across Five Apps: Build Your Own"
description: "A full-stack personal finance system that tracks accounts, transactions, net worth, credit score, and live market data through a Spring Boot REST API backed by PostgreSQL. A native iOS client built with Expo/TypeScript drives the interface, while an optional C++17 engine runs Monte Carlo simulations for retirement projections."
stack: ["Java 17 / Spring Boot 3.3", "TypeScript / Expo (React Native)", "PostgreSQL", "C++17 / Monte Carlo Engine", "Docker"]
gif: "onthemoney-demo.gif"
href: "https://github.com/nickczak/OnTheMoney-Finance-Tracker"
liveHref: "https://onthemoney.site"
---

## Origin

Personal finance apps tend to fall into two camps: simple trackers that only show balances, or bloated platforms that try to do everything and end up doing nothing well. Most also require linking bank accounts through third-party aggregators, which raises privacy concerns and introduces a single point of failure.

I wanted to build something that gave me full visibility into my financial health without surrendering my data to a third party. I also wanted the challenge of building a complete system from scratch — backend, mobile client, and a simulation engine that most consumer apps either skip entirely or put behind a paywall.

## Building On The Money

### The Backend

I started with the Spring Boot REST API. The core of the system is straightforward: account management, transaction ingestion, market data polling, and credit score tracking. PostgreSQL stores all financial data with strict schema validation.

The biggest learning curve was getting comfortable with Spring Data JPA and Hibernate. On the surface they make database access easy, but if you don't understand what's happening under the hood, debugging becomes a nightmare. I spent a lot of time understanding how entity relationships work, how to write efficient queries, and how to structure the service layer so the controllers stay thin.

### The Mobile Client

I chose Expo (React Native) over native Swift because I wanted the option to run on Android later without rewriting everything. The hot-reload cycle made iterating on the UI dramatically faster than I expected.

The interface is optimized for quick check-ins: net worth at a glance, recent transactions, and projection updates. I didn't want a bloated dashboard — just the numbers that matter, when you need them.

### The Monte Carlo Engine

This was the most interesting piece. I built a standalone C++17 service that runs Monte Carlo retirement projections. It ingests historical market data and user-defined parameters — savings rate, withdrawal rate, time horizon — and returns probability distributions for portfolio outcomes.

Running 10,000+ simulation paths with varying market conditions is embarrassingly parallel but computationally intensive. A native engine completes in seconds what would take a JavaScript service significantly longer, making the feature feel instant rather than batched. The backend and simulation engine communicate via a lightweight REST interface, keeping the coupling loose enough that the engine could be swapped or extended independently.

### Deploy

I Dockerized the entire system and deployed it to a VPS. This is where I really learned about deployment through GitHub Actions — the current setup holds the VPS SSH credentials so it can build a new Docker image and deploy automatically on push.

## What I Learned

- **Spring Boot**
  - Got comfortable with REST API design and how to structure controllers, services, and repositories
  - Learned Spring Data JPA and Hibernate for database interaction — understanding what's happening under the hood matters more than the convenience
- **React Native / Expo**
  - Built my first mobile app and learned how to think about UI differently on a phone versus the web
  - Expo's hot-reload cycle made iterating on the UI dramatically faster than a pure native approach
- **C++ for Compute**
  - Built a standalone Monte Carlo engine and learned how to integrate C++ services with a Java backend via REST
  - Learned that choosing the right language for the job matters — a native engine completes in seconds what JavaScript would take much longer to do
- **Self-Hosting**
  - Learned the tradeoffs of self-hosting: full control over your data, but you're responsible for uptime, backups, and deployment
  - Dockerized the entire system and learned how to deploy and maintain services on a VPS

## Key Decisions

**Self-hosted by design.** Running your own finance system means your data never touches a third-party aggregator. The tradeoff is manual transaction entry or CSV import, but for users who prioritize privacy and control, that's an acceptable exchange.

**C++ for Monte Carlo.** Running 10,000+ simulation paths with varying market conditions is embarrassingly parallel but computationally intensive. A native engine completes in seconds what would take a JavaScript service significantly longer, making the feature feel instant rather than batched.

**Expo over native Swift.** The mobile client needs to run on iOS (and potentially Android later). Expo gives near-native performance with a single TypeScript codebase, and the hot-reload cycle made iterating on the UI dramatically faster than a pure native approach.

**Separate simulation service.** Keeping the Monte Carlo engine as its own service means it can be scaled independently, run on different hardware, or replaced with a more sophisticated model without touching the main API.

## Where It Stands

On The Money provides a complete financial dashboard: account balances, transaction history, net worth trends, credit score monitoring, and retirement projections — all from a self-hosted system. The Monte Carlo engine runs thousands of simulation paths in seconds, giving users a probability distribution rather than a single number. The Expo client delivers a responsive, native-feeling experience on iOS.
