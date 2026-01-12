import { Checkbox } from '@/components/ui/checkbox'
import { Icon } from '@/components/icons'
import { BluetoothIcon, SmartPhone01Icon, CpuIcon } from '@hugeicons-pro/core-stroke-rounded'

interface Goal {
  id: string
  title: string
  description: string
  icon: typeof BluetoothIcon
  status: 'not-started' | 'in-progress' | 'completed'
}

const goals: Goal[] = [
  {
    id: 'serial-interface',
    title: 'Serial Device Interface',
    description: 'Web app connecting to hardware via Bluetooth/USB — OBD sensors, microcontrollers',
    icon: BluetoothIcon,
    status: 'not-started',
  },
  {
    id: 'ios-app',
    title: 'Native iOS App',
    description: 'First native mobile application built with Swift and SwiftUI',
    icon: SmartPhone01Icon,
    status: 'not-started',
  },
  {
    id: 'hardware-project',
    title: 'Custom Hardware',
    description: 'Physical computing project — PCB design, embedded systems',
    icon: CpuIcon,
    status: 'not-started',
  },
]

export function Goals2026() {
  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <div
          key={goal.id}
          className="group flex items-start gap-4 py-2 border-b border-border/20"
        >
          <div className="flex items-center justify-center pt-0.5">
            <Checkbox
              checked={goal.status === 'completed'}
              disabled
              className="data-checked:bg-primary"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="text-base font-medium"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {goal.title}
              </span>
              <Icon
                icon={goal.icon}
                className="size-3.5 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <p
              className="text-sm text-muted-foreground mt-1"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {goal.description}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4 shrink-0">
            <span
              className={`inline-block size-1.5 rounded-full ${
                goal.status === 'completed'
                  ? 'bg-primary'
                  : goal.status === 'in-progress'
                    ? 'bg-yellow-500'
                    : 'bg-muted-foreground/30'
              }`}
              aria-label={
                goal.status === 'completed'
                  ? 'Completed'
                  : goal.status === 'in-progress'
                    ? 'In progress'
                    : 'Not started'
              }
            />
          </div>
        </div>
      ))}
    </div>
  )
}
