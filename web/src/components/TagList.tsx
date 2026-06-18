import { Badge } from '@/components/ui/badge'

type TagListProps = {
  tags?: string[]
  emptyLabel?: string
}

export default function TagList({ tags, emptyLabel }: TagListProps) {
  if (!tags || tags.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel || 'No tags yet.'}</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge key={tag} variant="outline">
          [+] {tag}
        </Badge>
      ))}
    </div>
  )
}
