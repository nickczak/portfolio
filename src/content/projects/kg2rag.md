---
name: "KG²RAG"
title: "KG²RAG — Reducing Retrieval Noise in Knowledge Graph RAG"
description: "Extending the open-source KG²RAG framework to investigate how irrelevant information introduced during knowledge-graph-guided retrieval affects question-answering performance. The research explores semantic filtering and cross-encoder reranking for multi-hop questions."
status: "Neurosymbolic AI Research Project · In Progress"
stack: ["Python", "Knowledge Graphs", "Sentence Transformers", "Semantic Similarity", "RAG", "HotpotQA"]
href: "https://github.com/nickczak/KG2RAG-noise-retrieval"
gif: "kgrag_final_demo.png"
readingTime: 1
date: "10.29.2026"
---

## Research Focus

This project extends the open-source KG²RAG framework to investigate how irrelevant information introduced during knowledge-graph-guided retrieval affects question-answering performance.

The work explores semantic filtering and cross-encoder reranking to reduce retrieval noise while preserving the supporting evidence needed for multi-hop questions.

## Planned Experiments

The experiments will compare the original KG²RAG pipeline against modified retrieval strategies on HotpotQA, evaluating:

- Answer quality.
- Retrieval relevance and preservation of supporting evidence.
- Token usage.
- Latency.

The research is in progress. These experiments are planned comparisons; no measured improvements are claimed yet.

## Research Foundation

*Based on the 2025 KG²RAG research implementation by Zhu et al. This project focuses on experimental extensions to the original framework.*

The original work is [Knowledge Graph-Guided Retrieval Augmented Generation (Zhu et al., NAACL 2025)](https://aclanthology.org/2025.naacl-long.449/), with its [research implementation maintained by nju-websoft](https://github.com/nju-websoft/KG2RAG). The original framework and published results belong to that work; this project's contribution is the investigation of retrieval-noise reduction strategies.

Follow the experimental extension on [GitHub](https://github.com/nickczak/KG2RAG-noise-retrieval).
