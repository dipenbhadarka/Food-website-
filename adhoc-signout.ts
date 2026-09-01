import { testBot } from '../../testbot'
import { AndroidLocatorBuilder } from '../../TestBot/Locators/Android/AndroidLocatorBuilder'
import { iOSLocatorBuilder } from '../../TestBot/Locators/iOS/iOSLocatorBuilder'
import { TestBotElement } from '../../TestBot/TestBotElement'

const isLocal = process.env.RUN_MODE === 'local'
console.log(`Running Adhoc Activity flow in ${isLocal ? 'LOCAL PHYSICAL DEVICE' : 'BROWSERSTACK CLOUD'} mode`)

// ─────────────────────────────────────────────
// Full list of care recipients — one is picked
// at random each run to make the script dynamic
// rather than always targeting the same person.
// ─────────────────────────────────────────────
const CARE_RECIPIENTS = [
    'Ah-Na Gravy',
    'Alan Gravy',
    'Albie Armstrong',
    'Arturo Reyes',
    'Benita Reyes',
    'Brenda Brown',
    'Charlotte Crawley',
    'Freya Farrow',
    'Gaz Garfield',
    'Harriet Harper',
    'Ingrid Ingleberry',
    'Jo Johnson',
    'Mack Michaels',
    'Maureeen Moor',
    'Rico Dawson',
    'Robyn Partridge',
    'Rosie Matthews',
    'Victor Willson',
    'Yasmine Young',
]

function residentLocator(name: string): TestBotElement {
    return {
        android: AndroidLocatorBuilder.xpath(
            `//android.widget.TextView[@text="${name}"]`
        ),
        ios: iOSLocatorBuilder.xpath(
            `//XCUIElementTypeStaticText[@name="${name}"]`
        ),
    } as TestBotElement
}

// ─────────────────────────────────────────────
// Helper — dump page source safely, without
// throwing if the session itself is dead. Also
// persisted to disk since console output for the
// final test in a run has proven unreliable to
// inspect after the fact.
// ─────────────────────────────────────────────
async function dumpPageSourceOnFailure(stepLabel: string) {
    console.error(`Failure at ${stepLabel} — dumping page source`)
    try {
        const pageSource = await driver.getPageSource()
        console.log(`─────────── PAGE SOURCE: ${stepLabel} ───────────`)
        console.log(pageSource)
        console.log('─────────────────────────────────────────────')
        try {
            const fs = require('fs')
            const path = require('path')
            const safeName = stepLabel.replace(/[^a-z0-9.]+/gi, '_')
            const outDir = path.resolve(__dirname, '../../../../run')
            if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
            fs.writeFileSync(path.join(outDir, `adhoc_failure_${safeName}.xml`), pageSource, 'utf-8')
        } catch (writeErr) {
            console.warn('Could not write page source to disk:', writeErr)
        }
    } catch (srcErr) {
        console.error(
            `getPageSource ALSO failed (${srcErr instanceof Error ? srcErr.message : srcErr}) — ` +
            'session likely dead. Consider restarting Appium/BrowserStack session.'
        )
    }
}

// ─────────────────────────────────────────────
// Helper — pick and select a resident dynamically
// AT RUNTIME. Scans which of the CARE_RECIPIENTS
// are ACTUALLY present on screen right now, then
// picks randomly among only those, so it never
// converges on the same "easy to find" name.
// Returns the name that was actually selected.
// ─────────────────────────────────────────────
async function selectRandomResident(): Promise<string> {
    console.log('▶ Scanning screen for all currently visible care recipients...')

    const visibleCandidates: string[] = []

    for (const candidateName of CARE_RECIPIENTS) {
        const locator = residentLocator(candidateName)
        const isPresent = await testBot.isVisible(locator).catch(() => false)
        if (isPresent) {
            visibleCandidates.push(candidateName)
        }
    }

    console.log(`▶ Found ${visibleCandidates.length} visible candidate(s) without scrolling:`, visibleCandidates)

    if (visibleCandidates.length === 0) {
        console.warn('No candidates visible without scrolling — falling back to scroll-based search')
        const shuffled = [...CARE_RECIPIENTS].sort(() => Math.random() - 0.5)

        for (const candidateName of shuffled) {
            try {
                const scrolled = await $(
                    'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
                    `.scrollIntoView(new UiSelector().textMatches("^${candidateName}$"))`
                )
                if (await scrolled.isExisting()) {
                    await scrolled.click()
                    console.log(`▶ Selected resident: "${candidateName}" (found via scroll fallback)`)
                    return candidateName
                }
            } catch (err) {
                console.warn(`"${candidateName}" not found via scroll — trying next candidate`)
            }
        }

        console.error('None of the care recipients in the list were found on screen — dumping page source')
        await dumpPageSourceOnFailure('selectRandomResident (no candidate found)')
        throw new Error('Could not select any resident from the full CARE_RECIPIENTS list — none were visible on screen')
    }

    const randomIndex = Math.floor(Math.random() * visibleCandidates.length)
    const chosenName = visibleCandidates[randomIndex]

    console.log(`▶ Randomly chosen from visible candidates: "${chosenName}"`)

    const locator = residentLocator(chosenName)
    await testBot.click(locator)
    console.log(`▶ Selected resident: "${chosenName}"`)
    return chosenName
}

// ─────────────────────────────────────────────
// Care note types shown in the "Select Care"
// picker, grouped by their real on-screen section
// tab so we can guarantee at least one pick per
// section rather than a flat random pool that
// might land all picks in one section and skip
// the rest entirely.
//
// Activities/Communication/Medical/Personal Care
// entries are confirmed from a real "Select Care"
// picker page-source dump or as previously
// provided. The remaining sections (Emotional
// Support, Going to the Toilet, Mobility,
// Nutrition/Eating & Drinking, Personal Safety &
// Environment, Process, Sleeping) are NOT yet
// confirmed — each has an EMPTY array below as a
// placeholder. Fill in the real note names for
// each (visible on the "Select Care" screen under
// that section's tab) before relying on random
// selection for that section; until filled in,
// that section is simply skipped by Mode B
// (nothing to pick from) and can still be targeted
// directly by name in Mode A/per-section explicit
// lists regardless of this list being empty.
// ─────────────────────────────────────────────
const CARE_NOTE_CATEGORIES = {
    Activities: [
        'Armchair exercises',
        'Art',
        'Ball games',
        'Bingo',
        'Birthday',
        'Bowling',
        'Church',
        'Cigarette',
        'Cinema',
        'Community',
        'Computer',
        'Concert',
        'Cooking',
        'Crossword',
        'Daily Sparkle',
        'Day centre',
    ],
    Communication: [
        'Bell',
        "Can't communicate",
        'Chatted',
        'Email',
        'Help reading',
        'Help writing',
        'Mentoring',
        'Newspaper',
    ],
    'Emotional Support': [
        // TODO: fill in real note names for this section
    ],
    'Going to the Toilet': [
        // TODO: fill in real note names for this section
    ],
    Medical: [
        'Add bag',
        'Ambulance',
        'Blood',
        'INR',
    ],
    Mobility: [
        // TODO: fill in real note names for this section
    ],
    'Nutrition, Eating & Drinking': [
        // TODO: fill in real note names for this section
    ],
    'Personal Care': [
        'Bath',
        'Catheter care',
        'Change clothes',
    ],
    'Personal Safety & Environment': [
        // NB: confirmed from a real screenshot, but the section
        // header above these was cut off — please confirm these
        // 4 genuinely belong to "Personal Safety & Environment"
        // and not a different, unlabelled section.
        'Fridge temperature',
        'Pendant alarm',
        'Room temperature',
        'Wheelchair belt',
    ],
    Process: [
        // Confirmed from a real screenshot of the "Select Care" screen.
        'Admitted',
        'Alert',
        'Complaint',
        'Compliment',
    ],
    Sleeping: [
        // TODO: fill in real note names for this section
    ],
} as const

type CareNoteCategory = keyof typeof CARE_NOTE_CATEGORIES

const ALL_CATEGORY_NAMES = Object.keys(CARE_NOTE_CATEGORIES) as CareNoteCategory[]

// Flat pool (all sections combined) — used only
// for the "pure random, no section guarantee"
// mode, kept for backward compatibility.
const CARE_NOTE_TYPES: string[] = Object.values(CARE_NOTE_CATEGORIES).flat()

// ─────────────────────────────────────────────
// RUN CONFIGURATION — edit PER_SECTION_CONFIG
// before each run to control what gets selected,
// independently for EACH of the 11 sections.
//
// For every section, choose ONE of:
//
//   { mode: 'explicit', notes: ['Name One', 'Name Two'] }
//     -> selects EXACTLY those names from that
//        section, in that order (scrolls to find
//        each one if needed). Fails with a clear
//        error if a name can't be found even after
//        scrolling — this mode is deterministic on
//        purpose, so a typo or wrong section is
//        never silently ignored.
//
//   { mode: 'random', count: 2 }
//     -> picks that many RANDOM notes from
//        whatever's visible in that section
//        (scrolling to discover the full list
//        first). Set count to 0 to skip the
//        section's random pick entirely while
//        still leaving it configured for later.
//
//   { mode: 'skip' }
//     -> section is not touched at all this run.
//
// Every section not listed in PER_SECTION_CONFIG
// defaults to `{ mode: 'skip' }` automatically —
// you only need to list the sections you actually
// want to act on for a given run.
//
// Total notes selected across ALL sections combined
// is still capped at 10 per run (per requirement).
// If your per-section requests add up to more than
// 10, sections are processed in the order listed
// below and the run stops adding further notes once
// the cap is reached (already-completed sections are
// unaffected).
// ─────────────────────────────────────────────
type SectionSelection =
    | { mode: 'explicit'; notes: string[] }
    | { mode: 'random'; count: number }
    | { mode: 'skip' }

const PER_SECTION_CONFIG: Partial<Record<CareNoteCategory, SectionSelection>> = {
    Activities: { mode: 'random', count: 1 },
    Communication: { mode: 'random', count: 1 },
    'Emotional Support': { mode: 'random', count: 1 },
    'Going to the Toilet': { mode: 'random', count: 1 },
    Medical: { mode: 'random', count: 1 },
    Mobility: { mode: 'random', count: 1 },
    'Nutrition, Eating & Drinking': { mode: 'random', count: 1 },
    'Personal Care': { mode: 'random', count: 1 },
    'Personal Safety & Environment': { mode: 'random', count: 1 },
    Process: { mode: 'random', count: 1 },
    Sleeping: { mode: 'random', count: 1 },
}

// Overall cap — never select more than this many
// notes total across all sections combined in one
// run, regardless of what PER_SECTION_CONFIG asks
// for.
const OVERALL_CARE_NOTE_CAP = 10

function careNoteLocator(name: string): TestBotElement {
    return {
        android: AndroidLocatorBuilder.xpath(
            `//android.widget.TextView[@text="${name}"]`
        ),
        ios: iOSLocatorBuilder.xpath(
            `//XCUIElementTypeStaticText[@name="${name}"]`
        ),
    } as TestBotElement
}

async function isNoteVisible(name: string): Promise<boolean> {
    return testBot.isVisible(careNoteLocator(name)).catch(() => false)
}

// ─────────────────────────────────────────────
// Helper — find a note by name, scrolling the
// "Select Care" list if it isn't visible without
// scrolling first. Tries direct visibility, then
// falls back to UiScrollable.scrollIntoView.
// Returns true if found (and leaves it on screen,
// scrolled into view), false if genuinely not
// present anywhere in the list even after
// scrolling.
// ─────────────────────────────────────────────
async function scrollToNoteIfNeeded(name: string): Promise<boolean> {
    if (await isNoteVisible(name)) {
        return true
    }

    console.log(`  "${name}" not visible without scrolling — scrolling to find it`)
    try {
        const scrolled = await $(
            'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
            `.scrollIntoView(new UiSelector().textMatches("^${name}$"))`
        )
        if (await scrolled.isExisting()) {
            return true
        }
    } catch (err) {
        console.warn(`  UiScrollable scroll for "${name}" failed:`, err)
    }

    return false
}

// ─────────────────────────────────────────────
// Helper — scroll the "Select Care" list to the
// named section's tab/heading, so that section's
// notes are the ones currently in view before we
// scan or select within it. Sections are laid out
// as tabs/headings on the same scrollable screen;
// scrolling to the section name itself brings its
// notes into view directly below it.
// ─────────────────────────────────────────────
async function scrollToSection(category: CareNoteCategory): Promise<boolean> {
    const sectionHeadingXpath = `//android.widget.TextView[@text="${category}"]`

    const headingEl = await $(sectionHeadingXpath)
    if (await headingEl.isExisting() && await headingEl.isDisplayed()) {
        return true
    }

    console.log(`  Scrolling to section heading "${category}"...`)
    try {
        const scrolled = await $(
            'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
            `.scrollIntoView(new UiSelector().textMatches("^${category}$"))`
        )
        return await scrolled.isExisting()
    } catch (err) {
        console.warn(`  Could not scroll to section "${category}":`, err)
        return false
    }
}

// ─────────────────────────────────────────────
// Selects EXACTLY the given note names within one
// section, in order, scrolling to find each one.
// Throws immediately (naming the missing note) if
// any requested name can't be found even after
// scrolling — deterministic on purpose, so a typo
// is never silently ignored.
// ─────────────────────────────────────────────
async function selectExplicitNotesInSection(category: CareNoteCategory, names: string[]): Promise<string[]> {
    console.log(`▶ [${category}] Mode: explicit — selecting exactly ${names.length} requested note(s):`, names)

    await scrollToSection(category)

    const selected: string[] = []
    for (const name of names) {
        const found = await scrollToNoteIfNeeded(name)
        if (!found) {
            await dumpPageSourceOnFailure(`selectExplicitNotesInSection (${category}: missing "${name}")`)
            throw new Error(
                `Requested care note "${name}" (section "${category}") was not found on the ` +
                `"Select Care" screen, even after scrolling. Check spelling — it must match ` +
                `exactly what's shown on screen — and that it actually belongs to this section.`
            )
        }
        await testBot.click(careNoteLocator(name))
        console.log(`▶ [${category}] Selected: "${name}"`)
        selected.push(name)
        await driver.pause(500)
    }

    return selected
}

// ─────────────────────────────────────────────
// Selects `count` RANDOM notes from within one
// section, scrolling to discover the section's
// full visible list first (from CARE_NOTE_CATEGORIES
// as a starting point, verified against what's
// actually on screen). If the section's
// CARE_NOTE_CATEGORIES entry is still an empty
// placeholder (not yet filled in), this returns an
// empty array and logs a warning rather than
// failing the whole run — fill in the real note
// names for that section to enable random
// selection there.
// ─────────────────────────────────────────────
async function selectRandomNotesInSection(category: CareNoteCategory, count: number): Promise<string[]> {
    if (count <= 0) {
        return []
    }

    const knownNames = CARE_NOTE_CATEGORIES[category] as readonly string[]
    if (knownNames.length === 0) {
        console.warn(
            `▶ [${category}] Mode: random — SKIPPED. No known note names configured for this ` +
            `section yet (CARE_NOTE_CATEGORIES['${category}'] is empty). Fill in the real note ` +
            `names for this section, or use { mode: 'explicit', notes: [...] } instead.`
        )
        return []
    }

    console.log(`▶ [${category}] Mode: random — selecting up to ${count} note(s) from ${knownNames.length} known candidate(s)`)

    await scrollToSection(category)

    const visibleCandidates: string[] = []
    for (const candidateName of knownNames) {
        const found = await scrollToNoteIfNeeded(candidateName)
        if (found) {
            visibleCandidates.push(candidateName)
        }
    }

    console.log(`  [${category}] ${visibleCandidates.length} visible candidate(s):`, visibleCandidates)

    if (visibleCandidates.length === 0) {
        console.warn(`  [${category}] No candidates found visible on screen — skipping this section`)
        return []
    }

    const cappedCount = Math.min(count, visibleCandidates.length)
    const shuffled = [...visibleCandidates].sort(() => Math.random() - 0.5)
    const chosenNames = shuffled.slice(0, cappedCount)

    const selected: string[] = []
    for (const name of chosenNames) {
        const found = await scrollToNoteIfNeeded(name)
        if (!found) {
            console.warn(`  [${category}] "${name}" was visible during scan but not found when re-scrolling to select it — skipping`)
            continue
        }
        await testBot.click(careNoteLocator(name))
        console.log(`▶ [${category}] Selected: "${name}"`)
        selected.push(name)
        await driver.pause(500)
    }

    return selected
}

// ─────────────────────────────────────────────
// Entry point — walks PER_SECTION_CONFIG in
// declaration order, applying each section's
// configured mode ('explicit' / 'random' / 'skip'),
// and stops adding further notes once
// OVERALL_CARE_NOTE_CAP is reached. Sections
// processed before the cap was hit are unaffected;
// a section that would push the total over the cap
// has its selection trimmed to fit exactly, not
// skipped entirely.
// ─────────────────────────────────────────────
async function selectCareNotesForThisRun(): Promise<string[]> {
    const allSelected: string[] = []

    for (const category of ALL_CATEGORY_NAMES) {
        const config = PER_SECTION_CONFIG[category] ?? { mode: 'skip' }

        if (allSelected.length >= OVERALL_CARE_NOTE_CAP) {
            console.log(`▶ [${category}] Overall cap (${OVERALL_CARE_NOTE_CAP}) already reached — skipping remaining sections`)
            break
        }

        const remainingBudget = OVERALL_CARE_NOTE_CAP - allSelected.length

        if (config.mode === 'skip') {
            console.log(`▶ [${category}] Mode: skip`)
            continue
        }

        if (config.mode === 'explicit') {
            const namesToRequest = config.notes.slice(0, remainingBudget)
            if (namesToRequest.length < config.notes.length) {
                console.warn(
                    `▶ [${category}] Requested ${config.notes.length} explicit note(s) but only ` +
                    `${remainingBudget} remain under the overall cap (${OVERALL_CARE_NOTE_CAP}) — ` +
                    `trimming to: ${namesToRequest.join(', ')}`
                )
            }
            const selected = await selectExplicitNotesInSection(category, namesToRequest)
            allSelected.push(...selected)
            continue
        }

        if (config.mode === 'random') {
            const requestCount = Math.min(config.count, remainingBudget)
            const selected = await selectRandomNotesInSection(category, requestCount)
            allSelected.push(...selected)
            continue
        }
    }

    console.log(`▶ Total care notes selected across all sections (${allSelected.length}):`, allSelected)
    return allSelected
}

// ─────────────────────────────────────────────
// Adhoc Activity Flow selectors — resident
// locator is built dynamically from whichever
// name was randomly picked above.
// ─────────────────────────────────────────────
const adhocSelectors = {
    adhocButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Adhoc"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Adhoc"]'
        ),
    } as TestBotElement,

    // On the "Select Care" screen, toggles between grid/icon view
    // (sections shown as icon tiles, current default) and a
    // compact list view. NB: this is a generic empty-text button
    // XPath (matches the FIRST such button on screen) — confirmed
    // via screenshot to sit next to the search icon, but if the
    // screen has other empty-text buttons above it in document
    // order this may need to be scoped further (e.g. with a
    // resource-id) once verified in Appium Inspector.
    selectCareViewToggleButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text=""]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name=""]'
        ),
    } as TestBotElement,

    activitiesListItem: {
        android: AndroidLocatorBuilder.xpath(
            '//androidx.recyclerview.widget.RecyclerView/android.view.ViewGroup[2]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeCollectionView/XCUIElementTypeCell[2]'
        ),
    } as TestBotElement,

    selectCareScreenTitle: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Select Care"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Select Care"]'
        ),
    } as TestBotElement,

    selectCareNextButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="Next"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Next"]'
        ),
    } as TestBotElement,

    updateCareTitle: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Update Care"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Update Care"]'
        ),
    } as TestBotElement,

    howLongHeading: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="How long did this care take?"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="How long did this care take?"]'
        ),
    } as TestBotElement,

    bottomTenMinsOption: {
        android: AndroidLocatorBuilder.xpath(
            '//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/DurationField"]//android.widget.TextView[@text="10 mins"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="10 mins"]'
        ),
    } as TestBotElement,

    confirmButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/ConfirmButton"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="ConfirmButton"]'
        ),
    } as TestBotElement,

    createRecordsButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="Create Records"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Create Records"]'
        ),
    } as TestBotElement,

    // NB: Close button locator unconfirmed — falls back to
    // Create Records button if a dedicated close control
    // isn't found. Update once confirmed on real screen.
    closeAfterCreateButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="Create Records"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Create Records"]'
        ),
    } as TestBotElement,

    earlierTab: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Earlier"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Earlier"]'
        ),
    } as TestBotElement,

    // Cross/close mark on the Earlier page that returns to the
    // Communities page. Confirmed via real page-source dump: it's
    // the top-right android.widget.Button with empty text — the
    // FIRST such button in document order (the bottom nav tab
    // icons are also empty-text Buttons, but appear later in the
    // tree).
    earlierCloseCrossMark: {
        android: AndroidLocatorBuilder.xpath(
            '(//android.widget.Button[@text=""])[1]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '(//XCUIElementTypeButton[@name=""])[1]'
        ),
    } as TestBotElement,

    myCommunitiesTab: {
        android: AndroidLocatorBuilder.xpath(
            '//*[@text="My Communities"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//*[@name="My Communities"]'
        ),
    } as TestBotElement,
}

// ─────────────────────────────────────────────
// Suite — Dynamic Adhoc Activity Flow
// (assumes the app is already logged in and on
// the My Communities page — run this after the
// enrolment/login suite in the same session)
// ─────────────────────────────────────────────
describe('Care Delivery - Dynamic Adhoc Activity Flow', () => {

    let selectedResidentName = ''
    let selectedCareNotes: string[] = []

    // Number of "Update Care" completion iterations to generate as
    // test steps, computed up front from PER_SECTION_CONFIG so Mocha
    // can register a fixed number of `it()` blocks. This is the
    // theoretical MAXIMUM across all sections (explicit lengths +
    // random counts), capped at OVERALL_CARE_NOTE_CAP — the actual
    // number selected at runtime may be lower (e.g. a random
    // section finding fewer visible candidates than requested, or
    // the overall cap trimming a later section); any planned
    // iteration beyond what was actually selected skips itself
    // gracefully (see the loop below).
    const plannedNoteIterations = Math.min(
        OVERALL_CARE_NOTE_CAP,
        ALL_CATEGORY_NAMES.reduce((sum, category) => {
            const config = PER_SECTION_CONFIG[category] ?? { mode: 'skip' }
            if (config.mode === 'explicit') return sum + config.notes.length
            if (config.mode === 'random') return sum + config.count
            return sum
        }, 0)
    )

    // Scrolls to the bottom "How long did this care take?" section, picks
    // "10 mins", then taps the bottom "Continue" button — shared by every
    // care-note completion iteration below.
    async function completeUpdateCareForCurrentNote(): Promise<void> {
        const howLongXpath =
            '//android.widget.TextView[@text="How long did this care take?"]'
        const bottomTenMinsXpath =
            '//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/DurationField"]//android.widget.TextView[@text="10 mins"]'

        let reachedBottom = false
        for (let i = 0; i < 8; i++) {
            const heading = await $(howLongXpath)
            if (await heading.isExisting() && await heading.isDisplayed()) {
                reachedBottom = true
                break
            }

            const { width, height } = await driver.getWindowSize()
            await driver.execute('mobile: swipeGesture', {
                left: Math.floor(width * 0.2),
                top: Math.floor(height * 0.6),
                width: Math.floor(width * 0.6),
                height: Math.floor(height * 0.3),
                direction: 'up',
                percent: 0.8,
            })
            await driver.pause(1500)
        }

        if (!reachedBottom) {
            throw new Error('"How long did this care take?" section never became visible after scrolling')
        }

        let tenMinsEl = await $(bottomTenMinsXpath)
        for (let i = 0; i < 4; i++) {
            if (await tenMinsEl.isExisting() && await tenMinsEl.isDisplayed()) break

            const { width, height } = await driver.getWindowSize()
            await driver.execute('mobile: swipeGesture', {
                left: Math.floor(width * 0.2),
                top: Math.floor(height * 0.6),
                width: Math.floor(width * 0.6),
                height: Math.floor(height * 0.3),
                direction: 'up',
                percent: 0.5,
            })
            await driver.pause(1500)
            tenMinsEl = await $(bottomTenMinsXpath)
        }

        const confirmXpath =
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/ConfirmButton"]'

        let confirmEnabled = false
        for (let attempt = 0; attempt < 3 && !confirmEnabled; attempt++) {
            tenMinsEl = await $(bottomTenMinsXpath)
            await tenMinsEl.click()
            console.log(`Selected "10 mins" in the "How long did this care take?" section (attempt ${attempt + 1})`)
            await driver.pause(2000)

            const confirmBtn = await $(confirmXpath)
            confirmEnabled = await confirmBtn.waitForEnabled({ timeout: 5000 }).catch(() => false)
        }

        if (!confirmEnabled) {
            throw new Error('"Continue" button never became enabled after selecting "10 mins" (tried 3 times)')
        }

        const confirmBtn = await $(confirmXpath)
        await confirmBtn.click()
        console.log('Clicked "Continue"')
        await driver.pause(3000)
    }

    it('Step 1 - Select a random resident from the community list', async function () {
        try {
            selectedResidentName = await selectRandomResident()
            await driver.pause(3000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 1')
            throw err
        }
    })

    it('Step 2 - Click Adhoc', async function () {
        try {
            await testBot.waitUntilVisible(adhocSelectors.adhocButton, 5000)
            await testBot.click(adhocSelectors.adhocButton)
            await driver.pause(3000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 2')
            throw err
        }
    })

    it('Step 3 - Open the "Select Care" picker and choose care note(s) per section config', async function () {
        try {
            await testBot.waitUntilVisible(adhocSelectors.activitiesListItem, 5000)
            await testBot.click(adhocSelectors.activitiesListItem)
            await driver.pause(3000)

            await testBot.waitUntilVisible(adhocSelectors.selectCareScreenTitle, 10000)

            // Tap the view-toggle button ONCE, right away, so all
            // sections/notes render expanded on one screen instead
            // of the default collapsed/scrollable grid — this
            // removes the need for per-note scroll-hunting below.
            //
            // Verification added: captures the button's on-screen
            // attributes (checked/selected state, bounds) BEFORE and
            // AFTER the tap, so we can confirm from the log whether
            // the tap genuinely changed the button's state — rather
            // than assuming success just because later note-finding
            // happened to work anyway (which it can, via scrolling,
            // even if this specific tap did nothing).
            try {
                await testBot.waitUntilVisible(adhocSelectors.selectCareViewToggleButton, 5000)

                const toggleBtn = await $(
                    await (testBot as any).getLocatorTextForElement(adhocSelectors.selectCareViewToggleButton)
                )

                const attrsBefore = await toggleBtn.getAttribute('checked').catch(() => 'N/A')
                const selectedBefore = await toggleBtn.getAttribute('selected').catch(() => 'N/A')
                console.log(`Toggle button state BEFORE tap — checked: ${attrsBefore}, selected: ${selectedBefore}`)

                await toggleBtn.click()
                console.log('Tapped view-toggle button — expecting all sections/notes to render expanded')
                await driver.pause(2000)

                const toggleBtnAfter = await $(
                    await (testBot as any).getLocatorTextForElement(adhocSelectors.selectCareViewToggleButton)
                )
                const attrsAfter = await toggleBtnAfter.getAttribute('checked').catch(() => 'N/A')
                const selectedAfter = await toggleBtnAfter.getAttribute('selected').catch(() => 'N/A')
                console.log(`Toggle button state AFTER tap — checked: ${attrsAfter}, selected: ${selectedAfter}`)

                if (attrsBefore === attrsAfter && selectedBefore === selectedAfter) {
                    console.warn(
                        'Toggle button state did NOT change after tap (checked/selected identical ' +
                        'before and after) — this tap may not be doing anything. If notes are still ' +
                        'found below, it is likely via the scroll fallback, not because this toggle ' +
                        'actually expanded the view.'
                    )
                }
            } catch (toggleErr) {
                console.warn('View-toggle button not found or tap failed — continuing with default (scrollable) view:', toggleErr)
            }

            selectedCareNotes = await selectCareNotesForThisRun()
            await driver.pause(3000)

            await testBot.waitUntilVisible(adhocSelectors.selectCareNextButton, 5000)
            await testBot.click(adhocSelectors.selectCareNextButton)
            await driver.pause(3000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 3')
            throw err
        }
    })

    // Real UI: selecting care note(s) opens the "Update Care" modal directly
    // — it already contains Preferences, Happiness slider and the Duration
    // grid on one screen. When multiple notes were selected, one "Update
    // Care" screen is completed at a time; each iteration below handles one.
    for (let noteIndex = 0; noteIndex < plannedNoteIterations; noteIndex++) {
        const stepLabel = `Step 4.${noteIndex + 1} - Complete "Update Care" for care note #${noteIndex + 1}`
        it(stepLabel, async function () {
            if (noteIndex >= selectedCareNotes.length) {
                console.log(`Only ${selectedCareNotes.length} care note(s) were actually selected — skipping iteration ${noteIndex + 1}`)
                this.skip()
                return
            }

            const noteName = selectedCareNotes[noteIndex]
            try {
                await testBot.waitUntilVisible(adhocSelectors.updateCareTitle, 10000)
                console.log(`"Update Care" page loaded for care note "${noteName}" (${noteIndex + 1}/${selectedCareNotes.length})`)
                await completeUpdateCareForCurrentNote()
            } catch (err) {
                await dumpPageSourceOnFailure(stepLabel)
                throw err
            }
        })
    }

    it('Step 9 - Click Create Records', async function () {
        try {
            await testBot.waitUntilVisible(adhocSelectors.createRecordsButton, 5000)
            await testBot.click(adhocSelectors.createRecordsButton)
            await driver.pause(3000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 9')
            throw err
        }
    })

    it('Step 10 - Click Close', async function () {
        try {
            await testBot.waitUntilVisible(adhocSelectors.closeAfterCreateButton, 5000)
            await testBot.click(adhocSelectors.closeAfterCreateButton)
            await driver.pause(3000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 10')
            throw err
        }
    })

    it('Step 11 - Click on "Earlier" tab', async function () {
        try {
            await testBot.waitUntilVisible(adhocSelectors.earlierTab, 5000)
            await testBot.click(adhocSelectors.earlierTab)
            await driver.pause(3000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 11')
            throw err
        }
    })

    // Cross mark on the Earlier page — closes it and returns to the
    // Communities page, from which the signout spec (next in the wdio
    // specs array) can begin the Finish/Sign Out flow.
    it('Step 12 - Click the cross mark on the "Earlier" page to return to Communities', async function () {
        try {
            await testBot.waitUntilVisible(adhocSelectors.earlierCloseCrossMark, 5000)
            await testBot.click(adhocSelectors.earlierCloseCrossMark)
            await driver.pause(3000)

            await testBot.waitUntilVisible(adhocSelectors.myCommunitiesTab, 30000)
            console.log('Back on Communities page — ready for signout flow')
        } catch (err) {
            await dumpPageSourceOnFailure('Step 12')
            throw err
        }
    })

})
