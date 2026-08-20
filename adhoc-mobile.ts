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

 

// ─────────────────────────────────────────────

// Individual named care taker selectors — each

// one explicitly declared on its own, built from

// the exact locators provided. These are not used

// directly for selection (selectRandomResident()

// below builds locators dynamically from

// CARE_RECIPIENTS instead, so it stays in sync

// automatically) but are kept here as named,

// directly-referenceable selectors per care taker

// if a specific one is ever needed individually.

// ─────────────────────────────────────────────

const careTakerAlanGravy: TestBotElement = {

    android: AndroidLocatorBuilder.xpath('//android.widget.TextView[@text="Alan Gravy"]'),

    ios: iOSLocatorBuilder.xpath('//XCUIElementTypeStaticText[@name="Alan Gravy"]'),

}

const careTakerAlbieArmstrong: TestBotElement = {

    android: AndroidLocatorBuilder.xpath('//android.widget.TextView[@text="Albie Armstrong"]'),

    ios: iOSLocatorBuilder.xpath('//XCUIElementTypeStaticText[@name="Albie Armstrong"]'),

}

const careTakerArturoReyes: TestBotElement = {

    android: AndroidLocatorBuilder.xpath('//android.widget.TextView[@text="Arturo Reyes"]'),

    ios: iOSLocatorBuilder.xpath('//XCUIElementTypeStaticText[@name="Arturo Reyes"]'),

}

const careTakerBenitaReyes: TestBotElement = {

    android: AndroidLocatorBuilder.xpath('//android.widget.TextView[@text="Benita Reyes"]'),

    ios: iOSLocatorBuilder.xpath('//XCUIElementTypeStaticText[@name="Benita Reyes"]'),

}

const careTakerBrendaBrown: TestBotElement = {

    android: AndroidLocatorBuilder.xpath('//android.widget.TextView[@text="Brenda Brown"]'),

    ios: iOSLocatorBuilder.xpath('//XCUIElementTypeStaticText[@name="Brenda Brown"]'),

}

const careTakerCharlotteCrawley: TestBotElement = {

    android: AndroidLocatorBuilder.xpath('//android.widget.TextView[@text="Charlotte Crawley"]'),

    ios: iOSLocatorBuilder.xpath('//XCUIElementTypeStaticText[@name="Charlotte Crawley"]'),

}

const careTakerFreyaFarrow: TestBotElement = {

    android: AndroidLocatorBuilder.xpath('//android.widget.TextView[@text="Freya Farrow"]'),

    ios: iOSLocatorBuilder.xpath('//XCUIElementTypeStaticText[@name="Freya Farrow"]'),

}

const careTakerGazGarfield: TestBotElement = {

    android: AndroidLocatorBuilder.xpath('//android.widget.TextView[@text="Gaz Garfield"]'),

    ios: iOSLocatorBuilder.xpath('//XCUIElementTypeStaticText[@name="Gaz Garfield"]'),

}

const careTakerHarrietHarper: TestBotElement = {

    android: AndroidLocatorBuilder.xpath('//android.widget.TextView[@text="Harriet Harper"]'),

    ios: iOSLocatorBuilder.xpath('//XCUIElementTypeStaticText[@name="Harriet Harper"]'),

}

const careTakerIngridIngleberry: TestBotElement = {

    android: AndroidLocatorBuilder.xpath('//android.widget.TextView[@text="Ingrid Ingleberry"]'),

    ios: iOSLocatorBuilder.xpath('//XCUIElementTypeStaticText[@name="Ingrid Ingleberry"]'),

}

const careTakerJoJohnson: TestBotElement = {

    android: AndroidLocatorBuilder.xpath('//android.widget.TextView[@text="Jo Johnson"]'),

    ios: iOSLocatorBuilder.xpath('//XCUIElementTypeStaticText[@name="Jo Johnson"]'),

}

const careTakerMackMichaels: TestBotElement = {

    android: AndroidLocatorBuilder.xpath('//android.widget.TextView[@text="Mack Michaels"]'),

    ios: iOSLocatorBuilder.xpath('//XCUIElementTypeStaticText[@name="Mack Michaels"]'),

}

const careTakerMaureeenMoor: TestBotElement = {

    android: AndroidLocatorBuilder.xpath('//android.widget.TextView[@text="Maureeen Moor"]'),

    ios: iOSLocatorBuilder.xpath('//XCUIElementTypeStaticText[@name="Maureeen Moor"]'),

}

const careTakerRicoDawson: TestBotElement = {

    android: AndroidLocatorBuilder.xpath('//android.widget.TextView[@text="Rico Dawson"]'),

    ios: iOSLocatorBuilder.xpath('//XCUIElementTypeStaticText[@name="Rico Dawson"]'),

}

const careTakerRobynPartridge: TestBotElement = {

    android: AndroidLocatorBuilder.xpath('//android.widget.TextView[@text="Robyn Partridge"]'),

    ios: iOSLocatorBuilder.xpath('//XCUIElementTypeStaticText[@name="Robyn Partridge"]'),

}

const careTakerRosieMatthews: TestBotElement = {

    android: AndroidLocatorBuilder.xpath('//android.widget.TextView[@text="Rosie Matthews"]'),

    ios: iOSLocatorBuilder.xpath('//XCUIElementTypeStaticText[@name="Rosie Matthews"]'),

}

const careTakerVictorWillson: TestBotElement = {

    android: AndroidLocatorBuilder.xpath('//android.widget.TextView[@text="Victor Willson"]'),

    ios: iOSLocatorBuilder.xpath('//XCUIElementTypeStaticText[@name="Victor Willson"]'),

}

const careTakerYasmineYoung: TestBotElement = {

    android: AndroidLocatorBuilder.xpath('//android.widget.TextView[@text="Yasmine Young"]'),

    ios: iOSLocatorBuilder.xpath('//XCUIElementTypeStaticText[@name="Yasmine Young"]'),

}

 

function pickRandomResident(): string {

    const index = Math.floor(Math.random() * CARE_RECIPIENTS.length)

    return CARE_RECIPIENTS[index]

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

    } catch (srcErr) {

        console.error(

            `getPageSource ALSO failed (${srcErr instanceof Error ? srcErr.message : srcErr}) — ` +

            'session likely dead. Consider restarting Appium/BrowserStack session.'

        )

    }

}

 

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

// Helper — pick and select a resident dynamically

// AT RUNTIME. Instead of trying shuffled candidates

// one-by-one (which biases toward whichever name is

// easiest to find, since the loop stops at the

// first success), this scans which of the 21 names

// are ACTUALLY present on screen right now, then

// picks randomly among only those. This guarantees

// a genuinely random choice among real options,

// rather than always converging on the same "easy"

// name.

// Returns the name that was actually selected.

// ─────────────────────────────────────────────

async function selectRandomResident(): Promise<string> {

    console.log(' Scanning screen for all currently visible care recipients...')

 

    const visibleCandidates: string[] = []

 

    for (const candidateName of CARE_RECIPIENTS) {

        const locator = residentLocator(candidateName)

        const isPresent = await testBot.isVisible(locator).catch(() => false)

        if (isPresent) {

            visibleCandidates.push(candidateName)

        }

    }

 

    console.log(` Found ${visibleCandidates.length} visible candidate(s) without scrolling:`, visibleCandidates)

 

    // If nothing is visible without scrolling (unusual, but

    // possible on a very short list view), fall back to

    // scrolling through the full shuffled list once.

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

                    console.log(` Selected resident: "${candidateName}" (found via scroll fallback)`)

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

 

    // Pick genuinely at random among the names that are

    // ACTUALLY visible right now.

    const randomIndex = Math.floor(Math.random() * visibleCandidates.length)

    const chosenName = visibleCandidates[randomIndex]

 

    console.log(` Randomly chosen from visible candidates: "${chosenName}"`)

 

    const locator = residentLocator(chosenName)

    await testBot.click(locator)

    console.log(` Selected resident: "${chosenName}"`)

    return chosenName

}

 

// ─────────────────────────────────────────────

// Care note types shown in the "Select Care"

// picker that opens after tapping Adhoc's list

// item. One is picked at random, the same way

// selectRandomResident() picks a resident.

//

// NB: different note types render entirely

// different "Update Care" templates — e.g.

// outings like "Cinema"/"Church" show a

// "Duration (hours)" + "Activity benefit" grid,

// while short indoor activities like "Art" and

// "Bowling" show "Duration (mins)" + a

// "Happiness" mood slider. Restricted to the

// minutes-based types so the "10 mins" duration

// step is reliable regardless of which is picked.

// ─────────────────────────────────────────────

const CARE_NOTE_TYPES = [

    'Art',

    'Bowling',

]

 

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

 

// ─────────────────────────────────────────────

// Selects a random care note from the "Select

// Care" picker grid, scanning for whichever

// names are actually visible without scrolling.

// Returns the name that was selected.

// ─────────────────────────────────────────────

async function selectRandomCareNote(): Promise<string> {

    console.log(' Scanning "Select Care" screen for visible care note types...')

 

    const visibleCandidates: string[] = []

    for (const candidateName of CARE_NOTE_TYPES) {

        const locator = careNoteLocator(candidateName)

        const isPresent = await testBot.isVisible(locator).catch(() => false)

        if (isPresent) {

            visibleCandidates.push(candidateName)

        }

    }

 

    console.log(` Found ${visibleCandidates.length} visible care note candidate(s):`, visibleCandidates)

 

    if (visibleCandidates.length === 0) {

        await dumpPageSourceOnFailure('selectRandomCareNote (no candidate found)')

        throw new Error('Could not select any care note from the "Select Care" list — none were visible on screen')

    }

 

    const randomIndex = Math.floor(Math.random() * visibleCandidates.length)

    const chosenName = visibleCandidates[randomIndex]

 

    console.log(` Randomly chosen care note: "${chosenName}"`)

    await testBot.click(careNoteLocator(chosenName))

    console.log(` Selected care note: "${chosenName}"`)

    return chosenName

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

 

    // Real UI: tapping this opens a "Select Care" picker grid of named

    // note types (Art, Bingo, Community, etc.) — it does not itself

    // select a specific note. selectRandomCareNote() taps one by name.

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

 

    // Real UI: "Select Care" is a multi-select picker — tapping a note

    // name only toggles its checkbox; this "Next" button (which only

    // appears once at least one note is selected) advances to the

    // "Update Care" modal for that note.

    selectCareNextButton: {

        android: AndroidLocatorBuilder.xpath(

            '//android.widget.Button[@text="Next"]'

        ),

        ios: iOSLocatorBuilder.xpath(

            '//XCUIElementTypeButton[@name="Next"]'

        ),

    } as TestBotElement,

 

    // Real UI: selecting a care note opens an "Update Care" modal directly

    // containing Preferences, a Happiness slider, and the Duration grid all

    // on one screen — there is no separate expand-arrow/art-selection step.

    // The "Update Care" page is one long scrollable form. The title stays

    // pinned at the top and is a reliable "page loaded" indicator.

    updateCareTitle: {

        android: AndroidLocatorBuilder.xpath(

            '//android.widget.TextView[@text="Update Care"]'

        ),

        ios: iOSLocatorBuilder.xpath(

            '//XCUIElementTypeStaticText[@name="Update Care"]'

        ),

    } as TestBotElement,

 

    // The duration we actually want lives at the BOTTOM of the page under

    // the "How long did this care take?" heading (resource-id DurationField)

    // — NOT the "Duration (mins)" quick-grid near the top.

    howLongHeading: {

        android: AndroidLocatorBuilder.xpath(

            '//android.widget.TextView[@text="How long did this care take?"]'

        ),

        ios: iOSLocatorBuilder.xpath(

            '//XCUIElementTypeStaticText[@name="How long did this care take?"]'

        ),

    } as TestBotElement,

 

    // Scoped to the bottom DurationField so it never matches the top grid.

    bottomTenMinsOption: {

        android: AndroidLocatorBuilder.xpath(

            '//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/DurationField"]//android.widget.TextView[@text="10 mins"]'

        ),

        ios: iOSLocatorBuilder.xpath(

            '//XCUIElementTypeStaticText[@name="10 mins"]'

        ),

    } as TestBotElement,

 

    // The real "Continue" button at the very bottom of the page

    // (resource-id ConfirmButton), disabled until a bottom duration is picked.

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

}

 

// ─────────────────────────────────────────────

// Suite — Dynamic Adhoc Activity Flow

// (assumes the app is already logged in and on

// the My Communities page — run this after the

// enrolment/login suite in the same session)

//

// Wait times reduced to 3-5s range throughout,

// down from the previous 15-20s waits, per

// request. If this proves too fast for a given

// screen transition on your device, that step

// will fail with a clear "element not found"

// error rather than hang — bump that ONE

// timeout back up rather than reverting all of

// them.

// ─────────────────────────────────────────────

describe('Care Delivery - Dynamic Adhoc Activity Flow', () => {

 

    let selectedResidentName = ''

 

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

 

    it('Step 3 - Open the "Select Care" picker and choose a care note from the list', async function () {

        try {

            await testBot.waitUntilVisible(adhocSelectors.activitiesListItem, 5000)

            await testBot.click(adhocSelectors.activitiesListItem)

            await driver.pause(3000)

 

            await testBot.waitUntilVisible(adhocSelectors.selectCareScreenTitle, 10000)

            await selectRandomCareNote()

            await driver.pause(3000)

 

            await testBot.waitUntilVisible(adhocSelectors.selectCareNextButton, 5000)

            await testBot.click(adhocSelectors.selectCareNextButton)

            await driver.pause(3000)

        } catch (err) {

            await dumpPageSourceOnFailure('Step 3')

            throw err

        }

    })

 

    // Real UI: selecting a care note opens the "Update Care" modal directly

    // — it already contains Preferences, Happiness slider and the Duration

    // grid on one screen, so there is no expand-arrow/art-selection/Next step.

    it('Step 4 - Verify the "Update Care" page loaded', async function () {

        try {

            await testBot.waitUntilVisible(adhocSelectors.updateCareTitle, 10000)

            console.log('"Update Care" page loaded')

        } catch (err) {

            await dumpPageSourceOnFailure('Step 4')

            throw err

        }

    })

 

    // Per the recorded flow: do NOT tap the "Duration (mins)" quick-grid near

    // the top. Scroll all the way down to the "How long did this care take?"

    // section (resource-id DurationField) at the bottom and pick 10 mins there.

    it('Step 5 - Scroll to the bottom "How long did this care take?" section and select "10 mins"', async function () {

        try {

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

 

            await tenMinsEl.click()

            console.log('Selected "10 mins" in the "How long did this care take?" section')

            await driver.pause(2000)

        } catch (err) {

            await dumpPageSourceOnFailure('Step 5')

            throw err

        }

    })

 

    // The real "Continue" button (resource-id ConfirmButton) sits at the very

    // bottom, just below the duration section, and enables once 10 mins is set.

    it('Step 6 - Tap the "Continue" button at the bottom', async function () {

        try {

            const confirmXpath =

                '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/ConfirmButton"]'

 

            const confirmBtn = await $(confirmXpath)

            await confirmBtn.waitForEnabled({ timeout: 10000 })

            await confirmBtn.click()

            console.log('Clicked "Continue"')

            await driver.pause(3000)

        } catch (err) {

            await dumpPageSourceOnFailure('Step 6')

            throw err

        }

    })

 

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

 

})




