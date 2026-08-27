import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    BriefcaseBusiness,
    Calculator,
    Columns3,
    Info,
    Lightbulb,
    Link2,
    Maximize2,
    Plus,
    Unlink,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { CalendarView } from '@/components/calendar-view';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

type EntryType = 'problem' | 'enquiry';
type EntryStatus =
    | 'open'
    | 'investigating'
    | 'solution_drafted'
    | 'testing'
    | 'resolved'
    | 'closed'
    | 'new_enquiry'
    | 'discovery'
    | 'proposal_drafted'
    | 'proposal_sent'
    | 'won'
    | 'lost';

const problemStatuses: Array<{ value: EntryStatus; label: string }> = [
    { value: 'open', label: 'Open' },
    { value: 'investigating', label: 'Investigating' },
    { value: 'solution_drafted', label: 'Solution drafted' },
    { value: 'testing', label: 'Testing solution' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
];

const enquiryStatuses: Array<{ value: EntryStatus; label: string }> = [
    { value: 'new_enquiry', label: 'New enquiry' },
    { value: 'discovery', label: 'Discovery' },
    { value: 'proposal_drafted', label: 'Proposal drafted' },
    { value: 'proposal_sent', label: 'Proposal sent' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' },
];

type IdeaEntry = {
    id: number;
    title: string;
    content: string;
    is_validated: boolean;
    validation_content: string | null;
    created_at: string;
    updated_at: string;
};

type ProblemEntry = {
    id: number;
    idea_id: number | null;
    idea_title: string | null;
    entry_type: EntryType;
    status: EntryStatus;
    project_owner_id: number | null;
    project_owner_name: string | null;
    project_id: number | null;
    project_name: string | null;
    customer_name: string | null;
    contact_person: string | null;
    contact_method: string | null;
    enquiry_source: string | null;
    expected_budget: string | null;
    expected_budget_currency: string | null;
    desired_delivery_date: string | null;
    follow_up_date: string | null;
    next_action: string | null;
    price_calculations: PriceCalculationSummary[];
    title: string;
    content: string;
    validation_content: string | null;
    created_at: string;
    updated_at: string;
};

type ProjectOwnerOption = { id: number; name: string };
type ProjectOption = { id: number; name: string; owner_id: number };
type PriceCalculationSummary = {
    id: number;
    name: string;
    total: number;
    created_at?: string;
};

type ConfirmAction = 'update-problem' | 'delete-problem' | 'update-idea' | null;

function getDateKey(date: Date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function formatTimeLabel(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

function formatFullDateLabel(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}

export default function Dashboard({
    ideas,
    problems,
    projectOwners,
    projects,
    availablePriceCalculations,
    selectedEntryId,
}: {
    ideas: IdeaEntry[];
    problems: ProblemEntry[];
    projectOwners: ProjectOwnerOption[];
    projects: ProjectOption[];
    availablePriceCalculations: PriceCalculationSummary[];
    selectedEntryId: number | null;
}) {
    const initialEntry = problems.find((entry) => entry.id === selectedEntryId);
    const initialSolution = initialEntry?.idea_id
        ? ideas.find((idea) => idea.id === initialEntry.idea_id)
        : null;
    const page = usePage();
    const [isProblemEditorOpen, setIsProblemEditorOpen] = useState(
        Boolean(initialEntry),
    );
    const [isProblemTextareaExpanded, setIsProblemTextareaExpanded] =
        useState(false);
    const [isIdeaEditorOpen, setIsIdeaEditorOpen] = useState(
        Boolean(initialSolution),
    );
    const [problemDraft, setProblemDraft] = useState(
        initialEntry?.content ?? '',
    );
    const [ideaDraft, setIdeaDraft] = useState(initialSolution?.content ?? '');
    const [titleDraft, setTitleDraft] = useState(initialEntry?.title ?? '');
    const [entryType, setEntryType] = useState<EntryType>(
        initialEntry?.entry_type ?? 'problem',
    );
    const [entryStatus, setEntryStatus] = useState<EntryStatus>(
        initialEntry?.status ?? 'open',
    );
    const [projectOwnerId, setProjectOwnerId] = useState(
        String(initialEntry?.project_owner_id ?? 'none'),
    );
    const [projectId, setProjectId] = useState(
        String(initialEntry?.project_id ?? 'none'),
    );
    const [customerName, setCustomerName] = useState(
        initialEntry?.customer_name ?? initialEntry?.project_owner_name ?? '',
    );
    const [contactMethod, setContactMethod] = useState(
        initialEntry?.contact_method ?? '',
    );
    const [enquirySource, setEnquirySource] = useState(
        initialEntry?.enquiry_source ?? '',
    );
    const [expectedBudget, setExpectedBudget] = useState(
        initialEntry?.expected_budget ?? '',
    );
    const [budgetCurrency, setBudgetCurrency] = useState(
        initialEntry?.expected_budget_currency ?? 'IDR',
    );
    const [desiredDeliveryDate, setDesiredDeliveryDate] = useState(
        initialEntry?.desired_delivery_date ?? '',
    );
    const [followUpDate, setFollowUpDate] = useState(
        initialEntry?.follow_up_date ?? '',
    );
    const [nextAction, setNextAction] = useState(
        initialEntry?.next_action ?? '',
    );
    const [priceCalculationId, setPriceCalculationId] = useState('none');
    const [isOwnerDialogOpen, setIsOwnerDialogOpen] = useState(false);
    const [pendingOwnerName, setPendingOwnerName] = useState('');
    const [ownerCountry, setOwnerCountry] = useState('');
    const [ownerContactNumber, setOwnerContactNumber] = useState('');
    const [isOwnerSaving, setIsOwnerSaving] = useState(false);
    const [entryTypeFilter, setEntryTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('active');
    const [activeProblemId, setActiveProblemId] = useState<number | null>(
        initialEntry?.id ?? null,
    );
    const [isSaving, setIsSaving] = useState(false);
    const [problemErrors, setProblemErrors] = useState<Record<string, string>>(
        {},
    );
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
    const [regenerateTitleOnUpdate, setRegenerateTitleOnUpdate] =
        useState(false);
    const [showAiFailureDialog, setShowAiFailureDialog] = useState(
        page.props.flash.ai_title_generation.failed,
    );
    const problemTextareaRef = useRef<HTMLTextAreaElement | null>(null);
    const ideaTextareaRef = useRef<HTMLTextAreaElement | null>(null);

    const today = useMemo(() => new Date(), []);
    const todayLabel = useMemo(() => formatFullDateLabel(today), [today]);

    const activeProblem = useMemo(
        () =>
            activeProblemId === null
                ? null
                : (problems.find((entry) => entry.id === activeProblemId) ??
                  null),
        [activeProblemId, problems],
    );
    const activeIdea = useMemo(
        () =>
            activeProblem?.idea_id === null ||
            activeProblem?.idea_id === undefined
                ? null
                : (ideas.find((entry) => entry.id === activeProblem.idea_id) ??
                  null),
        [activeProblem?.idea_id, ideas],
    );
    const filteredProblems = useMemo(
        () =>
            problems.filter(
                (entry) =>
                    (entryTypeFilter === 'all' ||
                        entry.entry_type === entryTypeFilter) &&
                    (statusFilter === 'all' ||
                        (statusFilter === 'active'
                            ? !['resolved', 'closed', 'won', 'lost'].includes(
                                  entry.status,
                              )
                            : entry.status === statusFilter)),
            ),
        [entryTypeFilter, problems, statusFilter],
    );
    const availableProjects = useMemo(
        () =>
            projectOwnerId === 'none'
                ? projects
                : projects.filter(
                      (project) => String(project.owner_id) === projectOwnerId,
                  ),
        [projectOwnerId, projects],
    );

    const activeProblemDate = activeProblem
        ? new Date(activeProblem.created_at)
        : null;
    const activeProblemDateLabel = activeProblemDate
        ? formatFullDateLabel(activeProblemDate)
        : todayLabel;
    const problemSavedAt = activeProblem
        ? formatTimeLabel(new Date(activeProblem.updated_at))
        : null;

    function focusTextarea(
        ref: React.RefObject<HTMLTextAreaElement | null>,
        position: 'start' | 'end',
    ) {
        requestAnimationFrame(() => {
            const textarea = ref.current;

            if (!textarea) {
                return;
            }

            textarea.focus();

            const cursorPosition =
                position === 'end' ? textarea.value.length : 0;

            textarea.setSelectionRange(cursorPosition, cursorPosition);
        });
    }

    useEffect(() => {
        if (!isProblemEditorOpen || isIdeaEditorOpen) {
            return;
        }

        focusTextarea(problemTextareaRef, 'end');
    }, [isIdeaEditorOpen, isProblemEditorOpen]);

    function resetProblemEditorState() {
        setIsProblemTextareaExpanded(false);
        setProblemDraft('');
        setTitleDraft('');
        setActiveProblemId(null);
        setEntryType('problem');
        setEntryStatus('open');
        setProjectOwnerId('none');
        setProjectId('none');
        setCustomerName('');
        setContactMethod('');
        setEnquirySource('');
        setExpectedBudget('');
        setBudgetCurrency('IDR');
        setDesiredDeliveryDate('');
        setFollowUpDate('');
        setNextAction('');
        setProblemErrors({});
        setRegenerateTitleOnUpdate(false);
    }

    function resetIdeaEditorState() {
        setIdeaDraft('');
        setRegenerateTitleOnUpdate(false);
    }

    function openNewProblem() {
        resetProblemEditorState();
        resetIdeaEditorState();
        setIsIdeaEditorOpen(false);
        setIsProblemEditorOpen(true);
        focusTextarea(problemTextareaRef, 'start');
    }

    function openExistingProblem(entry: ProblemEntry) {
        setProblemErrors({});
        setActiveProblemId(entry.id);
        setProblemDraft(entry.content);
        setTitleDraft(entry.title);
        setEntryType(entry.entry_type);
        setEntryStatus(entry.status);
        setProjectOwnerId(String(entry.project_owner_id ?? 'none'));
        setProjectId(String(entry.project_id ?? 'none'));
        setCustomerName(entry.customer_name ?? entry.project_owner_name ?? '');
        setContactMethod(entry.contact_method ?? '');
        setEnquirySource(entry.enquiry_source ?? '');
        setExpectedBudget(entry.expected_budget ?? '');
        setBudgetCurrency(entry.expected_budget_currency ?? 'IDR');
        setDesiredDeliveryDate(entry.desired_delivery_date ?? '');
        setFollowUpDate(entry.follow_up_date ?? '');
        setNextAction(entry.next_action ?? '');
        setRegenerateTitleOnUpdate(false);
        setIsProblemEditorOpen(true);
        focusTextarea(problemTextareaRef, 'end');

        if (entry.idea_id) {
            const linkedIdea =
                ideas.find((idea) => idea.id === entry.idea_id) ?? null;

            setIdeaDraft(linkedIdea?.content ?? '');
            setIsIdeaEditorOpen(true);
            focusTextarea(ideaTextareaRef, linkedIdea ? 'end' : 'start');

            return;
        }

        resetIdeaEditorState();
        setIsIdeaEditorOpen(false);
    }

    function openIdeaEditor() {
        if (!activeProblem) {
            return;
        }

        setIdeaDraft(activeIdea?.content ?? '');
        setIsIdeaEditorOpen(true);
        focusTextarea(ideaTextareaRef, activeIdea ? 'end' : 'start');
    }

    function closeAllEditors() {
        setIsProblemTextareaExpanded(false);
        setIsIdeaEditorOpen(false);
        setIsProblemEditorOpen(false);
    }

    function closeIdeaEditor() {
        setIsIdeaEditorOpen(false);
        resetIdeaEditorState();
    }

    function linkPriceCalculation() {
        if (!activeProblem || priceCalculationId === 'none') {
            return;
        }

        router.put(
            `/ideabook/problems/${activeProblem.id}/price-calculations/${priceCalculationId}`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => setPriceCalculationId('none'),
            },
        );
    }

    function unlinkPriceCalculation(calculationId: number) {
        if (!activeProblem) {
            return;
        }

        router.delete(
            `/ideabook/problems/${activeProblem.id}/price-calculations/${calculationId}`,
            { preserveScroll: true },
        );
    }

    function findProjectOwner(name: string) {
        const normalizedName = name.trim().toLocaleLowerCase();

        return (
            projectOwners.find(
                (owner) =>
                    owner.name.trim().toLocaleLowerCase() === normalizedName,
            ) ?? null
        );
    }

    function selectCustomerName(name: string) {
        setCustomerName(name);
        const owner = findProjectOwner(name);
        setProjectOwnerId(owner ? String(owner.id) : 'none');

        const selectedProject = projects.find(
            (project) => String(project.id) === projectId,
        );

        if (!owner || selectedProject?.owner_id !== owner.id) {
            setProjectId('none');
        }
    }

    function resolveCustomerName() {
        const trimmedName = customerName.trim();

        if (!trimmedName) {
            return null;
        }

        const owner = findProjectOwner(trimmedName);

        if (owner) {
            setCustomerName(owner.name);
            setProjectOwnerId(String(owner.id));

            return owner;
        }

        setPendingOwnerName(trimmedName);
        setOwnerCountry('');
        setOwnerContactNumber('');
        setIsOwnerDialogOpen(true);

        return null;
    }

    function createProjectOwner(event: FormEvent) {
        event.preventDefault();

        if (!pendingOwnerName.trim() || !ownerCountry.trim()) {
            return;
        }

        setIsOwnerSaving(true);
        router.post(
            '/ideabook/project-owners',
            {
                name: pendingOwnerName.trim(),
                country: ownerCountry.trim(),
                contact_number: ownerContactNumber.trim() || null,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (inertiaPage) => {
                    const owners = inertiaPage.props
                        .projectOwners as ProjectOwnerOption[];
                    const owner = owners.find(
                        (item) =>
                            item.name.trim().toLocaleLowerCase() ===
                            pendingOwnerName.trim().toLocaleLowerCase(),
                    );

                    if (owner) {
                        setCustomerName(owner.name);
                        setProjectOwnerId(String(owner.id));
                    }

                    setIsOwnerDialogOpen(false);
                },
                onFinish: () => setIsOwnerSaving(false),
            },
        );
    }

    function saveProblem() {
        const trimmedDraft = problemDraft.trim();

        if (trimmedDraft.length === 0) {
            return;
        }

        setIsSaving(true);
        setProblemErrors({});

        const payload = {
            title: titleDraft.trim() || null,
            entry_type: entryType,
            status: entryStatus,
            project_owner_id:
                findProjectOwner(customerName)?.id ??
                (projectOwnerId === 'none' ? null : Number(projectOwnerId)),
            project_id: projectId === 'none' ? null : Number(projectId),
            customer_name: customerName.trim() || null,
            contact_person: customerName.trim() || null,
            contact_method: contactMethod.trim() || null,
            enquiry_source: enquirySource.trim() || null,
            expected_budget: expectedBudget || null,
            expected_budget_currency: expectedBudget
                ? budgetCurrency.toUpperCase()
                : null,
            desired_delivery_date: desiredDeliveryDate || null,
            follow_up_date: followUpDate || null,
            next_action: nextAction.trim() || null,
            content: trimmedDraft,
            validation_content: null,
            regenerate_title: regenerateTitleOnUpdate,
        };

        const onFinish = () => {
            setIsSaving(false);
        };

        const onSuccess = () => {
            resetProblemEditorState();
            resetIdeaEditorState();
            closeAllEditors();
        };
        const onError = (errors: Record<string, string>) => {
            setProblemErrors(errors);
        };

        if (activeProblemId !== null) {
            router.put(`/ideabook/problems/${activeProblemId}`, payload, {
                preserveScroll: true,
                onFinish,
                onSuccess,
                onError,
            });

            return;
        }

        router.post('/ideabook/problems', payload, {
            preserveScroll: true,
            onFinish,
            onSuccess,
            onError,
        });
    }

    function requestProblemSave() {
        if (isSaving || problemDraft.trim().length === 0) {
            return;
        }

        if (entryType === 'enquiry') {
            if (!customerName.trim()) {
                return;
            }

            if (!findProjectOwner(customerName)) {
                resolveCustomerName();

                return;
            }
        }

        if (activeProblem) {
            setConfirmAction('update-problem');

            return;
        }

        saveProblem();
    }

    function deleteProblem() {
        if (activeProblemId === null) {
            return;
        }

        setIsSaving(true);

        router.delete(`/ideabook/problems/${activeProblemId}`, {
            preserveScroll: true,
            onFinish: () => {
                setIsSaving(false);
            },
            onSuccess: () => {
                resetProblemEditorState();
                resetIdeaEditorState();
                closeAllEditors();
            },
        });
    }

    function confirmPendingAction() {
        if (confirmAction === 'update-problem') {
            setConfirmAction(null);
            saveProblem();

            return;
        }

        if (confirmAction === 'update-idea') {
            setConfirmAction(null);
            saveLinkedIdea();

            return;
        }

        if (confirmAction === 'delete-problem') {
            setConfirmAction(null);
            deleteProblem();
        }
    }

    function saveLinkedIdea() {
        const trimmedDraft = ideaDraft.trim();

        if (!activeProblem || trimmedDraft.length === 0) {
            return;
        }

        setIsSaving(true);

        if (activeIdea) {
            router.put(
                `/ideabook/ideas/${activeIdea.id}`,
                {
                    content: trimmedDraft,
                    is_validated: activeIdea.is_validated,
                    validation_content: activeIdea.validation_content,
                    regenerate_title: regenerateTitleOnUpdate,
                },
                {
                    preserveScroll: true,
                    onFinish: () => {
                        setIsSaving(false);
                    },
                    onSuccess: () => {
                        closeIdeaEditor();
                    },
                },
            );

            return;
        }

        router.post(
            `/ideabook/problems/${activeProblem.id}/idea`,
            {
                content: trimmedDraft,
                validation_content: null,
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsSaving(false);
                },
                onSuccess: () => {
                    closeIdeaEditor();
                },
            },
        );
    }

    function requestIdeaSave() {
        if (isSaving || ideaDraft.trim().length === 0) {
            return;
        }

        if (activeIdea) {
            setConfirmAction('update-idea');

            return;
        }

        saveLinkedIdea();
    }

    const aiFailureEntryType = page.props.flash.ai_title_generation.entry_type;
    const calendarWidthClass = isIdeaEditorOpen
        ? 'w-1/3'
        : isProblemEditorOpen
          ? 'w-1/2'
          : 'flex-1';
    const problemWidthClass = isProblemEditorOpen
        ? isIdeaEditorOpen
            ? 'w-1/3'
            : 'w-1/2'
        : 'w-0 border-l-0';

    return (
        <>
            <Head title="IdeaBook" />
            <div className="group/sidebar-dashboard flex h-full min-h-0 flex-1 overflow-hidden bg-background">
                <div
                    className={[
                        'flex h-full min-h-0 overflow-hidden transition-[width] duration-300 ease-out',
                        calendarWidthClass,
                    ].join(' ')}
                >
                    <CalendarView
                        pageTitle="IdeaBook"
                        headerActions={
                            <>
                                {!isProblemEditorOpen && (
                                    <>
                                        <Select
                                            value={entryTypeFilter}
                                            onValueChange={(value) => {
                                                setEntryTypeFilter(value);
                                                setStatusFilter('active');
                                            }}
                                        >
                                            <SelectTrigger
                                                className="w-[140px]"
                                                aria-label="Filter entry type"
                                            >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All entries
                                                </SelectItem>
                                                <SelectItem value="problem">
                                                    Problems
                                                </SelectItem>
                                                <SelectItem value="enquiry">
                                                    Enquiries
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select
                                            value={statusFilter}
                                            onValueChange={setStatusFilter}
                                        >
                                            <SelectTrigger
                                                className="w-[150px]"
                                                aria-label="Filter status"
                                            >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">
                                                    Active
                                                </SelectItem>
                                                <SelectItem value="all">
                                                    All statuses
                                                </SelectItem>
                                                {(entryTypeFilter === 'enquiry'
                                                    ? enquiryStatuses
                                                    : entryTypeFilter ===
                                                        'problem'
                                                      ? problemStatuses
                                                      : [
                                                            ...problemStatuses,
                                                            ...enquiryStatuses,
                                                        ]
                                                ).map((status) => (
                                                    <SelectItem
                                                        key={status.value}
                                                        value={status.value}
                                                    >
                                                        {status.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </>
                                )}
                                <Button asChild variant="outline">
                                    <Link href="/ideabook/pipeline">
                                        <Columns3 className="size-4" />
                                        Pipeline
                                    </Link>
                                </Button>
                                <Button type="button" onClick={openNewProblem}>
                                    <Plus className="size-4" />
                                    New entry
                                </Button>
                            </>
                        }
                        renderDayContent={(date) => {
                            const dayProblems = filteredProblems.filter(
                                (entry) =>
                                    getDateKey(new Date(entry.created_at)) ===
                                        getDateKey(date) ||
                                    entry.follow_up_date === getDateKey(date),
                            );

                            return dayProblems.map((entry) => {
                                const isFollowUp =
                                    entry.follow_up_date === getDateKey(date);
                                const isOverdue =
                                    isFollowUp &&
                                    entry.follow_up_date !== null &&
                                    entry.follow_up_date < getDateKey(today) &&
                                    !['won', 'lost'].includes(entry.status);

                                return (
                                    <button
                                        key={`problem-${entry.id}`}
                                        type="button"
                                        onClick={() =>
                                            openExistingProblem(entry)
                                        }
                                        className={[
                                            'inline-flex w-fit max-w-full items-center gap-1.5 rounded-md border px-2 py-1 text-left text-xs font-medium transition-colors',
                                            isOverdue
                                                ? 'border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15'
                                                : ['resolved', 'won'].includes(
                                                        entry.status,
                                                    )
                                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100'
                                                  : ['closed', 'lost'].includes(
                                                          entry.status,
                                                      )
                                                    ? 'border-border bg-muted text-muted-foreground hover:bg-muted/80'
                                                    : [
                                                            'solution_drafted',
                                                            'proposal_drafted',
                                                            'proposal_sent',
                                                        ].includes(entry.status)
                                                      ? 'border-sky-300 bg-sky-50 text-sky-900 hover:bg-sky-100 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-100'
                                                      : 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100',
                                        ].join(' ')}
                                    >
                                        {entry.entry_type === 'enquiry' ? (
                                            <BriefcaseBusiness className="h-3 w-3 shrink-0" />
                                        ) : (
                                            <AlertCircle className="h-3 w-3 shrink-0" />
                                        )}
                                        <span className="truncate">
                                            {isFollowUp
                                                ? `Follow up: ${entry.customer_name ?? entry.title}`
                                                : entry.customer_name
                                                  ? `${entry.customer_name}: ${entry.title}`
                                                  : entry.title}
                                        </span>
                                    </button>
                                );
                            });
                        }}
                    />
                </div>

                <div
                    className={[
                        'min-h-0 overflow-hidden border-l border-border bg-background transition-[width] duration-300 ease-out',
                        problemWidthClass,
                    ].join(' ')}
                >
                    <div
                        className={[
                            'flex h-full min-h-0 w-full flex-col transition-all duration-300 ease-out',
                            isProblemEditorOpen
                                ? 'translate-x-0 opacity-100'
                                : 'translate-x-8 opacity-0',
                        ].join(' ')}
                    >
                        <div className="flex shrink-0 flex-col gap-3 border-b px-4 py-4">
                            <div className="min-w-0">
                                <h2 className="text-2xl font-semibold tracking-normal break-words">
                                    {activeProblem
                                        ? `Editing ${activeProblem.title}`
                                        : entryType === 'enquiry'
                                          ? 'New customer enquiry'
                                          : 'New problem'}
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {activeProblemDateLabel}
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={closeAllEditors}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>

                        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
                            <div className="mb-4 grid shrink-0 gap-4 border-b pb-4">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Entry type</Label>
                                        <ToggleGroup
                                            type="single"
                                            variant="outline"
                                            value={entryType}
                                            onValueChange={(value) => {
                                                if (value) {
                                                    const nextType =
                                                        value as EntryType;
                                                    setEntryType(nextType);
                                                    setEntryStatus(
                                                        nextType === 'enquiry'
                                                            ? 'new_enquiry'
                                                            : 'open',
                                                    );
                                                }
                                            }}
                                            className="w-full"
                                        >
                                            <ToggleGroupItem
                                                value="problem"
                                                className="flex-1"
                                            >
                                                <AlertCircle className="size-4" />
                                                Problem
                                            </ToggleGroupItem>
                                            <ToggleGroupItem
                                                value="enquiry"
                                                className="flex-1"
                                            >
                                                <BriefcaseBusiness className="size-4" />
                                                Enquiry
                                            </ToggleGroupItem>
                                        </ToggleGroup>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="entry-status">
                                            Status
                                        </Label>
                                        <Select
                                            value={entryStatus}
                                            onValueChange={(value) =>
                                                setEntryStatus(
                                                    value as EntryStatus,
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                id="entry-status"
                                                className="w-full"
                                            >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(entryType === 'enquiry'
                                                    ? enquiryStatuses
                                                    : problemStatuses
                                                ).map((status) => (
                                                    <SelectItem
                                                        key={status.value}
                                                        value={status.value}
                                                    >
                                                        {status.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {entryType === 'enquiry' && (
                                    <div className="grid gap-3">
                                        <h3 className="text-sm font-semibold">
                                            Customer
                                        </h3>
                                        <div className="grid gap-2">
                                            <Label htmlFor="customer-name">
                                                Customer name
                                            </Label>
                                            <Input
                                                id="customer-name"
                                                list="project-owner-options"
                                                value={customerName}
                                                onChange={(event) =>
                                                    selectCustomerName(
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                                onBlur={resolveCustomerName}
                                                placeholder="Select or enter a customer"
                                            />
                                            <datalist id="project-owner-options">
                                                {projectOwners.map((owner) => (
                                                    <option
                                                        key={owner.id}
                                                        value={owner.name}
                                                    />
                                                ))}
                                            </datalist>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="entry-project">
                                                Existing project
                                            </Label>
                                            <Select
                                                value={projectId}
                                                onValueChange={(value) => {
                                                    setProjectId(value);

                                                    const project =
                                                        projects.find(
                                                            (item) =>
                                                                String(
                                                                    item.id,
                                                                ) === value,
                                                        );

                                                    if (project) {
                                                        setProjectOwnerId(
                                                            String(
                                                                project.owner_id,
                                                            ),
                                                        );
                                                        const owner =
                                                            projectOwners.find(
                                                                (item) =>
                                                                    item.id ===
                                                                    project.owner_id,
                                                            );

                                                        if (owner) {
                                                            setCustomerName(
                                                                owner.name,
                                                            );
                                                        }
                                                    }
                                                }}
                                            >
                                                <SelectTrigger
                                                    id="entry-project"
                                                    className="w-full"
                                                >
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">
                                                        Not linked
                                                    </SelectItem>
                                                    {availableProjects.map(
                                                        (project) => (
                                                            <SelectItem
                                                                key={project.id}
                                                                value={String(
                                                                    project.id,
                                                                )}
                                                            >
                                                                {project.name}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="contact-method">
                                                    Contact method
                                                </Label>
                                                <Input
                                                    id="contact-method"
                                                    value={contactMethod}
                                                    onChange={(event) =>
                                                        setContactMethod(
                                                            event.currentTarget
                                                                .value,
                                                        )
                                                    }
                                                    placeholder="Email, phone, chat"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="enquiry-source">
                                                    Enquiry source
                                                </Label>
                                                <Input
                                                    id="enquiry-source"
                                                    value={enquirySource}
                                                    onChange={(event) =>
                                                        setEnquirySource(
                                                            event.currentTarget
                                                                .value,
                                                        )
                                                    }
                                                    placeholder="Referral, website, marketplace"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="grid gap-2">
                                    <h3 className="text-sm font-semibold">
                                        {entryType === 'enquiry'
                                            ? 'Enquiry details'
                                            : 'Problem details'}
                                    </h3>
                                    <Label htmlFor="entry-title">Title</Label>
                                    <Input
                                        id="entry-title"
                                        value={titleDraft}
                                        onChange={(event) =>
                                            setTitleDraft(
                                                event.currentTarget.value,
                                            )
                                        }
                                        placeholder="Leave blank for Gemini"
                                    />
                                </div>
                            </div>

                            <div className="grid shrink-0 gap-2">
                                <div className="flex items-center justify-between gap-2">
                                    <Label htmlFor="entry-details">
                                        {entryType === 'enquiry'
                                            ? 'Customer requirements'
                                            : 'Problem description'}
                                    </Label>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        title="Expand editor"
                                        onClick={() =>
                                            setIsProblemTextareaExpanded(true)
                                        }
                                    >
                                        <Maximize2 className="size-4" />
                                        <span className="sr-only">
                                            Expand editor
                                        </span>
                                    </Button>
                                </div>
                                <Textarea
                                    id="entry-details"
                                    ref={problemTextareaRef}
                                    aria-label="Entry details editor"
                                    wrap="soft"
                                    placeholder={
                                        entryType === 'enquiry'
                                            ? 'Describe the customer need, constraints, and desired outcome...'
                                            : 'Describe the problem here...'
                                    }
                                    value={problemDraft}
                                    onChange={(event) =>
                                        setProblemDraft(
                                            event.currentTarget.value,
                                        )
                                    }
                                    onKeyDown={(event) => {
                                        if (
                                            event.ctrlKey &&
                                            event.key === 'Enter'
                                        ) {
                                            event.preventDefault();
                                            requestProblemSave();

                                            return;
                                        }

                                        if (event.key === 'Escape') {
                                            event.preventDefault();
                                            closeAllEditors();
                                        }
                                    }}
                                    className="h-56 min-h-56 resize-none overflow-x-hidden bg-background px-4 py-4 text-sm leading-6"
                                />
                            </div>

                            {entryType === 'enquiry' && (
                                <div className="mt-8 grid shrink-0 gap-5">
                                    <section className="grid gap-3">
                                        <h3 className="text-sm font-semibold">
                                            Commercial and timeline
                                        </h3>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="expected-budget">
                                                    Expected budget
                                                </Label>
                                                <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-2">
                                                    <Input
                                                        value={budgetCurrency}
                                                        maxLength={3}
                                                        aria-label="Budget currency"
                                                        onChange={(event) =>
                                                            setBudgetCurrency(
                                                                event
                                                                    .currentTarget
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                    <Input
                                                        id="expected-budget"
                                                        type="number"
                                                        min="0"
                                                        value={expectedBudget}
                                                        onChange={(event) =>
                                                            setExpectedBudget(
                                                                event
                                                                    .currentTarget
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="delivery-date">
                                                    Desired delivery
                                                </Label>
                                                <Input
                                                    id="delivery-date"
                                                    type="date"
                                                    value={desiredDeliveryDate}
                                                    onChange={(event) =>
                                                        setDesiredDeliveryDate(
                                                            event.currentTarget
                                                                .value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    <section className="grid gap-3">
                                        <h3 className="text-sm font-semibold">
                                            Follow-up
                                        </h3>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <div className="flex items-center gap-1.5">
                                                    <Label htmlFor="next-action">
                                                        Next action
                                                    </Label>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                type="button"
                                                                aria-label="About next action"
                                                                className="text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                                            >
                                                                <Info className="size-3.5" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent
                                                            side="top"
                                                            className="max-w-xs space-y-2 p-3 leading-5"
                                                        >
                                                            <p>
                                                                Enter the single
                                                                concrete task
                                                                you need to
                                                                perform next to
                                                                move the enquiry
                                                                forward.
                                                            </p>
                                                            <p>
                                                                Examples:
                                                                Schedule a
                                                                discovery call;
                                                                ask for website
                                                                requirements;
                                                                request system
                                                                access; prepare
                                                                a technical
                                                                proposal; create
                                                                a price
                                                                calculation;
                                                                send or revise
                                                                the proposal;
                                                                follow up with
                                                                the customer; or
                                                                convert an
                                                                accepted enquiry
                                                                to a project.
                                                            </p>
                                                            <p>
                                                                This describes
                                                                your action.
                                                                Follow-up date
                                                                records when you
                                                                intend to do it.
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <Input
                                                    id="next-action"
                                                    value={nextAction}
                                                    onChange={(event) =>
                                                        setNextAction(
                                                            event.currentTarget
                                                                .value,
                                                        )
                                                    }
                                                    placeholder="e.g. Send proposal to customer"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="follow-up-date">
                                                    Follow-up date
                                                </Label>
                                                <Input
                                                    id="follow-up-date"
                                                    type="date"
                                                    value={followUpDate}
                                                    onChange={(event) =>
                                                        setFollowUpDate(
                                                            event.currentTarget
                                                                .value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            )}

                            {entryType === 'enquiry' && (
                                <section className="mt-4 border-y border-border py-4">
                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <p className="text-sm font-medium">
                                                Price calculations
                                            </p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Link saved estimates to this
                                                customer enquiry.
                                            </p>
                                        </div>

                                        {activeProblem ? (
                                            <>
                                                {activeProblem
                                                    .price_calculations.length >
                                                0 ? (
                                                    <div className="divide-y rounded-md border">
                                                        {activeProblem.price_calculations.map(
                                                            (calculation) => (
                                                                <div
                                                                    key={
                                                                        calculation.id
                                                                    }
                                                                    className="flex items-center justify-between gap-3 px-3 py-2.5"
                                                                >
                                                                    <div className="min-w-0">
                                                                        <Link
                                                                            className="truncate text-sm font-medium text-primary underline-offset-4 hover:underline"
                                                                            href={`/price-calculator/${calculation.id}`}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                        >
                                                                            {
                                                                                calculation.name
                                                                            }
                                                                        </Link>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {new Intl.NumberFormat(
                                                                                'id-ID',
                                                                                {
                                                                                    style: 'currency',
                                                                                    currency:
                                                                                        'IDR',
                                                                                    maximumFractionDigits: 0,
                                                                                },
                                                                            ).format(
                                                                                calculation.total,
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        title="Unlink calculation"
                                                                        onClick={() =>
                                                                            unlinkPriceCalculation(
                                                                                calculation.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Unlink className="size-4" />
                                                                    </Button>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">
                                                        No calculations linked
                                                        yet.
                                                    </p>
                                                )}

                                                {availablePriceCalculations.length >
                                                    0 && (
                                                    <div className="flex flex-col gap-2 sm:flex-row">
                                                        <Select
                                                            value={
                                                                priceCalculationId
                                                            }
                                                            onValueChange={
                                                                setPriceCalculationId
                                                            }
                                                        >
                                                            <SelectTrigger className="min-w-0 flex-1">
                                                                <SelectValue placeholder="Choose a saved calculation" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="none">
                                                                    Choose a
                                                                    saved
                                                                    calculation
                                                                </SelectItem>
                                                                {availablePriceCalculations.map(
                                                                    (
                                                                        calculation,
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                calculation.id
                                                                            }
                                                                            value={String(
                                                                                calculation.id,
                                                                            )}
                                                                        >
                                                                            {
                                                                                calculation.name
                                                                            }
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            disabled={
                                                                priceCalculationId ===
                                                                'none'
                                                            }
                                                            onClick={
                                                                linkPriceCalculation
                                                            }
                                                        >
                                                            <Link2 className="size-4" />
                                                            Link calculation
                                                        </Button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                Save this enquiry before adding
                                                a calculation.
                                            </p>
                                        )}
                                    </div>
                                </section>
                            )}

                            <div className="mt-4 rounded-lg border border-border bg-muted/20 p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            Proposed solution
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Each entry can have one linked
                                            solution.
                                        </p>
                                        {activeProblem?.idea_title && (
                                            <p className="text-sm text-muted-foreground">
                                                Saved solution:{' '}
                                                <span className="font-medium text-foreground">
                                                    {activeProblem.idea_title}
                                                </span>
                                            </p>
                                        )}
                                        {!activeProblem && (
                                            <p className="text-sm text-muted-foreground">
                                                Save this entry first to add a
                                                solution.
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={!activeProblem || isSaving}
                                        onClick={openIdeaEditor}
                                    >
                                        {activeIdea ? (
                                            <Link2 className="h-4 w-4" />
                                        ) : (
                                            <Lightbulb className="h-4 w-4" />
                                        )}
                                        {activeIdea
                                            ? 'View solution'
                                            : 'Add solution'}
                                    </Button>
                                </div>
                            </div>

                            {Object.keys(problemErrors).length > 0 && (
                                <div
                                    role="alert"
                                    className="mt-4 flex gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
                                >
                                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                    <div>
                                        <p className="font-medium">
                                            Unable to save this entry
                                        </p>
                                        <ul className="mt-1 space-y-1">
                                            {Object.entries(problemErrors).map(
                                                ([field, message]) => (
                                                    <li key={field}>
                                                        {message}
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">
                                        {problemSavedAt
                                            ? `Saved at ${problemSavedAt}`
                                            : problemDraft.trim().length > 0
                                              ? `${problemDraft.trim().length} characters`
                                              : 'Not saved yet'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Press{' '}
                                        <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[11px]">
                                            Ctrl
                                        </kbd>{' '}
                                        +{' '}
                                        <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[11px]">
                                            Enter
                                        </kbd>{' '}
                                        to save,{' '}
                                        <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[11px]">
                                            Esc
                                        </kbd>{' '}
                                        to cancel
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center justify-end gap-2">
                                    {activeProblem?.entry_type === 'enquiry' &&
                                        (activeProblem.project_id ? (
                                            <Button asChild variant="outline">
                                                <Link
                                                    href={`/projects/${activeProblem.project_id}/edit`}
                                                >
                                                    <BriefcaseBusiness className="size-4" />
                                                    View project
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button asChild variant="outline">
                                                <Link
                                                    href={`/projects/create?ideabook_entry_id=${activeProblem.id}`}
                                                >
                                                    <BriefcaseBusiness className="size-4" />
                                                    Convert to project
                                                </Link>
                                            </Button>
                                        ))}
                                    {activeProblem && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={isSaving}
                                            onClick={() =>
                                                setConfirmAction(
                                                    'delete-problem',
                                                )
                                            }
                                        >
                                            Delete
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        disabled={
                                            problemDraft.trim().length === 0 ||
                                            isSaving
                                        }
                                        onClick={requestProblemSave}
                                    >
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className={[
                        'min-h-0 overflow-hidden border-l border-border bg-background transition-[width] duration-300 ease-out',
                        isIdeaEditorOpen ? 'w-1/3' : 'w-0 border-l-0',
                    ].join(' ')}
                >
                    <div
                        className={[
                            'flex h-full min-h-0 w-full flex-col transition-all duration-300 ease-out',
                            isIdeaEditorOpen
                                ? 'translate-x-0 opacity-100'
                                : 'translate-x-8 opacity-0',
                        ].join(' ')}
                    >
                        <div className="flex shrink-0 flex-col gap-3 border-b px-4 py-4">
                            <div className="min-w-0">
                                <h2 className="text-2xl font-semibold tracking-normal break-words">
                                    {activeIdea
                                        ? `Editing ${activeIdea.title}`
                                        : 'New solution'}
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {activeProblemDateLabel}
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                {activeProblem?.entry_type === 'enquiry' && (
                                    <Button asChild variant="outline">
                                        <Link
                                            href={`/price-calculator?enquiry_id=${activeProblem.id}`}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <Calculator className="size-4" />
                                            Price calculator
                                        </Link>
                                    </Button>
                                )}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={closeIdeaEditor}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>

                        <div className="flex min-h-0 flex-1 flex-col p-4">
                            <div className="min-h-[240px] flex-1">
                                <Textarea
                                    ref={ideaTextareaRef}
                                    aria-label="Solution editor"
                                    placeholder="Describe the proposed solution..."
                                    value={ideaDraft}
                                    onChange={(event) =>
                                        setIdeaDraft(event.currentTarget.value)
                                    }
                                    onKeyDown={(event) => {
                                        if (
                                            event.ctrlKey &&
                                            event.key === 'Enter'
                                        ) {
                                            event.preventDefault();
                                            requestIdeaSave();

                                            return;
                                        }

                                        if (event.key === 'Escape') {
                                            event.preventDefault();
                                            closeIdeaEditor();
                                        }
                                    }}
                                    className="h-full min-h-[240px] resize-none bg-background px-4 py-4 text-sm leading-6"
                                />
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">
                                        {ideaDraft.trim().length > 0
                                            ? `${ideaDraft.trim().length} characters`
                                            : 'Not saved yet'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Press{' '}
                                        <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[11px]">
                                            Ctrl
                                        </kbd>{' '}
                                        +{' '}
                                        <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[11px]">
                                            Enter
                                        </kbd>{' '}
                                        to save,{' '}
                                        <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[11px]">
                                            Esc
                                        </kbd>{' '}
                                        to cancel
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    disabled={
                                        ideaDraft.trim().length === 0 ||
                                        isSaving
                                    }
                                    onClick={requestIdeaSave}
                                >
                                    {isSaving
                                        ? 'Saving...'
                                        : activeIdea
                                          ? 'Save changes'
                                          : 'Save solution'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog
                open={isProblemTextareaExpanded}
                onOpenChange={setIsProblemTextareaExpanded}
            >
                <DialogContent className="flex h-[min(85svh,56rem)] flex-col sm:max-w-5xl">
                    <DialogHeader className="shrink-0">
                        <DialogTitle>
                            {entryType === 'enquiry'
                                ? 'Customer requirements'
                                : 'Problem description'}
                        </DialogTitle>
                        <DialogDescription>
                            {entryType === 'enquiry'
                                ? 'Describe the customer need, constraints, and desired outcome.'
                                : 'Describe the problem, its impact, and relevant context.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        autoFocus
                        aria-label={
                            entryType === 'enquiry'
                                ? 'Expanded customer requirements editor'
                                : 'Expanded problem description editor'
                        }
                        wrap="soft"
                        value={problemDraft}
                        onChange={(event) =>
                            setProblemDraft(event.currentTarget.value)
                        }
                        placeholder={
                            entryType === 'enquiry'
                                ? 'Describe the customer need, constraints, and desired outcome...'
                                : 'Describe the problem here...'
                        }
                        className="min-h-0 flex-1 resize-none overflow-x-hidden bg-background px-4 py-4 text-sm leading-6"
                    />
                    <DialogFooter className="shrink-0 items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            {problemDraft.trim().length} characters
                        </p>
                        <Button
                            type="button"
                            onClick={() => setIsProblemTextareaExpanded(false)}
                        >
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={isOwnerDialogOpen}
                onOpenChange={(open) => {
                    if (!isOwnerSaving) {
                        setIsOwnerDialogOpen(open);
                    }
                }}
            >
                <DialogContent>
                    <form onSubmit={createProjectOwner}>
                        <DialogHeader>
                            <DialogTitle>New project owner</DialogTitle>
                            <DialogDescription>
                                This customer is not in Project Owners yet.
                                Complete their details to link the enquiry.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="new-owner-name">Name</Label>
                                <Input
                                    id="new-owner-name"
                                    required
                                    value={pendingOwnerName}
                                    onChange={(event) =>
                                        setPendingOwnerName(
                                            event.currentTarget.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="new-owner-country">
                                    Country
                                </Label>
                                <Input
                                    id="new-owner-country"
                                    required
                                    value={ownerCountry}
                                    onChange={(event) =>
                                        setOwnerCountry(
                                            event.currentTarget.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="new-owner-contact">
                                    Contact number
                                </Label>
                                <Input
                                    id="new-owner-contact"
                                    value={ownerContactNumber}
                                    onChange={(event) =>
                                        setOwnerContactNumber(
                                            event.currentTarget.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isOwnerSaving}
                                onClick={() => setIsOwnerDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isOwnerSaving}>
                                {isOwnerSaving ? 'Creating...' : 'Create owner'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={confirmAction !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmAction(null);
                        setRegenerateTitleOnUpdate(false);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {confirmAction === 'delete-problem'
                                ? 'Delete entry?'
                                : confirmAction === 'update-idea'
                                  ? 'Update solution?'
                                  : 'Update entry?'}
                        </DialogTitle>
                        <DialogDescription>
                            {confirmAction === 'delete-problem'
                                ? 'This will permanently remove the selected entry.'
                                : confirmAction === 'update-idea'
                                  ? 'This will overwrite the current proposed solution.'
                                  : 'This will overwrite the current entry details.'}
                        </DialogDescription>
                    </DialogHeader>
                    {(confirmAction === 'update-problem' ||
                        confirmAction === 'update-idea') && (
                        <div className="rounded-md border border-border bg-muted/30 p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                        Regenerate title
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Ask Gemini to create a new short title
                                        from the updated content.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant={
                                        regenerateTitleOnUpdate
                                            ? 'default'
                                            : 'outline'
                                    }
                                    onClick={() =>
                                        setRegenerateTitleOnUpdate(
                                            (current) => !current,
                                        )
                                    }
                                >
                                    {regenerateTitleOnUpdate
                                        ? 'Enabled'
                                        : 'Enable'}
                                </Button>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setConfirmAction(null);
                                setRegenerateTitleOnUpdate(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant={
                                confirmAction === 'delete-problem'
                                    ? 'destructive'
                                    : 'default'
                            }
                            disabled={isSaving}
                            onClick={confirmPendingAction}
                        >
                            {confirmAction === 'delete-problem'
                                ? 'Delete'
                                : 'Update'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={showAiFailureDialog}
                onOpenChange={setShowAiFailureDialog}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>AI title generation failed</DialogTitle>
                        <DialogDescription>
                            {page.props.flash.ai_title_generation.operation ===
                            'update'
                                ? `Gemini could not regenerate a title for this ${aiFailureEntryType ?? 'entry'}, so the app kept the fallback title or the existing saved title instead.`
                                : `Gemini could not generate a title for this ${aiFailureEntryType ?? 'entry'}, so the app used the fallback title instead.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={() => setShowAiFailureDialog(false)}
                        >
                            OK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'IdeaBook',
            href: '/ideabook',
        },
    ],
};
