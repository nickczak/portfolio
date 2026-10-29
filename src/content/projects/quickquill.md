---
name: "QuickQuill"
title: "Why I Built a Writing Tool for Distraction-Free Authors"
description: "QuickQuill is a simple writing environment with a quick search dictionary and spellchecker. The app has features such as spellchecking (Did you mean ...?), similar search, word suggestions (Synonym selection), autocomplete, and more."
status: "Writing & Dictionary Platform"
stack: ["TypeScript / Angular 21", "Java / Spring Boot", "PostgreSQL", "C++17 / Trie Tree", "Docker"]
href: "https://github.com/nickczak/QuickQuill-Dictionary-SpellChecker"
gif: "quickquill-demo.gif"
liveHref: "https://quickquill.ink"
readingTime: 5
date: "08.30.2026"
---

## Origin

QuickQuill began as a personal project to continue where my data structures class at UMBC left off. I wanted to explore creating these structures on my own, specifically a Trie tree. At first, the project was a small data structure aimed to store 20,000 or so words in a Trie tree with spellchecking capabilities. The core logic of the Trie tree didn't take long to implement, but I wanted to make it more useful. I wanted to add features like quick lookup, knowing that C++ is a fast language and would be able to handle the Trie tree with ease. I must have spent weeks looking for the class structure that I wanted to use — how was I to connect a Dictionary class to a Trie class that was actually starting to scale into a proper project? It took a lot of trial and error.

## Building QuickQuill

### A C++ Application

At first I wanted to keep this whole project in C++ and make it a command line tool, but I started getting curious about hosting it on the web. I wanted to make it a web application that could be used by anyone. To keep the project in C++, I used Crow — a C++ web framework. With that, I created a REST API that would allow users to send requests that would touch the Dictionary and SpellChecker layers that rely on the Trie tree. To keep the frontend minimal to match my minimal knowledge of frontend development at the time, I built a very simple frontend.

At UMBC we don't use any frameworks so I had experimented with testing this application without a framework but I quickly remembered how miserable that is to read and run. I explored gtest but quickly realized that was a bit too much for this project, so I ended up landing on the Catch2 testing framework. This was perfect for the project because it was easy to use and lightweight.

Now that this application took shape as a full dictionary website, I needed to not only find dictionary data, but I also needed to find a way to store it. I found a free dictionary JSONL Wiktionary extract courtesy of [kaikki.org](https://kaikki.org/), which was perfect for what I wanted. I created a Python script that would parse the JSONL file and insert the data into a SQL database. I then created a Database class that would access that SQL file via SQLite3 and "load" the Trie tree on application startup. Currently, when a user makes a request, if the word is not in the thread-safe LRU cache storing 10,000 words, it touches the Trie tree. The application will then search the Trie for the word ID in O(L) time, where L is the length of the word. Once the word ID is found (-1 if the word is not found), the database is queried for the word data and returned to the user. The database currently holds about 1.2+ million words and their data.

### Migrating to Java and Angular

After creating On The Money and seeing how I wanted to keep practicing my Java skills, I decided to migrate the backend to Java and Spring Boot. I moved all data storage except the actual dictionary data to a PostgreSQL database to migrate the API to Spring Boot. While building On The Money I learned how to use Hibernate / Spring Data JPA to make database access easier and more maintainable, so the switch wasn't hard. The search and spellchecking logic remained in C++ which now is more of an engine. My work at ZipTip required that I learn Angular and I wanted to continue practicing that using my personal projects. I decided to finally clean up the frontend of the project by completely rewriting it in Angular. I also wanted to make the frontend more user friendly and add some features that would make it more useful. On top of the quick search dictionary and spellchecker, I also added a writing environment. But that required that I keep that data to an account, so I also then added user authentication as well as a database to store said user data (includes search history and suggested words).

### Deployment

I wanted to manually deploy this project to a server that I had access to, so I decided to use Docker to containerize the application. This is where I really learned about CI/CD through GitHub Actions — the deployment system builds a fresh Docker image on push and deploys automatically. I also learned how to use Docker Compose to manage multiple containers and their dependencies, and how to use Docker volumes to persist data across container restarts. The app now runs on Render and Vercel: the Spring Boot backend, backed by managed PostgreSQL, is deployed to Render as a Docker image, and the Angular frontend ships as a static build to Vercel.

The only caveat is that Render's free tier stops a service after 15 minutes of inactivity, so the first request after a period of inactivity will take a while to load. But for a small website like this, it's not a big deal.

## What I Learned

This was my first web-hosted project that I've built and maintained in a public git repo. I've learned a lot about how to build a web application and how to deploy it.

- **C++ Where Speed Matters** 
  - Learned how to structure a real C++ application and make it configurable with tools like CMake and vcpkg
  - Pushed through the trial and error of class structuring and trade-offs that only come up when building something real
  - Learned about threading to serve multiple requests at once, which was a fun challenge to implement
- **Spring Boot**
  - Spring Boot has a lot of "magic" — if you don't learn what's happening under the hood, you'll get lost
  - Got hands-on experience with Spring Data JPA and Hibernate for database interaction
  - Integrated authentication using UUID token sessions and BCrypt; moved credentials into validated JSON request bodies and added regression tests for rejected URL/form credentials and sensitive error output
- **Angular**
  - Angular and TypeScript were both new to me — learned how to structure an Angular app and use the CLI to generate components, services, and modules
  - Used Angular's dependency injection to make the frontend more maintainable
  - Learned reactive forms and RxJS for handling asynchronous data streams alongside HttpClient for API calls
- **Git & GitHub**
  - This is where I really learned how to use Git and developing a workflow that works for me.
  - Learned how to use GitHub Actions to automate deployment and testing, which was a huge time saver
  - I also really got into make my public repos look nice and professional, which I continue to do with all my projects since
- **Docker / Deployment**
  - Learned how to containerize an application and automate its deployment through GitHub Actions
  - Learned how to use Docker Compose to manage multiple containers and their dependencies
  - Learned how to use Render and Vercel to host a full-stack application, including a PostgreSQL database

## Where It Stands

I'm proud of how far QuickQuill has come. It started as a simple Trie tree implementation and has grown into a full-featured writing tool with a cool "Dark Academia" aesthetic. There's plenty of room for improvement, but the core functionality is solid. I plan to continue maintaining it and adding features as I learn more about web development and user experience.
