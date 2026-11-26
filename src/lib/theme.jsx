import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({ theme: 'system', resolved: 'light', setTheme: () => {} })
const KEY = 'spm:theme'

const systemDark = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(KEY) || 'system' } catch { return 'system' }
  })
  const [sysDark, setSysDark] = useState(systemDark)

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    const on = (e) => setSysDark(e.matches)
    mq?.addEventListener('change', on)
    return () => mq?.removeEventListener('change', on)
  }, [])

  const resolved = theme === 'system' ? (sysDark ? 'dark' : 'light') : theme

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark')
    try { localStorage.setItem(KEY, theme) } catch { /* storage unavailable */ }
  }, [theme, resolved])

  return <ThemeContext.Provider value={{ theme, resolved, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
