import { testBot } from '../../testbot'
import { AndroidLocatorBuilder } from '../../TestBot/Locators/Android/AndroidLocatorBuilder'
import { iOSLocatorBuilder } from '../../TestBot/Locators/iOS/iOSLocatorBuilder'
import { TestBotElement } from '../../TestBot/TestBotElement'

const NON_BASELINE_RESIDENTS = [
    'Ah-Na Gravy',
    'Alan Gravy',
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

const NON_BASELINE_RESIDENT =
    process.env.BLOOD_O2_NON_BASELINE_RESIDENT ||
    NON_BASELINE_RESIDENTS[
        Math.floor(Math.random() * NON_BASELINE_RESIDENTS.length)
    ]
const BASELINE_RESIDENT =
    process.env.BLOOD_O2_BASELINE_RESIDENT || 'Albie Armstrong'

// Accepted range, per the provided locator: 1 - 200
const CLINICAL_MIN = 1
const CLINICAL_MAX = 200

// Baseline (personalised) range, as provided: 90 - 97
const BASELINE_MIN = 90
const BASELINE_MAX = 97

const VALID_BLOOD_O2 = '94'

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

    // ── CHANGED from Blood Sugar: label text, exactly as
    // provided ("Blood O2") ──
    bloodO2Text: locator(
        '//android.widget.TextView[@text="Blood O2"]',
        '//XCUIElementTypeStaticText[@name="Blood O2"]'
    ),

    bloodO2SelectionButton: locator(
        '//android.widget.TextView[@text="Blood O2"]/parent::android.view.ViewGroup',
        '//XCUIElementTypeStaticText[@name="Blood O2"]/ancestor::XCUIElementTypeOther[1]'
    ),

    suppliedBloodO2Image: locator(
        '//androidx.recyclerview.widget.RecyclerView/android.view.ViewGroup[4]/android.view.ViewGroup/android.view.ViewGroup[3]/android.view.ViewGroup/android.widget.ImageView',
        '//XCUIElementTypeStaticText[@name="Blood O2"]/preceding-sibling::XCUIElementTypeImage[1]'
    ),

    nextButton: locator(
        '//android.widget.Button[@text="Next"]',
        '//XCUIElementTypeButton[@name="Next"]'
    ),

    // ── CHANGED from Blood Sugar: your provided bare EditText
    // (identical structurally — no change needed to the xpath
    // itself, only the variable name) ──
    bloodO2Input: locator(
        '//android.widget.EditText',
        '//XCUIElementTypeTextField'
    ),

    // ── NOT CONFIRMED — placeholder ──
    // No exact validation-message text was provided for Blood
    // ── NOT CONFIRMED — broadened guess. The original single
    // exact-phrase match ("Blood O2 should be within the
    // specified range") was NOT found on a real run (confirmed
    // via stack trace: expectClinicalValidation threw "Expected
    // clinical validation to be displayed"). Widened to match
    // several likely real wordings at once, so it has a much
    // better chance of catching the actual message even without
    // knowing its exact text yet. expectClinicalValidation()
    // below ALSO now dumps page source directly at the point of
    // failure (not just via the outer runStep catch), so if this
    // still doesn't match, the real message text will finally be
    // visible in that dump — please share it once you have it,
    // so this can be locked to the exact wording.
    validationError: locator(
        '//android.widget.TextView[' +
        'contains(@text,"Blood O2") and (' +
        'contains(@text,"range") or ' +
        'contains(@text,"valid") or ' +
        'contains(@text,"Valid") or ' +
        'contains(@text,"between") or ' +
        'contains(@text,"must be") or ' +
        'contains(@text,"error") or ' +
        'contains(@text,"Error")' +
        ')]',
        '//XCUIElementTypeStaticText[' +
        'contains(@name,"Blood O2") and (' +
        'contains(@name,"range") or ' +
        'contains(@name,"valid") or ' +
        'contains(@name,"Valid") or ' +
        'contains(@name,"between") or ' +
        'contains(@name,"must be") or ' +
        'contains(@name,"error") or ' +
        'contains(@name,"Error")' +
        ')]'
    ),

    // ── NOT CONFIRMED — placeholder, same pattern as
    // Respiration's confirmed guidance strings ──
    lowBaselineGuidance: locator(
        '//android.widget.TextView[contains(@text,"Blood O2 is lower than the specified range")]',
        '//XCUIElementTypeStaticText[contains(@name,"Blood O2 is lower than the specified range")]'
    ),

    highBaselineGuidance: locator(
        '//android.widget.TextView[contains(@text,"Blood O2 is higher than the specified range")]',
        '//XCUIElementTypeStaticText[contains(@name,"Blood O2 is higher than the specified range")]'
    ),

    durationOptions: locator(
        '//android.widget.TextView[contains(@text,"mins")]',
        '//XCUIElementTypeStaticText[contains(@name,"mins")]'
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

    // ── Provided directly: click on Earlier page ──
    earlierTab: locator(
        '//android.widget.TextView[@text="Earlier"]',
        '//XCUIElementTypeStaticText[@name="Earlier"]'
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

// ── CHANGED from Blood Sugar: function name + "Blood O2"
// text target, same navigation structure ──
async function openBloodO2CareNote(residentName: string): Promise<void> {
    await testBot.waitUntilVisible(selectors.myCommunitiesTab, 120000)

    await selectResident(residentName)
    console.log(`Selected resident: ${residentName}`)

    await testBot.waitUntilVisible(selectors.adhocButton, 10000)
    await testBot.click(selectors.adhocButton)

    let bloodO2Visible = await isVisible(selectors.bloodO2Text)

    if (!bloodO2Visible && await isVisible(selectors.expandAllSectionsButton)) {
        await testBot.click(selectors.expandAllSectionsButton)
        await driver.pause(500)
        bloodO2Visible = await isVisible(selectors.bloodO2Text)
    }

    if (!bloodO2Visible) {
        const bloodO2 = await $(
            'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
            '.scrollIntoView(new UiSelector().text("Blood O2"))'
        )
        await bloodO2.waitForDisplayed({ timeout: 10000 })
    }

    await selectBloodO2Tile()

    await testBot.waitUntilVisible(selectors.nextButton, 10000)
    await testBot.click(selectors.nextButton)

    await testBot.waitUntilVisible(selectors.bloodO2Input, 10000)
}

async function tapElementCenter(element: any): Promise<void> {
    const location = await element.getLocation()
    const size = await element.getSize()
    const x = Math.round(location.x + size.width / 2)
    const y = Math.round(location.y + size.height / 2)

    await driver.performActions([{
        type: 'pointer',
        id: 'blood-sugar-tap',
        parameters: { pointerType: 'touch' },
        actions: [
            { type: 'pointerMove', duration: 0, x, y },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 100 },
            { type: 'pointerUp', button: 0 },
        ],
    }])
}

async function selectBloodO2Tile(): Promise<void> {
    const bloodO2TileXpath = await (testBot as any)
        .getLocatorTextForElement(selectors.bloodO2SelectionButton)
    const bloodO2Tile = await $(bloodO2TileXpath)
    await bloodO2Tile.waitForDisplayed({ timeout: 10000 })

    await tapElementCenter(bloodO2Tile)
    await driver.pause(500)

    if (!(await isVisible(selectors.nextButton))) {
        const suppliedXpath = await (testBot as any)
            .getLocatorTextForElement(selectors.suppliedBloodO2Image)
        const suppliedImage = await $(suppliedXpath)

        if (await suppliedImage.isDisplayed().catch(() => false)) {
            await tapElementCenter(suppliedImage)
            await driver.pause(500)
        }
    }

    if (!(await isVisible(selectors.nextButton))) {
        throw new Error('Blood O2 tile was tapped but Next did not appear')
    }
}

async function setBloodO2(value: string): Promise<void> {
    // Every step has its own timeout so a genuine hang fails
    // fast with a clear error rather than freezing forever.
    // Timeouts trimmed to match how fast each call actually
    // needs to be — these are simple, near-instant operations
    // on a single text field, not multi-second waits.
    const xpath = await withTimeout(
        (testBot as any).getLocatorTextForElement(selectors.bloodO2Input),
        2000,
        `setBloodO2("${value}") - getLocatorTextForElement`
    )
    const input = await $(xpath)
    await withTimeout(input.waitForDisplayed({ timeout: 3000 }), 3500, `setBloodO2("${value}") - waitForDisplayed`)
    await withTimeout(input.click(), 2000, `setBloodO2("${value}") - click`)
    await withTimeout(input.clearValue(), 2000, `setBloodO2("${value}") - clearValue`)
    await withTimeout(input.setValue(value), 2000, `setBloodO2("${value}") - setValue`)

    try {
        await withTimeout(driver.hideKeyboard(), 1500, `setBloodO2("${value}") - hideKeyboard`)
    } catch {
        // The keyboard may already be closed on cloud devices,
        // or hideKeyboard itself timed out — either way, non-fatal.
    }
    await driver.pause(150)
}

async function clearBloodO2(): Promise<void> {
    const xpath = await withTimeout(
        (testBot as any).getLocatorTextForElement(selectors.bloodO2Input),
        2000,
        'clearBloodO2 - getLocatorTextForElement'
    )
    const input = await $(xpath)
    await withTimeout(input.waitForDisplayed({ timeout: 3000 }), 3500, 'clearBloodO2 - waitForDisplayed')
    await withTimeout(input.click(), 2000, 'clearBloodO2 - click')
    await withTimeout(input.clearValue(), 2000, 'clearBloodO2 - clearValue')

    try {
        await withTimeout(driver.hideKeyboard(), 1500, 'clearBloodO2 - hideKeyboard')
    } catch {
        // The keyboard may already be closed on cloud devices,
        // or hideKeyboard itself timed out — either way, non-fatal.
    }
    await driver.pause(150)

    const value = await withTimeout(
        (process.env.PLATFORM || 'android').toLowerCase() === 'android'
            ? input.getAttribute('text')
            : input.getValue(),
        2000,
        'clearBloodO2 - read back value'
    )

    if (value !== '') {
        throw new Error(`Blood O2 field was not blank. Current value: "${value}"`)
    }
}

// ── COMBINED CHECK: tries the (widened) validation-message
// locator first, and ALSO checks the field-value/Confirm-
// enabled signals as a second, independent path — either one
// firing counts as "rejected". This covers both possibilities
// at once (a message the widened locator might catch, or no
// message at all with the app just blocking the value) rather
// than betting on only one theory. Timeouts trimmed down since
// these are direct isVisible/getAttribute reads, not waits for
// something to appear.
async function readBloodO2FieldValue(): Promise<string> {
    const xpath = await (testBot as any).getLocatorTextForElement(selectors.bloodO2Input)
    const input = await $(xpath)
    const value = (process.env.PLATFORM || 'android').toLowerCase() === 'android'
        ? await input.getAttribute('text').catch(() => '')
        : await input.getValue().catch(() => '')
    return value || ''
}

async function isConfirmEnabled(): Promise<boolean> {
    const confirmXpath = await (testBot as any).getLocatorTextForElement(selectors.confirmButton)
    const confirmButton = await $(confirmXpath)
    return await confirmButton.isEnabled().catch(() => false)
}

// Wraps a promise with a hard timeout so a stalled Appium
// command fails fast with a clear error instead of hanging.
async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms — likely stuck`)), ms)
        ),
    ])
}

async function expectClinicalValidation(expected: boolean, attemptedValue?: string): Promise<void> {
    const messageDisplayed = await withTimeout(isVisible(selectors.validationError), 1500, 'validationError check').catch(() => false)
    const actualValue = await withTimeout(readBloodO2FieldValue(), 1500, 'readBloodO2FieldValue')
    const confirmEnabled = await withTimeout(isConfirmEnabled(), 1500, 'isConfirmEnabled')

    // "Rejected" = a validation message is shown, OR the field
    // does not hold the value we tried to enter (app blocked or
    // reverted it), OR Confirm/Continue is disabled. Any one of
    // these is real evidence the app refused it.
    const valueWasRejected = attemptedValue !== undefined && actualValue !== attemptedValue
    const rejected = messageDisplayed || valueWasRejected || !confirmEnabled

    if (rejected !== expected) {
        await dumpPageSourceOnFailure(
            `expectClinicalValidation - expected rejected=${expected}, got rejected=${rejected} ` +
            `(messageDisplayed=${messageDisplayed}, attempted="${attemptedValue ?? '(n/a)'}", actualFieldValue="${actualValue}", confirmEnabled=${confirmEnabled})`
        )
        throw new Error(
            `Expected value to be ${expected ? 'rejected' : 'accepted'}, but field shows "${actualValue}" ` +
            `(attempted "${attemptedValue ?? '(n/a)'}") and Confirm is ${confirmEnabled ? 'enabled' : 'disabled'}`
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
        throw new Error('Expected personalized Blood O2 guidance')
    }
    if (expected === 'none' && guidanceVisible) {
        throw new Error('Personalized guidance was shown inside the baseline range')
    }
}

async function runClinicalBoundaryAnalysis(): Promise<void> {
    for (const value of [String(CLINICAL_MIN - 1), String(CLINICAL_MAX + 1)]) {
        await setBloodO2(value)
        await expectClinicalValidation(true, value)
    }
}

async function selectRequiredDuration(): Promise<void> {
    for (let attempt = 0; attempt < 5; attempt++) {
        const durationXpath = await (testBot as any)
            .getLocatorTextForElement(selectors.durationOptions)
        const durationOptions = await $$(durationXpath)
        const visibleOptions = []

        for (const option of durationOptions) {
            if (await option.isDisplayed().catch(() => false)) {
                visibleOptions.push(option)
            }
        }

        if (visibleOptions.length > 0) {
            const randomIndex = Math.floor(Math.random() * visibleOptions.length)
            const selectedOption = visibleOptions[randomIndex]
            const selectedDuration = await selectedOption.getText().catch(() => '')

            await selectedOption.click()
            console.log(`Selected duration: ${selectedDuration}`)
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

    throw new Error('No duration option was found')
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

    try {
        await testBot.waitUntilVisible(selectors.myCommunitiesTab, 15000)
    } catch (err) {
        // NB: this step was seen hanging/failing after a PRIOR
        // step (validation check) had already failed earlier in
        // the same test, leaving the app on an unexpected screen
        // that never actually reaches Create Records / Close /
        // Earlier / Communities in the normal sequence. Timeout
        // shortened from 30s to 15s and a dump added here
        // specifically, so if this step fails on its own (not as
        // a cascade), the real screen state is captured directly.
        await dumpPageSourceOnFailure('completeCareNote - My Communities not reached after Earlier close')
        throw err
    }
}

async function runStep(step: string, action: () => Promise<void>): Promise<void> {
    try {
        await action()
    } catch (error) {
        await dumpPageSourceOnFailure(step)
        throw error
    }
}

describe('Resident Area Profile - Observations - Blood O2', () => {

    it('Validates boundaries, re-enters a valid baseline value and completes the care note', async () => {
        await runStep('baseline Blood O2', async () => {
            await openBloodO2CareNote(BASELINE_RESIDENT)

            await runClinicalBoundaryAnalysis()

            // Outside baseline but still within the accepted
            // clinical range — the app accepts these values
            // (not rejected) and shows personalised guidance.
            await setBloodO2(String(BASELINE_MIN - 1))
            await expectClinicalValidation(false, String(BASELINE_MIN - 1))
            await expectGuidance('present')

            await setBloodO2(String(BASELINE_MAX + 1))
            await expectClinicalValidation(false, String(BASELINE_MAX + 1))
            await expectGuidance('present')

            await setBloodO2(VALID_BLOOD_O2)
            await expectClinicalValidation(false, VALID_BLOOD_O2)
            await expectGuidance('none')

            await completeCareNote()
        })
    })

    it('Leaves Blood O2 blank for a new non-baseline resident and completes the care note', async () => {
        await runStep('blank non-baseline Blood O2', async () => {
            await openBloodO2CareNote(NON_BASELINE_RESIDENT)
            await clearBloodO2()
            // A genuinely blank field is a distinct case from a
            // rejected numeric value — clearBloodO2() already
            // asserts the field reads as empty; no further
            // rejection check needed here.
            await completeCareNote()
        })
    })

    it('Rejects out-of-range Blood O2 values, then completes with a valid value', async () => {
        await runStep('out-of-range Blood O2', async () => {
            await openBloodO2CareNote(NON_BASELINE_RESIDENT)

            for (const value of [String(CLINICAL_MIN - 1), String(CLINICAL_MAX + 1)]) {
                await setBloodO2(value)
                await expectClinicalValidation(true, value)
            }

            await setBloodO2(VALID_BLOOD_O2)
            await expectClinicalValidation(false, VALID_BLOOD_O2)
            await completeCareNote()
        })
    })

})
