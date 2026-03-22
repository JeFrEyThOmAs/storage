# 🧠 1. Inline Scripts with HASH (no 'unsafe-inline')

## 📌 Problem

CSP normally blocks this:

```html
<script>
  console.log("hello");
</script>
```

👉 Because it’s inline ❌

✅ Solution: Allow ONLY this exact script using a hash

**Step 1:** Take the script content
```plaintext
console.log("hello");
```
**Step 2:** Generate SHA-256 hash

*Example:*
`sha256-abc123xyz...`

*(You can generate using tools or Node)*

**Step 3:** Add to CSP:
```plaintext
script-src 'self' 'sha256-abc123xyz...';
```

## 🎯 Result

✔ That exact script → allowed
❌ Any modified script → blocked

## 💥 Why this is powerful
Attacker tries:
```html<br>
<script>alert("hack")</script>
```
👉 Hash won’t match → ❌ blocked

## 🧠 Simple intuition
Hash = fingerprint of the script.
If fingerprint changes → blocked 🚫

## ⚠️ Limitation
Even a small change:
```plaintext<br>
printf("hello "); // extra space<br>
```
👉 New hash → old one won’t work.

---
# 🔐 2. What is integrity (SRI)?
This is for external scripts.

## 📌 Example:
```html<br>
e.g.,<br><script <br> src="https://cdn.jsdelivr.net/npm/library.js"<br> integrity="sha384-xyz123"<br> crossorigin="anonymous"><br></script>
```
## 🧠 What it does:
't Load this script ONLY if its content matches this hash.'
d'
e.g.,<br>"Load this script ONLY if its content matches this hash"
d'
d🔥 Why we need this:
even if source is trusted:
scrpt src="https://cdn.com/lib.js"></script>
d'
t👉 What if CDN gets hacked? 😬
d'
t💥 With integrity:
browser downloads script,
gcomputes hash,
and compares with given hash.
eif match:
wScript runs;
e not:
bocked.
d'
t🧠 Simple analogy:
cSP → “Where script can come from”;
integrity → “Is this EXACT file unchanged?”
d'
t🔍 Why use integrity even with 'self'? 
you asked this — good catch 👀 
normally:<br>`<script src="/app.js"></script>`<br>👉 Already trusted ('self')<br>But integrity adds extra layer.<br>👉 Protects against:<br>- server compromise<br>- file tampering<br>- build pipeline attacks.
d'
t🧠 Real-world thinking:
fFeature | What it protects |
hCSP | Where code comes from |
hIntegrity | Whether code was modified |
h🔥 Example combining both |
s `<script <br> src="/app.js"<br> integrity="sha256-abc123" ></script>`<br>script-src 'self';<br><br>👉 Now:<br>- Must come from your server ✅<br>- Must match hash ✅<br><br>⚠️ Important notes:<br>- ❌ Integrity does NOT work for inline scripts.<br>- Only for:<br>`<script src="..."></script>`<br>- ❌ Hash CSP ≠ Integrity<br>
definition | Use |
hash in CSP | inline scripts |
integrity | external scripts |
d'
t🧠 Final intuition:
hash in CSP → “Allow this exact inline code.”
integrity → “Verify this external file is unchanged.”
d'
t⚡ One-line summary: 
hash allows specific inline scripts safely, and integrity ensures external scripts haven’t been tampered with.