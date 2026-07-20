---
title: Express Tech Shop
date: 2026-06-25
description: A full-stack shop for desk tech, with accounts, a cart, and a checkout that cannot oversell stock even when two people buy the last item at once.
repo: https://github.com/ACoci86/express-tech-shop
image: /images/tech-shop-cover.jpg
tech:
  - JavaScript
  - Node
  - Express
  - SQL
  - Git
---
A full-stack shop for desk tech accessories: browse products, manage a cart,
check out, and see your order history.

Live at
[express-tech-shop.onrender.com](https://express-tech-shop.onrender.com).

## Why I built it

I wanted to build the parts of a web app that are easy to get subtly wrong.
Anyone can render a product grid. Sessions, password storage, and a checkout
that stays correct when two people click Buy at the same moment are where the
real thinking is, and they are the things a shop cannot afford to fumble.

So it is a small catalogue on purpose. The interesting code is behind it.

## What it does

- Register, log in and out, with hashed passwords and session cookies
- Product grid and detail pages showing live stock
- A cart you can add to and remove from, one row per user and product
- Checkout that creates the order, reduces stock, and empties the cart
- Order confirmation and a history of your past orders

![The cart page, with line items and a running total](/images/tech-shop-cart.jpg)

## How it's built

Express 5 on Node, EJS for the views, and Postgres hosted on Neon. Routes are
split by concern: auth, products, cart, checkout, orders. A single `requireAuth`
middleware protects everything that needs a logged-in user, so no route has to
remember to check for itself.

Five tables, with foreign keys cascading on delete: users, products, cart_items,
orders, order_items. `cart_items` carries a unique constraint on the user and
product pair, so a cart physically cannot hold the same product twice.

## Decisions, and what they cost

### Checkout is one transaction, not five steps

Buying does five things: read the cart, create the order, write the line items,
reduce the stock, clear the cart. Any of them can fail.

They all run inside one database transaction, so either the whole purchase
happens or none of it does. Without that, a failure halfway through leaves the
worst kind of mess: stock reduced for an order that does not exist, or an order
whose items were never recorded. There is no sensible way to clean that up
afterwards, so the fix is to make it impossible.

### The database enforces the stock rule, not the app

This is the part I would defend hardest.

The obvious way to prevent overselling is to check stock, then reduce it. It
reads naturally and it is wrong: two people can both pass the check before
either one writes, and the last item sells twice.

So the check lives inside the write:

```sql
UPDATE products SET stock = stock - $1
WHERE id = $2 AND stock >= $1
```

If the stock is no longer there, the row simply does not update, and the code
notices that nothing changed and rolls the whole order back. Two simultaneous
buyers are settled by the database, which is the only thing that can see both of
them.

There is still a friendly pre-check before this, purely so the common case gets
a clear "not enough stock" message rather than a mysterious failure. That check
is for the message. The conditional update is the correctness.

### Passwords are hashed, never stored

Passwords go through bcrypt and only the hash is kept. The app cannot tell you
your password, only whether a guess matches. If the database were ever exposed,
what leaks is hashes rather than credentials people have reused on other sites.

### Sessions instead of re-authenticating

Logging in issues a signed session cookie, so later requests prove who you are
without sending the password again. The secret that signs it lives in the
environment, never in the code, and `.env` is git-ignored.

## The parts that were actually hard

### Two buyers, one item

The bug that shaped the whole checkout. My first version checked stock in
JavaScript and then updated the row. It passed every test I could perform by
hand, because I cannot click twice in the same millisecond.

It is wrong in exactly the window between the check and the write. Moving the
condition into the SQL closed that window, and inspecting the affected row count
is what tells the app the race was lost. My code was fine; my assumption that
nothing else could happen mid-request was not.

### Deciding what a cart row means

An early version let the same product appear twice in a cart, because adding it
twice inserted two rows. The fix was not in the add-to-cart code. It was
deciding that "one row per user and product" is a rule, then letting the
database enforce it with a unique constraint and adding to the quantity instead.

Rules that live in the schema hold. Rules that live in whichever handler
remembers them do not.

## What's next

- Tests. The checkout logic is the most important code here and nothing guards it.
- Real payments, currently orders are marked paid on creation.
- Admin screens for adding products, which is a manual database job today.
