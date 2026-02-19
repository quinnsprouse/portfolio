import { memo, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

import type {
  ContributionCalendar,
  ContributionWeek,
  ContributionDay,
} from '@/lib/github'
import { cn } from '@/lib/utils'

interface TooltipData {
  id: string
  contributions: number
  date: string
  dayName: string
  x: number
  y: number
}

interface GithubContributionsProps {
  calendar: ContributionCalendar
}

// GitHub displays Sunday-Saturday (Sun at top, Sat at bottom)
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const visibleDayLabels = new Set([1, 3, 5]) // Mon, Wed, Fri

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

const rangeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})
const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  timeZone: 'UTC',
})

const parseIsoDateUtc = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00.000Z`)

const CELL_GAP = 2
const LEGEND_GAP = 3
const MOBILE_GRID_GAP = CELL_GAP
const DESKTOP_CELL_SIZE = 11
const MOBILE_CELL_SIZE = 14

export const GithubContributions = memo(function GithubContributions({
  calendar,
}: GithubContributionsProps) {
  const { weeks, weekLabels, totalContributions, levelColors } = calendar
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [desktopCellSize, setDesktopCellSize] = useState(DESKTOP_CELL_SIZE)
  const desktopColumnRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!desktopColumnRef.current) {
      return
    }

    const updateDesktopCellSize = () => {
      const containerWidth = desktopColumnRef.current?.clientWidth ?? 0

      if (containerWidth <= 0) {
        return
      }

      const totalGapWidth = Math.max(weeks.length - 1, 0) * CELL_GAP
      const nextSize = (containerWidth - totalGapWidth) / weeks.length

      if (!Number.isFinite(nextSize) || nextSize <= 0) {
        return
      }

      setDesktopCellSize((currentSize) =>
        Math.abs(currentSize - nextSize) < 0.1 ? currentSize : nextSize
      )
    }

    updateDesktopCellSize()

    const observer = new ResizeObserver(updateDesktopCellSize)
    observer.observe(desktopColumnRef.current)

    return () => observer.disconnect()
  }, [weeks.length])

  if (!weeks.length) {
    return null
  }

  const startDate =
    weeks[0]?.find((day) => day)?.date ?? weeks[0]?.[weeks[0].length - 1]?.date
  const lastActiveWeek = [...weeks]
    .reverse()
    .find((week) => week.some((day) => day !== null))
  const endDate = lastActiveWeek
    ?.slice()
    .reverse()
    .find((day) => day)?.date

  const rangeText =
    startDate && endDate
      ? `${rangeFormatter.format(parseIsoDateUtc(startDate))} – ${rangeFormatter.format(parseIsoDateUtc(endDate))}`
      : undefined

  const buildColumnStyle = (
    count: number,
    options?: { cellSize?: number; gap?: number }
  ): CSSProperties => ({
    gridTemplateColumns: `repeat(${count}, ${options?.cellSize ?? DESKTOP_CELL_SIZE}px)`,
    columnGap: `${options?.gap ?? CELL_GAP}px`,
  })

  const buildRowStyle = (gap: number, cellSize: number): CSSProperties => ({
    gridTemplateRows: `repeat(7, ${cellSize}px)`,
    rowGap: `${gap}px`,
  })

  const columnStyle = buildColumnStyle(weeks.length, {
    cellSize: desktopCellSize,
  })
  const weekRowStyle = buildRowStyle(CELL_GAP, desktopCellSize)

  // Render a single day cell
  const renderDayCell = (
    day: ContributionDay | null,
    dayOfWeek: number,
    weekIndex: number
  ) => {
    if (!day) {
      // Render invisible placeholder for missing days
      return (
        <span
          key={`day-${dayOfWeek}-${weekIndex}-empty`}
          className="block aspect-square w-full"
        />
      )
    }

    const background =
      day.fill ?? levelColors[day.level] ?? levelColors[0] ?? '#ebedf0'
    const contributions = day.count ?? 0

    // Format data for tooltip
    const date = parseIsoDateUtc(day.date)
    const dayName = weekdayFormatter.format(date)
    const formattedDate = dateFormatter.format(date)
    const tooltipId = `${day.date}-${dayOfWeek}-${weekIndex}`

    const showTooltip = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect()
      setTooltip({
        id: tooltipId,
        contributions,
        date: formattedDate,
        dayName,
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
      })
    }

    const hideTooltip = () => {
      setTooltip(null)
    }

    const toggleTooltip = (el: HTMLElement) => {
      if (tooltip?.id === tooltipId) {
        hideTooltip()
        return
      }

      showTooltip(el)
    }

    return (
      <span
        key={`day-${dayOfWeek}-${weekIndex}`}
        role="img"
        tabIndex={0}
        className="block aspect-square w-full rounded-[3px] border border-border/20 hover:border-border/40 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none transition-colors cursor-default"
        style={{ backgroundColor: background }}
        onMouseEnter={(e) => showTooltip(e.currentTarget)}
        onMouseLeave={hideTooltip}
        onFocus={(e) => showTooltip(e.currentTarget)}
        onBlur={hideTooltip}
        onClick={(e) => toggleTooltip(e.currentTarget)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggleTooltip(e.currentTarget)
          }
        }}
        aria-label={`${contributions} contribution${contributions === 1 ? '' : 's'} on ${formattedDate}`}
      />
    )
  }

  // Render a row for a specific day of the week (0=Sun, 1=Mon, ..., 6=Sat)
  const renderDayRow = (
    dayOfWeek: number,
    calendarWeeks: ContributionWeek[],
    dayColumnStyle: CSSProperties
  ) => {
    return (
      <div key={`day-${dayOfWeek}`} className="grid" style={dayColumnStyle}>
        {calendarWeeks.map((week, weekIndex) =>
          renderDayCell(week[dayOfWeek] ?? null, dayOfWeek, weekIndex)
        )}
      </div>
    )
  }

  const renderCalendar = (
    calendarWeeks: ContributionWeek[],
    labels: string[],
    variants: {
      showWeekdayColumn: boolean
      columnStyle: CSSProperties
      rowStyle: CSSProperties
      scrollable?: boolean
    }
  ) => {
    const scrollContainerStyle = variants.scrollable
      ? {
          touchAction: 'pan-x',
        }
      : undefined

    const monthHeader = (
      <div
        className="grid text-[9px] uppercase tracking-wide text-muted-foreground sm:text-[10px]"
        style={variants.columnStyle}
        aria-hidden
      >
        {labels.map((label, index) => (
          <span key={`month-${index}`} className="leading-[12px]">
            {label}
          </span>
        ))}
      </div>
    )

    const dayGrid = (
      <div className="grid" style={variants.rowStyle}>
        {/* Render 7 rows, one for each day of the week */}
        {Array.from({ length: 7 }).map((_, dayOfWeek) =>
          renderDayRow(dayOfWeek, calendarWeeks, variants.columnStyle)
        )}
      </div>
    )

    if (!variants.showWeekdayColumn) {
      return (
        <div
          className={cn(
            'flex flex-col gap-3',
            variants.scrollable &&
              'overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]'
          )}
          style={scrollContainerStyle}
        >
          {monthHeader}
          {dayGrid}
        </div>
      )
    }

    return (
      <div className="grid sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-4 sm:gap-y-3">
        <div className="hidden sm:block" aria-hidden />
        <div ref={desktopColumnRef} className="min-w-0 w-full">
          {monthHeader}
        </div>

        <div
          className="hidden sm:grid self-stretch text-[11px] font-medium text-muted-foreground"
          style={variants.rowStyle}
          aria-hidden
        >
          {Array.from({ length: 7 }).map((_, index) => (
            <span
              key={`day-label-${index}`}
              className={
                visibleDayLabels.has(index)
                  ? 'flex items-center leading-none'
                  : 'invisible'
              }
            >
              {visibleDayLabels.has(index) ? dayNames[index] : '—'}
            </span>
          ))}
        </div>

        <div className="min-w-0">{dayGrid}</div>
      </div>
    )
  }

  const mobileGridMinWidth =
    weeks.length * MOBILE_CELL_SIZE + (weeks.length - 1) * MOBILE_GRID_GAP
  const mobileColumnStyle = {
    ...buildColumnStyle(weeks.length, {
      cellSize: MOBILE_CELL_SIZE,
      gap: MOBILE_GRID_GAP,
    }),
    minWidth: mobileGridMinWidth,
  }
  const mobileRowStyle = {
    ...buildRowStyle(MOBILE_GRID_GAP, MOBILE_CELL_SIZE),
    minWidth: mobileGridMinWidth,
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/60 p-4 md:p-5 relative">
      <div className="mb-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <p
          className="text-sm font-medium sm:text-base"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {typeof totalContributions === 'number'
            ? `${totalContributions.toLocaleString('en-US')} contributions in the last year`
            : 'Contributions in the last year'}
        </p>
        {rangeText && (
          <p
            className="text-xs text-muted-foreground sm:text-sm sm:text-right sm:leading-snug sm:whitespace-nowrap"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {rangeText}
          </p>
        )}
      </div>

      <div className="hidden sm:block">
        {renderCalendar(weeks, weekLabels, {
          showWeekdayColumn: true,
          columnStyle,
          rowStyle: weekRowStyle,
        })}
      </div>

      <div className="sm:hidden">
        <p className="mb-2 text-[11px] text-muted-foreground/80">
          Swipe horizontally for more days
        </p>
        {renderCalendar(weeks, weekLabels, {
          showWeekdayColumn: false,
          columnStyle: mobileColumnStyle,
          rowStyle: mobileRowStyle,
          scrollable: true,
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 text-[11px] text-muted-foreground md:mt-5">
        <span>Less</span>
        <div className="flex items-center" style={{ gap: `${LEGEND_GAP}px` }}>
          {levelColors.map((color, index) => (
            <span
              key={`legend-${index}`}
              className="h-3 w-3 rounded-[3px] border border-border/30 sm:h-[11px] sm:w-[11px]"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <span>More</span>
      </div>

      {/* Custom Tooltip */}
      <div aria-live="polite" className="sr-only">
        {tooltip
          ? `${tooltip.contributions === 0 ? 'No contributions' : tooltip.contributions === 1 ? '1 contribution' : `${tooltip.contributions} contributions`} on ${tooltip.dayName}, ${tooltip.date}`
          : ''}
      </div>
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none"
          role="tooltip"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-foreground text-background px-3 py-2 rounded-md shadow-lg text-xs font-mono whitespace-nowrap">
            <div className="font-semibold">
              {tooltip.contributions === 0
                ? 'No contributions'
                : tooltip.contributions === 1
                  ? '1 contribution'
                  : `${tooltip.contributions} contributions`}
            </div>
            <div className="text-[10px] opacity-80 mt-0.5">
              {tooltip.dayName}, {tooltip.date}
            </div>
          </div>
        </div>
      )}
    </div>
  )
})
