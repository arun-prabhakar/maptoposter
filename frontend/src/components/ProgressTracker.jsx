import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { Check, Loader2, Clock } from 'lucide-react'

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
  if (!jobStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your poster is saved locally and added to the gallery below when finished.
          </p>
        </CardContent>
      </Card>
    )
  }

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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Progress</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Your poster is saved locally and added to the gallery below when finished.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Status</span>
            <Badge variant={isComplete ? "default" : isFailed ? "destructive" : "secondary"}>
              {currentProgress}%
            </Badge>
          </div>
          <Progress value={currentProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {jobStatus.message}
          </p>
        </div>

        {/* Step-by-step Progress */}
        <div className="space-y-2">
          {PROGRESS_STEPS.map((step, index) => {
            const isCurrentStep = index === currentStepIndex && !isComplete && !isFailed
            const isPastStep = index < currentStepIndex || isComplete
            const isFutureStep = index > currentStepIndex && !isComplete

            return (
              <div
                key={step.key}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  {isPastStep || isComplete ? (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  ) : isCurrentStep ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted" />
                  )}
                </div>
                <span
                  className={`text-sm flex-1 ${
                    isPastStep || isCurrentStep ? 'text-foreground font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
                {isCurrentStep && (
                  <Clock className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            )
          })}
        </div>

        {isFailed && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-sm text-destructive">
              Generation failed: {jobStatus.message}
            </p>
          </div>
        )}

        {isComplete && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <p className="text-sm text-primary font-medium">
              ✓ Poster generated successfully!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
