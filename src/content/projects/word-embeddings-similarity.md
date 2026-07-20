---
title: Word Embeddings
date: 2026-06-20
description: A Java console app that does arithmetic on word meanings. Type "king - man + woman" and it returns queen, searching 400,000 words in parallel with virtual threads.
repo: https://github.com/ACoci86/word-embeddings-similarity
image: /images/embeddings-cover.jpg
tech:
  - Java
  - Git
---
A Java console application that finds words similar in meaning to an
expression. You type `king - man + woman`, it does the maths, and it returns
`queen`.

## The idea

Every word is represented as 50 numbers, a vector, taken from Stanford's
[GloVe](https://nlp.stanford.edu/projects/glove/) dataset. Words used in
similar contexts end up with similar vectors, which means meaning becomes
something you can do arithmetic on.

Subtract the vector for `man` from `king`, add `woman`, and you land in a
region of the space whose nearest neighbour is `queen`. The app evaluates that
expression, then ranks all 400,000 known words by how close they sit to the
result.

## What it does

- Load a GloVe embeddings file, with a progress bar
- Evaluate an expression using `+`, `-`, `*` and `/`, validated before it runs
- Rank every word by one of three similarity metrics
- Configure the output file and how many results to return
- Save results with the original expression and a timestamp

## How it's built

Thirteen small classes, each with one job.

![Class diagram: Menu drives the app, SimilaritySearch ranks candidates, three metrics plug into a common interface](/images/embeddings-design.jpg)

The shape worth noticing is the `SimilarityMetric` interface. Cosine
similarity, dot product and Euclidean distance all implement it, so
`SimilaritySearch` never knows which one it is using. Adding a fourth metric
means writing one class and adding one enum value, and touching nothing else.

## Decisions, and what they cost

### The metric is an interface, not a switch statement

The easy version is a switch inside the search: if cosine do this, if
Euclidean do that. It works, and every new metric then means editing the search
code, which is the one piece that must stay correct.

Behind the interface, each metric is a few lines that can be read and checked on
its own, and the search is written once.

### Sort direction belongs to the metric, not the caller

This one bit me. Cosine similarity and dot product give higher scores to closer
words. Euclidean distance is the opposite: it measures distance, so *lower* is
closer. Sorting all three descending puts the worst possible matches at the top
for one of them.

The fix was to let the metric type declare which way it sorts, rather than
expecting whoever calls it to remember. Getting this wrong is quiet: nothing
crashes, you just get confidently wrong answers, which is the worst kind of bug
to ship.

### Vectors are cloned before arithmetic

The expression evaluator clones the first word's vector before working on it.
Without that clone, an operation that modified its input in place would corrupt
the stored vector for that word, and every later search would be subtly wrong in
a way that only appears after you have used the word once.

It costs one array copy per expression. Cheap insurance against a bug that would
be genuinely hard to track down.

## Concurrency, and what I would change

The file loads with one virtual thread per line, and the search forks a virtual
thread per word inside a `StructuredTaskScope`. Structured concurrency was the
point of the exercise, and it does what it says: `join()` waits for every forked
task, and the scope guarantees nothing outlives the block.

Being honest about it, though, this is not where virtual threads pay off.
They are built for work that spends its time waiting, on a network or a disk.
Scoring a word against a target vector is 50 multiplications, pure CPU with no
waiting at all, so forking 400,000 threads to do 400,000 tiny sums spends more
on coordination than the sums cost.

The version I would write now splits the words into as many chunks as there are
cores and gives each chunk one task. Same structured concurrency, same
correctness, a fraction of the overhead. Writing it the fork-per-word way is
what taught me the difference between work that blocks and work that computes,
which is not a distinction I would have felt from reading about it.

## What's next

- Chunked parallelism, as above.
- Tests. There are none, and the metrics are pure functions that would be easy to test.
- Support for the larger GloVe files, where 50 dimensions becomes 100 or 300.
