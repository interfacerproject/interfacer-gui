# Redesign Issues Reference

## Dependency Graph

```
Epic 1 (60u) P0  ──►  Epic 2 (0i2) P1  ──┐
                 ──►  Epic 3 (z7y) P1  ──►  Epic 7 (ady) P2
                 ──►  Epic 4 (1ne) P1  ──┤
                 ──►  Epic 5 (zdx) P1  ──►  Epic 8 (5pp) P2
                 ──►  Epic 6 (dwo) P2  ──┤
                                          └►  Epic 9 (7gg) P3
```

## Epics

| ID                 | P   | Title                                       | Subtasks  |
| ------------------ | --- | ------------------------------------------- | --------- |
| interfacer-gui-60u | 0   | Design System Foundation                    | .1-.5 (5) |
| interfacer-gui-0i2 | 1   | Navigation and Layout Redesign              | .1-.3 (3) |
| interfacer-gui-z7y | 1   | Catalog Pages (Designs, Products, Services) | .1-.5 (5) |
| interfacer-gui-1ne | 1   | Detail Pages (Design, Product, Service)     | .1-.4 (4) |
| interfacer-gui-zdx | 1   | Profile Page Redesign                       | .1-.8 (8) |
| interfacer-gui-dwo | 2   | Creation Forms Redesign                     | .1-.5 (5) |
| interfacer-gui-ady | 2   | Search and Filtering System                 | .1-.3 (3) |
| interfacer-gui-5pp | 2   | Interactive Features                        | .1-.5 (5) |
| interfacer-gui-7gg | 3   | Polish and Legacy Cleanup                   | .1-.6 (6) |

Total: 9 epics + 44 subtasks = 53 new issues (73 total in bd)
Created: 2026-03-16
