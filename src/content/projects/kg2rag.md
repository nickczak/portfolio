---
name: "KG²RAG"
title: "KG²RAG — Reducing Retrieval Noise in Knowledge Graph RAG"
description: "Extending the open-source KG²RAG framework to investigate how irrelevant information introduced during knowledge-graph-guided retrieval affects question-answering performance. A pilot study explores semantic filtering, cross-encoder ranking, and graph-aware evidence recovery before planned multi-hop evaluation."
status: "Neurosymbolic AI Research Project · In Progress"
stack: ["Python", "Knowledge Graphs", "Sentence Transformers", "Semantic Similarity", "RAG", "HotpotQA"]
href: "https://github.com/nickczak/KG2RAG-noise-retrieval"
gif: "kgrag_final_demo.png"
readingTime: 7
date: "10.29.2026"
---

## Reducing Retrieval Noise in KG²RAG

*A pilot study of relevance filtering and graph recovery. Nicholas Sobchak · University of Maryland, Baltimore County · CMSC 491 Research Project · October 2026.*

Knowledge Graph-Guided Retrieval Augmented Generation (KG²RAG) uses a knowledge graph to expand retrieved passages, but that expansion can also introduce irrelevant information. This project investigates three ways to select evidence: semantic similarity filtering (SEM), cross-encoder ranking (CROSS), and graph-aware recovery (GRAPH).

In a pilot with one question and six handwritten passages, SEM retained five passages, CROSS retained three, and GRAPH recovered one connected passage for a total of four. These results illustrate how selection and recovery work. They do not yet establish an improvement in answer quality, evidence quality, token usage, or latency.

## Research Focus

Retrieval-augmented generation (RAG) supplies a language model with passages relevant to a question. KG²RAG extends that process by identifying semantically relevant seed chunks, expanding along knowledge-graph relationships, and organizing the resulting evidence. Graph expansion can gather useful context, but a connection in the graph does not guarantee relevance to the current question.

This project focuses on retrieval noise: evidence that does not help answer the query. I am investigating three questions:

1. Can semantic similarity screen out unrelated chunks?
2. Can a question–passage cross-encoder distinguish answer relevance from general similarity?
3. Can graph links recover useful indirect context that the other selectors exclude?

The original KG²RAG system already includes relevance-based organization and reranking of graph-derived evidence. My contribution is an experimental screening and recovery process, with the hypothesis that screening chunks while preserving useful paths could improve evidence precision and resource consumption.

## Background

Semantic RAG retrieves passages through vector similarity. Sentence-BERT provides a way to compare independently computed sentence embeddings using cosine similarity. For this pilot, I use `sentence-transformers/all-MiniLM-L6-v2`, a bi-encoder that produces a 384-dimensional vector for each text. Cosine similarity measures the alignment between the question and passage vectors.

The second model, `cross-encoder/ms-marco-MiniLM-L6-v2`, processes each question–passage pair jointly and produces a relevance-ranking score. This gives it a different role from the bi-encoder: it ranks a passage in the context of the specific question.

## Three Evidence-Selection Methods

The pilot compares all three methods on the same six candidate chunks, numbered 0 through 5. It does not yet run the full retrieval-and-generation pipeline.

### Semantic Similarity (SEM)

The bi-encoder maps the question and each chunk into embedding vectors. Their cosine similarity is the dot product of those vectors divided by the product of their lengths.

SEM retains every chunk with a cosine similarity of **0.50 or greater**. This tests semantic relatedness, but a related chunk does not necessarily contain evidence needed to answer the question.

### Cross-Encoder Relevance (CROSS)

The cross-encoder reads the question and each candidate chunk together, then assigns a ranking score. In the pilot, it scores all six chunks and retains the **three highest-ranked passages**.

CROSS is evaluated separately from SEM; it is not a sequential filter applied only to SEM's output. Running CROSS only on SEM-retained chunks is a possible future efficiency experiment because joint question–passage scoring adds computation.

### Graph-Aware Evidence Recovery (GRAPH)

GRAPH starts with the CROSS-selected chunks and adds one-hop neighbors connected by an allowed relation. Edges may be followed in either direction, but their relation labels must belong to a manually defined allowlist.

For example, an allowed link connects chunk 1, about Van Gogh's association with Post-Impressionism, to chunk 2, which describes that movement. Following this link restores chunk 2 after both SEM and CROSS exclude it.

This is a recovery mechanism based on manually defined graph links and permitted relations. It is not a general-purpose graph relevance classifier. Automating graph recovery remains a next step.

## Pilot Setup

The demonstration asks:

> What artistic movement influenced Vincent van Gogh's Starry Night?

The expected short answer in this example is **Post-Impressionism**. The six passages were handwritten for illustration rather than sampled from HotpotQA.

The Python implementation uses the `sentence-transformers` library with these settings:

- **Embedding model:** `sentence-transformers/all-MiniLM-L6-v2`.
- **Ranking model:** `cross-encoder/ms-marco-MiniLM-L6-v2`.
- **SEM threshold:** 0.50 cosine similarity.
- **CROSS selection:** Top 3 passages from all six candidates.
- **GRAPH recovery:** One hop through manually defined links with allowed relation labels.

## Observed Results

| ID | Passage topic | Cosine similarity | CROSS score | SEM | CROSS | GRAPH |
| --- | --- | ---: | ---: | :---: | :---: | :---: |
| 0 | Painting and artist | 0.765 | 4.198 | Yes | Yes | Yes |
| 1 | Artist and movement | 0.647 | 0.811 | Yes | Yes | Yes |
| 2 | Movement characteristics | 0.385 | -7.512 | No | No | Yes |
| 3 | Sunflowers | 0.636 | -2.484 | Yes | No | No |
| 4 | Night-sky description | 0.502 | -1.640 | Yes | Yes | Yes |
| 5 | Residence in Arles | 0.548 | -4.261 | Yes | No | No |

SEM selected **five of six chunks**. It retained the sunflower passage and the passage about Van Gogh's residence in Arles, although neither identifies the artistic movement.

CROSS selected **three chunks**, as configured, excluding both distractions. It also excluded the passage describing Post-Impressionism's characteristics, which received the lowest cross-encoder score.

GRAPH restored that movement description through the allowed link from chunk 1 to chunk 2, producing **four selected chunks**. Although the recovered passage does not directly connect Van Gogh's painting to the movement, it supplies context that could support a fuller explanation.

No generative language model was run. The effect on answer quality and output length remains unknown.

## What the Pilot Shows—and Its Limits

### Similarity Is Not Answer Relevance

The sunflower passage illustrates a limitation of similarity-only screening. A chunk can share the artist and general subject matter with the question without answering it. In this example, cross-encoder ranking separated those distractions from more directly related evidence.

### Recovery Can Add Context Without Adding a Necessary Fact

The recovered description explains Post-Impressionism, but the direct answer was already present in the evidence retained by SEM and CROSS. Recovering the passage demonstrates context preservation; it does not establish better answer correctness.

A future recovery rule could require the edge itself to be contextually relevant to the query, helping distinguish useful neighbors from other graph connections.

### Costs and Validity Still Need Measurement

Cross-encoder ranking and graph processing could increase end-to-end latency. The pilot recorded neither latency nor token usage.

The demonstration uses one question, six manually written chunks, a hand-labeled graph, and manually permitted relations. Since KG²RAG already performs graph-based organization and reranking, any claim of improvement requires a measured comparison against that baseline.

## Going Forward with KG²RAG

The proposed integration point is **after graph expansion and before evidence organization**. The planned benchmark is HotpotQA, the dataset used in the original KG²RAG research. Similarity thresholds, top-K selection, and relation-selection settings will be tuned on validation data.

The evaluation will compare the original pipeline against the modified retrieval strategies using:

- Supporting-fact precision, recall, and F1.
- Answer accuracy and answer F1.
- Input token usage.
- Filtering overhead and end-to-end latency.

The pilot illustrates three behaviors: semantic similarity retains broadly related text, a cross-encoder supplies a more question-aware ranking, and a graph rule can recover associated context. The next step is to automate graph recovery and test whether retrieval-noise reduction improves results on multi-hop questions.

## Research Foundation and References

*Based on the 2025 KG²RAG research implementation by Zhu et al. The original framework and published results belong to that work; this project investigates experimental retrieval-noise reduction strategies.*

- Zhu, X., Xie, Y., Liu, Y., Li, Y., and Hu, W. (2025). [Knowledge Graph-Guided Retrieval Augmented Generation](https://aclanthology.org/2025.naacl-long.449/). NAACL 2025, pp. 8912–8924.
- Lewis, P., et al. (2020). [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401). NeurIPS.
- Yang, Z., et al. (2018). [HotpotQA: A Dataset for Diverse, Explainable Multi-hop Question Answering](https://aclanthology.org/D18-1259/). EMNLP 2018, pp. 2369–2380.
- Zhu, X., et al. [KG2RAG source code](https://github.com/nju-websoft/KG2RAG). The baseline commit for the planned comparison has not yet been specified.
- Reimers, N., and Gurevych, I. (2019). [Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks](https://aclanthology.org/D19-1410/). EMNLP-IJCNLP 2019, pp. 3982–3992.
- [Sentence Transformers documentation](https://sbert.net/).
- [all-MiniLM-L6-v2 model card](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2).
- [ms-marco-MiniLM-L6-v2 cross-encoder model card](https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2).

Follow the experimental extension on [GitHub](https://github.com/nickczak/KG2RAG-noise-retrieval).
