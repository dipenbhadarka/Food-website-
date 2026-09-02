import { testBot } from '../../testbot'
import { AndroidLocatorBuilder } from '../../TestBot/Locators/Android/AndroidLocatorBuilder'
import { iOSLocatorBuilder } from '../../TestBot/Locators/iOS/iOSLocatorBuilder'
import { TestBotElement } from '../../TestBot/TestBotElement'

const isLocal = process.env.RUN_MODE === 'local'
console.log(`Running Adhoc Activity flow in ${isLocal ? 'LOCAL PHYSICAL DEVICE' : 'BROWSERSTACK CLOUD'} mode`)

// ═══════════════════════════════════════════════
// CONFIGURATION — set this ONE value before running
// to control care note selection. Everything else
// in the flow is unchanged.
//
//   'one-per-section'  -> Step 4 picks exactly ONE
//                         random note from EACH
//                         expanded section (matches
//                         the demonstrated flow
//                         literally).
//
//   1, 3, 5, etc.       -> picks that many notes
//                         TOTAL, drawn randomly from
//                         across all sections combined
//                         (not one-per-section), capped
//                         at 10 regardless of the value
//                         set here.
// ═══════════════════════════════════════════════
const CARE_NOTE_COUNT: number | 'one-per-section' = 'one-per-section'

const OVERALL_CARE_NOTE_CAP = 10

// ─────────────────────────────────────────────
// Full list of care recipients — Step 1 picks one
// at random each run.
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
// throwing if the session itself is dead.
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
// STEP 1 — select any random resident from
// communities list.
// ─────────────────────────────────────────────
async function selectRandomResident(): Promise<string> {
    console.log('▶ Step 1: Scanning screen for all currently visible care recipients...')

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
        await dumpPageSourceOnFailure('Step 1 (no candidate found)')
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
// Care note names, grouped by their on-screen
// section, used for the random selection logic in
// Step 4. Activities/Communication/Medical/Personal
// Care/Personal Safety & Environment/Process are
// confirmed from real screenshots or page-source
// dumps. The remaining sections (Emotional Support,
// Going to the Toilet, Mobility, Nutrition Eating &
// Drinking, Sleeping) are still empty placeholders
// — fill in real note names for each once confirmed,
// otherwise Step 4 skips picking from that section
// (logs a warning) since it has nothing to pick from.
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
        'Fridge temperature',
        'Pendant alarm',
        'Room temperature',
        'Wheelchair belt',
    ],
    Process: [
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

const CARE_NOTE_TYPES: string[] = Object.values(CARE_NOTE_CATEGORIES).flat()

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
// STEP 4 (one-per-section mode) — picks exactly
// one random note from each section that has at
// least one candidate currently visible (sections
// were already expanded in Step 3, so no scrolling
// is attempted here — matches the demonstrated flow
// literally: pick from what's visible after
// expanding).
// ─────────────────────────────────────────────
async function selectOneRandomNotePerSection(): Promise<string[]> {
    console.log('▶ Step 4: selecting ONE random care note from EACH expanded section')

    const selected: string[] = []

    for (const category of ALL_CATEGORY_NAMES) {
        if (selected.length >= OVERALL_CARE_NOTE_CAP) {
            console.log(`▶ [${category}] Overall cap (${OVERALL_CARE_NOTE_CAP}) reached — skipping remaining sections`)
            break
        }

        const knownNames = CARE_NOTE_CATEGORIES[category] as readonly string[]
        if (knownNames.length === 0) {
            console.warn(`▶ [${category}] No known note names configured yet for this section — skipping`)
            continue
        }

        const visibleCandidates: string[] = []
        for (const name of knownNames) {
            if (await isNoteVisible(name)) {
                visibleCandidates.push(name)
            }
        }

        if (visibleCandidates.length === 0) {
            console.warn(`▶ [${category}] No candidates currently visible — skipping this section`)
            continue
        }

        const chosen = visibleCandidates[Math.floor(Math.random() * visibleCandidates.length)]
        await testBot.click(careNoteLocator(chosen))
        console.log(`▶ [${category}] Selected: "${chosen}"`)
        selected.push(chosen)
        await driver.pause(500)
    }

    console.log(`▶ Total care notes selected (one-per-section, ${selected.length}):`, selected)
    return selected
}

// ─────────────────────────────────────────────
// STEP 4 (fixed-count mode) — picks the given
// number of random notes TOTAL from whatever is
// currently visible across all sections combined
// (sections already expanded in Step 3).
// ─────────────────────────────────────────────
async function selectFixedCountRandomNotes(requestedCount: number): Promise<string[]> {
    const cappedRequest = Math.min(requestedCount, OVERALL_CARE_NOTE_CAP)
    console.log(`▶ Step 4: selecting ${cappedRequest} random care note(s) total across all expanded sections`)

    const visibleCandidates: string[] = []
    for (const name of CARE_NOTE_TYPES) {
        if (await isNoteVisible(name)) {
            visibleCandidates.push(name)
        }
    }

    console.log(`▶ Found ${visibleCandidates.length} visible candidate(s) across all sections:`, visibleCandidates)

    if (visibleCandidates.length === 0) {
        await dumpPageSourceOnFailure('Step 4 (no candidate found)')
        throw new Error('Could not find any visible care note across all sections after expanding')
    }

    const cappedCount = Math.min(cappedRequest, visibleCandidates.length)
    const shuffled = [...visibleCandidates].sort(() => Math.random() - 0.5)
    const chosenNames = shuffled.slice(0, cappedCount)

    const selected: string[] = []
    for (const name of chosenNames) {
        await testBot.click(careNoteLocator(name))
        console.log(`▶ Selected: "${name}"`)
        selected.push(name)
        await driver.pause(500)
    }

    console.log(`▶ Total care notes selected (fixed count, ${selected.length}):`, selected)
    return selected
}

// ─────────────────────────────────────────────
// Entry point for Step 4 — dispatches to whichever
// mode CARE_NOTE_COUNT is set to at the top of this
// file.
// ─────────────────────────────────────────────
async function selectCareNotesForThisRun(): Promise<string[]> {
    if (CARE_NOTE_COUNT === 'one-per-section') {
        return selectOneRandomNotePerSection()
    }
    return selectFixedCountRandomNotes(CARE_NOTE_COUNT)
}

// ─────────────────────────────────────────────
// Selectors — one entry per screen element used in
// the 11-step flow, in the order the steps use them.
// ─────────────────────────────────────────────
const selectors = {
    // Step 2
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

    // Step 3 — green expand-all arrow beside the search bar.
    // Confirmed Unicode private-use icon character for this
    // button's @text attribute.
    expandAllSectionsButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="\uE0A4"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name=""]'
        ),
    } as TestBotElement,

    // Step 5
    selectCareNextButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="Next"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Next"]'
        ),
    } as TestBotElement,

    // Step 6
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

    // The duration grid at the bottom of the "How long did this
    // care take?" section — matches any of the standard preset
    // duration options ("5 mins", "10 mins", "15 mins", "20 mins",
    // "30 mins", "45 mins", "60 mins") so a genuinely random one
    // can be picked, per the demonstrated step ("enter random time
    // frame").
    durationOptionsContainer: {
        android: AndroidLocatorBuilder.xpath(
            '//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/DurationField"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeOther[@name="DurationField"]'
        ),
    } as TestBotElement,

    // Step 7
    confirmButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/ConfirmButton"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="ConfirmButton"]'
        ),
    } as TestBotElement,

    // Step 8 — NOT PROVIDED. No locator was given for the
    // "review page" itself; using the presence of the Create
    // Records button as the review-page confirmation, since
    // that's the only concrete anchor available. Update this
    // once a real review-page title/locator is confirmed.
    createRecordsButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="Create Records"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Create Records"]'
        ),
    } as TestBotElement,

    // Step 9 — NOT PROVIDED as a distinct locator from Create
    // Records in earlier data. Using a text-based "Close" guess;
    // please confirm the real locator.
    closeButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="Close"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Close"]'
        ),
    } as TestBotElement,

    // Step 10
    earlierTab: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Earlier"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Earlier"]'
        ),
    } as TestBotElement,

    // Step 11 — cross/close mark on the Earlier page, returns to
    // Communities. Confirmed as the first empty-text Button in
    // document order.
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
// Suite — Adhoc Activity Flow, following the
// exact 11 documented steps, no additions.
// Assumes the app is already logged in and on
// the My Communities page.
// ─────────────────────────────────────────────
describe('Care Delivery - Adhoc Activity Flow (11-step)', () => {

    let selectedCareNotes: string[] = []

    const plannedNoteIterations = CARE_NOTE_COUNT === 'one-per-section'
        ? ALL_CATEGORY_NAMES.length
        : Math.min(CARE_NOTE_COUNT, OVERALL_CARE_NOTE_CAP)

    it('Step 1 - Select any random resident from communities list', async function () {
        try {
            await selectRandomResident()
            await driver.pause(3000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 1')
            throw err
        }
    })

    it('Step 2 - Click on Adhoc', async function () {
        try {
            await testBot.waitUntilVisible(selectors.adhocButton, 5000)
            await testBot.click(selectors.adhocButton)
            await driver.pause(3000)

            await testBot.waitUntilVisible(selectors.activitiesListItem, 5000)
            await testBot.click(selectors.activitiesListItem)
            await driver.pause(3000)

            await testBot.waitUntilVisible(selectors.selectCareScreenTitle, 10000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 2')
            throw err
        }
    })

    it('Step 3 - Click green expand button beside search bar so all care note sections expand', async function () {
        try {
            await testBot.waitUntilVisible(selectors.expandAllSectionsButton, 5000)
            await testBot.click(selectors.expandAllSectionsButton)
            console.log('Clicked green expand-all arrow')
            await driver.pause(2000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 3')
            throw err
        }
    })

    it('Step 4 - Select a random care note from each of the expanded sections', async function () {
        try {
            selectedCareNotes = await selectCareNotesForThisRun()
            await driver.pause(2000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 4')
            throw err
        }
    })

    it('Step 5 - Click Next', async function () {
        try {
            await testBot.waitUntilVisible(selectors.selectCareNextButton, 5000)
            await testBot.click(selectors.selectCareNextButton)
            await driver.pause(3000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 5')
            throw err
        }
    })

    // One "Update Care" completion per selected note, since the
    // real UI opens one Update Care screen per note.
    for (let noteIndex = 0; noteIndex < 10; noteIndex++) {
        const stepLabel = `Step 6.${noteIndex + 1} - Scroll down, enter random duration, complete any additional required fields for note #${noteIndex + 1}`
        it(stepLabel, async function () {
            if (noteIndex >= selectedCareNotes.length) {
                console.log(`Only ${selectedCareNotes.length} care note(s) were selected — skipping iteration ${noteIndex + 1}`)
                this.skip()
                return
            }

            const noteName = selectedCareNotes[noteIndex]
            try {
                await testBot.waitUntilVisible(selectors.updateCareTitle, 10000)
                console.log(`"Update Care" page loaded for "${noteName}" (${noteIndex + 1}/${selectedCareNotes.length})`)

                // Scroll down to the duration section
                const howLongXpath =
                    '//android.widget.TextView[@text="How long did this care take?"]'

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

                // Enter a RANDOM time frame from the standard preset
                // duration options, per the demonstrated step.
                const DURATION_OPTIONS = ['5 mins', '10 mins', '15 mins', '20 mins', '30 mins', '45 mins', '60 mins']
                const randomDuration = DURATION_OPTIONS[Math.floor(Math.random() * DURATION_OPTIONS.length)]
                const durationXpath = `//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/DurationField"]//android.widget.TextView[@text="${randomDuration}"]`

                let durationEl = await $(durationXpath)
                for (let i = 0; i < 4; i++) {
                    if (await durationEl.isExisting() && await durationEl.isDisplayed()) break
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
                    durationEl = await $(durationXpath)
                }

                let confirmEnabled = false
                const confirmXpath =
                    '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/ConfirmButton"]'
                for (let attempt = 0; attempt < 3 && !confirmEnabled; attempt++) {
                    durationEl = await $(durationXpath)
                    await durationEl.click()
                    console.log(`Selected "${randomDuration}" for "How long did this care take?" (attempt ${attempt + 1})`)
                    await driver.pause(2000)

                    const confirmBtn = await $(confirmXpath)
                    confirmEnabled = await confirmBtn.waitForEnabled({ timeout: 5000 }).catch(() => false)
                }

                if (!confirmEnabled) {
                    throw new Error(`"Continue" button never became enabled after selecting "${randomDuration}" (tried 3 times)`)
                }

                // NB: "enter if any additional answers require
                // according to care note" — no locators were
                // provided for any note-specific additional fields
                // (e.g. a text box, a severity picker). If a given
                // note type shows extra required fields beyond
                // duration, this step will need those locators
                // added here once confirmed; currently only the
                // duration field is handled.
            } catch (err) {
                await dumpPageSourceOnFailure(stepLabel)
                throw err
            }
        })
    }

    it('Step 7 - Click Continue', async function () {
        try {
            const confirmXpath =
                '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/ConfirmButton"]'
            const confirmBtn = await $(confirmXpath)
            await confirmBtn.waitForEnabled({ timeout: 10000 })
            await confirmBtn.click()
            console.log('Clicked Continue')
            await driver.pause(3000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 7')
            throw err
        }
    })

    it('Step 8 - Verify review page and click Create Records', async function () {
        try {
            // NB: no distinct "review page" locator was provided —
            // using Create Records button visibility as the
            // confirmation the review page has loaded.
            await testBot.waitUntilVisible(selectors.createRecordsButton, 10000)
            console.log('Review page reached (Create Records button visible)')
            await testBot.click(selectors.createRecordsButton)
            await driver.pause(3000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 8')
            throw err
        }
    })

    it('Step 9 - Click Close', async function () {
        try {
            await testBot.waitUntilVisible(selectors.closeButton, 10000)
            await testBot.click(selectors.closeButton)
            await driver.pause(3000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 9')
            throw err
        }
    })

    it('Step 10 - Click Earlier', async function () {
        try {
            await testBot.waitUntilVisible(selectors.earlierTab, 10000)
            await testBot.click(selectors.earlierTab)
            await driver.pause(3000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 10')
            throw err
        }
    })

    it('Step 11 - Click cross button; redirects to Communities page', async function () {
        try {
            await testBot.waitUntilVisible(selectors.earlierCloseCrossMark, 10000)
            await testBot.click(selectors.earlierCloseCrossMark)
            await driver.pause(3000)

            await testBot.waitUntilVisible(selectors.myCommunitiesTab, 30000)
            console.log('Back on Communities page')
        } catch (err) {
            await dumpPageSourceOnFailure('Step 11')
            throw err
        }
    })

})
