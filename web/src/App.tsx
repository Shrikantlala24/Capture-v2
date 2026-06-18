import { NavLink, Route, Routes } from 'react-router-dom'
import AsciiLogo from '@/components/AsciiLogo'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import Analyze from './pages/Analyze'
import History from './pages/History'
import Landing from './pages/Landing'

const navItems = [
  { label: '[+] home', to: '/' },
  { label: '[+] analyze', to: '/analyze' },
  { label: '[+] history', to: '/history' },
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'inline-flex items-center rounded-sm border border-transparent px-3 py-2 text-sm text-muted-foreground transition-colors',
    isActive && 'border-border bg-card text-foreground',
  )

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <NavLink to="/" className="flex flex-col gap-2">
              <AsciiLogo />
              <div className="text-sm text-muted-foreground">
                Capture is a DSA reasoning terminal for humans.
              </div>
            </NavLink>
            <div className="flex flex-col gap-3 sm:items-end">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                [x] web interface / local-first / mono mode
              </div>
              <NavLink to="/analyze" className={buttonVariants()}>
                Start session
              </NavLink>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} end className={navLinkClass}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="text-sm text-muted-foreground">
              [!] streamlit untouched · history stays in browser storage
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between">
          <span>[+] Capture UI for structured DSA practice.</span>
          <span>[+] Results are cached in this browser only.</span>
        </div>
      </footer>
    </div>
  )
}

export default App
