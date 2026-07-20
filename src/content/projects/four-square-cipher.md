---
title: Four Square Cipher
date: 2026-06-20
description: A Java console app that encrypts files and web pages with the Four Square Cipher, scrambling the letters while leaving spaces, punctuation and numbers exactly where they were.
repo: https://github.com/ACoci86/four-square-cipher
image: /images/cipher-cover.jpg
tech:
  - Java
  - Git
---
A console application that encrypts and decrypts text files, or pages fetched
straight from a URL, using the Four Square Cipher.

## How the cipher works

Four 5x5 grids of letters. Two hold the plain alphabet, two are scrambled by a
keyword you choose.

Letters are encrypted in pairs. Find the first letter in the top-left grid and
the second in the bottom-right, and those two positions form the corners of a
rectangle. The other two corners, read from the scrambled grids, are the
encrypted pair.

![The four 5x5 matrices, two plain and two scrambled by the keyword JAVA](/images/cipher-matrices.jpg)

Because the grids are 5x5 they hold 25 letters, not 26, so J and I share a cell.
That is the classic form of the cipher, and it has a consequence I come back to
below.

## What it does

- Generate random keywords, use one for both squares, or set two different ones
- Encrypt or decrypt a local file, or a page downloaded from a URL
- Keep spaces, punctuation and numbers exactly where they were
- View the four matrices to inspect the current configuration
- Change keys at any time without restarting

## Decisions, and what they cost

### Letters are pulled out, encrypted, then threaded back

This is the part I like. The cipher only knows how to handle pairs of letters,
but real text is full of spaces, commas and digits that must survive untouched.

Rather than teach the cipher about punctuation, the text is walked three times.
First pull every letter into one string, ignoring everything else. Encrypt that
string in pairs, knowing it is nothing but letters. Then walk the original text
again and, wherever there was a letter, drop in the next encrypted one, copying
everything else across unchanged.

So `Meet me at noon, bring the 3 keys!` comes back as
`OABT OA BP NMMN, AQFNG QHV 3 HCXS!` with the comma, the space and the `3` in
exactly their original places.

The cipher never learns what a comma is, and the formatting code never learns
what encryption is. Keeping those two jobs apart is what makes both of them
simple.

### One method for both directions

Encrypting and decrypting are the same procedure with the grids swapped: look up
in the plain squares and read from the scrambled ones, or the reverse. So there
is one `processText` method and a boolean, rather than two nearly-identical
methods that could drift apart when only one gets fixed.

## The limits, honestly

This is an exercise in implementing a historical cipher, not something to
protect anything with. Two limits are worth stating plainly.

### J and I cannot be told apart

The 5x5 grid has 25 cells for 26 letters, so J is folded into I before
encryption. That is how the cipher has always worked, but it means the fold is
one-way: `JAVA` encrypts fine and decrypts to `IAVA`. The J is not recoverable
because the information was discarded on the way in.

### Odd-length text loses its last letter

The cipher works on pairs, so text with an odd number of letters gets an `X`
appended to make the final pair. That padding letter has no slot to go back
into when the text is reassembled, so it is dropped from the output.

Which means it is gone at decryption time too, and the decrypt pads with a fresh
`X` that is not the character the encrypt actually produced. Since each output
letter depends on both letters of its pair, the last letter can come back wrong:

```
HELLO  ->  HVKKM  ->  HELLN
```

Five letters in, and the `O` returns as `N`. Even-length text round-trips
perfectly; odd-length text is a coin toss on the final character.

The fix is to stop throwing the padding away, either by keeping the extra
ciphertext letter or by recording that padding happened. I found this while
writing up the project rather than while building it, which is its own lesson:
the round-trip test that would have caught it takes about ten lines.

## What's next

- Fix the odd-length padding, as above.
- Tests, starting with encrypt-then-decrypt across a range of inputs.
- A proper flag for the J/I fold, so it is a stated behaviour rather than a surprise.
