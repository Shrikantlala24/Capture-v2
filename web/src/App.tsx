import { NavLink, Route, Routes } from 'react-router-dom'
import Analyze from './pages/Analyze'
import History from './pages/History'
import Landing from './pages/Landing'

const navItems = [
  { label: 'Landing', to: '/' },
  { label: 'Analyze', to: '/analyze' },
  { label: 'History', to: '/history' },
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-full px-3 py-1 text-sm font-medium transition',
    isActive
      ? 'bg-ink text-sand shadow-soft'
      : 'text-mist hover:text-ink hover:bg-white/70',
  ].join(' ')

function App() {
  return (
    <div className="relative min-h-screen overflow-hidden text-ink">
      <div className="pointer-events-none absolute -top-24 left-[-12%] h-72 w-72 rounded-full bg-accent opacity-20 blur-3xl animate-float" />
      <div
        className="pointer-events-none absolute top-12 right-[-10%] h-80 w-80 rounded-full bg-accent2 opacity-20 blur-3xl animate-float"
        style={{ animationDelay: '2s' }}
      />
      <div className="relative z-10">
        <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 pb-4 pt-8">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-sand shadow-soft">
              C
            </span>
            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-mist">
                Capture
              </div>
              <div className="font-display text-2xl">DSA Analyser</div>
            </div>
          </NavLink>
          <nav className="flex flex-wrap items-center gap-2 rounded-full border border-line bg-white/70 p-1 shadow-soft backdrop-blur">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <NavLink
              to="/analyze"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-sand shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow"
            >
              Start analyzing
            </NavLink>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-6">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<Landing />} />
          </Routes>
        </main>

        <footer className="mx-auto w-full max-w-6xl px-6 pb-10 text-sm text-mist">
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
            <span>Capture UI for DSA analysis.</span>
            <span>History is stored locally in your browser.</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
