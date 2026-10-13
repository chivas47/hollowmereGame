# Chat starters

Copy one into a new chat in the project and fill in the brackets. Each one tells Claude which kind of work it is, so it does not have to guess.

## New feature

> New feature: [what it is, in one or two sentences].
> Read CODEBASE.md and ARCHITECTURE.md first. Give me a short plan (new files, changed files, save impact, interaction priority, balance impact), then build it. Complete files only.

## New content (no new systems)

> Add content: [for example 2 new summer crops, a new fish, a new neighbour named X who is Y].
> Data files only where possible. Update GAME_DESIGN.md tables.

## Bug report

> Bug: [what I did] -> [what happened] -> [what I expected].
> Map: [Farm / Wilds / Hollow floor N]. Selected tool: [ ]. Any console error: [paste or "none"].
> Find the cause in CODEBASE.md before changing anything, explain it in two sentences, then fix it.

## Balance pass

> I played [N] days without debug tools. Here is what happened: [gold per day, what felt slow, what felt pointless, what I bought and when].
> Propose number changes as a before/after table with your reasoning, then apply them to the data files.

## Refactor or cleanup

> Refactor: [area]. Behaviour must not change and old saves must load.
> List the risks first.

## Art pass

> Art: redraw [sprite or tile] in `render/`. Keep the 16 px grid and the existing palette feel. Describe the change in words, then give the full file.

## Planning (no code)

> Planning only, no code. I am thinking about [idea]. Check it against GAME_DESIGN.md, tell me what it adds to the loop, what it costs to build, and what you would do instead if you disagree.
