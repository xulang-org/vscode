# Xu VS Code extension

This is an independent syntax-highlighting extension. Packaging must work
without a Xu compiler checkout. Extension versioning belongs to package.json
and is independent of the Xu release VERSION; bump it once for changed extension
content in a batch, then rebuild and inspect the current VSIX.

For local work beside Xu, read ../xu/docs/DEVELOPMENT.md before editing (XU_ROOT
selects another checkout). Keep the following rules in standalone work too:
no commits or pushes without user instruction; stage explicit source paths only;
keep reports, local docs, editor state, node_modules and VSIX artifacts untracked.
Never force-add ignored files or bypass Git checks. Preserve existing work.

Use npm ci and npm run package. .vscodeignore allowlists the public extension
files; inspect the resulting VSIX to ensure metadata, grammar, editor config and
icon are included, and Git/development/build state is excluded. Do not add compiler
or oracle binaries to the extension; LSP.md documents an explicit external lane.
