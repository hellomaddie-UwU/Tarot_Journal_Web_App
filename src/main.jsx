import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './main.css'
import './layout.css'
import './components.css'
import './animation.css'
import App from './App.jsx'
import { verifySupabaseConnection } from './lib/supabaseClient.js'

if (import.meta.env.DEV) {
  verifySupabaseConnection().then((result) => {
    if (result.ok) {
      console.info(result.message)
      return
    }

    console.warn(result.message)
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
