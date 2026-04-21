import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { DayPicker } from 'react-day-picker';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: React.ComponentProps<typeof DayPicker>) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn('relative p-3', className)}
            classNames={{
                months: 'flex flex-col',
                month: 'space-y-4',
                month_caption: 'flex h-8 items-center justify-center px-8',
                caption_label: 'text-sm font-medium',
                nav: 'absolute inset-x-3 top-3 flex items-center justify-between',
                button_previous: cn(buttonVariants({ variant: 'outline' }), 'size-7 bg-transparent p-0 opacity-50 hover:opacity-100'),
                button_next: cn(buttonVariants({ variant: 'outline' }), 'size-7 bg-transparent p-0 opacity-50 hover:opacity-100'),
                month_grid: 'w-full border-collapse space-y-1',
                weekdays: 'flex',
                weekday: 'text-muted-foreground w-9 rounded-md text-[0.8rem] font-normal',
                weeks: 'flex flex-col',
                week: 'mt-2 flex w-full',
                day: 'relative size-9 p-0 text-center text-sm focus-within:relative focus-within:z-20',
                day_button: cn(buttonVariants({ variant: 'ghost' }), 'size-9 p-0 font-normal aria-selected:opacity-100'),
                selected: 'bg-primary text-primary-foreground rounded-md hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                today: 'bg-accent text-accent-foreground rounded-md',
                outside: 'text-muted-foreground opacity-50',
                disabled: 'text-muted-foreground opacity-50',
                hidden: 'invisible',
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation }) => (orientation === 'left' ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />),
            }}
            {...props}
        />
    );
}

export { Calendar };
