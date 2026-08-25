import { Link, router } from '@inertiajs/react';
import { BookOpen, Pencil, Save, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    AmountInput,
    DataTable,
    PageBody,
    PageHeader,
} from '@/components/resource';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Project } from '@/types';

const ADDONS = [
    ['payment', 'Payment Gateway (Midtrans/Xendit/etc.)'],
    ['realtime', 'Realtime (chat / live notifications)'],
    ['cron', 'Background Job / Cron / Queue'],
    ['exportData', 'Export/Import Data (PDF/Excel)'],
    ['multilang', 'Multi-language'],
    ['pushNotif', 'Push Notification'],
] as const;
const PRICING_KEYS: Record<string, string> = {
    salary_divisor: 'Salary divisor',
    laptop_divisor: 'Laptop-price divisor',
    price_basis_cap: 'Price basis cap',
    crud_per_table: 'CRUD per table',
    login_manual: 'Manual login',
    login_google: 'Google login',
    login_both: 'Manual + Google login',
    relation_per_item: 'Database relation',
    frontend_easy: 'Simple frontend',
    frontend_medium: 'Medium frontend',
    frontend_complex: 'Complex frontend',
    library_per_item: 'Third-party library',
    platform_web: 'Website only',
    platform_mobile: 'Mobile app only',
    platform_both: 'Web + mobile',
    addon_payment: 'Payment gateway',
    addon_realtime: 'Realtime',
    addon_cron: 'Background job / cron',
    addon_export_data: 'Export/import',
    addon_multilang: 'Multi-language',
    addon_push_notif: 'Push notification',
    qa_percent: 'QA & PM overhead (%)',
    urgency_rush_percent: 'Rush urgency (%)',
    urgency_asap_percent: 'ASAP urgency (%)',
    infrastructure_fee: 'Infrastructure setup fee',
    maintenance_percent: 'Maintenance after warranty (%)',
    extra_revision_percent: 'Extra revision (%)',
    extra_revision_rounding: 'Extra revision rounding',
    deposit_percent: 'Suggested deposit (%)',
};
const FRONTEND = {
    easy: 'Simple — no motion or animations',
    medium: 'Medium — simple motion',
    complex: 'Complex — extensive motion and animation',
} as const;
const PLATFORMS = {
    web: 'Website only',
    mobile: 'Mobile app only',
    both: 'Web + mobile app',
} as const;
const DEADLINES = {
    relaxed: 'Relaxed (over 1 month)',
    normal: 'Normal (2–4 weeks)',
    rush: 'Rush (under 2 weeks)',
    asap: 'ASAP (under 1 week)',
} as const;
const REVISIONS = {
    1: '1 major revision',
    2: '2 major revisions',
    3: '3 major revisions',
} as const;
type Pricing = Record<string, number>;
type PriceCalculatorView = 'calculator' | 'saved' | 'settings';
type FormData = {
    workedBefore: boolean | null;
    lastSalary: string;
    laptopPrice: string;
    crudCount: string;
    hasLogin: boolean | null;
    loginType: string;
    relationCount: string;
    frontendLevel: keyof typeof FRONTEND | '';
    libraryCount: string;
    platformType: keyof typeof PLATFORMS | '';
    addOns: Record<string, boolean>;
    needInfra: boolean | null;
    vpsPrice: string;
    domainPrice: string;
    deadlineUrgency: keyof typeof DEADLINES | '';
    revisionIncluded: keyof typeof REVISIONS | '';
};
type Calculation = {
    id: number;
    project_id: number | null;
    problem_id: number | null;
    project?: Project | null;
    problem?: Pick<Enquiry, 'id' | 'title' | 'customer_name'> | null;
    name: string;
    inputs: FormData;
    price_snapshot: Record<string, number>;
    total: number;
    created_at: string;
};
type Enquiry = {
    id: number;
    title: string;
    customer_name: string | null;
    project_id: number | null;
    content: string;
    proposed_solution: string | null;
    expected_budget: string | null;
    expected_budget_currency: string | null;
    desired_delivery_date: string | null;
};
const initialForm = (): FormData => ({
    workedBefore: null,
    lastSalary: '',
    laptopPrice: '',
    crudCount: '',
    hasLogin: null,
    loginType: '',
    relationCount: '',
    frontendLevel: '',
    libraryCount: '',
    platformType: '',
    addOns: Object.fromEntries(ADDONS.map(([key]) => [key, false])),
    needInfra: null,
    vpsPrice: '',
    domainPrice: '',
    deadlineUrgency: '',
    revisionIncluded: '',
});
const calculationFormData = (calculation: Calculation): FormData => ({
    ...calculation.inputs,
    vpsPrice: String(calculation.inputs.vpsPrice ?? ''),
    domainPrice: String(calculation.inputs.domainPrice ?? ''),
});
const money = (value: number) =>
    `Rp ${Math.max(0, Math.round(value || 0)).toLocaleString('id-ID')}`;
const number = (value: string) => Number(value) || 0;

export default function PriceCalculator({
    settings,
    calculations,
    projects,
    selectedCalculationId,
    view,
    enquiry,
}: {
    settings: Pricing;
    calculations: Calculation[];
    projects: Project[];
    selectedCalculationId?: number | null;
    view: PriceCalculatorView;
    enquiry: Enquiry | null;
}) {
    const linkedCalculation = selectedCalculationId
        ? (calculations.find((item) => item.id === selectedCalculationId) ??
          null)
        : null;
    const [form, setForm] = useState<FormData>(
        linkedCalculation
            ? calculationFormData(linkedCalculation)
            : initialForm,
    );
    const [name, setName] = useState(
        linkedCalculation?.name ??
            (enquiry
                ? `${enquiry.customer_name ?? enquiry.title} estimate`
                : ''),
    );
    const [projectId, setProjectId] = useState(
        String(linkedCalculation?.project_id ?? enquiry?.project_id ?? ''),
    );
    const [editing, setEditing] = useState<Calculation | null>(
        linkedCalculation,
    );
    const [pricing, setPricing] = useState<Pricing>(settings);
    const update = <K extends keyof FormData>(key: K, value: FormData[K]) =>
        setForm((current) => ({ ...current, [key]: value }));
    const calc = useMemo(() => calculate(form, settings), [form, settings]);
    const complete = isComplete(form);
    const submit = () => {
        if (!complete || !name.trim()) {
            return;
        }

        const payload = {
            name: name.trim(),
            inputs: form,
            price_snapshot: { ...settings, ...calc },
            total: Math.round(calc.total),
            project_id: projectId ? Number(projectId) : null,
            problem_id: linkedCalculation?.problem_id ?? enquiry?.id ?? null,
        };

        if (editing) {
            router.put(`/price-calculator/${editing.id}`, payload, {
                onSuccess: () => reset(),
            });
        } else {
            router.post('/price-calculator', payload, {
                onSuccess: () => reset(),
            });
        }
    };
    const reset = () => {
        setForm(initialForm());
        setName('');
        setProjectId('');
        setEditing(null);
    };
    const edit = (calculation: Calculation) => {
        router.get(`/price-calculator/${calculation.id}`);
    };
    const saveSettings = () =>
        router.put('/price-calculator-settings', { pricing });

    const pageHeader = {
        calculator: {
            title: 'Price Calculator',
            description: 'Estimate and save a project fee calculation.',
        },
        saved: {
            title: 'Saved Calculations',
            description: 'Review and manage saved price calculations.',
        },
        settings: {
            title: 'Price Calculator Settings',
            description: 'Configure the rates used by the calculator.',
        },
    }[view];

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <PageHeader
                title={pageHeader.title}
                description={pageHeader.description}
            />
            <PageBody>
                <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
                    {view === 'calculator' && (
                        <div className="flex min-h-0 flex-1 flex-col gap-4">
                            {enquiry && <EnquiryReference enquiry={enquiry} />}
                            <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_360px] gap-4 overflow-hidden">
                                <div className="min-w-0 overflow-x-auto overflow-y-auto pr-1">
                                    <div className="grid w-full min-w-[736px] grid-cols-[repeat(auto-fit,_360px)] content-start gap-4">
                                        <Section
                                            number="01"
                                            title="Price basis"
                                        >
                                            <p>
                                                Have you worked professionally
                                                before?
                                            </p>
                                            <Toggle
                                                value={form.workedBefore}
                                                onChange={(value) =>
                                                    update(
                                                        'workedBefore',
                                                        value,
                                                    )
                                                }
                                                yes="Yes"
                                                no="No"
                                            />
                                            {form.workedBefore === true && (
                                                <AmountField
                                                    label="Last monthly salary"
                                                    value={form.lastSalary}
                                                    onChange={(value) =>
                                                        update(
                                                            'lastSalary',
                                                            value,
                                                        )
                                                    }
                                                    placeholder="e.g. 8,000,000"
                                                />
                                            )}
                                            {form.workedBefore === false && (
                                                <AmountField
                                                    label="Laptop price used for coding"
                                                    value={form.laptopPrice}
                                                    onChange={(value) =>
                                                        update(
                                                            'laptopPrice',
                                                            value,
                                                        )
                                                    }
                                                    placeholder="e.g. 10,000,000"
                                                />
                                            )}
                                        </Section>
                                        <Section
                                            number="02"
                                            title="CRUD features"
                                        >
                                            <p>
                                                How many core tables need CRUD?
                                            </p>
                                            <AmountInput
                                                value={form.crudCount}
                                                onChange={(value) =>
                                                    update('crudCount', value)
                                                }
                                            />
                                            <Hint>
                                                {money(settings.crud_per_table)}{' '}
                                                per table
                                            </Hint>
                                        </Section>
                                        <Section
                                            number="03"
                                            title="Login feature"
                                        >
                                            <p>Does it need login?</p>
                                            <Toggle
                                                value={form.hasLogin}
                                                onChange={(value) => {
                                                    update('hasLogin', value);

                                                    if (!value) {
                                                        update('loginType', '');
                                                    }
                                                }}
                                                yes="Required"
                                                no="Not required"
                                            />
                                            {form.hasLogin && (
                                                <Select
                                                    value={form.loginType}
                                                    onChange={(value) =>
                                                        update(
                                                            'loginType',
                                                            value,
                                                        )
                                                    }
                                                    options={[
                                                        [
                                                            'manual',
                                                            `Manual — ${money(settings.login_manual)}`,
                                                        ],
                                                        [
                                                            'google',
                                                            `Google — ${money(settings.login_google)}`,
                                                        ],
                                                        [
                                                            'both',
                                                            `Manual + Google — ${money(settings.login_both)}`,
                                                        ],
                                                    ]}
                                                    placeholder="Choose login type"
                                                />
                                            )}
                                        </Section>
                                        <Section
                                            number="04"
                                            title="Database relations"
                                        >
                                            <p>
                                                How many relations are needed
                                                between tables?
                                            </p>
                                            <AmountInput
                                                value={form.relationCount}
                                                onChange={(value) =>
                                                    update(
                                                        'relationCount',
                                                        value,
                                                    )
                                                }
                                            />
                                            <Hint>
                                                {money(
                                                    settings.relation_per_item,
                                                )}{' '}
                                                per relation
                                            </Hint>
                                        </Section>
                                        <Section number="05" title="Frontend">
                                            <p>
                                                What is the frontend complexity?
                                            </p>
                                            <Select
                                                value={form.frontendLevel}
                                                onChange={(value) =>
                                                    update(
                                                        'frontendLevel',
                                                        value as FormData['frontendLevel'],
                                                    )
                                                }
                                                options={Object.entries(
                                                    FRONTEND,
                                                )}
                                                placeholder="Choose complexity"
                                            />
                                            <AmountField
                                                label="Third-party library count"
                                                value={form.libraryCount}
                                                onChange={(value) =>
                                                    update(
                                                        'libraryCount',
                                                        value,
                                                    )
                                                }
                                                placeholder="e.g. 5"
                                            />
                                            <Hint>
                                                {money(
                                                    settings.library_per_item,
                                                )}{' '}
                                                per library
                                            </Hint>
                                        </Section>
                                        <Section number="06" title="Platform">
                                            <p>Where will this project run?</p>
                                            <Select
                                                value={form.platformType}
                                                onChange={(value) =>
                                                    update(
                                                        'platformType',
                                                        value as FormData['platformType'],
                                                    )
                                                }
                                                options={Object.entries(
                                                    PLATFORMS,
                                                )}
                                                placeholder="Choose platform"
                                            />
                                        </Section>
                                        <Section
                                            number="07"
                                            title="Additional features"
                                        >
                                            <p>
                                                Select every applicable feature.
                                            </p>
                                            <div className="mt-3 grid gap-3">
                                                {ADDONS.map(([key, label]) => (
                                                    <label
                                                        key={key}
                                                        className="flex cursor-pointer items-center justify-between gap-3"
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <Checkbox
                                                                checked={
                                                                    form.addOns[
                                                                        key
                                                                    ]
                                                                }
                                                                onCheckedChange={() =>
                                                                    update(
                                                                        'addOns',
                                                                        {
                                                                            ...form.addOns,
                                                                            [key]: !form
                                                                                .addOns[
                                                                                key
                                                                            ],
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                            {label}
                                                        </span>
                                                        <span className="whitespace-nowrap text-muted-foreground">
                                                            +
                                                            {money(
                                                                settings[
                                                                    `addon_${key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)}`
                                                                ],
                                                            )}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </Section>
                                        <Section
                                            number="08"
                                            title="Infrastructure"
                                        >
                                            <p>
                                                Does it need a VPS and domain?
                                            </p>
                                            <Toggle
                                                value={form.needInfra}
                                                onChange={(value) =>
                                                    update('needInfra', value)
                                                }
                                                yes="Required"
                                                no="Not required"
                                            />
                                            {form.needInfra && (
                                                <div className="grid gap-3">
                                                    <AmountField
                                                        label="VPS price (per year)"
                                                        value={form.vpsPrice}
                                                        onChange={(value) =>
                                                            update(
                                                                'vpsPrice',
                                                                value,
                                                            )
                                                        }
                                                        placeholder="600,000"
                                                    />
                                                    <AmountField
                                                        label="Domain price"
                                                        value={form.domainPrice}
                                                        onChange={(value) =>
                                                            update(
                                                                'domainPrice',
                                                                value,
                                                            )
                                                        }
                                                        placeholder="150,000"
                                                    />
                                                </div>
                                            )}
                                        </Section>
                                        <Section number="09" title="Deadline">
                                            <p>Choose the delivery urgency.</p>
                                            <Select
                                                value={form.deadlineUrgency}
                                                onChange={(value) =>
                                                    update(
                                                        'deadlineUrgency',
                                                        value as FormData['deadlineUrgency'],
                                                    )
                                                }
                                                options={Object.entries(
                                                    DEADLINES,
                                                ).map(([key, label]) => [
                                                    key,
                                                    key === 'rush'
                                                        ? `${label} (+${settings.urgency_rush_percent}%)`
                                                        : key === 'asap'
                                                          ? `${label} (+${settings.urgency_asap_percent}%)`
                                                          : label,
                                                ])}
                                                placeholder="Choose deadline"
                                            />
                                        </Section>
                                        <Section
                                            number="10"
                                            title="Revision policy"
                                        >
                                            <Select
                                                value={String(
                                                    form.revisionIncluded,
                                                )}
                                                onChange={(value) =>
                                                    update(
                                                        'revisionIncluded',
                                                        value as FormData['revisionIncluded'],
                                                    )
                                                }
                                                options={Object.entries(
                                                    REVISIONS,
                                                )}
                                                placeholder="Choose included revisions"
                                            />
                                        </Section>
                                    </div>
                                </div>
                                <div className="min-h-0 overflow-y-auto">
                                    <Aside
                                        calc={calc}
                                        pricing={settings}
                                        complete={complete}
                                        name={name}
                                        setName={setName}
                                        projectId={projectId}
                                        setProjectId={setProjectId}
                                        projects={projects}
                                        editing={editing}
                                        submit={submit}
                                        reset={reset}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {view === 'saved' && (
                        <Saved calculations={calculations} edit={edit} />
                    )}
                    {view === 'settings' && (
                        <Settings
                            pricing={pricing}
                            setPricing={setPricing}
                            save={saveSettings}
                        />
                    )}
                </div>
            </PageBody>
        </div>
    );
}

function EnquiryReference({ enquiry }: { enquiry: Enquiry }) {
    const expectedBudget = enquiry.expected_budget
        ? `${enquiry.expected_budget_currency ?? 'IDR'} ${Number(
              enquiry.expected_budget,
          ).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`
        : 'Not provided';

    return (
        <section className="shrink-0 border-b pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                        Enquiry reference
                    </p>
                    <h2 className="mt-1 font-semibold">{enquiry.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {enquiry.customer_name ?? 'Unknown customer'} · Budget:{' '}
                        {expectedBudget} · Delivery:{' '}
                        {enquiry.desired_delivery_date ?? 'Not provided'}
                    </p>
                </div>
                <Button asChild size="sm" variant="outline">
                    <Link href={`/ideabook?entry=${enquiry.id}`}>
                        <BookOpen className="size-4" />
                        View enquiry
                    </Link>
                </Button>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="min-w-0 border-t pt-3">
                    <h3 className="text-sm font-medium">
                        Customer requirements
                    </h3>
                    <p className="mt-2 max-h-32 overflow-y-auto text-sm leading-6 whitespace-pre-wrap">
                        {enquiry.content}
                    </p>
                </div>
                <div className="min-w-0 border-t pt-3">
                    <h3 className="text-sm font-medium">Proposed solution</h3>
                    <p className="mt-2 max-h-32 overflow-y-auto text-sm leading-6 whitespace-pre-wrap">
                        {enquiry.proposed_solution ??
                            'No proposed solution has been saved yet.'}
                    </p>
                </div>
            </div>
        </section>
    );
}

function calculate(form: FormData, p: Pricing) {
    const base = Math.min(
        form.workedBefore
            ? number(form.lastSalary) / p.salary_divisor
            : form.workedBefore === false
              ? number(form.laptopPrice) / p.laptop_divisor
              : 0,
        p.price_basis_cap,
    );
    const crud = number(form.crudCount) * p.crud_per_table;
    const login = form.hasLogin ? p[`login_${form.loginType}`] || 0 : 0;
    const relation = number(form.relationCount) * p.relation_per_item;
    const frontend = form.frontendLevel
        ? p[`frontend_${form.frontendLevel}`]
        : 0;
    const libraries = number(form.libraryCount) * p.library_per_item;
    const platform = form.platformType ? p[`platform_${form.platformType}`] : 0;
    const addons = ADDONS.reduce(
        (total, [key]) =>
            total +
            (form.addOns[key]
                ? p[
                      `addon_${key.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`)}`
                  ]
                : 0),
        0,
    );
    const featureTotal =
        crud + login + relation + frontend + libraries + platform + addons;
    const qa = (featureTotal * p.qa_percent) / 100;
    const urgency =
        form.deadlineUrgency === 'rush'
            ? ((featureTotal + qa) * p.urgency_rush_percent) / 100
            : form.deadlineUrgency === 'asap'
              ? ((featureTotal + qa) * p.urgency_asap_percent) / 100
              : 0;
    const complexity = featureTotal + qa + urgency;
    const infrastructure = form.needInfra
        ? number(form.vpsPrice) +
          number(form.domainPrice) +
          p.infrastructure_fee
        : 0;
    const total = Math.max(complexity, base) + infrastructure;

    return {
        ...p,
        base,
        crud,
        login,
        relation,
        frontend,
        libraries,
        platform,
        addons,
        qa,
        urgency,
        complexity,
        infrastructure,
        total,
    };
}
function isComplete(form: FormData) {
    return (
        form.workedBefore !== null &&
        (form.workedBefore ? !!form.lastSalary : !!form.laptopPrice) &&
        !!form.crudCount &&
        form.hasLogin !== null &&
        (!form.hasLogin || !!form.loginType) &&
        !!form.relationCount &&
        !!form.frontendLevel &&
        !!form.libraryCount &&
        !!form.platformType &&
        form.needInfra !== null &&
        (!form.needInfra || (!!form.vpsPrice && !!form.domainPrice)) &&
        !!form.deadlineUrgency &&
        !!form.revisionIncluded
    );
}
function Aside({
    calc,
    pricing,
    complete,
    name,
    setName,
    projectId,
    setProjectId,
    projects,
    editing,
    submit,
    reset,
}: {
    calc: ReturnType<typeof calculate>;
    pricing: Pricing;
    complete: boolean;
    name: string;
    setName: (value: string) => void;
    projectId: string;
    setProjectId: (value: string) => void;
    projects: Project[];
    editing: Calculation | null;
    submit: () => void;
    reset: () => void;
}) {
    return (
        <aside className="sticky top-0 h-fit space-y-4 self-start">
            <Card>
                <CardHeader>
                    <CardTitle>Fee breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Row label="CRUD features" value={calc.crud} />
                    <Row label="Login" value={calc.login} />
                    <Row label="Database relations" value={calc.relation} />
                    <Row label="Frontend" value={calc.frontend} />
                    <Row label="Third-party libraries" value={calc.libraries} />
                    <Row label="Platform" value={calc.platform} />
                    <Row label="Additional features" value={calc.addons} />
                    <Row label="QA & PM overhead" value={calc.qa} />
                    <Row label="Urgency fee" value={calc.urgency} />
                    <hr />
                    <Row
                        label="Complexity subtotal"
                        value={calc.complexity}
                        strong
                    />
                    <Row label="Price basis" value={calc.base} />
                    <Row label="VPS + domain" value={calc.infrastructure} />
                    <div className="mt-4 rounded-lg bg-primary p-4 text-primary-foreground">
                        <span className="text-xs font-medium tracking-wide uppercase">
                            Total fee
                        </span>
                        <strong className="mt-1 block text-2xl">
                            {complete ? money(calc.total) : 'Complete the form'}
                        </strong>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="space-y-3">
                    <Row
                        label="Maintenance after warranty"
                        value={
                            complete
                                ? (calc.total * pricing.maintenance_percent) /
                                  100
                                : 0
                        }
                    />
                    <Row
                        label="Extra revision"
                        value={
                            complete
                                ? Math.round(
                                      (calc.total *
                                          pricing.extra_revision_percent) /
                                          100 /
                                          pricing.extra_revision_rounding,
                                  ) * pricing.extra_revision_rounding
                                : 0
                        }
                    />
                    <Row
                        label="Suggested deposit"
                        value={
                            complete
                                ? (calc.total * pricing.deposit_percent) / 100
                                : 0
                        }
                    />
                </CardContent>
            </Card>
            <Card>
                <CardContent className="space-y-3">
                    <Label htmlFor="calculation-name">Calculation name</Label>
                    <Input
                        id="calculation-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="e.g. Online Store — Client A"
                    />
                    <Label htmlFor="calculation-project">Project</Label>
                    <Select
                        id="calculation-project"
                        value={projectId}
                        onChange={setProjectId}
                        options={projects.map((project) => [
                            String(project.id),
                            project.name,
                        ])}
                        placeholder="No linked project"
                    />
                    <div className="flex gap-2">
                        <Button
                            className="flex-1"
                            disabled={!complete || !name.trim()}
                            onClick={submit}
                        >
                            <Save />
                            {editing
                                ? 'Update calculation'
                                : 'Save calculation'}
                        </Button>
                        {editing && (
                            <Button variant="outline" onClick={reset}>
                                Cancel
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </aside>
    );
}
function Saved({
    calculations,
    edit,
}: {
    calculations: Calculation[];
    edit: (calculation: Calculation) => void;
}) {
    return (
        <div className="min-h-0 flex-1 overflow-auto">
            <DataTable className="min-w-full">
                <thead className="bg-muted/50 text-left">
                    <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Enquiry</th>
                        <th className="px-4 py-3">Project</th>
                        <th className="px-4 py-3">Saved</th>
                        <th className="px-4 py-3 text-right">Total</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {calculations.map((calculation) => (
                        <tr key={calculation.id} className="border-t">
                            <td className="px-4 py-3 font-medium">
                                {calculation.name}
                            </td>
                            <td className="px-4 py-3">
                                {calculation.problem ? (
                                    <Link
                                        className="text-primary underline-offset-4 hover:underline"
                                        href={`/ideabook?entry=${calculation.problem.id}`}
                                    >
                                        {calculation.problem.customer_name ??
                                            calculation.problem.title}
                                    </Link>
                                ) : (
                                    '-'
                                )}
                            </td>
                            <td className="px-4 py-3">
                                {calculation.project?.name ?? '-'}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                                {new Date(
                                    calculation.created_at,
                                ).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                                {money(calculation.total)}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        title="Edit"
                                        onClick={() => edit(calculation)}
                                    >
                                        <Pencil />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        title="Delete"
                                        onClick={() => {
                                            if (
                                                window.confirm(
                                                    'Delete this calculation?',
                                                )
                                            ) {
                                                router.delete(
                                                    `/price-calculator/${calculation.id}`,
                                                );
                                            }
                                        }}
                                    >
                                        <Trash2 className="size-4" />
                                        Delete
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {calculations.length === 0 && (
                        <tr>
                            <td
                                colSpan={6}
                                className="px-4 py-12 text-center text-muted-foreground"
                            >
                                No saved calculations yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </DataTable>
        </div>
    );
}
function Settings({
    pricing,
    setPricing,
    save,
}: {
    pricing: Pricing;
    setPricing: (pricing: Pricing) => void;
    save: () => void;
}) {
    return (
        <div className="min-h-0 flex-1 overflow-y-auto">
            <DataTable className="min-w-[720px]">
                <thead className="bg-muted/50 text-left">
                    <tr>
                        <th className="px-4 py-3">Setting</th>
                        <th className="w-[360px] px-4 py-3">Value</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(PRICING_KEYS).map(([key, label]) => (
                        <tr key={key} className="border-t">
                            <td className="px-4 py-3 font-medium">{label}</td>
                            <td className="w-[360px] px-4 py-3">
                                <SettingsInput
                                    id={key}
                                    value={pricing[key]}
                                    onChange={(value) =>
                                        setPricing({ ...pricing, [key]: value })
                                    }
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </DataTable>
            <Button className="sticky bottom-0 mt-4" onClick={save}>
                <Save />
                Save settings
            </Button>
        </div>
    );
}
function SettingsInput({
    id,
    value,
    onChange,
}: {
    id: string;
    value: number;
    onChange: (value: number) => void;
}) {
    const format = (amount: number) =>
        amount.toLocaleString('id-ID', { maximumFractionDigits: 0 });
    const [draft, setDraft] = useState(format(value));

    return (
        <Input
            id={id}
            type="text"
            inputMode="numeric"
            value={draft}
            onChange={(event) => {
                const digits = event.target.value.replace(/\D/g, '');
                setDraft(digits ? Number(digits).toLocaleString('id-ID') : '');
                onChange(Number(digits) || 0);
            }}
        />
    );
}
function Section({
    number,
    title,
    children,
    className = '',
}: {
    number: string;
    title: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-base">
                    <span className="mr-2 text-muted-foreground">{number}</span>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
                {children}
            </CardContent>
        </Card>
    );
}
function Toggle({
    value,
    onChange,
    yes,
    no,
}: {
    value: boolean | null;
    onChange: (value: boolean) => void;
    yes: string;
    no: string;
}) {
    return (
        <div className="grid grid-cols-2 gap-2">
            <Button
                type="button"
                variant={value === true ? 'default' : 'outline'}
                onClick={() => onChange(true)}
            >
                {yes}
            </Button>
            <Button
                type="button"
                variant={value === false ? 'default' : 'outline'}
                onClick={() => onChange(false)}
            >
                {no}
            </Button>
        </div>
    );
}
function AmountField({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
}) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <AmountInput
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />
        </div>
    );
}
function Select({
    id,
    value,
    onChange,
    options,
    placeholder,
}: {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    options: readonly (readonly [string, string | number])[];
    placeholder: string;
}) {
    return (
        <select
            id={id}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            value={value}
            onChange={(event) => onChange(event.target.value)}
        >
            <option value="">{placeholder}</option>
            {options.map(([key, label]) => (
                <option key={key} value={key}>
                    {label}
                </option>
            ))}
        </select>
    );
}
function Hint({ children }: { children: React.ReactNode }) {
    return <p className="text-xs text-muted-foreground">{children}</p>;
}
function Row({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: number;
    strong?: boolean;
}) {
    return (
        <div
            className={
                strong
                    ? 'flex justify-between font-semibold'
                    : 'flex justify-between gap-4 text-muted-foreground'
            }
        >
            <span>{label}</span>
            <span className="whitespace-nowrap text-foreground">
                {money(value)}
            </span>
        </div>
    );
}
PriceCalculator.layout = {
    breadcrumbs: [{ title: 'Price Calculator', href: '/price-calculator' }],
};
