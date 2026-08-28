---
name: "On The Money"
title: "Stop Splitting Finances Across Five Apps: Build Your Own"
description: "A full-stack personal finance system that tracks accounts, transactions, net worth, credit score, and live market data through a Spring Boot REST API backed by PostgreSQL. A native iOS client built with Expo/TypeScript drives the interface, while an optional C++17 engine runs Monte Carlo simulations for retirement projections."
stack: ["Java 17 / Spring Boot 3.3", "TypeScript / Expo (React Native)", "PostgreSQL", "C++17 / Monte Carlo Engine", "Docker"]
gif: "onthemoney-demo.gif"
href: "https://github.com/nickczak/OnTheMoney-Finance-Tracker"
liveHref: "https://onthemoney.site"
---

## The Problem

Personal finance apps tend to fall into two camps: simple trackers that only show balances, or bloated platforms that try to do everything and end up doing nothing well. Most also require linking bank accounts through third-party aggregators, which raises privacy concerns and introduces a single point of failure.

On The Money was built as a self-hosted alternative — a system that gives full visibility into financial health without surrendering data to a third party. It tracks accounts, transactions, net worth, credit score, and market data, and adds a Monte Carlo simulation engine for retirement projections that most consumer apps either skip entirely or abstract behind a paywall.

## Architecture

The system has three main components:

- **Backend API** — A Spring Boot 3.3 REST service handling account management, transaction ingestion, market data polling, and credit score tracking. PostgreSQL stores all financial data with strict schema validation.
- **Mobile Client** — An Expo (React Native) app written in TypeScript. The interface is optimized for quick check-ins: net worth at a glance, recent transactions, and projection updates.
- **Simulation Engine** — A standalone C++17 service that runs Monte Carlo retirement projections. It ingests historical market data and user-defined parameters (savings rate, withdrawal rate, time horizon) and returns probability distributions for portfolio outcomes.

The backend and simulation engine communicate via a lightweight REST interface, keeping the coupling loose enough that the engine could be swapped or extended independently.

## Key Decisions

**Self-hosted by design.** Running your own finance system means your data never touches a third-party aggregator. The tradeoff is manual transaction entry or CSV import, but for users who prioritize privacy and control, that's an acceptable exchange.

**C++ for Monte Carlo.** Running 10,000+ simulation paths with varying market conditions is embarrassingly parallel but computationally intensive. A native engine completes in seconds what would take a JavaScript service significantly longer, making the feature feel instant rather than batched.

**Expo over native Swift.** The mobile client needs to run on iOS (and potentially Android later). Expo gives near-native performance with a single TypeScript codebase, and the hot-reload cycle made iterating on the UI dramatically faster than a pure native approach.

**Separate simulation service.** Keeping the Monte Carlo engine as its own service means it can be scaled independently, run on different hardware, or replaced with a more sophisticated model without touching the main API.

## Results

On The Money provides a complete financial dashboard: account balances, transaction history, net worth trends, credit score monitoring, and retirement projections — all from a self-hosted system. The Monte Carlo engine runs thousands of simulation paths in seconds, giving users a probability distribution rather than a single number. The Expo client delivers a responsive, native-feeling experience on iOS.
