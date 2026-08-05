# GitHub Copilot Instructions for interfacer-gui

## Issue Tracking with bd

**CRITICAL**: This project uses **bd** for ALL task tracking. Do NOT create markdown TODO lists.

### Essential Commands

```bash
# Find work
bd ready --json                    # Unblocked issues
bd stale --days 30 --json          # Forgotten issues

# Create and manage
bd create "Title" -t bug|feature|task -p 0-4 --json
bd create "Subtask" --parent <epic-id> --json  # Hierarchical subtask
bd update <id> --status in_progress --json
bd close <id> --reason "Done" --json

# Search
bd list --status open --priority 1 --json
bd show <id> --json

# Sync (CRITICAL at end of session!)
bd sync  # Force immediate export/commit/push
```

### Workflow

1. **Check ready work**: `bd ready --json`
2. **Claim task**: `bd update <id> --status in_progress`
3. **Work on it**: Implement, test, document
4. **Discover new work?** `bd create "Found bug" -p 1 --deps discovered-from:<parent-id> --json`
5. **Complete**: `bd close <id> --reason "Done" --json`
6. **Sync**: `bd sync` (flushes changes to git immediately)

### Priorities

- `0` - Critical (security, data loss, broken builds)
- `1` - High (major features, important bugs)
- `2` - Medium (default, nice-to-have)
- `3` - Low (polish, optimization)
- `4` - Backlog (future ideas)

## CLI Help

Run `bd <command> --help` to see all available flags for any command.
For example: `bd create --help` shows `--parent`, `--deps`, `--assignee`, etc.

## Important Rules

- ✅ Use bd for ALL task tracking
- ✅ Always use `--json` flag for programmatic use
- ✅ Run `bd sync` at end of sessions
- ✅ Link discovered work with `discovered-from` dependencies
- ✅ Run `bd <cmd> --help` to discover available flags
- ❌ Do NOT create markdown TODO lists
- ❌ Do NOT use external issue trackers

---

**For detailed workflows and advanced features, see [AGENTS.md](../AGENTS.md)**

---

## Design Context

### Users

Interfacer serves makers, designers, manufacturers, Fab City participants, and product auditors collaborating on open-source hardware. They use project details to understand how something can be made, verify its provenance, inspect related processes and resources, and assess whether its documentation is trustworthy and reusable.

### Brand Personality

Open, trustworthy, and practically technical. The interface should communicate civic infrastructure and transparent production without feeling like a developer console. It should create confidence, curiosity, and a sense that complex supply-chain information is understandable.

### Aesthetic Direction

Use Interfacer's existing light visual language: IBM Plex Sans for body copy, Space Grotesk for headings, restrained green as the primary action and trust color, entity colors for semantic distinctions, compact borders, and clear white surfaces. Traceability views should be approachable-technical: simplify the graph by default, progressively reveal node details, and avoid decorative data visualization.

### Design Principles

1. Make provenance legible: communicate resources, processes, and events through consistent shapes, colors, labels, and direction.
2. Reveal complexity progressively: begin with a readable overview, then expose identifiers, metadata, and raw data on demand.
3. Preserve trust through precision: distinguish loaded, empty, and error states clearly and never imply data that was not returned.
4. Keep expensive data intentional: fetch traceability only when requested, cache it for the detail-page session, and reuse the result across consumers.
5. Design inclusively: meet WCAG AA contrast, provide keyboard-operable controls and a structured text alternative, respect reduced motion, and adapt the graph for smaller screens.
