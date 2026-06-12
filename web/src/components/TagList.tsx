type TagListProps = {
  tags?: string[]
  emptyLabel?: string
}

export default function TagList({ tags, emptyLabel }: TagListProps) {
  if (!tags || tags.length === 0) {
    return <p className="text-sm text-mist">{emptyLabel || 'No tags yet.'}</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-line bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-mist"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}
