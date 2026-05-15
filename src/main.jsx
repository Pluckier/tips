import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Tips from './components/Tips.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Tips />
  </StrictMode>,
)
