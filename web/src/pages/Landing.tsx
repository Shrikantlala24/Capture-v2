import { ArrowRight, Layers, LineChart, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const highlights = [
  {
    title: 'Signal in context',
    description:
      'Surface the concept tags and logic blocks before you start coding.',
    icon: Sparkles,
  },
  {
    title: 'Complexity first',
    description: 'See time and space tradeoffs at a glance, not after the fact.',
    icon: LineChart,
  },
  {
    title: 'Approach ladder',
    description:
      'Compare brute, better, and optimal strategies without context switching.',
    icon: Layers,
  },
]

const pills = [
  'Concept tags',
  'Logic blocks',
  'Error diagnosis',
  'Complexity notes',
  'Approach ladder',
]

export default function Landing() {
  return (
    <div className="space-y-16">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6 animate-fade-up">
          <p className="text-xs uppercase tracking-[0.45em] text-mist">Capture</p>
          <h1 className="text-4xl leading-tight sm:text-5xl">
            See the algorithm, not just the answer.
          </h1>
          <p className="text-lg text-mist">
            Capture turns DSA problems into structured reasoning. Go from raw
            statement to a clear strategy in one focused pass.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-sand shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow"
            >
              Start analyzing
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/history"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-5 py-2 text-sm font-semibold text-ink shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow"
            >
              View history
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {pills.map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-line bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-mist"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-card p-6 shadow-soft animate-fade-up">
          <div className="text-xs uppercase tracking-[0.4em] text-mist">
            Analysis snapshot
          </div>
          <div className="mt-5 grid gap-4">
            <div className="rounded-2xl border border-line bg-white/80 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-mist">
                Concept
              </p>
              <p className="text-lg font-semibold">Two pointers</p>
              <p className="text-sm text-mist">
                Reduce comparisons with a sliding boundary.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-white/80 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-mist">
                Complexity
              </p>
              <p className="text-lg font-semibold">O(n log n)</p>
              <p className="text-sm text-mist">Space stays O(1).</p>
            </div>
            <div className="rounded-2xl border border-line bg-white/80 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-mist">
                Next action
              </p>
              <p className="text-sm text-mist">
                Validate the optimal approach before coding.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {highlights.map((item, index) => {
          const Icon = item.icon
          return (
            <div
              key={item.title}
              className="rounded-3xl border border-line bg-card p-6 shadow-soft animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 text-ink shadow-soft">
                <Icon size={20} />
              </div>
              <h3 className="mt-4 text-xl">{item.title}</h3>
              <p className="mt-2 text-sm text-mist">{item.description}</p>
            </div>
          )
        })}
      </section>

      <section className="grid gap-6 rounded-3xl border border-line bg-card p-8 shadow-soft lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <h2 className="text-3xl">How Capture works</h2>
          <p className="text-mist">
            Paste the problem, optionally add your code, and let Capture return a
            structured analysis you can act on immediately.
          </p>
          <div className="grid gap-3 text-sm text-mist">
            <div className="flex items-center justify-between rounded-2xl border border-line bg-white/70 px-4 py-3">
              <span>Paste</span>
              <span>Problem statement + code</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-line bg-white/70 px-4 py-3">
              <span>Analyze</span>
              <span>Tags, logic blocks, complexity</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-line bg-white/70 px-4 py-3">
              <span>Apply</span>
              <span>Choose the right approach</span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl">Session history stays local</h3>
          <p className="text-sm text-mist">
            Every analysis you run is stored in your browser, ready to revisit
            when you need a reminder.
          </p>
          <Link
            to="/history"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-5 py-2 text-sm font-semibold text-ink shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow"
          >
            Browse past sessions
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
