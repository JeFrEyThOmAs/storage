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
