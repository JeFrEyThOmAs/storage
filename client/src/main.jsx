import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {GoogleOAuthProvider} from '@react-oauth/google'

const clientId = import.meta.env.VITE_CLIENT_ID
console.log(clientId)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)




// BIG WARNING TEXT
console.log(
  "%cSTOP!",
  "color: red; font-size: 60px; font-weight: bold; text-shadow: 2px 2px 5px rgba(0,0,0,0.3);"
);

// Subtitle
console.log(
  "%cThis is a browser developer console.",
  "font-size: 18px; font-weight: bold;"
);

// Main warning message
console.log(
  "%cIf someone told you to paste something here, it is a scam.\nPasting code here could give attackers access to your account.",
  "color: white; background: #ff4d4f; font-size: 14px; padding: 8px; border-radius: 4px;"
);

// Highlight danger
console.log(
  "%cDo NOT paste anything here unless you understand exactly what it does.",
  "color: red; font-size: 14px; font-weight: bold;"
);