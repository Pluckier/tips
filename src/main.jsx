import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Tips from './Tips.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Tips />
  </StrictMode>,
)
