import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App.jsx'
import { ThemeProvider } from '@/lib/theme'
import { ConfirmProvider } from '@/components/shared'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <TooltipProvider delayDuration={200}>
        <ConfirmProvider>
          <App />
          <Toaster position="bottom-right" richColors closeButton />
        </ConfirmProvider>
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
)
