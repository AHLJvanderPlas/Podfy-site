// POST /csp-report — Content-Security-Policy violation reports (report-only phase) → MAIN_DB.csp_reports
import { handleCspReport } from "./_shared/csp-report.js";
export const onRequest = ({ request, env }) => handleCspReport(request, env.MAIN_DB, "site");
