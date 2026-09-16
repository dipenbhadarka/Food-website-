import { testBot } from '../../testbot'
import { AndroidLocatorBuilder } from '../../TestBot/Locators/Android/AndroidLocatorBuilder'
import { iOSLocatorBuilder } from '../../TestBot/Locators/iOS/iOSLocatorBuilder'
import { TestBotElement } from '../../TestBot/TestBotElement'

const NON_BASELINE_RESIDENT =
    process.env.HEIGHT_NON_BASELINE_RESIDENT || 'Ah-Na Gravy'
const BASELINE_RESIDENT =
    process.env.HEIGHT_BASELINE_RESIDENT || 'Albie Armstrong'

// Accepted range, per the provided locator: 50 - 300
const CLINICAL_MIN = 50
const CLINICAL_MAX = 300

// ── NOT CONFIRMED — placeholder ──
// No BaselineObservation-form screenshot was provided for
// Height (unlike Respiration's confirmed 18-30 rpm range).
// Using a provisional 100-200 range as a placeholder — please
// confirm the real personalised baseline range for Height and
// update these two values before relying on Steps 6-7 below.
const BASELINE_MIN = 100
const BASELINE_MAX = 200

const VALID_HEIGHT = '170'

function locator(androidXpath: string, iosXpath: string): TestBotElement {
    return {
        android: AndroidLocatorBuilder.xpath(androidXpath),
        ios: iOSLocatorBuilder.xpath(iosXpath),
    } as TestBotElement
}

function residentLocator(name: string): TestBotElement {
    return locator(
        `//android.widget.TextView[@text="${name}"]`,
        `//XCUIElementTypeStaticText[@name="${name}"]`
    )
}

const selectors = {
    adhocButton: locator(
        '//android.widget.TextView[@text="Adhoc"]',
        '//XCUIElementTypeStaticText[@name="Adhoc"]'
    ),

    expandAllSectionsButton: locator(
        '//android.widget.Button[@text="\uE0A4"]',
        '//XCUIElementTypeButton[@name=""]'
    ),

    // ── CHANGED from Temperature/Respiration: label text,
    // confirmed as "Record height" (not just "Height") ──
    heightText: locator(
        '//android.widget.TextView[@text="Record height"]',
        '//XCUIElementTypeStaticText[@name="Record height"]'
    ),

    heightSelectionButton: locator(
        '//android.widget.TextView[@text="Record height"]/ancestor::android.view.ViewGroup[@clickable="true"][1]',
        '//XCUIElementTypeStaticText[@name="Record height"]/ancestor::XCUIElementTypeOther[1]'
    ),

    // NB: No dedicated icon-image locator was provided for
    // Height (unlike Temperature's suppliedTemperatureImage).
    // Kept as a preceding-sibling-image guess, same pattern as
    // the other two flows, as a last-resort fallback only.
    suppliedHeightImage: locator(
        '//android.widget.TextView[@text="Record height"]/preceding-sibling::android.widget.ImageView[1]',
        '//XCUIElementTypeStaticText[@name="Record height"]/preceding-sibling::XCUIElementTypeImage[1]'
    ),

    nextButton: locator(
        '//android.widget.Button[@text="Next"]',
        '//XCUIElementTypeButton[@name="Next"]'
    ),

    // ── CHANGED from Temperature/Respiration: your provided
    // bare EditText (identical structurally — no change needed
    // to the xpath itself, only the variable name) ──
    heightInput: locator(
        '//android.widget.EditText',
        '//XCUIElementTypeTextField'
    ),

    // NB: no confirmed validation message text was provided for
    // Height. Using the same generic "range" contains() match
    // used as a placeholder in the Respiration flow — please
    // confirm the real message text.
    validationError: locator(
        '//android.widget.TextView[contains(@text,"range")]',
        '//XCUIElementTypeStaticText[contains(@name,"range")]'
    ),

    // NB: no confirmed baseline-guidance text was provided for
    // Height (unlike Respiration's confirmed "Respiration rate
    // is too low/high" strings from the BaselineObservation
    // form). Using a best-guess "Height is too low/high" pattern
    // — please confirm the real guidance text.
    lowBaselineGuidance: locator(
        '//android.widget.TextView[contains(@text,"Height is too low") or contains(@text,"Height is lower than")]',
        '//XCUIElementTypeStaticText[contains(@name,"Height is too low") or contains(@name,"Height is lower than")]'
    ),

    highBaselineGuidance: locator(
        '//android.widget.TextView[contains(@text,"Height is too high") or contains(@text,"Height is higher than")]',
        '//XCUIElementTypeStaticText[contains(@name,"Height is too high") or contains(@name,"Height is higher than")]'
    ),

    tenMinuteDuration: locator(
        '//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/DurationField"]//android.widget.TextView[@text="10 mins"]',
        '//XCUIElementTypeOther[@name="DurationField"]//XCUIElementTypeStaticText[@name="10 mins"]'
    ),

    confirmButton: locator(
        '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/ConfirmButton"]',
        '//XCUIElementTypeButton[@name="ConfirmButton"]'
    ),

    createRecordsButton: locator(
        '//android.widget.Button[@text="Create Records"]',
        '//XCUIElementTypeButton[@name="Create Records"]'
    ),

    closeButton: locator(
        '//android.widget.Button[@text="Close"]',
        '//XCUIElementTypeButton[@name="Close"]'
    ),

    earlierTab: locator(
        '//*[@text="Earlier"]',
        '//*[@name="Earlier"]'
    ),

    earlierCloseButton: locator(
        '(//android.widget.Button[@text=""])[1] | //android.widget.Button[@content-desc="Close"]',
        '(//XCUIElementTypeButton[@name=""])[1] | //XCUIElementTypeButton[@name="Close"]'
    ),

    myCommunitiesTab: locator(
        '//*[@text="My Communities"]',
        '//*[@name="My Communities"]'
    ),
}

async function dumpPageSourceOnFailure(step: string): Promise<void> {
    console.error(`Failure at ${step}`)
    try {
        console.log(await driver.getPageSource())
    } catch (error) {
        console.error('Could not get page source', error)
    }
}

async function isVisible(element: TestBotElement): Promise<boolean> {
    return testBot.isVisible(element).catch(() => false)
}

async function selectResident(name: string): Promise<void> {
    if (await isVisible(residentLocator(name))) {
        await testBot.click(residentLocator(name))
        return
    }

    if ((process.env.PLATFORM || 'android').toLowerCase() === 'android') {
        const resident = await $(
            'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
            `.scrollIntoView(new UiSelector().text("${name}"))`
        )
        await resident.waitForDisplayed({ timeout: 20000 })
        await resident.click()
        return
    }

    throw new Error(`Resident "${name}" is not visible`)
}

// ── CHANGED from Temperature/Respiration: function name +
// "Record height" text target, same structure ──
// ─────────────────────────────────────────────
// Recovery helper — if the app is not on the
// Communities page (e.g. a previous test case
// failed partway through and left the app stuck
// on the Adhoc/Select Care screen, or any other
// intermediate screen), this presses the device
// back button repeatedly to unwind back to
// Communities, rather than assuming the app is
// always in a clean state at the start of every
// test. Each `it()` calling openHeightCareNote()
// is otherwise independent, but the ACTUAL app
// only has one session — a previous test's
// failure leaves real state behind that the next
// test inherits unless this recovers it first.
// ─────────────────────────────────────────────
async function ensureOnCommunitiesPage(): Promise<void> {
    const alreadyThere = await isVisible(selectors.myCommunitiesTab)
    if (alreadyThere) {
        return
    }

    console.warn('Not on Communities page at test start — attempting recovery via back button')

    for (let attempt = 0; attempt < 8; attempt++) {
        if (await isVisible(selectors.myCommunitiesTab)) {
            console.log(`Recovered to Communities page after ${attempt} back-press(es)`)
            return
        }

        try {
            await driver.back()
        } catch (backErr) {
            console.warn('driver.back() failed:', backErr)
        }
        await driver.pause(1000)
    }

    if (!(await isVisible(selectors.myCommunitiesTab))) {
        await dumpPageSourceOnFailure('ensureOnCommunitiesPage - recovery failed after 8 back-presses')
        throw new Error(
            'Could not recover to the Communities page even after 8 back-presses. ' +
            'The app is stuck on an unexpected screen — likely because a PREVIOUS test case ' +
            'in this suite failed partway through and left real app state behind. ' +
            'Check the log for the FIRST failing test case in this run, not this one.'
        )
    }
}

async function openHeightCareNote(residentName: string): Promise<void> {
    await ensureOnCommunitiesPage()
    await testBot.waitUntilVisible(selectors.myCommunitiesTab, 120000)

    await selectResident(residentName)
    console.log(`Selected resident: ${residentName}`)

    await testBot.waitUntilVisible(selectors.adhocButton, 10000)
    await testBot.click(selectors.adhocButton)

    let heightVisible = await isVisible(selectors.heightText)

    if (!heightVisible && await isVisible(selectors.expandAllSectionsButton)) {
        await testBot.click(selectors.expandAllSectionsButton)
        await driver.pause(500)
        heightVisible = await isVisible(selectors.heightText)
    }

    if (!heightVisible) {
        const height = await $(
            'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
            '.scrollIntoView(new UiSelector().text("Record height"))'
        )
        await height.waitForDisplayed({ timeout: 10000 })
    }

    await selectHeightTile()

    await testBot.waitUntilVisible(selectors.nextButton, 10000)
    await testBot.click(selectors.nextButton)
    console.log('Clicked Next (attempt 1)')
    await driver.pause(1500)

    let onHeightInputScreen = await isVisible(selectors.heightInput)

    if (!onHeightInputScreen) {
        console.log('Height input field not visible after Next — retrying click (attempt 2)')
        const nextBtnRetry = await $(await (testBot as any).getLocatorTextForElement(selectors.nextButton))
        if (await nextBtnRetry.isDisplayed().catch(() => false)) {
            await nextBtnRetry.click()
            await driver.pause(1500)
            onHeightInputScreen = await isVisible(selectors.heightInput)
        }
    }

    if (!onHeightInputScreen) {
        await dumpPageSourceOnFailure('openHeightCareNote - Next click did not advance to height input')
        throw new Error('Clicked Next after selecting Height, but the height input field never appeared, even after retrying')
    }

    console.log('Reached height input field')
}

async function tapElementCenter(element: any): Promise<void> {
    const location = await element.getLocation()
    const size = await element.getSize()
    const x = Math.round(location.x + size.width / 2)
    const y = Math.round(location.y + size.height / 2)

    await driver.performActions([{
        type: 'pointer',
        id: 'height-tap',
        parameters: { pointerType: 'touch' },
        actions: [
            { type: 'pointerMove', duration: 0, x, y },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 100 },
            { type: 'pointerUp', button: 0 },
        ],
    }])
}

async function selectHeightTile(): Promise<void> {
    const heightTextXpath = await (testBot as any)
        .getLocatorTextForElement(selectors.heightText)
    const heightText = await $(heightTextXpath)
    await heightText.waitForDisplayed({ timeout: 10000 })

    await tapElementCenter(heightText)
    console.log('Tapped Height tile (attempt 1)')
    await driver.pause(1500)

    // Retry the SAME text-label tap once more before trying any
    // fallback — a single tap not registering (Appium reports
    // success but the app doesn't respond) has been an issue
    // with other tiles/buttons elsewhere in this codebase, and
    // is a more likely cause than needing a different element.
    if (!(await isVisible(selectors.nextButton))) {
        console.log('Next not visible after attempt 1 — retrying same tap (attempt 2)')
        const heightTextRetry = await $(heightTextXpath)
        if (await heightTextRetry.isDisplayed().catch(() => false)) {
            await tapElementCenter(heightTextRetry)
            await driver.pause(1500)
        }
    }

    if (!(await isVisible(selectors.nextButton))) {
        console.log('Next still not visible — trying Height tile icon image as fallback')
        const suppliedXpath = await (testBot as any)
            .getLocatorTextForElement(selectors.suppliedHeightImage)
        const suppliedImage = await $(suppliedXpath)

        if (await suppliedImage.isDisplayed().catch(() => false)) {
            await tapElementCenter(suppliedImage)
            console.log('Tapped Height tile icon image fallback')
            await driver.pause(1500)
        } else {
            console.log('Height tile icon image fallback not visible either')
        }
    }

    if (!(await isVisible(selectors.nextButton))) {
        await dumpPageSourceOnFailure('selectHeightTile - Next did not appear after 2 taps + fallback')
        throw new Error('Height tile was tapped but Next did not appear, even after retrying and trying the fallback icon')
    }
}

async function setHeight(value: string): Promise<void> {
    const xpath = await (testBot as any)
        .getLocatorTextForElement(selectors.heightInput)
    const input = await $(xpath)
    await input.waitForDisplayed({ timeout: 10000 })
    await input.click()
    await input.clearValue()
    await input.setValue(value)

    try {
        await driver.hideKeyboard()
    } catch {
        // The keyboard may already be closed on cloud devices.
    }
    await driver.pause(700)
}

async function clearHeight(): Promise<void> {
    const xpath = await (testBot as any)
        .getLocatorTextForElement(selectors.heightInput)
    const input = await $(xpath)
    await input.waitForDisplayed({ timeout: 10000 })
    await input.click()
    await input.clearValue()

    try {
        await driver.hideKeyboard()
    } catch {
        // The keyboard may already be closed on cloud devices.
    }
    await driver.pause(700)

    const value = (process.env.PLATFORM || 'android').toLowerCase() === 'android'
        ? await input.getAttribute('text')
        : await input.getValue()

    if (value !== '') {
        throw new Error(`Height field was not blank. Current value: "${value}"`)
    }
}

async function expectClinicalValidation(expected: boolean): Promise<void> {
    const displayed = await isVisible(selectors.validationError)
    if (displayed !== expected) {
        throw new Error(
            `Expected clinical validation to be ${expected ? 'displayed' : 'hidden'}`
        )
    }
}

async function expectGuidance(
    expected: 'present' | 'none'
): Promise<void> {
    const lowVisible = await isVisible(selectors.lowBaselineGuidance)
    const highVisible = await isVisible(selectors.highBaselineGuidance)
    const guidanceVisible = lowVisible || highVisible

    if (expected === 'present' && !guidanceVisible) {
        throw new Error('Expected personalized Height guidance')
    }
    if (expected === 'none' && guidanceVisible) {
        throw new Error('Personalized guidance was shown inside the baseline range')
    }
}

// ─────────────────────────────────────────────
// Boundary Value Analysis for the Height field's
// accepted range (50-300). Covers both NEGATIVE
// (invalid) values — below the minimum, zero, and
// a large negative number — and POSITIVE
// (invalid) values above the maximum, plus the
// exact boundary edges themselves. Every value in
// INVALID_HEIGHT_VALUES is expected to trigger
// validation; every value in VALID_HEIGHT_VALUES
// is expected NOT to.
// ─────────────────────────────────────────────
const INVALID_HEIGHT_VALUES = [
    String(CLINICAL_MIN - 1),   // 49  - just below minimum
    String(CLINICAL_MAX + 1),   // 301 - just above maximum
    '0',                        // zero
    '-1',                       // small negative
    '-100',                     // large negative
    '9999',                     // large positive, far above maximum
    'abc',                      // non-numeric
]

const VALID_HEIGHT_VALUES = [
    String(CLINICAL_MIN),       // 50  - exact lower boundary
    String(CLINICAL_MAX),       // 300 - exact upper boundary
    VALID_HEIGHT,                // 170 - mid-range
]

async function runClinicalBoundaryAnalysis(): Promise<void> {
    for (const value of INVALID_HEIGHT_VALUES) {
        console.log(`Testing invalid Height value: "${value}"`)
        await setHeight(value)
        await expectClinicalValidation(true)
    }

    for (const value of VALID_HEIGHT_VALUES) {
        console.log(`Testing valid Height value: "${value}"`)
        await setHeight(value)
        await expectClinicalValidation(false)
    }
}

async function selectRequiredDuration(): Promise<void> {
    for (let attempt = 0; attempt < 5; attempt++) {
        if (await isVisible(selectors.tenMinuteDuration)) {
            await testBot.click(selectors.tenMinuteDuration)
            return
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
        await driver.pause(750)
    }

    throw new Error('Required 10 mins duration was not found')
}

async function completeCareNote(): Promise<void> {
    await selectRequiredDuration()

    const confirmXpath = await (testBot as any)
        .getLocatorTextForElement(selectors.confirmButton)
    const confirmButton = await $(confirmXpath)
    await confirmButton.waitForDisplayed({ timeout: 10000 })
    await confirmButton.waitForEnabled({ timeout: 10000 })
    await confirmButton.click()

    await testBot.waitUntilVisible(selectors.createRecordsButton, 10000)
    await testBot.click(selectors.createRecordsButton)

    await testBot.waitUntilVisible(selectors.closeButton, 10000)
    await testBot.click(selectors.closeButton)

    await testBot.waitUntilVisible(selectors.earlierTab, 10000)
    await testBot.click(selectors.earlierTab)

    await testBot.waitUntilVisible(selectors.earlierCloseButton, 10000)
    await testBot.click(selectors.earlierCloseButton)

    await testBot.waitUntilVisible(selectors.myCommunitiesTab, 30000)
}

async function runStep(step: string, action: () => Promise<void>): Promise<void> {
    try {
        await action()
    } catch (error) {
        await dumpPageSourceOnFailure(step)
        throw error
    }
}

describe('Resident Area Profile - Observations - Height', () => {

    it('Validates boundaries, re-enters a valid baseline value and completes the care note', async () => {
        await runStep('baseline Height', async () => {
            await openHeightCareNote(BASELINE_RESIDENT)

            await runClinicalBoundaryAnalysis()

            await setHeight(String(BASELINE_MIN - 1))
            await expectClinicalValidation(false)
            await expectGuidance('present')

            await setHeight(String(BASELINE_MAX + 1))
            await expectClinicalValidation(false)
            await expectGuidance('present')

            await setHeight(VALID_HEIGHT)
            await expectClinicalValidation(false)
            await expectGuidance('none')

            await completeCareNote()
        })
    })

    it('Leaves Height blank for a new non-baseline resident and completes the care note', async () => {
        await runStep('blank non-baseline Height', async () => {
            await openHeightCareNote(NON_BASELINE_RESIDENT)
            await clearHeight()
            await expectClinicalValidation(false)
            await completeCareNote()
        })
    })

    it('Rejects invalid positive and negative Height values, then completes with a valid value', async () => {
        await runStep('positive and negative invalid Height', async () => {
            await openHeightCareNote(NON_BASELINE_RESIDENT)

            await runClinicalBoundaryAnalysis()

            await setHeight(VALID_HEIGHT)
            await expectClinicalValidation(false)
            await completeCareNote()
        })
    })

})
