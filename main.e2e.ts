import { runEnrolmentSuite } from './enrolment.e2e'
import { runFreyaFarrowAdhocSuite } from './freya-farrow-adhoc.scenario'

// ─────────────────────────────────────────────
// THIS IS THE ONLY FILE YOU RUN.
//
// enrolment.e2e.ts is FIXED — the shared login/
// enrolment flow. Never edit it when adding a
// new scenario.
//
// To add a NEW scenario tomorrow:
//   1. Create test/specs/<new-name>.scenario.ts
//      (copy the structure of
//      freya-farrow-adhoc.scenario.ts)
//   2. Add one import line below
//   3. Add one function call below
//
// Run command (always the same):
//   npx wdio run ./config/wdio.conf.ts --spec ./test/specs/main.e2e.ts
// ─────────────────────────────────────────────

// Always runs first — the login/enrolment flow
runEnrolmentSuite()

// Add scenario suites below this line.
// Comment out a line to skip that scenario
// without deleting anything.
runFreyaFarrowAdhocSuite()

// Example for adding a new scenario later:
// import { runAlbieClinicalSuite } from './albie-clinical.scenario'
// runAlbieClinicalSuite()
