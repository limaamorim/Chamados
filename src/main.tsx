// Inicia o React no elemento root do HTML e carrega os estilos globais.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Conecta o App ao HTML; StrictMode ajuda a identificar problemas durante o desenvolvimento.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
