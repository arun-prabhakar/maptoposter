import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { Check, Loader2, Clock, MapPin } from 'lucide-react'
import { cn } from '../lib/utils'

const PROGRESS_STEPS = [
  { key: 'queued', label: 'Queued', progress: 0 },
  { key: 'geocoding', label: 'Geocoding', progress: 10 },
  { key: 'street_network', label: 'Street Network', progress: 35 },
  { key: 'water', label: 'Water Features', progress: 45 },
  { key: 'parks', label: 'Parks', progress: 50 },
  { key: 'buildings', label: 'Buildings', progress: 55 },
  { key: 'railways', label: 'Railways', progress: 60 },
  { key: 'rendering', label: 'Rendering', progress: 80 },
  { key: 'saving', label: 'Saving', progress: 90 },
  { key: 'complete', label: 'Complete', progress: 100 },
]

export function ProgressTracker({ jobStatus }) {
  if (!jobStatus) return null

  const currentProgress = jobStatus.progress || 0
  const isComplete = jobStatus.status === 'completed'
  const isFailed = jobStatus.status === 'failed'

  const getCurrentStep = () => {
    for (let i = PROGRESS_STEPS.length - 1; i >= 0; i--) {
      if (currentProgress >= PROGRESS_STEPS[i].progress) {
        return i
      }
    }
    return 0
  }

  const currentStepIndex = getCurrentStep()

  return (
    <div className="space-y-8 w-full">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold truncate max-w-[200px]">Generating Poster</h3>
            <p className="text-[11px] text-muted-foreground">{jobStatus.message}</p>
          </div>
        </div>
        <Badge variant={isComplete ? "default" : isFailed ? "destructive" : "secondary"} className="h-6">
          {currentProgress}%
        </Badge>
      </div>

      <Progress value={currentProgress} className="h-1.5" />

      {/* Grid of steps for a more compact single-page look */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {PROGRESS_STEPS.map((step, index) => {
          const isCurrentStep = index === currentStepIndex && !isComplete && !isFailed
          const isPastStep = index < currentStepIndex || isComplete
          const isFutureStep = index > currentStepIndex && !isComplete

          return (
            <div
              key={step.key}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-300",
                isCurrentStep ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" : "border-border/50 bg-muted/20 opacity-60",
                isPastStep ? "opacity-100 border-primary/20" : ""
              )}
            >
              <div className="relative">
                {isPastStep || isComplete ? (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                ) : isCurrentStep ? (
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary">
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-muted" />
                )}
              </div>
              <span className={cn(
                "text-[10px] text-center font-bold tracking-tight uppercase",
                isPastStep || isCurrentStep ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {isFailed && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
          <p className="text-xs text-destructive font-medium text-center">
            Generation failed: {jobStatus.message}
          </p>
        </div>
      )}
    </div>
  )
}
