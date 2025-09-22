import { memo } from 'react'
import type { CSSProperties } from 'react'

import type { ContributionCalendar, ContributionWeek } from '@/lib/github'

interface GithubContributionsProps {
  calendar: ContributionCalendar
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const visibleDayLabels = new Set([1, 3, 5])

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const rangeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const MOBILE_WEEK_LIMIT = 26
const GRID_GAP = 4

export const GithubContributions = memo(function GithubContributions({ calendar }: GithubContributionsProps) {
  const { weeks, weekLabels, recentWeeks, recentWeekLabels, totalContributions, levelColors } = calendar

  if (!weeks.length) {
    return null
  }

  const startDate = weeks[0]?.find((day) => day)?.date ?? weeks[0]?.[weeks[0].length - 1]?.date
  const lastActiveWeek = [...weeks].reverse().find((week) => week.some((day) => day !== null))
  const endDate = lastActiveWeek?.slice().reverse().find((day) => day)?.date

  const rangeText = startDate && endDate
    ? `${rangeFormatter.format(new Date(startDate))} – ${rangeFormatter.format(new Date(endDate))}`
    : undefined

  const buildColumnStyle = (count: number): CSSProperties => ({
    gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
    columnGap: `${GRID_GAP}px`,
  })

  const weekRowStyle: CSSProperties = {
    gridTemplateRows: 'repeat(7, minmax(0, 1fr))',
    rowGap: `${GRID_GAP}px`,
  }

  const renderWeek = (week: ContributionWeek, weekIndex: number) => (
    <div key={`week-${weekIndex}`} className="grid" style={weekRowStyle}>
      {Array.from({ length: 7 }).map((_, dayIndex) => {
        const day = week[dayIndex] ?? null
        const background = day
          ? day.fill ?? levelColors[day.level] ?? levelColors[0] ?? '#ebedf0'
          : levelColors[0] ?? '#ebedf0'
        const contributions = day?.count ?? 0
        const title = day
          ? `${contributions} contribution${contributions === 1 ? '' : 's'} on ${dateFormatter.format(new Date(day.date))}`
          : 'No contributions'

        return (
          <span
            key={`day-${weekIndex}-${dayIndex}`}
            className="aspect-square w-full rounded-[3px] border border-border/20"
            style={{ backgroundColor: background }}
            title={title}
            aria-label={title}
          />
        )
      })}
    </div>
  )

  const renderCalendar = (calendarWeeks: ContributionWeek[], labels: string[], variants: { showWeekdayColumn: boolean }) => {
    const columnStyle = buildColumnStyle(calendarWeeks.length)

    return (
      <div className={variants.showWeekdayColumn ? 'grid md:grid-cols-[auto_1fr] md:gap-4' : ''}>
        {variants.showWeekdayColumn && (
          <div className="hidden md:grid text-[11px] font-medium text-muted-foreground" style={weekRowStyle} aria-hidden>
            {Array.from({ length: 7 }).map((_, index) => (
              <span key={`day-label-${index}`} className={visibleDayLabels.has(index) ? 'leading-[12px]' : 'invisible'}>
                {visibleDayLabels.has(index) ? dayNames[index] : '—'}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div
            className="grid text-[9px] uppercase tracking-wide text-muted-foreground sm:text-[10px]"
            style={columnStyle}
            aria-hidden
          >
            {labels.map((label, index) => (
              <span key={`month-${index}`} className="leading-[12px]">
                {label}
              </span>
            ))}
          </div>
          <div className="grid" style={{ ...columnStyle, rowGap: `${GRID_GAP}px` }}>
            {calendarWeeks.map(renderWeek)}
          </div>
        </div>
      </div>
    )
  }

  const mobileWeeks = recentWeeks?.length ? recentWeeks : weeks.slice(-MOBILE_WEEK_LIMIT)
  const mobileLabels = recentWeekLabels?.length ? recentWeekLabels : weekLabels.slice(-MOBILE_WEEK_LIMIT)

  return (
    <div className="rounded-xl border border-border/50 bg-card/60 p-4 md:p-5">
      <div className="mb-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium sm:text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
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

      <div className="hidden md:block">
        {renderCalendar(weeks, weekLabels, { showWeekdayColumn: true })}
      </div>

      <div className="md:hidden">
        {renderCalendar(mobileWeeks, mobileLabels, { showWeekdayColumn: false })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 text-[11px] text-muted-foreground md:mt-5">
        <span>Less</span>
        <div className="flex items-center" style={{ gap: `${GRID_GAP}px` }}>
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
    </div>
  )
})
