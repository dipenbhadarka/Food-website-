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

    // Pick genuinely at random among the names that are
    // ACTUALLY visible right now.
    const randomIndex = Math.floor(Math.random() * visibleCandidates.length)
    const chosenName = visibleCandidates[randomIndex]

    console.log(`▶ Randomly chosen from visible candidates: "${chosenName}"`)

    const locator = residentLocator(chosenName)
    await testBot.click(locator)
    console.log(`▶ Selected resident: "${chosenName}"`)
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

    activitiesListItem: {
        android: AndroidLocatorBuilder.xpath(
            '//androidx.recyclerview.widget.RecyclerView/android.view.ViewGroup[2]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeCollectionView/XCUIElementTypeCell[2]'
        ),
    } as TestBotElement,

    // NB: This arrow TOGGLES open/closed — tap once only.
    expandArrow: {
        android: AndroidLocatorBuilder.xpath(
            '(//android.widget.TextView[@text=""])[1]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '(//XCUIElementTypeStaticText[@name=""])[1]'
        ),
    } as TestBotElement,

    selectArtImage: {
        android: AndroidLocatorBuilder.xpath(
            '//androidx.recyclerview.widget.RecyclerView/android.view.ViewGroup[3]/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.widget.ImageView'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeCollectionView/XCUIElementTypeCell[3]/XCUIElementTypeImage'
        ),
    } as TestBotElement,

    nextButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="Next"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Next"]'
        ),
    } as TestBotElement,

    durationScreenTitle: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="How long did this care take?"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="How long did this care take?"]'
        ),
    } as TestBotElement,

    // Confirmed: plain grid button, no slider overlap.
    tenMinsOption: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="10 mins"] | //android.widget.Button[@text="10 mins"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="10 mins"] | //XCUIElementTypeButton[@name="10 mins"]'
        ),
    } as TestBotElement,

    // Confirmed: literal "Continue" button at the bottom
    // of the duration screen.
    confirmButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="Continue"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Continue"]'
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

    it('Step 3 - Select an activity from the list', async function () {
        try {
            await testBot.waitUntilVisible(adhocSelectors.activitiesListItem, 5000)
            await testBot.click(adhocSelectors.activitiesListItem)
            await driver.pause(3000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 3')
            throw err
        }
    })

    it('Step 4 - Tap arrow to expand (toggle — tap once only)', async function () {
        try {
            await testBot.waitUntilVisible(adhocSelectors.expandArrow, 5000)
            await testBot.click(adhocSelectors.expandArrow)
            await driver.pause(3000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 4')
            throw err
        }
    })

    it('Step 5 - Select the art', async function () {
        try {
            await testBot.waitUntilVisible(adhocSelectors.selectArtImage, 5000)
            await testBot.click(adhocSelectors.selectArtImage)
            await driver.pause(3000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 5')
            throw err
        }
    })

    it('Step 6 - Click Next and verify duration screen loads', async function () {
        try {
            await testBot.waitUntilVisible(adhocSelectors.nextButton, 5000)
            await testBot.click(adhocSelectors.nextButton)
            await driver.pause(3000)
            await testBot.waitUntilVisible(adhocSelectors.durationScreenTitle, 5000)
            console.log('Duration screen loaded: "How long did this care take?"')
        } catch (err) {
            await dumpPageSourceOnFailure('Step 6')
            throw err
        }
    })

    it('Step 7 - Scroll down and select "10 mins" duration', async function () {
        try {
            await testBot.waitUntilVisible(adhocSelectors.durationScreenTitle, 5000)

            const tenMinsXpath =
                '//android.widget.TextView[@text="10 mins"] | //android.widget.Button[@text="10 mins"]'

            let found = false
            for (let i = 0; i < 5; i++) {
                const el = await $(tenMinsXpath)
                if (await el.isExisting() && await el.isDisplayed()) {
                    found = true
                    break
                }

                const { width, height } = await driver.getWindowSize()
                await driver.execute('mobile: swipeGesture', {
                    left: Math.floor(width * 0.2),
                    top: Math.floor(height * 0.6),
                    width: Math.floor(width * 0.6),
                    height: Math.floor(height * 0.3),
                    direction: 'up',
                    percent: 0.5,
                })
                await driver.pause(3000)
            }

            if (!found) {
                throw new Error('"10 mins" button never became visible after scrolling')
            }

            const tenMinsEl = await $(tenMinsXpath)
            await tenMinsEl.click()
            console.log('Clicked "10 mins" duration button')
            await driver.pause(3000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 7')
            throw err
        }
    })

    it('Step 8 - Click Continue button at the bottom', async function () {
        try {
            await testBot.waitUntilVisible(adhocSelectors.confirmButton, 5000)

            try {
                await driver.hideKeyboard()
                await driver.pause(3000)
            } catch (kbErr) {
                console.warn('hideKeyboard failed or keyboard already hidden:', kbErr)
            }

            const freshContinueBtn = await $(
                '//android.widget.Button[@text="Continue"]'
            )
            await freshContinueBtn.click()
            await driver.pause(3000)

            let advanced = await testBot.isVisible(adhocSelectors.createRecordsButton).catch(() => false)

            if (!advanced) {
                console.warn('Create Records not visible after Continue tap — retrying once')
                const retryBtn = await $('//android.widget.Button[@text="Continue"]')
                if (await retryBtn.isExisting()) {
                    await retryBtn.click()
                    await driver.pause(3000)
                    advanced = await testBot.isVisible(adhocSelectors.createRecordsButton).catch(() => false)
                }
            }

            if (!advanced) {
                console.warn('Still stuck — trying coordinate-based tap on Continue')
                const continueBtn = await $('//android.widget.Button[@text="Continue"]')
                if (await continueBtn.isExisting()) {
                    const location = await continueBtn.getLocation()
                    const size = await continueBtn.getSize()
                    const centerX = Math.floor(location.x + size.width / 2)
                    const centerY = Math.floor(location.y + size.height / 2)
                    console.log(`Tapping Continue at coordinates: ${centerX}, ${centerY}`)

                    await driver.action('pointer', { parameters: { pointerType: 'touch' } })
                        .move({ duration: 0, x: centerX, y: centerY })
                        .down({ button: 0 })
                        .pause(100)
                        .up({ button: 0 })
                        .perform()

                    await driver.pause(3000)
                }
            }
        } catch (err) {
            await dumpPageSourceOnFailure('Step 8')
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
