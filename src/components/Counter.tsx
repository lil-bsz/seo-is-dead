interface CounterProps {
  displayCount: number
  isAnimating: boolean
}

export function Counter({ displayCount, isAnimating }: CounterProps) {
  return (
    <div>
      <div
        className={[
          'text-[clamp(4rem,12vw,8rem)] font-heading font-extrabold tabular-nums leading-none mb-2',
          'text-primary',
          'transition-transform duration-300 ease-out',
          isAnimating ? 'scale-105' : 'scale-100',
        ].join(' ')}
      >
        {displayCount.toLocaleString()}
      </div>
      <p className="text-base text-muted-foreground leading-relaxed">
        times someone on Reddit said<br />
        <span className="text-primary font-semibold italic">"SEO is dead"</span>
      </p>
    </div>
  )
}
