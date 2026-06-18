# Agent Instructions — SaaS Template Provider Consumer Use Case

This repository is a child reference/template project of `nkatraga/naveen-command-center`.

## Command Center Sync Rule

Any agent working in this repository must keep the Naveen Command Center in sync when work here changes top-level status, current focus, next actions, infrastructure, agents, or major decisions.

Required sync targets in `nkatraga/naveen-command-center`:

- Project status / current focus / next action: update `project-registry.yml`.
- Runtime infrastructure, deployment URLs, services, domains, storage, queues, cron jobs, or API integrations: update `infra-registry.yml`.
- AI agents, routines, scheduled jobs, Claude/Codex/Cursor workflows, or automations: update `agent-registry.yml`.
- Major product, strategy, template, or architecture decisions: append to `decision-log.md`.

Definition of done for work in this repo includes either:

1. The Command Center was updated directly, or
2. The final response/PR includes a clear **Command Center Update Needed** section with exact proposed changes.

## Local Project Notes

- This is currently tracked as a template/reference project, not an active current-focus project.
- Keep repo-specific technical detail in this repo.
- Keep top-level project status and cross-project context in `nkatraga/naveen-command-center`.
- Do not store secrets, API keys, tokens, passwords, or private credentials in this repo.
