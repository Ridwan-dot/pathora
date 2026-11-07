import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)

// The built site arrives with the page already drawn, so React "hydrates" it.
// While developing (npm run dev) the page is empty, so React draws it fresh.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
