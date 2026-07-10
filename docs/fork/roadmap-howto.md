# Roadmap in Plane — How-To (no custom code)

**Audience:** our internal team using the self-hosted Plane fork as a Jira replacement.
**Status:** Objective 3 of the fork brief. This feature already exists in Plane
Community — nothing was built. This doc just explains the model and the setup steps.

---

## 1. The vocabulary (Plane term → what it means for us)

| Plane term    | Jira-ish equivalent | What it is |
|---------------|---------------------|------------|
| **Work item** | Issue / task        | The atomic unit of work. Has an assignee, state, priority, dates, estimate. |
| **Cycle**     | Sprint              | A **time-boxed** container (start + end date). A work item can be in **one** cycle at a time. Use it for "what are we doing in the next two weeks". |
| **Module**    | Epic / deliverable group | A **deliverable-oriented** grouping with its own **start + target date**. A work item can belong to **multiple** modules. Use it for "the Billing rework" or "Q3 API migration". |
| **Epic**      | Initiative / theme  | A level **above** modules/work items — a large body of work spanning many items. In Plane an Epic is a special **Work Item Type**, so it must be enabled separately (see §2). |

**The "roadmap"** in Plane is not a separate screen — it is your **Modules (and/or
Epics)** displayed on the **Gantt / Timeline layout**, where each module's start→target
date range is drawn as a horizontal bar across a calendar. That timeline view *is* the
roadmap.

---

## 2. One-time setup (per project)

All of this is toggled in **Project Settings → Features**. You need the **Admin** role
on the project.

1. Open the project → **Settings** (gear icon) → **Features**.
2. Enable:
   - **Cycles** — turns on sprints.
   - **Modules** — turns on deliverable groups (required for the roadmap).
   - **Work Item Types** — *only if you want Epics.* Epics are a work-item type and
     ride on this toggle. If you just want a module timeline, you can skip this.
3. Save. The **Cycles** and **Modules** entries now appear in the project's left sidebar.

> Note: these are per-project switches (`cycle_view`, `module_view`,
> `is_issue_type_enabled` on the project). Enabling them in one project does not
> enable them elsewhere.

---

## 3. Build a roadmap (module timeline)

1. **Create a module per deliverable.**
   - Left sidebar → **Modules** → **New Module**.
   - Give it a name (e.g. "Billing rework"), a **Start date** and a **Target date**.
     The dates are what make it show up as a bar on the timeline — a module with no
     dates has nothing to plot.
   - Optionally set a Lead and Members.
2. **Add work items to the module.**
   - Open the module → add existing work items, or create new ones from inside it.
   - A work item can sit in several modules at once, so a single task can count toward
     more than one deliverable.
3. **Switch the layout to Gantt / Timeline.**
   - Open the module (or the project's work-items view) → use the **layout switcher**
     in the top-right → choose **Gantt** (a.k.a. Timeline).
   - You'll see each item/module as a bar positioned by its dates. Drag a bar's edges
     to change start/target; drag the whole bar to shift it.
4. **(Optional) Epics for a higher level.**
   - If Work Item Types is enabled, create an **Epic** work item and nest modules/items
     under it to get an initiative-level view above the modules.

### Cycles (sprints) alongside the roadmap
Cycles are the short-term execution view, complementary to the module roadmap:
- Create a Cycle with a start/end date (e.g. a 2-week sprint).
- Assign work items to the current cycle.
- The cycle page shows sprint progress (burndown, completed vs pending). Use Modules
  for the *long-range roadmap*, Cycles for *what's in flight now*.

---

## 4. Known gap (acceptable, no fix planned)

**Gantt dependency arrows are not available in Community.** You can place and move bars
on the timeline, but you **cannot draw "blocks / blocked-by" dependency links** between
them — the dependency-drawing components are stubbed out in the community edition
(`apps/web/ce/components/gantt-chart/dependency/*` render nothing). Everything else on
the timeline (bars, dates, drag-to-reschedule, sidebar) works normally.

If we ever need dependency arrows, that would be a separate build effort (not part of
the current fork objectives).

---

## 5. Quick reference

- Enable features: **Project Settings → Features** (Admin only).
- Roadmap = **Modules with dates** shown on the **Gantt/Timeline layout**.
- **Cycle** = time-box (sprint), one per work item. **Module** = deliverable, many per
  work item, has start+target dates. **Epic** = above modules (needs Work Item Types).
- Dependency arrows on the Gantt: **not available** in our edition.
