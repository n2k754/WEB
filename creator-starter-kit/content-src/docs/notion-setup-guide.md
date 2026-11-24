# Notion content dashboard — setup guide

Your package contains five CSV files that Notion can import as databases, plus this guide. Setup takes about 20 minutes. A free Notion account is enough. Notion's interface changes from time to time, so menu names may differ slightly.

> **What this is:** importable database files and step-by-step instructions to build the dashboard. It is not a one-click duplicate link: you build the workspace once using the steps below.

## Step 1 · Create a parent page

Create a new page called **Creator Dashboard**. Everything else lives inside it.

## Step 2 · Import the databases

For each CSV file: in the sidebar choose *Import* (or ⋯ → *Import*), select *CSV*, and upload the file. Move each new database inside your Creator Dashboard page.

| File | Database name |
|---|---|
| Content-Calendar.csv | Content Calendar |
| Idea-Database.csv | Idea Database |
| Published-Content-Tracker.csv | Published Content |
| Weekly-Planning.csv | Weekly Planning |
| Performance-Tracking.csv | Performance |

## Step 3 · Fix property types

Notion imports some columns as text. Change them as follows (click a column header → *Edit property* → *Type*):

**Content Calendar:** Status → *Status* or *Select* (Idea, Drafting, Ready, Scheduled, Published) · Publish Date → *Date* · Platform, Format, Pillar → *Select*.
**Idea Database:** Pillar, Format, Source, Priority, Status → *Select*.
**Published Content:** Publish Date → *Date* · URL → *URL* · Platform, Format, Pillar → *Select*.
**Weekly Planning:** Week Starting → *Date* · Posts Planned, Posts Published → *Number*.
**Performance:** Week Starting → *Date* · Posts, Views, Saves, Shares, Profile Visits, Link Clicks → *Number*.

## Step 4 · Add helpful views

- **Content Calendar → Calendar view** by *Publish Date*, plus a **Board view** grouped by *Status* for status management.
- **Idea Database → Table view** sorted by Priority, with a filter hiding items whose Status is *Used*.
- **Weekly Planning → Table view** sorted by Week Starting (descending).
- **Performance → Chart view** (Notion's chart feature) of Views by Week Starting, if available on your plan.

## Step 5 · Add formulas (optional)

In **Performance**, add a formula property *Engagement Rate*. In current Notion formula syntax:

`if(prop("Views") > 0, round((prop("Saves") + prop("Shares")) / prop("Views") * 1000) / 10, 0)`

This shows saves plus shares as a percentage of views. If your Notion version rejects the formula, ask Notion's built-in help for the equivalent.

## Step 6 · Link databases (optional)

Add a *Relation* property from **Published Content → Content Calendar** so each published item links to the plan that created it, and from **Content Calendar → Idea Database** to track where ideas came from.

## Step 7 · Build the dashboard page

On the Creator Dashboard page, add:

1. A heading **This week** and a linked view of Content Calendar filtered to this week.
2. A heading **Ideas to shoot next** with a linked Idea Database view filtered by High priority.
3. A heading **Weekly planning** with a linked Weekly Planning view.
4. A heading **Numbers** with a linked Performance view or chart.
5. A callout block with your goal for this month.

(Type `/linked view of database` in a page to add them.)

## Weekly routine (20 minutes)

1. Update Performance with last week's numbers.
2. Write What Worked and What To Change in Weekly Planning.
3. Pick next week's posts from the Idea Database and move them into the Content Calendar.
4. Move published items to *Published* and add the URL.

## The sample rows

All rows beginning with "Sample:" are examples. Replace or delete them. Dates are placeholders: edit them to match your schedule.
