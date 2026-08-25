import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type CalendarViewProps = {
    pageTitle: string;
    headerActions?: ReactNode;
    renderDayContent?: (date: Date) => ReactNode;
};

function startOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfCalendarGrid(date: Date) {
    const firstDay = startOfMonth(date);

    return new Date(
        firstDay.getFullYear(),
        firstDay.getMonth(),
        firstDay.getDate() - firstDay.getDay(),
    );
}

function isSameDay(left: Date, right: Date) {
    return (
        left.getFullYear() === right.getFullYear() &&
        left.getMonth() === right.getMonth() &&
        left.getDate() === right.getDate()
    );
}

export function CalendarView({
    pageTitle,
    headerActions,
    renderDayContent,
}: CalendarViewProps) {
    const [visibleMonth, setVisibleMonth] = useState(() =>
        startOfMonth(new Date()),
    );
    const today = useMemo(() => new Date(), []);

    const monthLabel = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
    }).format(visibleMonth);

    const days = useMemo(() => {
        const gridStart = startOfCalendarGrid(visibleMonth);

        return Array.from({ length: 42 }, (_, index) => {
            const date = new Date(gridStart);
            date.setDate(gridStart.getDate() + index);

            return date;
        });
    }, [visibleMonth]);

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex shrink-0 flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-normal">
                        {pageTitle}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {monthLabel}
                    </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                    {headerActions}
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() =>
                            setVisibleMonth(
                                (current) =>
                                    new Date(
                                        current.getFullYear(),
                                        current.getMonth() - 1,
                                        1,
                                    ),
                            )
                        }
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous month</span>
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() =>
                            setVisibleMonth(
                                (current) =>
                                    new Date(
                                        current.getFullYear(),
                                        current.getMonth() + 1,
                                        1,
                                    ),
                            )
                        }
                    >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next month</span>
                    </Button>
                </div>
            </div>

            <div className="m-4 flex h-0 min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border">
                <div className="grid shrink-0 grid-cols-7 border-b border-border bg-muted/30">
                    {weekdayLabels.map((label) => (
                        <div
                            key={label}
                            className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase"
                        >
                            {label}
                        </div>
                    ))}
                </div>

                <div className="grid h-0 min-h-0 flex-1 grid-cols-7 grid-rows-6 overflow-hidden">
                    {days.map((date) => {
                        const isCurrentMonth =
                            date.getMonth() === visibleMonth.getMonth();
                        const isToday = isSameDay(date, today);

                        return (
                            <div
                                key={date.toISOString()}
                                className="flex min-h-0 flex-col overflow-hidden border-r border-b border-border p-1.5 last:border-r-0 sm:p-2"
                            >
                                <div className="flex items-center justify-between">
                                    <span
                                        className={[
                                            'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                                            isToday
                                                ? 'bg-primary text-primary-foreground'
                                                : isCurrentMonth
                                                  ? 'text-foreground'
                                                  : 'text-muted-foreground/70',
                                        ].join(' ')}
                                    >
                                        {date.getDate()}
                                    </span>
                                </div>
                                {renderDayContent && (
                                    <div className="mt-1 flex min-h-0 flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto">
                                        {renderDayContent(date)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
