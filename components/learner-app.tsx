"use client";

import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Circle,
  Clock3,
  ExternalLink,
  FileCheck2,
  LayoutDashboard,
  LockKeyhole,
  MessageCircleMore,
  PlayCircle,
  Rocket,
  Sparkles,
} from "lucide-react";
import {
  onboardingItems,
  problemStatements,
  weekPlans,
} from "@/lib/program-data";
import type { WeekPlan } from "@/lib/program-data";
import type {
  LearnerWorkspaceData,
  LessonBlock,
  ProgramWeek,
  Role,
} from "@/lib/lms-types";
import type { ScheduleSettings } from "@/lib/db/program-settings";

type LearnerNav = "today" | "program" | "build" | "feedback";

export function LearnerOnboarding({
  user,
  learner,
  onComplete,
  onSignOut,
}: {
  user: { name: string; email: string; role: Role };
  learner: LearnerWorkspaceData;
  onComplete: (profile: Partial<LearnerWorkspaceData>) => void;
  onSignOut: () => void;
}) {
  const [form, setForm] = useState({
    timezone: learner.timezone,
    experience: learner.experience,
    weeklyAvailability: learner.weeklyAvailability,
    successDefinition: learner.successDefinition,
    productInterests: learner.productInterests,
  });
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("saving");
    setError("");
    const response = await fetch("/api/learner/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json();
    if (!response.ok) {
      setStatus("error");
      setError(result.error ?? "Could not save your profile.");
      return;
    }
    onComplete(result.profile);
  }

  return (
    <main className="onboarding-page">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>
          <span>
            MYREAL
            <br />
            PRODUCT
          </span>
        </div>
        <button className="secondary-button" onClick={onSignOut}>
          Sign out
        </button>
      </header>
      <div className="onboarding-layout">
        <section className="onboarding-intro">
          <span className="eyebrow">Welcome, {user.name.split(" ")[0]}</span>
          <h1>Let&apos;s build your plan.</h1>
          <p>
            This takes about five minutes. Your answers give Hari the context to
            personalise your four weeks before the first kickoff session.
          </p>
          <div className="onboarding-promise">
            <strong>What happens next</strong>
            <span>Complete Week 0</span>
            <span>Join the Saturday kickoff</span>
            <span>Start Week 1 when Hari unlocks it</span>
          </div>
        </section>
        <form className="onboarding-form" onSubmit={submit}>
          <Field label="Your timezone">
            <input
              value={form.timezone}
              onChange={(event) =>
                setForm({ ...form, timezone: event.target.value })
              }
              required
            />
            <button
              type="button"
              className="auth-toggle timezone-detect"
              onClick={() =>
                setForm({
                  ...form,
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                })
              }
            >
              Use my device timezone
            </button>
          </Field>
          <Field label="Where are you with AI and coding today?">
            <textarea
              value={form.experience}
              onChange={(event) =>
                setForm({ ...form, experience: event.target.value })
              }
              placeholder="What have you built or tried? It is completely fine to be new."
              required
            />
          </Field>
          <Field label="When can you work on the program each week?">
            <textarea
              value={form.weeklyAvailability}
              onChange={(event) =>
                setForm({ ...form, weeklyAvailability: event.target.value })
              }
              placeholder="For example: weekday evenings, 6–8 hours total."
              required
            />
          </Field>
          <Field label="What would make these four weeks successful?">
            <textarea
              value={form.successDefinition}
              onChange={(event) =>
                setForm({ ...form, successDefinition: event.target.value })
              }
              placeholder="Describe the result you want to leave with."
              required
            />
          </Field>
          <Field label="What problems or product ideas interest you?">
            <textarea
              value={form.productInterests}
              onChange={(event) =>
                setForm({ ...form, productInterests: event.target.value })
              }
              placeholder="Rough ideas are enough. We will narrow them together."
              required
            />
          </Field>
          {error && (
            <div className="settings-message error" role="alert">
              {error}
            </div>
          )}
          <button
            className="primary-button onboarding-submit"
            disabled={status === "saving"}
          >
            {status === "saving"
              ? "Building your workspace…"
              : "Create my training plan"}
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="profile-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function LearnerApp({
  user,
  learner,
  setLearner,
  schedule,
  content,
  weeks,
}: {
  user: { name: string; email: string };
  learner: LearnerWorkspaceData;
  setLearner: React.Dispatch<React.SetStateAction<LearnerWorkspaceData | null>>;
  schedule: ScheduleSettings;
  content: LessonBlock[];
  weeks: ProgramWeek[];
}) {
  const [nav, setNav] = useState<LearnerNav>("today");
  const [selectedWeek, setSelectedWeek] = useState(learner.currentWeek);
  const [savingItem, setSavingItem] = useState("");
  const completedOnboarding = onboardingItems.filter((item) =>
    learner.completedChecklist.includes(item.id),
  ).length;
  const progress = Math.round(
    (completedOnboarding / onboardingItems.length) * 100,
  );

  async function toggleChecklist(id: string) {
    if (
      id === "profile" ||
      learner.status === "paused" ||
      learner.status === "completed"
    )
      return;
    const wasComplete = learner.completedChecklist.includes(id);
    setSavingItem(id);
    setLearner((current) =>
      current
        ? {
            ...current,
            completedChecklist: wasComplete
              ? current.completedChecklist.filter((item) => item !== id)
              : [...current.completedChecklist, id],
          }
        : current,
    );
    const response = await fetch("/api/learner/checklist", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: id, completed: !wasComplete }),
    });
    if (!response.ok)
      setLearner((current) =>
        current
          ? {
              ...current,
              completedChecklist: wasComplete
                ? [...new Set([...current.completedChecklist, id])]
                : current.completedChecklist.filter((item) => item !== id),
            }
          : current,
      );
    setSavingItem("");
  }

  async function toggleBlock(id: string) {
    if (learner.status !== "active") return;
    const wasComplete = learner.completedBlocks.includes(id);
    setLearner((current) =>
      current
        ? {
            ...current,
            completedBlocks: wasComplete
              ? current.completedBlocks.filter((item) => item !== id)
              : [...current.completedBlocks, id],
          }
        : current,
    );
    const response = await fetch("/api/learner/blocks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockId: id, completed: !wasComplete }),
    });
    if (!response.ok)
      setLearner((current) =>
        current
          ? {
              ...current,
              completedBlocks: wasComplete
                ? [...new Set([...current.completedBlocks, id])]
                : current.completedBlocks.filter((item) => item !== id),
            }
          : current,
      );
  }

  return (
    <div className="workspace">
      <aside className="sidebar">
        <div className="profile-card">
          <div className="avatar avatar-large">{initials(user.name)}</div>
          <div>
            <strong>{user.name}</strong>
            <span>
              Week {learner.currentWeek} · {learner.timezone}
            </span>
          </div>
        </div>
        <nav className="side-nav">
          <SideButton
            active={nav === "today"}
            onClick={() => setNav("today")}
            icon={<LayoutDashboard size={18} />}
            label="Today"
          />
          <SideButton
            active={nav === "program"}
            onClick={() => setNav("program")}
            icon={<Rocket size={18} />}
            label="My program"
          />
          <SideButton
            active={nav === "build"}
            onClick={() => setNav("build")}
            icon={<Sparkles size={18} />}
            label="My build"
          />
          <SideButton
            active={nav === "feedback"}
            onClick={() => setNav("feedback")}
            icon={<MessageCircleMore size={18} />}
            label="Feedback"
          />
        </nav>
        <div className="coach-card">
          <span className="eyebrow">Your coach</span>
          <strong>Hari is in your corner.</strong>
          <p>
            Questions and quick updates happen in your private WhatsApp group.
          </p>
          {learner.whatsappInviteUrl ? (
            <a
              className="text-link"
              href={learner.whatsappInviteUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open WhatsApp <ExternalLink size={14} />
            </a>
          ) : (
            <small>Your private invite is being prepared.</small>
          )}
        </div>
      </aside>
      <section className="content-area">
        {learner.status === "paused" && (
          <div className="enrollment-banner">
            Your program is paused. Your work is safe; contact Hari when you are
            ready to continue.
          </div>
        )}
        {learner.status === "completed" && (
          <div className="enrollment-banner complete">
            Program completed. Your lessons, submissions and feedback remain
            available.
          </div>
        )}
        {nav === "today" && (
          <TodayView
            user={user}
            learner={learner}
            progress={progress}
            completedOnboarding={completedOnboarding}
            schedule={schedule}
            savingItem={savingItem}
            toggleChecklist={toggleChecklist}
            setNav={setNav}
          />
        )}
        {nav === "program" && (
          <ProgramView
            learner={learner}
            setLearner={setLearner}
            content={content}
            weeks={weeks}
            selectedWeek={selectedWeek}
            setSelectedWeek={setSelectedWeek}
            toggleBlock={toggleBlock}
          />
        )}
        {nav === "build" && (
          <BuildView
            learner={learner}
            setLearner={setLearner}
            onOpenProgram={() => setNav("program")}
          />
        )}
        {nav === "feedback" && <FeedbackView learner={learner} />}
      </section>
    </div>
  );
}

function TodayView({
  user,
  learner,
  progress,
  completedOnboarding,
  schedule,
  savingItem,
  toggleChecklist,
  setNav,
}: {
  user: { name: string };
  learner: LearnerWorkspaceData;
  progress: number;
  completedOnboarding: number;
  schedule: ScheduleSettings;
  savingItem: string;
  toggleChecklist: (id: string) => void;
  setNav: (nav: LearnerNav) => void;
}) {
  const firstName = user.name.split(" ")[0];
  const next = onboardingItems.find(
    (item) => !learner.completedChecklist.includes(item.id),
  );

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Week zero · Your foundation</span>
          <h1>
            Welcome,
            <br />
            {firstName}.
          </h1>
          <p>
            Week 0 is onboarding only. Set up your tools, choose one problem,
            research it and submit your understanding before the building starts.
          </p>
        </div>
        <div className="progress-piece">
          <span>{progress}%</span>
          <div className="mini-blocks">
            {onboardingItems.map((item) => (
              <i
                key={item.id}
                className={
                  learner.completedChecklist.includes(item.id) ? "done" : ""
                }
              />
            ))}
          </div>
          <small>
            {completedOnboarding} of {onboardingItems.length} setup blocks ready
          </small>
        </div>
      </div>
      {next ? (
        <div className="next-action">
          <div className="next-number">NEXT</div>
          <div>
            <span className="eyebrow">Your next move</span>
            <h2>{next.title}</h2>
            <p>{next.detail}</p>
          </div>
          <NextAction
            itemId={next.id}
            learner={learner}
            schedule={schedule}
            onComplete={() => toggleChecklist(next.id)}
            onOpenBuild={() => setNav("build")}
          />
        </div>
      ) : (
        <div className="next-action complete-banner">
          <div className="next-number">READY</div>
          <div>
            <span className="eyebrow">Week 0 complete</span>
            <h2>You&apos;re ready for your checkpoint.</h2>
            <p>Hari can now review your plan and unlock the next stage.</p>
          </div>
          <button className="primary-button" onClick={() => setNav("program")}>
            Open my program <ArrowRight size={18} />
          </button>
        </div>
      )}
      <section className="booking-section">
        <div className="section-title">
          <div>
            <span className="eyebrow">Live coaching</span>
            <h2>Book a call with Hari</h2>
          </div>
          <p>Cal.com will email your confirmation and meeting link.</p>
        </div>
        <div className="booking-card-grid">
          <BookingCard
            eyebrow="Weekly checkpoint"
            title="Saturday session"
            detail="Book your 60-minute kickoff to understand the week and decide what to build."
            href={schedule.saturdayBookingUrl}
            accent="pink"
          />
          <BookingCard
            eyebrow="Optional support"
            title="Tuesday office hours"
            detail="Book a 30-minute call when you need clarity before the build phase."
            href={schedule.officeHourBookingUrl}
            accent="blue"
          />
        </div>
      </section>
      <section className="section-block problem-picker">
        <div className="section-title">
          <div>
            <span className="eyebrow">Your problem portfolio</span>
            <h2>Ten real problems worth solving.</h2>
          </div>
        </div>
        <p className="problem-picker-intro">
          Explore these researched directions, choose the one you have a strong
          opinion about, or bring a real problem of your own. In Week 0 you only
          investigate it; from Week 1 onward, you evolve the same product through
          MVP, RAG, agents and production.
        </p>
        <div className="problem-option-grid">
          {problemStatements.map((problem) => (
              <article className="problem-option" key={problem.id}>
                <span className="eyebrow">{problem.category}</span>
                <h3>{problem.title}</h3>
                <p>{problem.statement}</p>
                <small className="primary-user">
                  <strong>For:</strong> {problem.primaryUser}
                </small>
                <details>
                  <summary>See the four-week path</summary>
                  <ol>
                    {problem.buildPath.map((step) => (
                      <li key={step.week}>
                        <strong>W{step.week}</strong> {step.outcome}
                      </li>
                    ))}
                  </ol>
                </details>
                <div className="problem-evidence">
                  {problem.evidence.map((source) => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {source.label} <ExternalLink size={11} />
                    </a>
                  ))}
                </div>
              </article>
          ))}
          <article className="problem-option own-problem">
            <span className="eyebrow">Your own direction</span>
            <h3>Bring a Problem You Understand</h3>
            <p>
              Already frustrated by a real problem at work, university or home?
              Bring it. The best starting point is a user you can reach, a painful
              workflow you can observe and a result that can be tested in four weeks.
            </p>
            <small className="primary-user">
              <strong>Best for:</strong> A learner with useful access or a strong,
              experience-backed opinion
            </small>
            <details>
              <summary>Pressure-test your idea</summary>
              <ol>
                <li><strong>01</strong> Who has this problem repeatedly?</li>
                <li><strong>02</strong> How do they solve it today?</li>
                <li><strong>03</strong> What is the smallest useful outcome?</li>
                <li><strong>04</strong> Can RAG, tools and evaluation add real value?</li>
              </ol>
            </details>
          </article>
        </div>
      </section>
      <section className="section-block">
        <div className="section-title">
          <div>
            <span className="eyebrow">Onboarding checklist</span>
            <h2>Clear the runway</h2>
          </div>
          <button
            className="secondary-button"
            onClick={() => setNav("program")}
          >
            See program <ChevronRight size={17} />
          </button>
        </div>
        <div className="checklist">
          {[...new Set(onboardingItems.map((item) => item.group))].map(
            (group) => (
              <div className="check-group" key={group}>
                <div className="check-group-title">{group}</div>
                <div>
                  {onboardingItems
                    .filter((item) => item.group === group)
                    .map((item) => {
                      const done = learner.completedChecklist.includes(item.id);
                      const unavailable =
                        (item.id === "whatsapp" &&
                          !learner.whatsappInviteUrl) ||
                        (item.id === "calendar" &&
                          !schedule.saturdayBookingUrl);
                      return (
                        <button
                          key={item.id}
                          disabled={
                            item.id === "profile" ||
                            savingItem === item.id ||
                            unavailable ||
                            learner.status === "paused" ||
                            learner.status === "completed"
                          }
                          className={`check-row ${done ? "completed" : ""} ${unavailable ? "unavailable" : ""}`}
                          onClick={() =>
                            item.id === "report"
                              ? setNav("build")
                              : toggleChecklist(item.id)
                          }
                        >
                          <span className="check-icon">
                            {done ? (
                              <Check size={17} strokeWidth={3} />
                            ) : unavailable ? (
                              <LockKeyhole size={15} />
                            ) : (
                              <Circle size={17} />
                            )}
                          </span>
                          <span className="check-copy">
                            <strong>{item.title}</strong>
                            <small>
                              {unavailable
                                ? "Hari is preparing this for you."
                                : item.detail}
                            </small>
                          </span>
                          <span className="check-meta">
                            <Clock3 size={14} />
                            {item.meta}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            ),
          )}
        </div>
      </section>
    </>
  );
}

function NextAction({
  itemId,
  learner,
  schedule,
  onComplete,
  onOpenBuild,
}: {
  itemId: string;
  learner: LearnerWorkspaceData;
  schedule: ScheduleSettings;
  onComplete: () => void;
  onOpenBuild: () => void;
}) {
  if (itemId === "whatsapp")
    return learner.whatsappInviteUrl ? (
      <div className="stacked-actions">
        <a
          className="primary-button"
          href={learner.whatsappInviteUrl}
          target="_blank"
          rel="noreferrer"
        >
          Join group <ExternalLink size={17} />
        </a>
        <button className="secondary-button" onClick={onComplete}>
          I&apos;ve joined
        </button>
      </div>
    ) : (
      <span className="booking-unavailable">Hari is preparing your invite</span>
    );
  if (itemId === "calendar")
    return schedule.saturdayBookingUrl ? (
      <div className="stacked-actions">
        <a
          className="primary-button"
          href={schedule.saturdayBookingUrl}
          target="_blank"
          rel="noreferrer"
        >
          Book on Cal.com <ExternalLink size={17} />
        </a>
        <button className="secondary-button" onClick={onComplete}>
          I&apos;ve booked
        </button>
      </div>
    ) : (
      <span className="booking-unavailable">
        Booking link is being prepared
      </span>
    );
  if (itemId === "report")
    return (
      <button className="primary-button" onClick={onOpenBuild}>
        Open report <ArrowRight size={17} />
      </button>
    );
  return (
    <button className="primary-button" onClick={onComplete}>
      Mark complete <Check size={17} />
    </button>
  );
}

function ProgramView({
  learner,
  setLearner,
  content,
  weeks,
  selectedWeek,
  setSelectedWeek,
  toggleBlock,
}: {
  learner: LearnerWorkspaceData;
  setLearner: React.Dispatch<React.SetStateAction<LearnerWorkspaceData | null>>;
  content: LessonBlock[];
  weeks: ProgramWeek[];
  selectedWeek: number;
  setSelectedWeek: (week: number) => void;
  toggleBlock: (id: string) => void;
}) {
  const selected =
    weeks.find((week) => week.weekNumber === selectedWeek) ?? weeks[0];
  const release = learner.releases.find(
    (item) => item.weekNumber === selected.weekNumber,
  );
  const locked = !release || release.status === "locked";
  const blocks = content.filter(
    (block) => block.weekNumber === selected.weekNumber && block.published,
  );
  const plan = weekPlans.find(
    (item) => item.weekNumber === selected.weekNumber,
  );
  return (
    <>
      <div className="page-heading compact">
        <div>
          <span className="eyebrow">Your personalised roadmap</span>
          <h1>
            One product.
            <br />
            Four build weeks.
          </h1>
          <p>
            Every week follows the same simple rhythm: learn, get unblocked,
            build and submit. Hari opens each week manually when it is time.
          </p>
        </div>
      </div>
      <div className="week-roadmap">
        {weeks.map((week) => {
          const releaseState = learner.releases.find(
            (item) => item.weekNumber === week.weekNumber,
          );
          const state = releaseState?.status ?? "locked";
          return (
            <button
              key={week.id}
              onClick={() => setSelectedWeek(week.weekNumber)}
              aria-pressed={selectedWeek === week.weekNumber}
              className={`week-card ${week.accent} ${selectedWeek === week.weekNumber ? "selected" : ""}`}
            >
              <span className="week-id">
                {String(week.weekNumber).padStart(2, "0")}
              </span>
              {state === "locked" && (
                <LockKeyhole size={18} className="week-lock" />
              )}
              <span className="eyebrow">{state}</span>
              <h3>{week.title}</h3>
              <p>{week.outcome}</p>
              <span className="week-card-flow">
                {week.weekNumber === 0 ? "Onboarding only" : "Learn → Build → Submit"}
              </span>
              {releaseState?.dueAt && (
                <small className="week-due">
                  Due {new Date(releaseState.dueAt).toLocaleString()}
                </small>
              )}
            </button>
          );
        })}
      </div>
      {plan && selected.weekNumber !== 0 && (
        <WeekPlanOverview plan={plan} locked={locked} />
      )}
      {locked ? (
        <section className="locked-week">
          <LockKeyhole size={32} />
          <span className="eyebrow">Week {selected.weekNumber} is locked</span>
          <h2>The plan is visible. The lessons are not open yet.</h2>
          <p>
            Hari will unlock this week manually. Until then, you can see the
            goal and expected submission without accessing unfinished videos.
          </p>
        </section>
      ) : selected.weekNumber === 0 ? (
        <section className="locked-week open-week">
          <Check size={32} />
          <span className="eyebrow">Week 0 is open</span>
          <h2>Research first. Build with clarity.</h2>
          <p>
            Complete the setup, research and report tasks from your Today
            checklist. Your Week 1 build starts only after the problem is clear.
          </p>
        </section>
      ) : (
        <section className="lesson-workspace real-lessons">
          <div className="lesson-main">
            <span className={`color-tag ${selected.accent}`}>
              Week {selected.weekNumber}
            </span>
            <h2>{selected.title}</h2>
            <p>{selected.outcome}</p>
            {blocks.length ? (
              <div className="content-blocks">
                {blocks.map((block) => (
                  <ContentBlock
                    key={block.id}
                    block={block}
                    complete={learner.completedBlocks.includes(block.id)}
                    disabled={learner.status !== "active"}
                    onToggle={() => toggleBlock(block.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="honest-empty">
                <LockKeyhole size={24} />
                <strong>No lessons are published for this week yet.</strong>
                <p>
                  Ask Hari before starting. This week should normally remain
                  locked until its material is ready.
                </p>
              </div>
            )}
          </div>
          <SubmissionForm
            weekNumber={selected.weekNumber}
            disabled={learner.status !== "active"}
            existing={learner.submissions.filter(
              (item) => item.weekNumber === selected.weekNumber,
            )}
            onSubmitted={(submission) =>
              setLearner((current) =>
                current
                  ? {
                      ...current,
                      submissions: [...current.submissions, submission],
                    }
                  : current,
              )
            }
          />
        </section>
      )}
    </>
  );
}

function WeekPlanOverview({
  plan,
  locked,
}: {
  plan: WeekPlan;
  locked: boolean;
}) {
  const rhythm =
    plan.weekNumber === 0
      ? [
          ["Step 1", "Choose", "Pick one problem statement"],
          ["Step 2", "Research", "Understand users and existing solutions"],
          ["Step 3", "Set up", "Prepare your laptop and accounts"],
          ["Step 4", "Submit", "Share your understanding report"],
        ]
      : [
          ["Saturday", "Kickoff", "Introduction, direction and questions"],
          ["Sun–Mon", "Learn", "Watch only the videos needed to build"],
          ["Tuesday", "Office hours", "Clarify the plan and remove blockers"],
          ["Wed–Fri", "Build + submit", "Make it work and send the evidence"],
        ];

  return (
    <section className={`week-plan-overview ${locked ? "is-locked" : ""}`}>
      <div className="week-plan-heading">
        <div>
          <span className="eyebrow">
            {locked ? "Plan preview" : "Your weekly plan"}
          </span>
          <h2>{plan.goal}</h2>
        </div>
        {locked && (
          <span className="plan-lock-label">
            <LockKeyhole size={14} /> Content locked
          </span>
        )}
      </div>
      <div className="weekly-rhythm">
        {rhythm.map(([day, phase, detail]) => (
          <div key={day}>
            <span>{day}</span>
            <strong>{phase}</strong>
            <small>{detail}</small>
          </div>
        ))}
      </div>
      <div className="phase-grid">
        <PlanColumn
          label="Learn phase"
          meta={`${plan.videos.length} focused videos`}
          items={plan.videos}
          icon={<PlayCircle size={20} />}
        />
        <PlanColumn
          label="Build phase"
          meta="Wednesday to Friday"
          items={plan.build}
          icon={<Sparkles size={20} />}
        />
        <PlanColumn
          label="Submit"
          meta={plan.weekNumber === 0 ? "Before Week 1" : "Friday"}
          items={plan.submit}
          icon={<FileCheck2 size={20} />}
        />
      </div>
    </section>
  );
}

function PlanColumn({
  label,
  meta,
  items,
  icon,
}: {
  label: string;
  meta: string;
  items: string[];
  icon: React.ReactNode;
}) {
  return (
    <div className="phase-column">
      <div className="phase-column-head">
        {icon}
        <div>
          <strong>{label}</strong>
          <small>{meta}</small>
        </div>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ContentBlock({
  block,
  complete,
  disabled,
  onToggle,
}: {
  block: LessonBlock;
  complete: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const embed =
    block.type === "video"
      ? youtubeEmbed(block.content.url || block.content.videoId || "")
      : "";
  return (
    <article className={`real-content-block ${complete ? "is-complete" : ""}`}>
      <div className="content-block-head">
        <div>
          <span className="eyebrow">
            {block.type}
            {block.content.durationMinutes
              ? ` · ${block.content.durationMinutes} min`
              : ""}
          </span>
          <h3>{block.title}</h3>
          {block.description && <p>{block.description}</p>}
        </div>
        {block.required && (
          <button
            className="complete-button"
            onClick={onToggle}
            disabled={disabled}
          >
            {complete ? <Check size={17} /> : <Circle size={17} />}
            {complete ? "Completed" : "Mark complete"}
          </button>
        )}
      </div>
      {block.type === "video" && embed && (
        <div className="video-frame">
          <iframe
            src={embed}
            title={block.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
      {block.type === "text" && block.content.body && (
        <div className="lesson-copy">{block.content.body}</div>
      )}
      {["link", "booking"].includes(block.type) && block.content.url && (
        <a
          className="secondary-button resource-link"
          href={block.content.url}
          target="_blank"
          rel="noreferrer"
        >
          Open resource <ExternalLink size={16} />
        </a>
      )}
    </article>
  );
}

function SubmissionForm({
  weekNumber,
  existing,
  disabled,
  onSubmitted,
}: {
  weekNumber: number;
  existing: LearnerWorkspaceData["submissions"];
  disabled: boolean;
  onSubmitted: (
    submission: LearnerWorkspaceData["submissions"][number],
  ) => void;
}) {
  const latest = existing.at(-1);
  const [open, setOpen] = useState(!latest);
  const [form, setForm] = useState({
    liveUrl: "",
    repositoryUrl: "",
    reflection: "",
    blocker: "",
  });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (disabled || submitting) return;
    setSubmitting(true);
    setMessage("Submitting…");
    const response = await fetch("/api/learner/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekNumber, ...form }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error ?? "Could not submit.");
      setSubmitting(false);
      return;
    }
    onSubmitted({
      ...result.submission,
      weekNumber,
      submittedAt: result.submission.submittedAt,
    });
    setOpen(false);
    setMessage("Submitted for Hari’s review.");
    setSubmitting(false);
  }
  return (
    <aside className="submission-card">
      <FileCheck2 size={24} />
      <span className="eyebrow">Weekly evidence</span>
      <h3>
        {latest
          ? `Status: ${latest.status.replaceAll("_", " ")}`
          : "Submit your build"}
      </h3>
      {latest && !open ? (
        <>
          <p>
            Your latest version was saved{" "}
            {latest.submittedAt
              ? new Date(latest.submittedAt).toLocaleDateString()
              : ""}
            .
          </p>
          <a
            href={latest.liveUrl ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            Open submitted app <ExternalLink size={14} />
          </a>
          <button className="secondary-button" onClick={() => setOpen(true)}>
            Submit a new version
          </button>
        </>
      ) : (
        <form className="submission-form" onSubmit={submit}>
          <label>
            Live app URL
            <input
              type="url"
              value={form.liveUrl}
              onChange={(event) =>
                setForm({ ...form, liveUrl: event.target.value })
              }
              required
            />
          </label>
          <label>
            GitHub repository
            <input
              type="url"
              value={form.repositoryUrl}
              onChange={(event) =>
                setForm({ ...form, repositoryUrl: event.target.value })
              }
              required
            />
          </label>
          <label>
            What changed?
            <textarea
              value={form.reflection}
              onChange={(event) =>
                setForm({ ...form, reflection: event.target.value })
              }
              required
            />
          </label>
          <label>
            Biggest blocker (optional)
            <textarea
              value={form.blocker}
              onChange={(event) =>
                setForm({ ...form, blocker: event.target.value })
              }
            />
          </label>
          <button
            className="primary-button"
            disabled={disabled || submitting}
          >
            {submitting ? "Submitting…" : "Send for review"}
          </button>
        </form>
      )}
      {message && <small>{message}</small>}
    </aside>
  );
}

function BuildView({
  learner,
  setLearner,
  onOpenProgram,
}: {
  learner: LearnerWorkspaceData;
  setLearner: React.Dispatch<React.SetStateAction<LearnerWorkspaceData | null>>;
  onOpenProgram: () => void;
}) {
  const [editing, setEditing] = useState(!learner.capstoneTitle);
  const [form, setForm] = useState({
    capstoneTitle: learner.capstoneTitle,
    capstoneProblem: learner.capstoneProblem,
    capstoneOutcome: learner.capstoneOutcome,
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (learner.status !== "active" || saving) return;
    setSaving(true);
    setMessage("Saving…");
    const response = await fetch("/api/learner/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "capstone", ...form }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error ?? "Could not save your product brief.");
      setSaving(false);
      return;
    }
    setLearner((current) =>
      current
        ? {
            ...current,
            ...result.capstone,
            completedChecklist: [
              ...new Set([
                ...current.completedChecklist,
                ...(result.completedChecklist ?? []),
              ]),
            ],
          }
        : current,
    );
    setEditing(false);
    setMessage("Understanding report submitted. You can keep refining it.");
    setSaving(false);
  }
  return (
    <>
      <div className="page-heading compact">
        <div>
          <span className="eyebrow">Week 0 understanding report</span>
          <h1>
            Your build,
            <br />
            layer by layer.
          </h1>
          <p>
            Capture what you learned about the problem before you start building.
          </p>
        </div>
      </div>
      {editing ? (
        <form className="content-editor-form capstone-form" onSubmit={save}>
          <div className="content-form-grid">
            <label className="wide">
              Problem direction
              <input
                value={form.capstoneTitle}
                onChange={(event) =>
                  setForm({ ...form, capstoneTitle: event.target.value })
                }
                required
              />
            </label>
            <label className="wide">
              Problem, primary user, current workaround and evidence
              <textarea
                value={form.capstoneProblem}
                onChange={(event) =>
                  setForm({ ...form, capstoneProblem: event.target.value })
                }
                required
              />
            </label>
            <label className="wide">
              Existing solutions, key gap and smallest useful outcome
              <textarea
                value={form.capstoneOutcome}
                onChange={(event) =>
                  setForm({ ...form, capstoneOutcome: event.target.value })
                }
                required
              />
            </label>
          </div>
          {message && (
            <div className="settings-message" role="status" aria-live="polite">
              {message}
            </div>
          )}
          <div className="form-actions">
            {learner.capstoneTitle && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            )}
            <button
              className="primary-button"
              disabled={learner.status !== "active" || saving}
            >
              {saving ? "Submitting…" : "Submit understanding report"}{" "}
              <Check size={17} />
            </button>
          </div>
        </form>
      ) : (
        <section className="product-brief">
          <div>
            <span className="eyebrow">Submitted problem direction</span>
            <h2>{learner.capstoneTitle}</h2>
          </div>
          <div>
            <small>Problem, user, workaround and evidence</small>
            <p>{learner.capstoneProblem}</p>
          </div>
          <div>
            <small>Existing solutions, gap and smallest useful outcome</small>
            <p>{learner.capstoneOutcome}</p>
          </div>
          <button
            className="secondary-button"
            onClick={() => setEditing(true)}
            disabled={learner.status !== "active"}
          >
            Edit report
          </button>
          {message && <small>{message}</small>}
        </section>
      )}
      <div className="grid-two">
        <section className="paper-card">
          <span className="eyebrow">What success means to you</span>
          <h2>{learner.successDefinition}</h2>
        </section>
        <section className="paper-card blue-paper">
          <span className="eyebrow">Problems you want to explore</span>
          <h2>{learner.productInterests}</h2>
        </section>
      </div>
      <section className="section-block">
        <div className="section-title">
          <div>
            <span className="eyebrow">Evidence</span>
            <h2>Your submitted versions</h2>
          </div>
          <button className="secondary-button" onClick={onOpenProgram}>
            Open program <ChevronRight size={17} />
          </button>
        </div>
        {learner.submissions.length ? (
          <div className="build-layers">
            {learner.submissions.map((submission) => (
              <div className="build-layer" key={submission.id}>
                <span>W{submission.weekNumber}</span>
                <div>
                  <strong>Version submitted</strong>
                  <small>{submission.status.replaceAll("_", " ")}</small>
                </div>
                <a
                  href={submission.liveUrl ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="honest-empty">
            <Sparkles size={24} />
            <strong>
              Your first version will appear here after you submit Week 1.
            </strong>
          </div>
        )}
      </section>
    </>
  );
}

function FeedbackView({ learner }: { learner: LearnerWorkspaceData }) {
  return (
    <>
      <div className="page-heading compact">
        <div>
          <span className="eyebrow">Coach feedback</span>
          <h1>
            Make every
            <br />
            revision count.
          </h1>
          <p>
            Hari’s decisions and written feedback are attached to the exact
            version you submitted.
          </p>
        </div>
      </div>
      {learner.feedback.length ? (
        <div className="feedback-list">
          {learner.feedback.map((item) => {
            const submission = learner.submissions.find(
              (entry) => entry.id === item.submissionId,
            );
            return (
              <article
                className="paper-card"
                key={`${item.submissionId}-${item.createdAt}`}
              >
                <span className="eyebrow">
                  Week {submission?.weekNumber} ·{" "}
                  {item.result.replaceAll("_", " ")}
                </span>
                <h2>{item.summary}</h2>
                <small>{new Date(item.createdAt).toLocaleString()}</small>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-feedback">
          <div className="feedback-symbol">
            <MessageCircleMore size={31} />
          </div>
          <h2>No feedback yet.</h2>
          <p>
            When you submit a released week, its review and Hari’s notes will
            appear here.
          </p>
        </div>
      )}
    </>
  );
}

function BookingCard({
  eyebrow,
  title,
  detail,
  href,
  accent,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  href: string;
  accent: "pink" | "blue";
}) {
  return (
    <article className={`booking-card ${accent}`}>
      <div className="booking-card-icon">
        <CalendarDays size={25} />
      </div>
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h3>{title}</h3>
        <p>{detail}</p>
      </div>
      {href ? (
        <a
          className="primary-button"
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          Book on Cal.com <ExternalLink size={16} />
        </a>
      ) : (
        <span className="booking-unavailable">Booking link coming soon</span>
      )}
    </article>
  );
}
function SideButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      className={active ? "active" : ""}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
function youtubeEmbed(value: string) {
  if (!value) return "";
  const match = value.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{6,})/,
  );
  const id = match?.[1] ?? (/^[\w-]{6,}$/.test(value) ? value : "");
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : "";
}
function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "MR"
  );
}
