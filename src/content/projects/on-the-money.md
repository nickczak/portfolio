---
name: "On The Money"
title: "Stop Splitting Finances Across Five Apps: Build Your Own"
description: "On The Money is a self-hosted personal finance tracker that allows you to track your net worth, monitor transactions/account balances, and run Monte Carlo retirement projections while keeping your data private. Accounts can be linked via Plaid, giving real-time, hands-off tracking of your finances."
stack: ["Java 17 / Spring Boot 3.3", "TypeScript / React", "PostgreSQL", "C++17 / Monte Carlo Engine", "Docker"]
gif: "onthemoney-demo.gif"
href: "https://github.com/nickczak/OnTheMoney-Finance-Tracker"
liveHref: "https://onthemoney.site"
readingTime: 4
date: "08.31.2026"
---

## Origin

For a long time, I wanted to build something that gave me full visibility of my finances in one app, while not surrendering my data to a third party (with exception to plaid, which probably had my information anyway). I was tired of splitting my finances across five+ different apps, so I decided to build my own. The idea was to create a finance tracker that would allow me to track, specifically, my net worth. I understand that a lot of big corp backends utilize Java and Spring Boot, as well as C++ for very intensive and quick trading algorithms, so I decided to do the same (also I just wanted to learn Spring Boot and had prior knowledge of Java).  


## Building On The Money

### An iOS Native Application 
My first idea for this stack of this application was to build a backend in Java with Spring Boot like planned and then build a frontend native to iOS in Swift. I wanted this to be an app that I could sideload onto my phone and use is that way, so I learned Swift. I mainly used the SwiftUI framework to build the UI, and I was learning the structure in which that operates. It got to a point where I was just having AI generate the majority of arbitrary functions that needed to be called from libraries I wasn't familiar with and I didn't like it, it started to feel umanageable and that it was falling outside this projects scope. So after I started learning TypeScript for my work at ZiTip, I decided to switch the frontend to a React application.  

### The Plaid Backend & Monte Carlo Engine
ADD PLAID BACKEND INFO HERE
I started this project by building the core finance logic in C++. I figured that for any finance caulculation it would be the quickqest. But I soon realized that was unnecessary because I would have to stream the data from the C++ engine to the Java API, which would be a lot of overhead for a simple calculation and thus was quicker by just doing the calculations in Java. To create a connection between the C++ engine and the Java backend, I was originally going to use JNI, but I realized that it would be a lot of overhead and headache to set up, especially moving the core logic to the Java backend. So I decided to just stream the data from the C++ engine to the Java backend via OS pipes and JSON. Currently, the C++ engine now holds the Monte Carlo logic, running 10,000+ simulation paths for retirement projections in seconds, obviously C++ is much more advantageous for this type of calculation. 

### The New Frontend 
The frontend was completely scrapped and rebuilt in React Native. This was my first time building a React-esque frontend, so I learned how to structure compoenents, use hooks, and manage state. BUT! I remembered how well QuickQuill worked as a PWA on my phone, and then I realized that I could just use React and Tailwind CSS to make the app have less overhead. And since the current architecture followed a React Native fronted, it wasn't as optimized as it could be. So I migrated the frontend to a React web app. Which to me felt like a much better approach because it's a much more conventional frontend setup and gave me experience with using React and Tailwind CSS to build a web app. Not only that, but I could just focus on creating a web app compatible with just the web, and not have to worry about different mobile platforms.  

### Deployment

I Dockerized the entire system and deployed it to a VPS similar to QuickQuill, but this time I only copied the executables instead of the whole repo. These cheap VPSs are great for hosting small projects like this, and it gives you full control, but they can be such a headache because they're so slow, I'm not sure if I see myself continuing to willingly use this in the future.  


## What I Learned

- **Spring Boot**
  - Learned how to integrate outside APIs like Plaid and FinnHub into a Spring Boot application
  - Got comfortable with REST API design and how to structure controllers, services, and repositories
  - Learned Spring Data JPA and Hibernate for database interaction — understanding what's happening under the hood matters more than the convenience
- **React / Tailwind CSS**
  - Built my first frontend and learned how to think about UI differently on a phone versus the web
  - React's hot-reload cycle made iterating on the UI dramatically faster than a pure native approach
- **C++ Where Speed Matters**
  - Built a Monte Carlo system using std::normal_distribution and std::accumulate that can run 10,000+ simulation paths in seconds
  - Learned how to stream data between C++ and Java using OS pipes and JSON serialization 


## Where It Stands

I have a working finance tracker that allows me to track my net worth, monitor transactions/account balances, and run Monte Carlo retirement projections. That being said, the app requires manual input of transactions and account balances, which is okay but could be better. I plan to add Plaid integration in the future to allow for automatic transaction and account balance tracking, I also might change from FinnHub stock data to Plaid stock data. 

