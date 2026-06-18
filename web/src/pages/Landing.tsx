import { Link } from 'react-router-dom'
import AsciiLogo from '@/components/AsciiLogo'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const features = [
  'Intuition hooks before code',
  'Pattern labels and concept tags',
  'Three-level approach ladder',
  'Complexity snapshot',
  'Error diagnosis for code attempts',
  'Local browser session history',
]

const steps = [
  ['[+] paste', 'Problem statement, code, or raw intuition.'],
  ['[+] select', 'Choose whether you are new, stuck, optimizing, or thinking aloud.'],
  ['[+] inspect', 'Read hints, pseudocode, key code blocks, and similar problems.'],
]

export default function Landing() {
  return (
    <div className="flex flex-col gap-24">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="flex flex-col gap-6">
          <Badge variant="outline">[+] capture / dsa coach / web</Badge>
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium text-muted-foreground">
              The interface reads like a notes file, but the output is a guided
              reasoning session.
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
              See the algorithm before you see the answer.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Capture turns a DSA prompt into a structured walkthrough: what pattern
              it smells like, what approach tiers exist, where your current code is
              drifting, and what to try next without collapsing into spoiler soup.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/analyze" className={buttonVariants()}>
              Open analyzer
            </Link>
            <Link to="/history" className={buttonVariants({ variant: 'outline' })}>
              Read local history
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {features.map((feature) => (
              <Badge key={feature} variant="outline">
                [+] {feature}
              </Badge>
            ))}
          </div>
        </div>

        <Card className="border-border bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-primary-foreground">[x] terminal preview</CardTitle>
            <CardDescription className="text-primary-foreground/70">
              One dark surface. Everything else stays flat on cream.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm leading-7">
            <AsciiLogo />
            <div className="rounded-sm border border-primary-foreground/20 bg-primary-foreground/8 px-3 py-2 text-primary-foreground/90">
              {`> mode: "I'm stuck"
> pattern: sliding window
> hint: keep one invariant true while the right pointer moves
> next: compare brute vs optimal before coding`}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.16em] text-primary-foreground/60">
              <span>tab switch ladder</span>
              <span>ctrl-k inspect history</span>
              <span>local-only sessions</span>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-balance">[+] how it works</h2>
          <p className="max-w-2xl text-muted-foreground">
            This is not a code generator front disguised as a tutor. The flow is
            built to keep reasoning visible.
          </p>
        </div>
        <Separator />
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map(([label, body]) => (
            <Card key={label}>
              <CardHeader>
                <CardTitle>{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-muted-foreground">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-balance">[+] what the web app now feels like</h2>
          <p className="text-muted-foreground">
            Monospaced, flatter, and more deliberate. Hairline borders replace
            glow. ASCII markers replace decorative icons. The result panel reads
            more like a working notebook than a startup landing page.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>[+] local-first notes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm leading-7 text-muted-foreground">
            <p>[+] The browser stores session history for quick revisits.</p>
            <p>[+] You can bring your own Gemini API key from the analyze page.</p>
            <p>[+] The deployed Streamlit flows are left alone.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
