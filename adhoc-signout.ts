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
// picker, grouped by their real on-screen
// category tab so we can guarantee at least one
// pick per section rather than a flat random pool
// that might land 3 picks all in Activities and
// skip Communication/Medical/Personal Care
// entirely.
//
// Activities entries are confirmed from a real
// "Select Care" picker page-source dump. The
// Communication/Medical/Personal Care entries are
// as provided.
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
    Medical: [
        'Add bag',
        'Ambulance',
        'Blood',
        'INR',
    ],
    'Personal Care': [
        'Bath',
        'Catheter care',
        'Change clothes',
    ],
} as const

type CareNoteCategory = keyof typeof CARE_NOTE_CATEGORIES

// Flat pool (all categories combined) — used only
// for the "pure random, no category guarantee"
// mode, kept for backward compatibility.
const CARE_NOTE_TYPES: string[] = Object.values(CARE_NOTE_CATEGORIES).flat()

// ─────────────────────────────────────────────
// RUN CONFIGURATION — edit these two values
// before each run to control what gets selected.
//
// Two modes, pick ONE:
//
// MODE A — Explicit names (deterministic).
// Set EXPLICIT_CARE_NOTES to a non-empty array of
// exact note names (must match CARE_NOTE_CATEGORIES
// spelling) to select EXACTLY those, in that order,
// regardless of category. Leave it as an empty
// array [] to use Mode B instead.
//   Example: ['Bingo', 'Bath', 'Chatted']
//
// MODE B — Random, at least one per category.
// Used automatically whenever EXPLICIT_CARE_NOTES
// is empty. ONE_PER_CATEGORY controls whether every
// run guarantees at least one note from each of the
// 4 categories (Activities / Communication /
// Medical / Personal Care) that has a visible
// candidate, topping up to CARE_NOTE_COUNT with
// further random picks from whatever remains
// visible. Set to false to fall back to pure random
// selection from the flat pool with no per-category
// guarantee (the old behaviour).
//
// CARE_NOTE_COUNT is only used in Mode B — how many
// notes to select in total this run. Capped at 10
// regardless of the value set here (per requirement:
// never more than 10 in a single run). Has no effect
// in Mode A, where the count is simply the length of
// EXPLICIT_CARE_NOTES.
// ─────────────────────────────────────────────
const EXPLICIT_CARE_NOTES: string[] = []
const ONE_PER_CATEGORY = true
const CARE_NOTE_COUNT = 4

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
// Mode A helper — select exactly the names given,
// in order, verifying each is actually visible
// before tapping it. Throws immediately (naming
// the missing note) if any requested name isn't
// on screen, since Mode A is meant to be
// deterministic — a silent skip would defeat the
// purpose of asking for specific notes.
// ─────────────────────────────────────────────
async function selectExplicitCareNotes(names: string[]): Promise<string[]> {
    console.log(`▶ Mode A (explicit): selecting exactly ${names.length} requested care note(s):`, names)

    const selected: string[] = []
    for (const name of names) {
        const visible = await isNoteVisible(name)
        if (!visible) {
            await dumpPageSourceOnFailure(`selectExplicitCareNotes (missing "${name}")`)
            throw new Error(
                `Requested care note "${name}" is not visible on the "Select Care" screen. ` +
                `Check spelling against CARE_NOTE_CATEGORIES, or that it belongs to a category ` +
                `that's actually shown for this resident/community.`
            )
        }
        await testBot.click(careNoteLocator(name))
        console.log(`▶ Selected care note: "${name}"`)
        selected.push(name)
        await driver.pause(500)
    }

    console.log(`▶ Total care notes selected (${selected.length}):`, selected)
    return selected
}

// ─────────────────────────────────────────────
// Mode B helper — random selection guaranteeing
// at least one note per category (when that
// category has any visible candidate), then tops
// up to requestedCount with further random picks
// from whatever remains visible across all
// categories. Requests above 10 are capped to 10.
// ─────────────────────────────────────────────
async function selectRandomCareNotesOnePerCategory(requestedCount: number): Promise<string[]> {
    console.log(`▶ Mode B (random, ≥1 per category): scanning "Select Care" screen (requested total: ${requestedCount})...`)

    const visibleByCategory: Record<string, string[]> = {}
    let totalVisible = 0

    for (const [category, names] of Object.entries(CARE_NOTE_CATEGORIES)) {
        const visibleInCategory: string[] = []
        for (const name of names) {
            if (await isNoteVisible(name)) {
                visibleInCategory.push(name)
            }
        }
        visibleByCategory[category] = visibleInCategory
        totalVisible += visibleInCategory.length
        console.log(`  ${category}: ${visibleInCategory.length} visible candidate(s)`, visibleInCategory)
    }

    if (totalVisible === 0) {
        await dumpPageSourceOnFailure('selectRandomCareNotesOnePerCategory (no candidate found)')
        throw new Error('Could not find any care note on the "Select Care" screen — none were visible in any category')
    }

    const cappedCount = Math.min(requestedCount, 10, totalVisible)
    if (requestedCount > 10) {
        console.log(`▶ Requested ${requestedCount} care notes — capping to a random ${Math.min(10, totalVisible)} per requirement`)
    }

    // Step 1: guarantee one pick from each category that has at
    // least one visible candidate, up to cappedCount total.
    const chosen: string[] = []
    const categoriesWithCandidates = Object.entries(visibleByCategory).filter(([, names]) => names.length > 0)

    for (const [category, names] of categoriesWithCandidates) {
        if (chosen.length >= cappedCount) break
        const pick = names[Math.floor(Math.random() * names.length)]
        chosen.push(pick)
        console.log(`  Guaranteed pick for "${category}": "${pick}"`)
    }

    // Step 2: top up to cappedCount with further random picks
    // from whatever remains visible (any category, no repeats).
    if (chosen.length < cappedCount) {
        const remainingPool = Object.values(visibleByCategory)
            .flat()
            .filter((name) => !chosen.includes(name))
        const shuffledRemaining = [...remainingPool].sort(() => Math.random() - 0.5)
        const topUp = shuffledRemaining.slice(0, cappedCount - chosen.length)
        chosen.push(...topUp)
        if (topUp.length > 0) {
            console.log(`  Topped up with ${topUp.length} further random pick(s):`, topUp)
        }
    }

    // Tap each chosen note's checkbox in the multi-select picker.
    for (const name of chosen) {
        await testBot.click(careNoteLocator(name))
        console.log(`▶ Selected care note: "${name}"`)
        await driver.pause(500)
    }

    console.log(`▶ Total care notes selected (${chosen.length}):`, chosen)
    return chosen
}

// ─────────────────────────────────────────────
// Mode B fallback — pure random from the flat pool,
// no per-category guarantee. Used only when
// ONE_PER_CATEGORY is explicitly set to false.
// ─────────────────────────────────────────────
async function selectRandomCareNotesFlat(requestedCount: number): Promise<string[]> {
    console.log(`▶ Mode B (pure random, flat pool): scanning "Select Care" screen (requested: ${requestedCount})...`)

    const visibleCandidates: string[] = []
    for (const candidateName of CARE_NOTE_TYPES) {
        if (await isNoteVisible(candidateName)) {
            visibleCandidates.push(candidateName)
        }
    }

    console.log(`▶ Found ${visibleCandidates.length} visible care note candidate(s):`, visibleCandidates)

    if (visibleCandidates.length === 0) {
        await dumpPageSourceOnFailure('selectRandomCareNotesFlat (no candidate found)')
        throw new Error('Could not select any care note from the "Select Care" list — none were visible on screen')
    }

    const cappedCount = Math.min(requestedCount, 10, visibleCandidates.length)
    const shuffled = [...visibleCandidates].sort(() => Math.random() - 0.5)
    const chosenNames = shuffled.slice(0, cappedCount)

    for (const name of chosenNames) {
        await testBot.click(careNoteLocator(name))
        console.log(`▶ Selected care note: "${name}"`)
        await driver.pause(500)
    }

    console.log(`▶ Total care notes selected (${chosenNames.length}):`, chosenNames)
    return chosenNames
}

// ─────────────────────────────────────────────
// Entry point — picks the right mode/helper based
// on the RUN CONFIGURATION constants above.
// ─────────────────────────────────────────────
async function selectCareNotesForThisRun(): Promise<string[]> {
    if (EXPLICIT_CARE_NOTES.length > 0) {
        return selectExplicitCareNotes(EXPLICIT_CARE_NOTES)
    }
    if (ONE_PER_CATEGORY) {
        return selectRandomCareNotesOnePerCategory(CARE_NOTE_COUNT)
    }
    return selectRandomCareNotesFlat(CARE_NOTE_COUNT)
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
    // test steps. In Mode A (explicit names) this is simply the
    // length of EXPLICIT_CARE_NOTES; in Mode B it's the capped
    // CARE_NOTE_COUNT. Known up front so Mocha can register a
    // fixed number of `it()` blocks; if fewer notes actually end
    // up selected at runtime, the extra iterations skip themselves
    // gracefully (see the loop below).
    const plannedNoteIterations = EXPLICIT_CARE_NOTES.length > 0
        ? EXPLICIT_CARE_NOTES.length
        : Math.min(CARE_NOTE_COUNT, 10)

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

    it(`Step 3 - Open the "Select Care" picker and choose care note(s) (${EXPLICIT_CARE_NOTES.length > 0 ? `explicit: ${EXPLICIT_CARE_NOTES.join(', ')}` : `random, ${ONE_PER_CATEGORY ? '≥1 per category, ' : ''}up to ${CARE_NOTE_COUNT}`})`, async function () {
        try {
            await testBot.waitUntilVisible(adhocSelectors.activitiesListItem, 5000)
            await testBot.click(adhocSelectors.activitiesListItem)
            await driver.pause(3000)

            await testBot.waitUntilVisible(adhocSelectors.selectCareScreenTitle, 10000)
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
