"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Check,
  ChevronRight,
  ExternalLink,
  FileCheck2,
  LayoutDashboard,
  LockKeyhole,
  MessageCircleMore,
  Plus,
  Sparkles,
  Trash2,
  UsersRound,
} from "lucide-react";
import type {
  AdminWorkspaceData,
  ContentKind,
  LessonBlock,
  ProgramWeek,
} from "@/lib/lms-types";
import type { ScheduleSettings } from "@/lib/db/program-settings";
import { onboardingItems, weekPlans } from "@/lib/program-data";

type AdminNav = "overview" | "learners" | "program" | "reviews" | "scheduling";

export function AdminApp({
  admin,
  setAdmin,
  schedule,
  setSchedule,
  content,
  setContent,
  weeks,
  setWeeks,
  canSave,
}: {
  admin: AdminWorkspaceData;
  setAdmin: React.Dispatch<React.SetStateAction<AdminWorkspaceData | null>>;
  schedule: ScheduleSettings;
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleSettings>>;
  content: LessonBlock[];
  setContent: React.Dispatch<React.SetStateAction<LessonBlock[]>>;
  weeks: ProgramWeek[];
  setWeeks: React.Dispatch<React.SetStateAction<ProgramWeek[]>>;
  canSave: boolean;
}) {
  const [nav, setNav] = useState<AdminNav>("overview");
  return (
    <div className="workspace admin-workspace">
      <aside className="sidebar admin-sidebar">
        <div>
          <span className="eyebrow">Coach workspace</span>
          <h2>Run the program.</h2>
        </div>
        <nav className="side-nav">
          <SideButton
            active={nav === "overview"}
            onClick={() => setNav("overview")}
            icon={<LayoutDashboard size={18} />}
            label="Overview"
          />
          <SideButton
            active={nav === "learners"}
            onClick={() => setNav("learners")}
            icon={<UsersRound size={18} />}
            label="Learners"
            count={String(admin.learners.length)}
          />
          <SideButton
            active={nav === "program"}
            onClick={() => setNav("program")}
            icon={<Sparkles size={18} />}
            label="Content"
          />
          <SideButton
            active={nav === "scheduling"}
            onClick={() => setNav("scheduling")}
            icon={<CalendarDays size={18} />}
            label="Scheduling"
          />
          <SideButton
            active={nav === "reviews"}
            onClick={() => setNav("reviews")}
            icon={<FileCheck2 size={18} />}
            label="Reviews"
            count={
              admin.reviews.length ? String(admin.reviews.length) : undefined
            }
          />
        </nav>
        <div className="admin-note">
          <span>Content status</span>
          <strong>
            {content.filter((item) => item.published).length} live
          </strong>
          <small>
            {content.filter((item) => !item.published).length} drafts
          </small>
        </div>
      </aside>
      <section className="content-area">
        {nav === "overview" && (
          <Overview admin={admin} content={content} go={setNav} />
        )}
        {nav === "learners" && (
          <Learners
            admin={admin}
            setAdmin={setAdmin}
            content={content}
            weeks={weeks}
          />
        )}
        {nav === "program" && (
          <ContentBuilder
            content={content}
            setContent={setContent}
            weeks={weeks}
            setWeeks={setWeeks}
            canSave={canSave}
          />
        )}
        {nav === "scheduling" && (
          <Scheduling
            schedule={schedule}
            setSchedule={setSchedule}
            canSave={canSave}
          />
        )}
        {nav === "reviews" && <Reviews admin={admin} setAdmin={setAdmin} />}
      </section>
    </div>
  );
}

function Overview({
  admin,
  content,
  go,
}: {
  admin: AdminWorkspaceData;
  content: LessonBlock[];
  go: (nav: AdminNav) => void;
}) {
  const setupNeeded = admin.learners.filter(
    (learner) => !learner.whatsappReady || !learner.onboardingComplete,
  ).length;
  return (
    <>
      <div className="admin-heading">
        <div>
          <span className="eyebrow">Live program data</span>
          <h1>
            Your coaching
            <br />
            control room.
          </h1>
          <p>
            Every number below comes from Neon. There are no sample learners or
            fabricated reviews.
          </p>
        </div>
      </div>
      <div className="stat-grid">
        <Stat
          value={String(admin.learners.length)}
          label="Learners"
          color="pink"
        />
        <Stat
          value={String(admin.reviews.length)}
          label="Reviews waiting"
          color="yellow"
        />
        <Stat value={String(setupNeeded)} label="Need setup" color="coral" />
        <Stat
          value={String(content.filter((item) => item.published).length)}
          label="Published blocks"
          color="green"
        />
      </div>
      <section className="section-block">
        <div className="section-title">
          <div>
            <span className="eyebrow">Learner setup</span>
            <h2>Who needs action?</h2>
          </div>
          <button className="secondary-button" onClick={() => go("learners")}>
            Manage learners <ChevronRight size={17} />
          </button>
        </div>
        {admin.learners.length ? (
          <div className="learner-table">
            {admin.learners.map((learner) => (
              <div className="learner-row real-admin-row" key={learner.id}>
                <span className="avatar tint-pink">
                  {initials(learner.name)}
                </span>
                <div>
                  <strong>{learner.name}</strong>
                  <small>{learner.email}</small>
                </div>
                <div>
                  <small>Access</small>
                  <strong>Week {learner.currentWeek}</strong>
                </div>
                <div>
                  <small>Week 0</small>
                  <strong>
                    {learner.completedItems}/{onboardingItems.length}
                  </strong>
                </div>
                <span
                  className={`status ${learner.onboardingComplete ? "status-on-track" : "status-onboarding"}`}
                >
                  {learner.onboardingComplete ? "Profile ready" : "New account"}
                </span>
                <span
                  className={
                    learner.whatsappReady
                      ? "whatsapp-ready"
                      : "whatsapp-pending"
                  }
                >
                  <MessageCircleMore size={15} />
                  {learner.whatsappReady ? "Ready" : "Set up"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            title="No learners yet"
            body="A learner appears here as soon as they create an account with a non-admin email."
          />
        )}
      </section>
    </>
  );
}

function Learners({
  admin,
  setAdmin,
  content,
  weeks,
}: {
  admin: AdminWorkspaceData;
  setAdmin: React.Dispatch<React.SetStateAction<AdminWorkspaceData | null>>;
  content: LessonBlock[];
  weeks: ProgramWeek[];
}) {
  const [selectedId, setSelectedId] = useState(admin.learners[0]?.id ?? "");
  const learner = admin.learners.find((item) => item.id === selectedId);
  const [invite, setInvite] = useState(learner?.whatsappInviteUrl ?? "");
  const [deadline, setDeadline] = useState(
    toLocalDateTime(learner?.currentDueAt ?? ""),
  );
  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");
  if (!learner)
    return (
      <>
        <Heading
          eyebrow="Learner management"
          title="Real people, real progress."
          body="Learners appear after they create an account."
        />
        <Empty
          title="No learner accounts"
          body="Share the sign-up URL. Any email not listed in ADMIN_EMAILS becomes a learner automatically."
        />
      </>
    );

  async function update(payload: {
    currentWeek?: number;
    whatsappInviteUrl?: string;
    whatsappReady?: boolean;
    dueWeek?: number;
    dueAt?: string;
    status?: "onboarding" | "active" | "paused" | "completed";
    note?: string;
  }) {
    setMessage("Saving…");
    const response = await fetch("/api/admin/learners", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: learner!.id, ...payload }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error ?? "Could not save.");
      return;
    }
    setAdmin((current) =>
      current
        ? {
            ...current,
            learners: current.learners.map((item) =>
              item.id === learner!.id
                ? {
                    ...item,
                    ...payload,
                    ...(result.note
                      ? { notes: [result.note, ...item.notes] }
                      : {}),
                    ...(payload.dueAt !== undefined
                      ? {
                          currentDueAt: payload.dueAt
                            ? new Date(payload.dueAt).toISOString()
                            : "",
                        }
                      : {}),
                  }
                : item,
            ),
          }
        : current,
    );
    if (payload.note) setNote("");
    setMessage("Saved. The learner workspace is updated.");
  }

  return (
    <>
      <Heading
        eyebrow="Learner management"
        title="Personal at scale."
        body="Control access and communication for the learner who is actually signed up."
      />
      <div className="learner-layout">
        <div className="learner-list">
          {admin.learners.map((item) => (
            <button
              key={item.id}
              className={selectedId === item.id ? "active" : ""}
              onClick={() => {
                setSelectedId(item.id);
                setInvite(item.whatsappInviteUrl);
                setDeadline(toLocalDateTime(item.currentDueAt));
                setNote("");
                setMessage("");
              }}
            >
              <span className="avatar tint-pink">{initials(item.name)}</span>
              <span>
                <strong>{item.name}</strong>
                <small>
                  Week {item.currentWeek} · {item.timezone}
                </small>
              </span>
              <ChevronRight size={17} />
            </button>
          ))}
        </div>
        <section className="learner-detail">
          <div className="learner-detail-head">
            <span className="avatar avatar-xl tint-pink">
              {initials(learner.name)}
            </span>
            <div>
              <span className="eyebrow">Learner profile</span>
              <h2>{learner.name}</h2>
              <p>
                {learner.email} · {learner.timezone}
              </p>
            </div>
            <span className="status-pill">
              {learner.onboardingComplete ? "Onboarded" : "Profile pending"}
            </span>
          </div>
          <div className="detail-grid">
            <div>
              <small>Current access</small>
              <strong>Week {learner.currentWeek}</strong>
            </div>
            <div>
              <small>Week 0</small>
              <strong>
                {learner.completedItems}/{onboardingItems.length}
              </strong>
            </div>
            <div>
              <small>WhatsApp</small>
              <strong>{learner.whatsappReady ? "Ready" : "Needed"}</strong>
            </div>
            <div>
              <small>Timezone</small>
              <strong>{learner.timezone}</strong>
            </div>
          </div>
          <section className="learner-report">
            <div>
              <span className="eyebrow">Week 0 understanding report</span>
              <h3>{learner.capstoneTitle || "Not submitted yet"}</h3>
            </div>
            {learner.capstoneTitle ? (
              <div className="learner-report-grid">
                <div>
                  <small>Problem, user, workaround and evidence</small>
                  <p>{learner.capstoneProblem}</p>
                </div>
                <div>
                  <small>Existing solutions, gap and intended outcome</small>
                  <p>{learner.capstoneOutcome}</p>
                </div>
              </div>
            ) : (
              <p>
                This appears automatically after the learner submits their
                problem research from My build.
              </p>
            )}
          </section>
          <div className="admin-controls communication-editor">
            <div>
              <span className="eyebrow">Enrollment</span>
              <h3>Learner status</h3>
              <p>
                Pause access without deleting progress, or mark the program
                complete.
              </p>
            </div>
            <div className="inline-form">
              <select
                value={learner.status}
                onChange={(event) =>
                  update({
                    status: event.target.value as
                      "onboarding" | "active" | "paused" | "completed",
                  })
                }
              >
                <option value="onboarding">Onboarding</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="admin-controls">
            <div>
              <span className="eyebrow">Release controls</span>
              <h3>Highest available week</h3>
              <p>Publish content before opening a new week.</p>
            </div>
            <div className="unlock-track">
              {weeks.map((week) => {
                const hasContent =
                  week.weekNumber === 0 ||
                  content.some(
                    (block) =>
                      block.weekNumber === week.weekNumber && block.published,
                  );
                return (
                  <button
                    key={week.id}
                    disabled={!hasContent}
                    title={
                      !hasContent
                        ? `Publish Week ${week.weekNumber} content first`
                        : undefined
                    }
                    className={
                      week.weekNumber <= learner.currentWeek
                        ? `unlocked ${week.accent}`
                        : ""
                    }
                    onClick={() => update({ currentWeek: week.weekNumber })}
                  >
                    {week.weekNumber <= learner.currentWeek ? (
                      <Check size={16} />
                    ) : (
                      <LockKeyhole size={15} />
                    )}
                    <span>W{week.weekNumber}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="admin-controls communication-editor">
            <div>
              <span className="eyebrow">Local-time deadline</span>
              <h3>Week {learner.currentWeek} due date</h3>
              <p>The learner sees this converted to their browser timezone.</p>
            </div>
            <div className="inline-form">
              <input
                type="datetime-local"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
              />
              <button
                className="primary-button"
                onClick={() =>
                  update({
                    dueWeek: learner.currentWeek,
                    dueAt: deadline ? new Date(deadline).toISOString() : "",
                  })
                }
              >
                Save deadline
              </button>
            </div>
          </div>
          <div className="admin-controls communication-editor">
            <div>
              <span className="eyebrow">Communication</span>
              <h3>Private WhatsApp group</h3>
              <p>Create the group, then paste its invite URL.</p>
            </div>
            <div className="inline-form">
              <input
                type="url"
                value={invite}
                onChange={(event) => setInvite(event.target.value)}
                placeholder="https://chat.whatsapp.com/..."
              />
              <button
                className="primary-button"
                onClick={() =>
                  update({
                    whatsappInviteUrl: invite,
                    whatsappReady: Boolean(invite),
                  })
                }
              >
                Save invite
              </button>
            </div>
          </div>
          <div className="coach-notes">
            <div>
              <span className="eyebrow">Private coach notes</span>
              <h3>Context for the next session</h3>
            </div>
            <div className="inline-form">
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Progress, blockers, decisions or follow-up…"
              />
              <button
                className="primary-button"
                onClick={() => update({ note })}
                disabled={!note.trim()}
              >
                Add note
              </button>
            </div>
            {learner.notes.length > 0 && (
              <div className="note-list">
                {learner.notes.map((item) => (
                  <article key={item.id}>
                    <p>{item.body}</p>
                    <small>{new Date(item.createdAt).toLocaleString()}</small>
                  </article>
                ))}
              </div>
            )}
          </div>
          {message && (
            <div className="settings-message saved" role="status" aria-live="polite">
              {message}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function ContentBuilder({
  content,
  setContent,
  weeks,
  setWeeks,
  canSave,
}: {
  content: LessonBlock[];
  setContent: React.Dispatch<React.SetStateAction<LessonBlock[]>>;
  weeks: ProgramWeek[];
  setWeeks: React.Dispatch<React.SetStateAction<ProgramWeek[]>>;
  canSave: boolean;
}) {
  const [weekNumber, setWeekNumber] = useState(0);
  const [editing, setEditing] = useState<LessonBlock | null>(null);
  const [showForm, setShowForm] = useState(false);
  const blocks = content.filter((item) => item.weekNumber === weekNumber);
  const week = weeks.find((item) => item.weekNumber === weekNumber)!;
  const plan = weekPlans.find((item) => item.weekNumber === weekNumber)!;
  function startNew() {
    setEditing(null);
    setShowForm(true);
  }
  async function move(id: string, direction: "up" | "down") {
    if (!canSave) return;
    const response = await fetch("/api/admin/program", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "move-block", id, direction }),
    });
    const result = await response.json();
    if (response.ok) setContent(result.blocks);
  }
  return (
    <>
      <div className="admin-heading">
        <div>
          <span className="eyebrow">Content management</span>
          <h1>
            Build the
            <br />
            learning path.
          </h1>
          <p>
            The weekly blueprint is ready. Add your videos when you record
            them; drafts stay invisible until you publish and unlock the week.
          </p>
        </div>
        {weekNumber === 0 ? (
          <span className="status-pill">Checklist-managed</span>
        ) : (
          <button className="primary-button" onClick={startNew}>
            <Plus size={18} /> Add lesson
          </button>
        )}
      </div>
      <div className="content-week-tabs">
        {weeks.map((week) => (
          <button
            className={
              weekNumber === week.weekNumber ? `active ${week.accent}` : ""
            }
            key={week.id}
            onClick={() => {
              setWeekNumber(week.weekNumber);
              setShowForm(false);
            }}
          >
            W{week.weekNumber}
            <span>
              {
                content.filter(
                  (item) =>
                    item.weekNumber === week.weekNumber && item.published,
                ).length
              }{" "}
              live
            </span>
          </button>
        ))}
      </div>
      <WeekEditor
        key={week.id}
        week={week}
        canSave={canSave}
        onSaved={(saved) =>
          setWeeks((current) =>
            current.map((item) => (item.id === saved.id ? saved : item)),
          )
        }
      />
      {weekNumber === 0 ? (
        <section className="week-zero-admin-note">
          <span className="eyebrow">Onboarding only</span>
          <strong>No videos and no build are required in Week 0.</strong>
          <p>
            Learners join WhatsApp, choose and research one problem, submit
            their understanding report, and set up Python, Claude Code and
            GitHub from the Today checklist.
          </p>
        </section>
      ) : (
        <section className="admin-plan-blueprint">
          <div>
            <span className="eyebrow">Video plan</span>
            <strong>{plan.videos.length} focused videos</strong>
            <ul>
              {plan.videos.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="eyebrow">Build outcome</span>
            <strong>{plan.goal}</strong>
            <ul>
              {plan.build.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="eyebrow">Learner submits</span>
            <strong>Friday</strong>
            <ul>
              {plan.submit.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      )}
      {showForm && (
        <ContentForm
          weekNumber={weekNumber}
          editing={editing}
          canSave={canSave}
          onCancel={() => setShowForm(false)}
          onSaved={(block) => {
            setContent((current) =>
              editing
                ? current.map((item) => (item.id === block.id ? block : item))
                : [...current, block],
            );
            setShowForm(false);
          }}
        />
      )}
      {blocks.length ? (
        <div className="admin-week-grid content-admin-list">
          {blocks.map((block) => (
            <article className={`admin-week ${week.accent}`} key={block.id}>
              <span className="content-type-icon">
                {block.type.slice(0, 1).toUpperCase()}
              </span>
              <div>
                <span className="eyebrow">
                  {block.type} · {block.published ? "Published" : "Draft"}
                </span>
                <h3>{block.title}</h3>
                <p>{block.description}</p>
              </div>
              <div className="row-actions">
                <button
                  className="icon-button"
                  aria-label={`Move ${block.title} up`}
                  onClick={() => move(block.id, "up")}
                  disabled={block.id === blocks[0]?.id}
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  className="icon-button"
                  aria-label={`Move ${block.title} down`}
                  onClick={() => move(block.id, "down")}
                  disabled={block.id === blocks.at(-1)?.id}
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  className="secondary-button"
                  onClick={() => {
                    setEditing(block);
                    setShowForm(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="icon-button"
                  aria-label={`Delete ${block.title}`}
                  onClick={async () => {
                    if (!canSave) return;
                    const response = await fetch("/api/admin/content", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: block.id }),
                    });
                    if (response.ok)
                      setContent((current) =>
                        current.filter((item) => item.id !== block.id),
                      );
                  }}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        !showForm && (
          <Empty
            title={`No content in Week ${weekNumber}`}
            body={
              weekNumber === 0
                ? "Week 0 is managed through the learner onboarding checklist and understanding report."
                : "Add the first lesson, resource or task. Nothing appears to learners until you publish it."
            }
          />
        )
      )}
    </>
  );
}

function WeekEditor({
  week,
  canSave,
  onSaved,
}: {
  week: ProgramWeek;
  canSave: boolean;
  onSaved: (week: ProgramWeek) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    eyebrow: week.eyebrow,
    title: week.title,
    outcome: week.outcome,
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!canSave) return setMessage("Sign in as the configured admin to save.");
    if (saving) return;
    setSaving(true);
    const response = await fetch("/api/admin/program", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update-week",
        weekNumber: week.weekNumber,
        ...form,
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setSaving(false);
      return setMessage(result.error ?? "Could not save week details.");
    }
    onSaved(result.week);
    setEditing(false);
    setMessage("Week details saved.");
    setSaving(false);
  }
  if (!editing)
    return (
      <section className={`week-settings ${week.accent}`}>
        <div>
          <span className="eyebrow">{week.eyebrow}</span>
          <h2>{week.title}</h2>
          <p>{week.outcome}</p>
        </div>
        <button className="secondary-button" onClick={() => setEditing(true)}>
          Edit week details
        </button>
        {message && <small>{message}</small>}
      </section>
    );
  return (
    <form className="content-editor-form week-editor" onSubmit={save}>
      <div className="content-form-grid">
        <label>
          Short label
          <input
            value={form.eyebrow}
            onChange={(event) =>
              setForm({ ...form, eyebrow: event.target.value })
            }
            required
          />
        </label>
        <label>
          Week title
          <input
            value={form.title}
            onChange={(event) =>
              setForm({ ...form, title: event.target.value })
            }
            required
          />
        </label>
        <label className="wide">
          Learner outcome
          <textarea
            value={form.outcome}
            onChange={(event) =>
              setForm({ ...form, outcome: event.target.value })
            }
            required
          />
        </label>
      </div>
      {message && (
        <div className="settings-message error" role="status" aria-live="polite">
          {message}
        </div>
      )}
      <div className="form-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => setEditing(false)}
        >
          Cancel
        </button>
        <button className="primary-button" disabled={saving}>
          {saving ? "Saving…" : "Save week"} <Check size={17} />
        </button>
      </div>
    </form>
  );
}

function ContentForm({
  weekNumber,
  editing,
  canSave,
  onCancel,
  onSaved,
}: {
  weekNumber: number;
  editing: LessonBlock | null;
  canSave: boolean;
  onCancel: () => void;
  onSaved: (block: LessonBlock) => void;
}) {
  const [form, setForm] = useState({
    type: editing?.type ?? ("video" as ContentKind),
    title: editing?.title ?? "",
    description: editing?.description ?? "",
    body: editing?.content.body ?? "",
    url: editing?.content.url ?? "",
    durationMinutes: editing?.content.durationMinutes?.toString() ?? "",
    required: editing?.required ?? true,
    published: editing?.published ?? false,
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!canSave) {
      setMessage("Sign in as the configured admin to save content.");
      return;
    }
    if (saving) return;
    setSaving(true);
    setMessage("Saving…");
    const payload = {
      id: editing?.id,
      weekNumber,
      type: form.type,
      title: form.title,
      description: form.description,
      content: {
        body: form.body || undefined,
        url: form.url || undefined,
        durationMinutes: form.durationMinutes
          ? Number(form.durationMinutes)
          : undefined,
      },
      required: form.required,
      published: form.published,
    };
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error ?? "Could not save.");
      setSaving(false);
      return;
    }
    onSaved({
      id: result.block.id,
      weekNumber,
      type: form.type,
      title: form.title,
      description: form.description,
      content: payload.content,
      required: form.required,
      published: form.published,
      sortOrder: result.block.sortOrder ?? editing?.sortOrder ?? 0,
    });
    setSaving(false);
  }
  return (
    <form className="content-editor-form" onSubmit={save}>
      <div className="content-form-grid">
        <label>
          Content type
          <select
            value={form.type}
            onChange={(event) =>
              setForm({ ...form, type: event.target.value as ContentKind })
            }
          >
            <option value="video">YouTube video</option>
            <option value="text">Written lesson</option>
            <option value="link">Resource link</option>
            <option value="checklist">Task</option>
            <option value="booking">Booking link</option>
            <option value="submission">Submission instruction</option>
          </select>
        </label>
        <label>
          Title
          <input
            value={form.title}
            onChange={(event) =>
              setForm({ ...form, title: event.target.value })
            }
            required
          />
        </label>
        <label className="wide">
          Short description
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
          />
        </label>
        {form.type === "text" ||
        form.type === "checklist" ||
        form.type === "submission" ? (
          <label className="wide">
            Lesson or instruction text
            <textarea
              value={form.body}
              onChange={(event) =>
                setForm({ ...form, body: event.target.value })
              }
            />
          </label>
        ) : (
          <label className="wide">
            {form.type === "video" ? "YouTube URL" : "Destination URL"}
            <input
              type="url"
              value={form.url}
              onChange={(event) =>
                setForm({ ...form, url: event.target.value })
              }
            />
          </label>
        )}
        <label>
          Duration in minutes
          <input
            type="number"
            min="1"
            value={form.durationMinutes}
            onChange={(event) =>
              setForm({ ...form, durationMinutes: event.target.value })
            }
          />
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={form.required}
            onChange={(event) =>
              setForm({ ...form, required: event.target.checked })
            }
          />{" "}
          Required for progress
        </label>
        <label className="check-label publish-check">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(event) =>
              setForm({ ...form, published: event.target.checked })
            }
          />{" "}
          Publish to unlocked learners
        </label>
      </div>
      {message && (
        <div className="settings-message error" role="status" aria-live="polite">
          {message}
        </div>
      )}
      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
        <button className="primary-button" disabled={saving}>
          {saving
            ? "Saving…"
            : editing
              ? "Save changes"
              : "Add block"}
          <Check size={17} />
        </button>
      </div>
    </form>
  );
}

function Reviews({
  admin,
  setAdmin,
}: {
  admin: AdminWorkspaceData;
  setAdmin: React.Dispatch<React.SetStateAction<AdminWorkspaceData | null>>;
}) {
  const [selectedId, setSelectedId] = useState(admin.reviews[0]?.id ?? "");
  const [summary, setSummary] = useState("");
  const [result, setResult] = useState<
    "changes_requested" | "approved" | "standout"
  >("approved");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const selected = admin.reviews.find((item) => item.id === selectedId);
  async function submit() {
    if (!selected || submitting || !summary.trim()) return;
    setSubmitting(true);
    setMessage("Saving…");
    const response = await fetch("/api/admin/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId: selected.id, result, summary }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "Could not save review.");
      setSubmitting(false);
      return;
    }
    setAdmin((current) =>
      current
        ? {
            ...current,
            reviews: current.reviews.filter((item) => item.id !== selected.id),
          }
        : current,
    );
    setSelectedId("");
    setSummary("");
    setMessage("Feedback sent to the learner.");
    setSubmitting(false);
  }
  return (
    <>
      <Heading
        eyebrow="Review queue"
        title="Close the feedback loop."
        body="Review real learner evidence and send a decision back to their workspace."
      />
      {admin.reviews.length ? (
        <div className="review-workspace">
          <div className="review-list">
            {admin.reviews.map((review) => (
              <button
                className={`review-card ${selectedId === review.id ? "selected" : ""}`}
                key={review.id}
                onClick={() => setSelectedId(review.id)}
              >
                <span className="avatar avatar-large tint-green">
                  {initials(review.learnerName)}
                </span>
                <div>
                  <span className="eyebrow">
                    Week {review.weekNumber} · v{review.version}
                  </span>
                  <h3>{review.learnerName}</h3>
                  <p>
                    {review.submittedAt
                      ? new Date(review.submittedAt).toLocaleString()
                      : "Submitted"}
                  </p>
                </div>
                <ChevronRight />
              </button>
            ))}
          </div>
          {selected && (
            <section className="review-detail">
              <span className="eyebrow">Submitted evidence</span>
              <h2>
                {selected.learnerName} · Week {selected.weekNumber}
              </h2>
              <div className="review-links">
                <a
                  className="secondary-button"
                  href={selected.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Live app <ExternalLink size={16} />
                </a>
                <a
                  className="secondary-button"
                  href={selected.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Repository <ExternalLink size={16} />
                </a>
              </div>
              <h3>Reflection</h3>
              <p>{selected.reflection}</p>
              {selected.blocker && (
                <>
                  <h3>Blocker</h3>
                  <p>{selected.blocker}</p>
                </>
              )}
              <label className="review-feedback">
                Feedback
                <textarea
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  placeholder="Give specific, actionable feedback."
                />
              </label>
              <div className="review-decision">
                <select
                  value={result}
                  onChange={(event) =>
                    setResult(event.target.value as typeof result)
                  }
                >
                  <option value="approved">Approve</option>
                  <option value="changes_requested">Request changes</option>
                  <option value="standout">Mark standout</option>
                </select>
                <button
                  className="primary-button"
                  onClick={submit}
                  disabled={submitting || !summary.trim()}
                >
                  {submitting ? "Sending…" : "Send feedback"}
                </button>
              </div>
              {message && <small>{message}</small>}
            </section>
          )}
        </div>
      ) : (
        <Empty
          title="Review queue clear"
          body="New learner submissions will appear here automatically."
        />
      )}
    </>
  );
}

function Scheduling({
  schedule,
  setSchedule,
  canSave,
}: {
  schedule: ScheduleSettings;
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleSettings>>;
  canSave: boolean;
}) {
  const [draft, setDraft] = useState(schedule);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!canSave) {
      setMessage("Sign in as the configured admin to save.");
      return;
    }
    if (saving) return;
    setSaving(true);
    setMessage("Saving…");
    const response = await fetch("/api/admin/schedule", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error ?? "Could not save.");
      setSaving(false);
      return;
    }
    setSchedule(result.settings);
    setDraft(result.settings);
    setMessage("Saved. Learner booking cards are updated.");
    setSaving(false);
  }
  return (
    <>
      <Heading
        eyebrow="Scheduling settings"
        title="Your coaching doors."
        body="Paste the two direct Cal.com links shown on the learner's booking cards."
      />
      <form className="schedule-settings" onSubmit={save}>
        <ScheduleEditor
          title="Saturday kickoff"
          detail="Introduction, weekly direction and questions"
          value={draft.saturdayBookingUrl}
          accent="pink"
          onChange={(value) =>
            setDraft({ ...draft, saturdayBookingUrl: value })
          }
        />
        <ScheduleEditor
          title="Tuesday office hours"
          detail="One-to-one clarification before the build phase"
          value={draft.officeHourBookingUrl}
          accent="blue"
          onChange={(value) =>
            setDraft({ ...draft, officeHourBookingUrl: value })
          }
        />
        <div className="schedule-save">
          <p>
            Cal.com handles confirmation emails, reminders and meeting links.
          </p>
          <button className="primary-button" disabled={saving}>
            {saving ? "Saving…" : "Save booking links"} <Check size={17} />
          </button>
        </div>
        {message && (
          <div className="settings-message saved" role="status" aria-live="polite">
            {message}
          </div>
        )}
      </form>
    </>
  );
}

function ScheduleEditor({
  title,
  detail,
  value,
  accent,
  onChange,
}: {
  title: string;
  detail: string;
  value: string;
  accent: string;
  onChange: (value: string) => void;
}) {
  const testable = isCalBookingUrl(value);
  return (
    <section className={`schedule-editor ${accent}`}>
      <div className="schedule-editor-number">
        <CalendarDays size={25} />
      </div>
      <div className="schedule-editor-copy">
        <span className="eyebrow">Cal.com event</span>
        <h2>{title}</h2>
        <p>{detail}</p>
        <label>
          Booking URL
          <input
            type="url"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://cal.com/myrealproduct/event-name"
          />
        </label>
      </div>
      {testable && (
        <a
          className="secondary-button"
          href={value}
          target="_blank"
          rel="noreferrer"
        >
          Test link <ExternalLink size={16} />
        </a>
      )}
    </section>
  );
}

function isCalBookingUrl(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    return (
      url.protocol === "https:" &&
      (hostname === "cal.com" || hostname.endsWith(".cal.com"))
    );
  } catch {
    return false;
  }
}
function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="honest-empty">
      <Sparkles size={24} />
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}
function Heading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="admin-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{body}</p>
      </div>
    </div>
  );
}
function Stat({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className={`stat-card ${color}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
function SideButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: string;
}) {
  return (
    <button
      className={active ? "active" : ""}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
    >
      {icon}
      <span>{label}</span>
      {count && <b>{count}</b>}
    </button>
  );
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
function toLocalDateTime(value: string) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}
