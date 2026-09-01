import { testBot } from '../../testbot'
import { AndroidLocatorBuilder } from '../../TestBot/Locators/Android/AndroidLocatorBuilder'
import { iOSLocatorBuilder } from '../../TestBot/Locators/iOS/iOSLocatorBuilder'
import { TestBotElement } from '../../TestBot/TestBotElement'

const isLocal = process.env.RUN_MODE === 'local'
console.log(`Running Adhoc Activity flow in ${isLocal ? 'LOCAL PHYSICAL DEVICE' : 'BROWSERSTACK CLOUD'} mode`)

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
    'Emotional Support': [],
    'Going to the Toilet': [],
    Medical: [
        'Add bag',
        'Ambulance',
        'Blood',
        'INR',
    ],
    Mobility: [],
    'Nutrition, Eating & Drinking': [],
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
    Sleeping: [],
} as const

type CareNoteCategory = keyof typeof CARE_NOTE_CATEGORIES

const ALL_CATEGORY_NAMES = Object.keys(CARE_NOTE_CATEGORIES) as CareNoteCategory[]

const CARE_NOTE_TYPES: string[] = Object.values(CARE_NOTE_CATEGORIES).flat()

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

const adhocSelectors = {
    adhocButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Adhoc"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Adhoc"]'
        ),
    } as TestBotElement,

    // Green up/down arrow beside the search icon on the "Select Care"
    // screen. Tapping it expands all care category dropdowns. Uses the
    // Unicode private-use icon character confirmed for this button's
    // @text attribute, rather than an empty-string match.
    selectCareExpandAllButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="\uE0A4"]'
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

describe('Care Delivery - Dynamic Adhoc Activity Flow', () => {

    let selectedResidentName = ''
    let selectedCareNotes: string[] = []

    const plannedNoteIterations = Math.min(
        OVERALL_CARE_NOTE_CAP,
        ALL_CATEGORY_NAMES.reduce((sum, category) => {
            const config = PER_SECTION_CONFIG[category] ?? { mode: 'skip' }
            if (config.mode === 'explicit') return sum + config.notes.length
            if (config.mode === 'random') return sum + config.count
            return sum
        }, 0)
    )

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

    async function tapSelectCareExpandAllButton(): Promise<void> {
        await testBot.waitUntilVisible(adhocSelectors.selectCareExpandAllButton, 5000)
        await testBot.click(adhocSelectors.selectCareExpandAllButton)
        console.log('Clicked Select Care green expand-all arrow')
        await driver.pause(1500)
    }

    async function tapCategoryHeader(category: CareNoteCategory, actionLabel: string): Promise<void> {
        if (!(await scrollToSection(category))) {
            throw new Error(`Could not bring "${category}" header into view before tapping its ${actionLabel} arrow`)
        }

        const headingEl = await $(`//android.widget.TextView[@text="${category}"]`)
        await headingEl.waitForDisplayed({ timeout: 5000 })

        const headingLocation = await headingEl.getLocation()
        const headingSize = await headingEl.getSize()
        const { width } = await driver.getWindowSize()

        await driver.execute('mobile: clickGesture', {
            x: Math.floor(width * 0.89),
            y: Math.floor(headingLocation.y + headingSize.height / 2),
        })
        console.log(`Clicked ${category} ${actionLabel} arrow`)
        await driver.pause(1500)
    }

    async function verifySelectCareArrowsOpenAndClose(): Promise<void> {
        const category: CareNoteCategory = 'Activities'
        const probeNoteName = CARE_NOTE_CATEGORIES[category][0]

        if (await isNoteVisible(probeNoteName)) {
            await tapCategoryHeader(category, 'collapse')
        }

        if (await isNoteVisible(probeNoteName)) {
            throw new Error(`${category} arrow did not close the dropdown; "${probeNoteName}" is still visible`)
        }

        await tapSelectCareExpandAllButton()

        if (!(await isNoteVisible(probeNoteName))) {
            throw new Error(`Select Care green expand-all arrow did not open the ${category} dropdown; "${probeNoteName}" is not visible`)
        }

        await tapCategoryHeader(category, 'collapse')

        if (await isNoteVisible(probeNoteName)) {
            throw new Error(`${category} arrow did not close after expand-all; "${probeNoteName}" is still visible`)
        }

        await tapSelectCareExpandAllButton()

        if (!(await isNoteVisible(probeNoteName))) {
            throw new Error(`Select Care green expand-all arrow did not reopen the ${category} dropdown for selection; "${probeNoteName}" is not visible`)
        }
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

            await verifySelectCareArrowsOpenAndClose()

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
