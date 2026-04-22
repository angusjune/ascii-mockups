'use client'

export default function TopBar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border-cream bg-parchment px-4">
      <h1 className="font-serif text-[25px] font-medium text-near-black">ASCII Mockups</h1>
      <div className="flex items-center gap-2">
        <button className="rounded-[8px] bg-warm-sand px-3 py-1.5 text-sm text-charcoal-warm ring-ring-warm">
          New
        </button>
        <button className="rounded-[8px] bg-warm-sand px-3 py-1.5 text-sm text-charcoal-warm ring-ring-warm">
          Open
        </button>
        <button className="rounded-[8px] bg-terracotta px-3 py-1.5 text-sm text-ivory ring-1 ring-terracotta">
          Copy ASCII
        </button>
      </div>
    </header>
  )
}
