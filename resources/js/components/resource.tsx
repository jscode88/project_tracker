import { Head, Link, router } from '@inertiajs/react';
import { CalendarIcon, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types/domain';

export function PageHeader({
    title,
    description,
    actionHref,
    actionLabel = 'New',
}: {
    title: string;
    description?: string;
    actionHref?: string;
    actionLabel?: string;
}) {
    return (
        <>
            <Head title={title} />
            <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
                    {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
                </div>
                {actionHref ? (
                    <Button asChild>
                        <Link href={actionHref}>
                            <Plus className="size-4" />
                            {actionLabel}
                        </Link>
                    </Button>
                ) : null}
            </div>
        </>
    );
}

export function PageBody({ children }: { children: ReactNode }) {
    return <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">{children}</div>;
}

export function SearchBar({ defaultValue = '', action }: { defaultValue?: string; action: string }) {
    const [search, setSearch] = useState(defaultValue);

    function submit(event: FormEvent) {
        event.preventDefault();
        router.get(action, search ? { search } : {}, { preserveState: true, replace: true });
    }

    return (
        <form onSubmit={submit} className="flex max-w-xl gap-2">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" />
            <Button type="submit" variant="secondary">
                <Search className="size-4" />
                Search
            </Button>
        </form>
    );
}

export function DataTable({ children, className = 'min-w-[720px]' }: { children: ReactNode; className?: string }) {
    return (
        <div className="overflow-hidden rounded-lg border bg-card">
            <table className={`w-full text-sm [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-muted/50 ${className}`}>{children}</table>
        </div>
    );
}

export function Pagination<T>({ page }: { page: Paginated<T> }) {
    if (page.links.length <= 3) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div>
                Showing {page.from ?? 0}-{page.to ?? 0} of {page.total}
            </div>
            <div className="flex flex-wrap gap-1">
                {page.links.map((link, index) => (
                    <Button key={`${link.label}-${index}`} asChild={Boolean(link.url)} disabled={!link.url} size="sm" variant={link.active ? 'default' : 'outline'}>
                        {link.url ? <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} /> : <span dangerouslySetInnerHTML={{ __html: link.label }} />}
                    </Button>
                ))}
            </div>
        </div>
    );
}

export function CrudActions({ editHref, deleteHref }: { editHref: string; deleteHref: string }) {
    function remove() {
        if (window.confirm('Delete this record?')) {
            router.delete(deleteHref);
        }
    }

    return (
        <div className="flex justify-end gap-2">
            <Button asChild size="icon" variant="outline" title="Edit">
                <Link href={editHref}>
                    <Pencil className="size-4" />
                </Link>
            </Button>
            <Button type="button" size="icon" variant="destructive" title="Delete" onClick={remove}>
                <Trash2 className="size-4" />
            </Button>
        </div>
    );
}

export function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            {children}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
    );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            {...props}
            className="min-h-28 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
    );
}

export function AmountInput({
    value,
    onChange,
    placeholder,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}) {
    const digits = value.replace(/\D/g, '');
    const displayValue = digits === '' ? '' : Number(digits).toLocaleString('id-ID');

    return (
        <Input
            inputMode="numeric"
            value={displayValue}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value.replace(/\D/g, ''))}
        />
    );
}

export function DatePicker({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    const selected = parseDateValue(value);
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal', !selected && 'text-muted-foreground')}
                >
                    <CalendarIcon className="size-4" />
                    {selected ? selected.toLocaleDateString('id-ID') : 'Select date'}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selected}
                    onSelect={(date) => {
                        if (date) {
                            onChange(formatDateValue(date));
                            setOpen(false);
                        }
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}

function parseDateValue(value: string) {
    const [year, month, day] = value.split('-').map(Number);

    if (!year || !month || !day) {
        return undefined;
    }

    return new Date(year, month - 1, day);
}

function formatDateValue(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function CheckField({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox checked={checked} onCheckedChange={(value) => onChange(value === true)} />
            {label}
        </label>
    );
}

export function FormShell({ children, title }: { children: ReactNode; title: string }) {
    return (
        <>
            <Head title={title} />
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4">
                <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
                <div className="rounded-lg border bg-card p-5">{children}</div>
            </div>
        </>
    );
}

export function FormActions({ cancelHref, processing }: { cancelHref: string; processing: boolean }) {
    function cancel() {
        if (window.history.length > 1) {
            window.history.back();

            return;
        }

        router.visit(cancelHref);
    }

    return (
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={cancel}>
                Cancel
            </Button>
            <Button type="submit" disabled={processing}>
                Save
            </Button>
        </div>
    );
}

export function money(amount: number | string | null | undefined, currency = 'IDR') {
    const value = Number(amount ?? 0);
    const currencyCode = /^[A-Z]{3}$/.test(currency) ? currency : 'IDR';

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: 0,
    }).format(value);
}
