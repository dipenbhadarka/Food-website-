import { runEnrolmentSuite } from './enrolment.e2e'
import { runFinishSignOutSuite } from './scenarios/finish-signout.scenario'

// ─────────────────────────────────────────────
// THIS IS THE ONLY FILE YOU RUN.
//
// enrolment.e2e.ts is FIXED — the shared login/
// enrolment flow. Never edit it when adding a
// new scenario.
//
// To add a NEW scenario:
//   1. Create test/specs/scenarios/<name>.scenario.ts
//      (copy finish-signout.scenario.ts as a template —
//      keep the same "export function run...Suite()"
//      pattern)
//   2. Add ONE import line below (copy the pattern of
//      the existing import line)
//   3. Add ONE function call below (copy the pattern
//      of the existing call)
//   Never delete or edit the lines already here —
//   only ADD new ones.
//
// Run command (always the same):
//   npx wdio run ./config/wdio.conf.ts --spec ./test/specs/main.e2e.ts
// ─────────────────────────────────────────────

console.log('▶▶▶ main.e2e.ts loaded — running enrolment suite + all listed scenarios')

// Always runs first — the login/enrolment flow
runEnrolmentSuite()

// ── Scenarios — add new lines below, never remove existing ones ──
runFinishSignOutSuite()

// Example of what adding a second scenario looks like later:
// import { runFreyaFarrowAdhocSuite } from './scenarios/freya-farrow-adhoc.scenario'
// runFreyaFarrowAdhocSuite()
