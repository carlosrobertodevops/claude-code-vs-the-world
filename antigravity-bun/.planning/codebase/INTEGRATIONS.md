# Integrations

**Analysis Date:** 2026-04-13

## External Services

- **NextAuth (Auth.js):** Provides authentication layer. Planned for Credentials and possible future OAuth.
- **MinIO Storage:** S3-compatible service used to persist photos and PDF contracts.

## Internal Dependencies

- **PostgreSQL:** Primary state storage.

## Data Formats

- **PDF Generation:** Interfacing directly with `@react-pdf/renderer` to generate quotes and contracts.
- **CSV Exporter:** Data exported from Recharts internal analysis into CSVs for the manager.

---

*Integrations analysis: 2026-04-13*
*Update when adding/modifying external connections*
