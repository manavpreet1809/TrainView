# Release preparation progress

Delivered filtered/sorted CSV attachments, spreadsheet-safe serialization tests, a privacy-preserving health endpoint, standalone packaging including Prisma native engines, Docker demo packaging, Compose health checks, and expanded CI for normal/standalone/container execution.

Local validation: 24 tests, lint, TypeScript, production build, normal and standalone HTTP smoke checks, and Compose configuration validation. The first standalone run exposed a missing native engine; packaging now copies the runtime explicitly. Generated standalone bundles exclude local environment files.

Docker execution is delegated to CI because the local Docker daemon was unavailable. The container job must pass before describing the image as verified. Live provider integrations, real FIT exports, public hosting, final media, and comprehensive device/accessibility checks remain release work. This stage is not marked fully complete.

Unrelated workspace output and a CSV dataset are excluded from commits and the container build context.
