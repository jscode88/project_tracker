import { Head } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AmountInput, PageBody, PageHeader } from '@/components/resource';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ADDONS = [
    ['payment', 'Payment Gateway (Midtrans/Xendit/etc.)', 2500000],
    ['realtime', 'Realtime (chat / live notifications)', 1000000],
    ['cron', 'Background Job / Cron / Queue', 500000],
    ['exportData', 'Export/Import Data (PDF/Excel)', 300000],
    ['multilang', 'Multi-language', 500000],
    ['pushNotif', 'Push Notification', 500000],
] as const;

const PLATFORMS = { web: ['Website only', 0], mobile: ['Mobile app only', 1500000], both: ['Web + mobile app', 2500000] } as const;
const FRONTEND = {
    easy: ['Simple — no motion or animations', 1000000],
    medium: ['Medium — simple motion', 2000000],
    complex: ['Complex — extensive motion and animation', 3000000],
} as const;
const DEADLINES = { relaxed: ['Relaxed (over 1 month)', 0], normal: ['Normal (2–4 weeks)', 0], rush: ['Rush (under 2 weeks)', 0.25], asap: ['ASAP (under 1 week)', 0.5] } as const;
const REVISIONS = { 1: '1 major revision', 2: '2 major revisions', 3: '3 major revisions' } as const;

type FormData = {
    workedBefore: boolean | null; lastSalary: string; laptopPrice: string; crudCount: string; hasLogin: boolean | null; loginType: string;
    relationCount: string; frontendLevel: keyof typeof FRONTEND | ''; libraryCount: string; platformType: keyof typeof PLATFORMS | '';
    addOns: Record<string, boolean>; needInfra: boolean | null; vpsPrice: string; domainPrice: string; deadlineUrgency: keyof typeof DEADLINES | ''; revisionIncluded: keyof typeof REVISIONS | '';
};

const initialForm = (): FormData => ({
    workedBefore: null, lastSalary: '', laptopPrice: '', crudCount: '', hasLogin: null, loginType: '', relationCount: '', frontendLevel: '', libraryCount: '', platformType: '',
    addOns: Object.fromEntries(ADDONS.map(([key]) => [key, false])), needInfra: null, vpsPrice: '', domainPrice: '', deadlineUrgency: '', revisionIncluded: '',
});
const money = (value: number) => `Rp ${Math.max(0, Math.round(value || 0)).toLocaleString('id-ID')}`;
const number = (value: string) => Number(value) || 0;

export default function PriceCalculator() {
    const [form, setForm] = useState<FormData>(initialForm);
    const [saved, setSaved] = useState<{ id: number; name: string; form: FormData }[]>(() => JSON.parse(localStorage.getItem('price_calculator_saved') || '[]'));
    const [name, setName] = useState('');
    const update = <K extends keyof FormData>(key: K, value: FormData[K]) => setForm((current) => ({ ...current, [key]: value }));
    const calc = useMemo(() => {
        const base = Math.min(form.workedBefore ? number(form.lastSalary) / 2 : form.workedBefore === false ? number(form.laptopPrice) / 3 : 0, 3500000);
        const crud = number(form.crudCount) * 500000;
        const login = form.hasLogin ? ({ manual: 700000, google: 300000, both: 1000000 }[form.loginType] || 0) : 0;
        const relation = number(form.relationCount) * 50000;
        const frontend = form.frontendLevel ? FRONTEND[form.frontendLevel][1] : 0;
        const libraries = number(form.libraryCount) * 30000;
        const platform = form.platformType ? PLATFORMS[form.platformType][1] : 0;
        const addons = ADDONS.reduce((total, [key, , price]) => total + (form.addOns[key] ? price : 0), 0);
        const featureTotal = crud + login + relation + frontend + libraries + platform + addons;
        const qa = featureTotal * 0.1;
        const urgency = form.deadlineUrgency ? (featureTotal + qa) * DEADLINES[form.deadlineUrgency][1] : 0;
        const complexity = featureTotal + qa + urgency;
        const infrastructure = form.needInfra ? number(form.vpsPrice) + number(form.domainPrice) + 100000 : 0;
        const total = Math.max(complexity, base) + infrastructure;
        return { base, crud, login, relation, frontend, libraries, platform, addons, featureTotal, qa, urgency, complexity, infrastructure, total };
    }, [form]);
    const complete = form.workedBefore !== null && (form.workedBefore ? !!form.lastSalary : !!form.laptopPrice) && !!form.crudCount && form.hasLogin !== null && (!form.hasLogin || !!form.loginType) && !!form.relationCount && !!form.frontendLevel && !!form.libraryCount && !!form.platformType && form.needInfra !== null && (!form.needInfra || (!!form.vpsPrice && !!form.domainPrice)) && !!form.deadlineUrgency && !!form.revisionIncluded;
    const save = () => {
        if (!name.trim()) return;
        const next = [{ id: Date.now(), name: name.trim(), form }, ...saved];
        setSaved(next); localStorage.setItem('price_calculator_saved', JSON.stringify(next)); setName('');
    };

    return <>
        <Head title="Price Calculator" />
        <PageHeader title="Price Calculator" description="Estimate a fixed project fee from scope, complexity, and delivery requirements." />
        <PageBody>
            <div className="grid max-w-6xl gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="grid gap-4 md:grid-cols-2">
                    <Section number="01" title="Price basis" className="md:col-span-2"><p>Have you worked professionally before?</p><Toggle value={form.workedBefore} onChange={(value) => update('workedBefore', value)} yes="Yes" no="No" />
                        {form.workedBefore === true && <AmountField label="Last monthly salary" value={form.lastSalary} onChange={(value) => update('lastSalary', value)} placeholder="e.g. 8,000,000" />}
                        {form.workedBefore === false && <AmountField label="Laptop price used for coding" value={form.laptopPrice} onChange={(value) => update('laptopPrice', value)} placeholder="e.g. 10,000,000" />}</Section>
                    <Section number="02" title="CRUD features"><p>How many core tables need CRUD?</p><AmountInput value={form.crudCount} onChange={(value) => update('crudCount', value)} /><Hint>Rp 500,000 per table</Hint></Section>
                    <Section number="03" title="Login feature"><p>Does it need login?</p><Toggle value={form.hasLogin} onChange={(value) => { update('hasLogin', value); if (!value) update('loginType', ''); }} yes="Required" no="Not required" />
                        {form.hasLogin && <Select value={form.loginType} onChange={(value) => update('loginType', value)} options={[['manual', 'Manual — Rp 700,000'], ['google', 'Google — Rp 300,000'], ['both', 'Manual + Google — Rp 1,000,000']]} placeholder="Choose login type" />}</Section>
                    <Section number="04" title="Database relations"><p>How many relations are needed between tables?</p><AmountInput value={form.relationCount} onChange={(value) => update('relationCount', value)} /><Hint>Rp 50,000 per relation</Hint></Section>
                    <Section number="05" title="Frontend"><p>What is the frontend complexity?</p><Select value={form.frontendLevel} onChange={(value) => update('frontendLevel', value as FormData['frontendLevel'])} options={Object.entries(FRONTEND).map(([key, [label]]) => [key, label] as const)} placeholder="Choose complexity" /><AmountField label="Third-party library count" value={form.libraryCount} onChange={(value) => update('libraryCount', value)} placeholder="e.g. 5" /><Hint>Rp 30,000 per library</Hint></Section>
                    <Section number="06" title="Platform"><p>Where will this project run?</p><Select value={form.platformType} onChange={(value) => update('platformType', value as FormData['platformType'])} options={Object.entries(PLATFORMS).map(([key, [label]]) => [key, label] as const)} placeholder="Choose platform" /></Section>
                    <Section number="07" title="Additional features"><p>Select every applicable feature.</p><div className="mt-3 grid gap-3">{ADDONS.map(([key, label, price]) => <label key={key} className="flex cursor-pointer items-center justify-between gap-3 text-sm"><span className="flex items-center gap-2"><Checkbox checked={form.addOns[key]} onCheckedChange={() => update('addOns', { ...form.addOns, [key]: !form.addOns[key] })} />{label}</span><span className="whitespace-nowrap text-muted-foreground">+{money(price)}</span></label>)}</div></Section>
                    <Section number="08" title="Infrastructure"><p>Does it need a VPS and domain?</p><Toggle value={form.needInfra} onChange={(value) => update('needInfra', value)} yes="Required" no="Not required" />{form.needInfra && <div className="grid gap-3"><AmountField label="VPS price (per year)" value={form.vpsPrice} onChange={(value) => update('vpsPrice', value)} placeholder="600,000" /><AmountField label="Domain price" value={form.domainPrice} onChange={(value) => update('domainPrice', value)} placeholder="150,000" /></div>}</Section>
                    <Section number="09" title="Deadline"><p>Choose the delivery urgency.</p><Select value={form.deadlineUrgency} onChange={(value) => update('deadlineUrgency', value as FormData['deadlineUrgency'])} options={Object.entries(DEADLINES).map(([key, [label, multiplier]]) => [key, multiplier ? `${label} (+${multiplier * 100}%)` : label] as const)} placeholder="Choose deadline" /></Section>
                    <Section number="10" title="Revision policy" className="md:col-span-2"><Select value={form.revisionIncluded} onChange={(value) => update('revisionIncluded', value as FormData['revisionIncluded'])} options={Object.entries(REVISIONS)} placeholder="Choose included revisions" /></Section>
                </div>
                <div className="space-y-4 xl:sticky xl:top-4 xl:self-start"><Card><CardHeader><CardTitle>Fee breakdown</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><Row label="CRUD features" value={calc.crud} /><Row label="Login" value={calc.login} /><Row label="Database relations" value={calc.relation} /><Row label="Frontend" value={calc.frontend} /><Row label="Third-party libraries" value={calc.libraries} /><Row label="Platform" value={calc.platform} /><Row label="Additional features" value={calc.addons} /><Row label="QA & PM overhead (10%)" value={calc.qa} /><Row label="Urgency fee" value={calc.urgency} /><hr /><Row label="Complexity subtotal" value={calc.complexity} strong /><Row label="Price basis" value={calc.base} /><Row label="VPS + domain" value={calc.infrastructure} /><div className="mt-4 rounded-lg bg-primary p-4 text-primary-foreground"><span className="text-xs font-medium uppercase tracking-wide">Total fee</span><strong className="mt-1 block text-2xl">{complete ? money(calc.total) : 'Complete the form'}</strong></div></CardContent></Card>
                    <Card><CardContent className="space-y-3 pt-6 text-sm"><Row label="Maintenance after warranty" value={complete ? calc.total * 0.1 : 0} /><Row label="Extra revision" value={complete ? Math.round((calc.total * 0.05) / 10000) * 10000 : 0} /><Row label="Suggested 50% deposit" value={complete ? calc.total * 0.5 : 0} /></CardContent></Card>
                    <Card><CardContent className="space-y-3 pt-6"><Label htmlFor="calculation-name">Save calculation locally</Label><Input id="calculation-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Online Store — Client A" /><Button className="w-full" disabled={!complete || !name.trim()} onClick={save}><Save />Save calculation</Button>{saved.length > 0 && <div className="border-t pt-3"><p className="mb-2 text-xs text-muted-foreground">Saved calculations</p><div className="grid gap-1">{saved.map((item) => <Button key={item.id} type="button" variant="ghost" className="justify-start" onClick={() => setForm(item.form)}>{item.name}</Button>)}</div></div>}</CardContent></Card></div>
            </div>
        </PageBody>
    </>;
}

function Section({ number, title, children, className = '' }: { number: string; title: string; children: React.ReactNode; className?: string }) { return <Card className={className}><CardHeader><CardTitle className="text-base"><span className="mr-2 text-muted-foreground">{number}</span>{title}</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-muted-foreground">{children}</CardContent></Card>; }
function Toggle({ value, onChange, yes, no }: { value: boolean | null; onChange: (value: boolean) => void; yes: string; no: string }) { return <div className="grid grid-cols-2 gap-2"><Button type="button" variant={value === true ? 'default' : 'outline'} onClick={() => onChange(true)}>{yes}</Button><Button type="button" variant={value === false ? 'default' : 'outline'} onClick={() => onChange(false)}>{no}</Button></div>; }
function AmountField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) { return <div className="grid gap-2"><Label>{label}</Label><AmountInput value={value} onChange={onChange} placeholder={placeholder} /></div>; }
function Select({ value, onChange, options, placeholder }: { value: string; onChange: (value: string) => void; options: readonly (readonly [string, string | number])[]; placeholder: string }) { return <select className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" value={value} onChange={(event) => onChange(event.target.value)}><option value="">{placeholder}</option>{options.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>; }
function Hint({ children }: { children: React.ReactNode }) { return <p className="text-xs text-muted-foreground">{children}</p>; }
function Row({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) { return <div className={strong ? 'flex justify-between font-semibold' : 'flex justify-between gap-4 text-muted-foreground'}><span>{label}</span><span className="whitespace-nowrap text-foreground">{money(value)}</span></div>; }

PriceCalculator.layout = { breadcrumbs: [{ title: 'Price Calculator', href: '/price-calculator' }] };
