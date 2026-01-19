import { Card } from './ui/card'
import { cn } from '../lib/utils'

export function ThemeCard({ theme, selected, onClick }) {
  const colors = theme.colors || {}

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:scale-105 hover:shadow-lg",
        selected ? "ring-2 ring-primary shadow-lg" : "hover:ring-1 hover:ring-muted-foreground"
      )}
      onClick={onClick}
    >
      <div className="p-4 space-y-3">
        <div>
          <h4 className="font-semibold text-sm">{theme.display_name}</h4>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {theme.description}
          </p>
        </div>

        <div className="flex gap-1.5">
          {colors.bg && (
            <div
              className="w-6 h-6 rounded-md border border-border/50"
              style={{ backgroundColor: colors.bg }}
              title="Background"
            />
          )}
          {colors.text && (
            <div
              className="w-6 h-6 rounded-md border border-border/50"
              style={{ backgroundColor: colors.text }}
              title="Text"
            />
          )}
          {colors.water && (
            <div
              className="w-6 h-6 rounded-md border border-border/50"
              style={{ backgroundColor: colors.water }}
              title="Water"
            />
          )}
          {colors.parks && (
            <div
              className="w-6 h-6 rounded-md border border-border/50"
              style={{ backgroundColor: colors.parks }}
              title="Parks"
            />
          )}
          {colors.road_motorway && (
            <div
              className="w-6 h-6 rounded-md border border-border/50"
              style={{ backgroundColor: colors.road_motorway }}
              title="Motorway"
            />
          )}
        </div>
      </div>
    </Card>
  )
}
