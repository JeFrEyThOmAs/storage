# 🧼 DOMPurify – Complete Guide (Frontend + Backend)

## 📌 What is DOMPurify?

DOMPurify is a JavaScript library used to sanitize HTML and prevent XSS (Cross-Site Scripting) attacks.

👉 It removes dangerous content like:

- `<script>` tags
- onerror, onclick handlers
- malicious URLs (`javascript:`)

## ⚠️ Why do we need DOMPurify?

If you take user input and render it as HTML:

```html
<div id="output"></div>
output.innerHTML = userInput;
```

❌ This is dangerous because:

```html
<script>alert("Hacked")</script>
```

👉 This will execute in your browser → **XSS attack**

## ✅ What DOMPurify does
```js
def clean = DOMPurify.sanitize(dirtyHTML);
```

👉 Output:
- Removes unsafe tags
- Keeps safe HTML

## 🖥️ Frontend Implementation
### 📦 Step 1: Install
dnpm install dompurify
### 📌 Step 2: Basic Usage
dimport DOMPurify from "dompurify";
const dirty = `<img src=x onerror=alert("XSS") />`;
const clean = DOMPurify.sanitize(dirty);
document.getElementById("output").innerHTML = clean;
### 🔍 Example
**Input (User sends):**
```html<h1>Hello</h1><script>alert("hack")</script>```
**Output (After sanitize):**
```html<h1>Hello</h1>```
### ⚙️ Advanced Options
documentation for `DOMPurify.sanitize` with options like `ALLOWED_TAGS`, `ALLOWED_ATTR`, etc.
### 🔒 Prevent inline JS
documentation for forbidding attributes like `onerror`, `onclick`.
### 💡 React Example:
```jsx
import DOMPurify from "dompurify";
function App() {
  const dirty = `<img src=x onerror=alert("XSS") />`;
  return (
    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(dirty) }} />
  );
}
default App;
default export;
default function;
default ReactComponent;
default ReactApp;
default ReactExample; // Placeholder for React component code.
'to be continued...

app.use((req, res, next) => {
  if (req.headers.accept?.includes("text/html")) {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self';\
       script-src 'self' https://*.tailwindcss.com;\
       img-src 'self' https://images.unsplash.com;\
       style-src 'self' 'unsafe-inline';\
       connect-src 'self'"
    );
  }
  next();
});