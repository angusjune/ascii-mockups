export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="font-serif text-5xl text-near-black">ASCII Mockups</h1>
      <div className="rounded-[12px] bg-ivory px-6 py-3 ring-border-warm">
        <span className="font-mono text-charcoal-warm">the quick brown fox ┌─┐</span>
      </div>
      <button className="rounded-[8px] bg-terracotta px-4 py-2 text-ivory ring-1 ring-terracotta">
        Copy ASCII
      </button>
    </main>
  )
}
