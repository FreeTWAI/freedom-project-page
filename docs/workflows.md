# Freedom Project Page Workflows

## Project Page Schema Validation

The project page generator relies on a valid `freedom.project.yaml` manifest. The generator performs defensive checks against the provided manifest during the build step. However, this does not replace the full canonical schema validation.

Before processing a project page manifest, the repository relies on a central schema. You should always validate the input manifest against the latest canonical JSON schema to ensure it contains all the necessary public metadata. The generator strictly refuses to emit internal metadata or fields meant to be withheld from public view.

## GitHub Status Check Action Guide

The `freedom-project-page` repository leverages a shared GitHub workflow (`verify-template.yml`) to enforce CI checks on pull requests and pushes to `main`. This is handled by a remote workflow call to:

`FreeTWAI/.github/.github/workflows/verify-template.yml`

This centralized action ensures the template contract and fundamental build steps operate as expected.

## Pin-SHA Workflows

When using external shared actions or dependent files, use exact SHA-1 hashes (40-character commits) instead of tags like `v1` or branch names like `main`. This ensures reproducible builds and prevents upstream modifications from breaking the CI without an explicit bump in the local repository.

Example from our own workflows:
`uses: FreeTWAI/.github/.github/workflows/verify-template.yml@fb74d43e623f05c849664da6f2f1a630de25a898`
