import { Card } from './ui/card'
import { cn } from '../lib/utils'

export function ThemeCard({ theme, selected, onClick }) {
  const colors = theme.colors || {}

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:ring-2 hover:ring-primary/50",
        selected
          ? "ring-2 ring-primary bg-primary/5 shadow-inner"
          : "bg-muted/20 border-border/50 hover:bg-muted/40"
      )}
      onClick={onClick}
    >
      <div className="p-3 flex items-center gap-4">
        {/* Swatch Grid */}
        <div className="grid grid-cols-2 gap-0.5 shrink-0 rotate-3 group-hover:rotate-0 transition-transform">
          {colors.bg && <div className="w-5 h-5 rounded-tl-md border border-black/5" style={{ backgroundColor: colors.bg }} />}
          {colors.water && <div className="w-5 h-5 rounded-tr-md border border-black/5" style={{ backgroundColor: colors.water }} />}
          {colors.parks && <div className="w-5 h-5 rounded-bl-md border border-black/5" style={{ backgroundColor: colors.parks }} />}
          {colors.road_motorway && <div className="w-5 h-5 rounded-br-md border border-black/5" style={{ backgroundColor: colors.road_motorway }} />}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-semibold text-xs transition-colors",
            selected ? "text-primary" : "text-foreground"
          )}>
            {theme.display_name}
          </h4>
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
            {theme.description}
          </p>
        </div>
      </div>
    </Card>
  )
}
