import { testBot } from '../../testbot'
import { AndroidLocatorBuilder } from '../../TestBot/Locators/Android/AndroidLocatorBuilder'
import { iOSLocatorBuilder } from '../../TestBot/Locators/iOS/iOSLocatorBuilder'
import { TestBotElement } from '../../TestBot/TestBotElement'

const isLocal = process.env.RUN_MODE === 'local'
console.log(`Running Respiration Observation flow in ${isLocal ? 'LOCAL PHYSICAL DEVICE' : 'BROWSERSTACK CLOUD'} mode`)

// ─────────────────────────────────────────────
// Full list of care recipients — used the same
// way as in the Weight and Temperature
// observation flows: one resident is scanned-for
// and selected at runtime, never hardcoded.
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

// The two named residents this suite specifically
// needs — one confirmed to have a personalised
// Respiration baseline configured, one confirmed
// NOT to (a "non-baseline" resident) — kept
// overridable via env var, matching the pattern
// used in the Temperature observation flow.
const BASELINE_RESIDENT = process.env.RESPIRATION_BASELINE_RESIDENT || 'Albie Armstrong'
const NON_BASELINE_RESIDENT = process.env.RESPIRATION_NON_BASELINE_RESIDENT || 'Ah-Na Gravy'

// ─────────────────────────────────────────────
// RESPIRATION BOUNDARY VALUE ANALYSIS
//
// Accepted range: 1 - 99
// Baseline (personalised) range, per the
// BaselineObservation form: 18 - 30 (rpm)
//
// 0  = Accepted Min - 1 -> INVALID (accepted range)
// 1  = Accepted Min     -> VALID (accepted range)
// 99 = Accepted Max     -> VALID (accepted range)
// 100 = Accepted Max + 1 -> INVALID (accepted range)
//
// Within the accepted range but OUTSIDE the
// resident's personal baseline (18-30), a baseline
// resident should see guidance text ("Respiration
// rate is too low" / "too high", per the form) —
// not a hard validation error — while a
// non-baseline resident should not.
// ─────────────────────────────────────────────
const ACCEPTED_MIN = 1
const ACCEPTED_MAX = 99
const BASELINE_MIN = 18
const BASELINE_MAX = 30
const VALID_RESPIRATION = '24'

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
// inspect after the fact. Matches the same
// pattern used in the Weight and Temperature
// observation flows.
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
            fs.writeFileSync(path.join(outDir, `respiration_obs_failure_${safeName}.xml`), pageSource, 'utf-8')
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
// Selectors — same structure/style as the Weight
// and Temperature observation files.
// ─────────────────────────────────────────────
const selectors = {
    adhocButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Adhoc"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Adhoc"]'
        ),
    } as TestBotElement,

    // Green up/down arrow beside the search icon — expands all
    // sections at once. Confirmed Unicode private-use icon
    // character, same locator proven working in the adhoc,
    // Weight, and Temperature observation flows.
    expandAllSectionsButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="\uE0A4"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name=""]'
        ),
    } as TestBotElement,

    respirationText: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Respiration"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Respiration"]'
        ),
    } as TestBotElement,

    // The clickable row/tile containing the "Respiration" label —
    // tapping the label itself may not register on some layouts,
    // so this ancestor container is used as the primary tap
    // target with the label as a fallback (see selectRespirationTile),
    // matching the Temperature flow's tile-selection approach.
    respirationSelectionButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Respiration"]/ancestor::android.view.ViewGroup[@clickable="true"][1]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Respiration"]/ancestor::XCUIElementTypeOther[1]'
        ),
    } as TestBotElement,

    // The Respiration tile's icon image, provided as a
    // position-based fallback locator — NB: position-based
    // locators have previously broken when the expand-all arrow
    // changes the grid layout (see the Weight observation flow's
    // weightIcon fix). Kept here only as a last-resort fallback,
    // never as the primary tap target.
    suppliedRespirationImage: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Respiration"]/preceding-sibling::android.widget.ImageView[1]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Respiration"]/preceding-sibling::XCUIElementTypeImage[1]'
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

    // NB: Provided as a bare "android.widget.EditText" with no
    // resource-id — same caveat as the Weight/Temperature input
    // fields: this assumes it is the ONLY EditText visible on
    // this page at this point.
    respirationInputField: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeTextField'
        ),
    } as TestBotElement,

    // ── NOT CONFIRMED — placeholder ──
    // No exact validation-message text was provided for
    // Respiration (unlike Temperature's confirmed "Temperature
    // should be within the specified range" string). Using a
    // generic contains() match on the word "range" as a
    // best-guess fallback; please confirm the real message text
    // via Appium Inspector or a real failed-save screenshot.
    validationErrorMessage: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[contains(@text,"range") or contains(@text,"Respiration should be")]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[contains(@name,"range") or contains(@name,"Respiration should be")]'
        ),
    } as TestBotElement,

    // Soft personalised-baseline guidance — text confirmed from
    // the BaselineObservation form's guidance columns
    // ("Respiration rate is too low" / "too high").
    lowBaselineGuidance: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[contains(@text,"Respiration rate is too low")]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[contains(@name,"Respiration rate is too low")]'
        ),
    } as TestBotElement,

    highBaselineGuidance: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[contains(@text,"Respiration rate is too high")]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[contains(@name,"Respiration rate is too high")]'
        ),
    } as TestBotElement,

    // The required 10-mins duration option in the duration grid —
    // same container-scoped pattern proven in the Weight and
    // Temperature flows.
    tenMinuteDuration: {
        android: AndroidLocatorBuilder.xpath(
            '//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/DurationField"]//android.widget.TextView[@text="10 mins"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeOther[@name="DurationField"]//XCUIElementTypeStaticText[@name="10 mins"]'
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

    closeButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="Close"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Close"]'
        ),
    } as TestBotElement,

    earlierTab: {
        android: AndroidLocatorBuilder.xpath(
            '//*[@text="Earlier"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//*[@name="Earlier"]'
        ),
    } as TestBotElement,

    // Top-right close (X) button on the Earlier page — same
    // confirmed pattern used in the Weight/Temperature
    // observation flows: first empty-text Button in document
    // order, with a content-desc fallback.
    earlierCloseButton: {
        android: AndroidLocatorBuilder.xpath(
            '(//android.widget.Button[@text=""])[1] | //android.widget.Button[@content-desc="Close"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '(//XCUIElementTypeButton[@name=""])[1] | //XCUIElementTypeButton[@name="Close"]'
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

    // ── Step 3 requirement: "Value is not displayed in care
    // note in Earlier" — checked after leaving Respiration
    // blank and completing the care note. NOT CONFIRMED — no
    // locator was provided for how a care note's value is shown
    // in the Earlier list; using a generic guess scoped to the
    // Respiration label appearing alongside a value. Please
    // confirm the real structure via Appium Inspector.
    respirationValueInEarlierList: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[contains(@text,"Respiration")]/following-sibling::android.widget.TextView[1]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[contains(@name,"Respiration")]/following-sibling::XCUIElementTypeStaticText[1]'
        ),
    } as TestBotElement,
}

// ─────────────────────────────────────────────
// Helper — visibility check with a safe catch,
// used throughout instead of raw testBot calls.
// ─────────────────────────────────────────────
async function isVisible(element: TestBotElement): Promise<boolean> {
    return testBot.isVisible(element).catch(() => false)
}

// ─────────────────────────────────────────────
// Selects a SPECIFIC named resident (not random —
// this suite needs the baseline and non-baseline
// residents by name specifically). Scans for
// direct visibility first, falls back to scroll,
// matching the same pattern used in the
// Temperature observation flow.
// ─────────────────────────────────────────────
async function selectNamedResident(name: string): Promise<void> {
    if (await isVisible(residentLocator(name))) {
        await testBot.click(residentLocator(name))
        console.log(`Selected resident: "${name}"`)
        return
    }

    console.log(`"${name}" not immediately visible — scrolling to find them`)
    try {
        const resident = await $(
            'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
            `.scrollIntoView(new UiSelector().text("${name}"))`
        )
        await resident.waitForDisplayed({ timeout: 20000 })
        await resident.click()
        console.log(`Selected resident: "${name}" (found via scroll)`)
        return
    } catch (err) {
        await dumpPageSourceOnFailure(`selectNamedResident - "${name}" not found`)
        throw new Error(`Resident "${name}" is not visible, even after scrolling`)
    }
}

// ─────────────────────────────────────────────
// Taps the exact pixel center of a WebdriverIO
// element via a raw pointer action — same
// coordinate-tap fallback pattern proven in the
// enrolment/adhoc/Temperature flows for elements
// that don't respond to a standard element click.
// ─────────────────────────────────────────────
async function tapElementCenter(element: WebdriverIO.Element): Promise<void> {
    const location = await element.getLocation()
    const size = await element.getSize()
    const x = Math.round(location.x + size.width / 2)
    const y = Math.round(location.y + size.height / 2)

    await driver.action('pointer', { parameters: { pointerType: 'touch' } })
        .move({ duration: 0, x, y })
        .down({ button: 0 })
        .pause(100)
        .up({ button: 0 })
        .perform()
}

// ─────────────────────────────────────────────
// Taps the "Respiration" tile. Tries the text
// label first (coordinate tap, matching the
// Temperature flow's approach), then falls back
// to the tile's icon image if Next still hasn't
// appeared. Throws with a clear message (and
// page-source dump) if neither works.
// ─────────────────────────────────────────────
async function selectRespirationTile(): Promise<void> {
    const respirationTextXpath = await (testBot as any).getLocatorTextForElement(selectors.respirationText)
    const respirationTextEl = await $(respirationTextXpath)
    await respirationTextEl.waitForDisplayed({ timeout: 10000 })

    await tapElementCenter(respirationTextEl)
    console.log('Tapped Respiration tile (text label)')
    await driver.pause(1000)

    if (!(await isVisible(selectors.nextButton))) {
        console.log('Next not visible yet — trying Respiration tile icon image as fallback')
        const suppliedXpath = await (testBot as any).getLocatorTextForElement(selectors.suppliedRespirationImage)
        const suppliedImageEl = await $(suppliedXpath)

        if (await suppliedImageEl.isDisplayed().catch(() => false)) {
            await tapElementCenter(suppliedImageEl)
            console.log('Tapped Respiration tile (icon image fallback)')
            await driver.pause(1000)
        }
    }

    if (!(await isVisible(selectors.nextButton))) {
        await dumpPageSourceOnFailure('selectRespirationTile - Next did not appear')
        throw new Error('Respiration tile was tapped but the Next button did not appear')
    }
}

// ─────────────────────────────────────────────
// Full navigation: Communities -> named resident
// -> Adhoc -> expand-all -> Respiration tile ->
// Continue/Next -> respiration input field visible.
// Step 1 (Log In) is assumed already complete —
// this suite starts on the Communities page, same
// as the Weight and Temperature flows.
// ─────────────────────────────────────────────
async function openRespirationCareNote(residentName: string): Promise<void> {
    try {
        await testBot.waitUntilVisible(selectors.myCommunitiesTab, 120000)

        await selectNamedResident(residentName)
        await driver.pause(2000)

        await testBot.waitUntilVisible(selectors.adhocButton, 10000)
        await testBot.click(selectors.adhocButton)
        await driver.pause(2000)

        let respirationVisible = await isVisible(selectors.respirationText)

        if (!respirationVisible && (await isVisible(selectors.expandAllSectionsButton))) {
            await testBot.click(selectors.expandAllSectionsButton)
            console.log('Tapped green expand-all arrow — expecting all sections to render expanded')
            await driver.pause(1500)
            respirationVisible = await isVisible(selectors.respirationText)
        }

        if (!respirationVisible) {
            console.log('"Respiration" not visible — scrolling to find it')
            const respirationEl = await $(
                'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
                '.scrollIntoView(new UiSelector().text("Respiration"))'
            )
            await respirationEl.waitForDisplayed({ timeout: 10000 })
        }

        await selectRespirationTile()

        // Step 2 of the manual test case: "Click Continue" after
        // selecting Respiration. The app may render this as a
        // "Next" button (same wording used across the other
        // observation flows) — using the same nextButton selector.
        await testBot.waitUntilVisible(selectors.nextButton, 10000)
        await testBot.click(selectors.nextButton)
        console.log('Clicked Continue/Next')
        await driver.pause(2000)

        await testBot.waitUntilVisible(selectors.respirationInputField, 10000)
        console.log('Reached Respiration input field')
    } catch (err) {
        await dumpPageSourceOnFailure('openRespirationCareNote')
        throw err
    }
}

// ─────────────────────────────────────────────
// Enters a respiration value (clears first).
// ─────────────────────────────────────────────
async function setRespiration(value: string): Promise<void> {
    const xpath = await (testBot as any).getLocatorTextForElement(selectors.respirationInputField)
    const input = await $(xpath)
    await input.waitForDisplayed({ timeout: 10000 })
    await input.click()
    await input.clearValue()
    await input.setValue(value)

    try {
        await driver.hideKeyboard()
    } catch (kbErr) {
        console.warn('hideKeyboard failed or keyboard already hidden:', kbErr)
    }
    await driver.pause(700)
}

// ─────────────────────────────────────────────
// Clears the Respiration field and verifies it is
// genuinely blank afterward (Step 3 of the manual
// test case: "leave the value blank") — reads the
// field's actual current value back and throws if
// anything remains, rather than assuming the clear
// succeeded.
// ─────────────────────────────────────────────
async function clearRespiration(): Promise<void> {
    const xpath = await (testBot as any).getLocatorTextForElement(selectors.respirationInputField)
    const input = await $(xpath)
    await input.waitForDisplayed({ timeout: 10000 })
    await input.click()
    await input.clearValue()

    try {
        await driver.hideKeyboard()
    } catch (kbErr) {
        console.warn('hideKeyboard failed or keyboard already hidden:', kbErr)
    }
    await driver.pause(700)

    const currentValue = isLocal || (process.env.PLATFORM || 'android').toLowerCase() === 'android'
        ? await input.getAttribute('text')
        : await input.getValue()

    if (currentValue !== '') {
        await dumpPageSourceOnFailure(`clearRespiration - field not blank ("${currentValue}")`)
        throw new Error(`Respiration field was not blank after clearing. Current value: "${currentValue}"`)
    }
}

// ─────────────────────────────────────────────
// Checks the hard accepted-range validation
// error's visibility against an expected state,
// throwing a clear message naming both if they
// don't match. Also covers Step 5's requirement
// that the user is prevented from saving —
// verified separately by the caller checking
// Continue/Confirm stays disabled.
// ─────────────────────────────────────────────
async function expectRangeValidation(expected: boolean): Promise<void> {
    const displayed = await isVisible(selectors.validationErrorMessage)
    if (displayed !== expected) {
        await dumpPageSourceOnFailure(`expectRangeValidation - expected ${expected}, got ${displayed}`)
        throw new Error(`Expected range validation to be ${expected ? 'displayed' : 'hidden'}, but it was ${displayed ? 'displayed' : 'hidden'}`)
    }
}

// ─────────────────────────────────────────────
// Checks the soft personalised-baseline guidance
// (low or high) against an expected presence
// state.
// ─────────────────────────────────────────────
async function expectGuidance(expected: 'present' | 'none'): Promise<void> {
    const lowVisible = await isVisible(selectors.lowBaselineGuidance)
    const highVisible = await isVisible(selectors.highBaselineGuidance)
    const guidanceVisible = lowVisible || highVisible

    if (expected === 'present' && !guidanceVisible) {
        await dumpPageSourceOnFailure('expectGuidance - expected guidance but none shown')
        throw new Error('Expected personalised Respiration guidance to be shown, but neither low nor high guidance was visible')
    }
    if (expected === 'none' && guidanceVisible) {
        await dumpPageSourceOnFailure('expectGuidance - unexpected guidance shown')
        throw new Error('Personalised guidance was shown, but the value should be within the baseline range')
    }
}

// ─────────────────────────────────────────────
// Verifies Step 5's requirement that an
// out-of-range value cannot be saved — checks
// that Continue/Confirm is either not visible or
// remains disabled, meaning the user is prevented
// from proceeding.
// ─────────────────────────────────────────────
async function expectSaveIsPrevented(): Promise<void> {
    const confirmVisible = await isVisible(selectors.confirmButton)
    if (!confirmVisible) {
        console.log('Confirm/Continue not visible — save is prevented as expected')
        return
    }

    const xpath = await (testBot as any).getLocatorTextForElement(selectors.confirmButton)
    const confirmBtn = await $(xpath)
    const isEnabled = await confirmBtn.isEnabled().catch(() => false)

    if (isEnabled) {
        await dumpPageSourceOnFailure('expectSaveIsPrevented - Confirm was enabled')
        throw new Error('Expected Confirm/Continue to remain disabled for an out-of-range value, but it was enabled')
    }
    console.log('Confirm/Continue is disabled — save is prevented as expected')
}

// ─────────────────────────────────────────────
// Selects the required "10 mins" duration,
// scrolling to find it if needed. Matches the
// same retry/scroll pattern proven in the Weight
// and Temperature observation flows.
// ─────────────────────────────────────────────
async function selectRequiredDuration(): Promise<void> {
    for (let attempt = 0; attempt < 5; attempt++) {
        if (await isVisible(selectors.tenMinuteDuration)) {
            await testBot.click(selectors.tenMinuteDuration)
            console.log('Selected "10 mins" duration')
            return
        }

        console.log(`"10 mins" not visible — scrolling (attempt ${attempt + 1})`)
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

    await dumpPageSourceOnFailure('selectRequiredDuration - 10 mins not found')
    throw new Error('Required "10 mins" duration option was not found, even after scrolling')
}

// ─────────────────────────────────────────────
// Completes the care note end-to-end: select
// duration -> Continue -> Create Records -> Close
// -> Earlier -> Close (top-right, on Earlier page)
// -> verify redirected to Communities. Same
// ordering already confirmed working in the
// Weight and Temperature observation flows.
// ─────────────────────────────────────────────
async function completeCareNote(): Promise<void> {
    try {
        await selectRequiredDuration()

        const confirmXpath = await (testBot as any).getLocatorTextForElement(selectors.confirmButton)
        const confirmBtn = await $(confirmXpath)
        await confirmBtn.waitForDisplayed({ timeout: 10000 })
        await confirmBtn.waitForEnabled({ timeout: 10000 })
        await confirmBtn.click()
        console.log('Clicked Continue')
        await driver.pause(2000)

        await testBot.waitUntilVisible(selectors.createRecordsButton, 10000)
        await testBot.click(selectors.createRecordsButton)
        await driver.pause(2000)

        // Bottom Close button on the record-confirmation screen —
        // this was previously missing from the flow (only the
        // top-right earlierCloseButton was wired in), which is
        // why Close appeared not to do anything: this button was
        // never actually clicked.
        await testBot.waitUntilVisible(selectors.closeButton, 10000)
        await testBot.click(selectors.closeButton)
        console.log('Clicked bottom Close button')
        await driver.pause(2000)

        // Go to the Earlier page next, then Close from there (top-
        // right icon), and confirm redirected back to Communities.
        await testBot.waitUntilVisible(selectors.earlierTab, 10000)
        await testBot.click(selectors.earlierTab)
        await driver.pause(2000)

        await testBot.waitUntilVisible(selectors.earlierCloseButton, 10000)
        await testBot.click(selectors.earlierCloseButton)
        await driver.pause(2000)

        await testBot.waitUntilVisible(selectors.myCommunitiesTab, 30000)
        console.log('Care note complete — redirected back to Communities')
    } catch (err) {
        await dumpPageSourceOnFailure('completeCareNote')
        throw err
    }
}

// ─────────────────────────────────────────────
// Runs the accepted-range boundary checks (just
// outside 1-99) as its own reusable step.
// ─────────────────────────────────────────────
async function runAcceptedRangeBoundaryAnalysis(): Promise<void> {
    for (const value of [String(ACCEPTED_MIN - 1), String(ACCEPTED_MAX + 1)]) {
        console.log(`Testing accepted-range boundary value: "${value}"`)
        await setRespiration(value)
        await expectRangeValidation(true)
        await expectSaveIsPrevented()
        console.log(`✓ "${value}" correctly rejected by range validation`)
    }
}

// ─────────────────────────────────────────────
// Suite — Respiration Observation, following the
// same it()-per-step structure as the Weight and
// Temperature observation flows. Assumes the app
// is already logged in and will land on the My
// Communities page (Step 1, "Log In", of the
// manual test case).
// ─────────────────────────────────────────────
describe('Resident Area Profile - Observations - Respiration', () => {

    // Step 3 of the manual test case: leaving the value blank.
    // Run against a fresh (non-baseline) resident since this is
    // a distinct, independent scenario from the boundary/baseline
    // checks below.
    it('Step 1 - Leaving value blank: not displayed in care note and not plotted in chart', async function () {
        await openRespirationCareNote(NON_BASELINE_RESIDENT)
        await clearRespiration()

        // No validation error is expected for a blank value per
        // the manual test case (it only specifies the value
        // should not be displayed/plotted, not that saving is
        // blocked) — complete the care note, then verify absence
        // in the Earlier list.
        await completeCareNote()

        await testBot.waitUntilVisible(selectors.earlierTab, 10000)
        await testBot.click(selectors.earlierTab)
        await driver.pause(2000)

        const valueShown = await isVisible(selectors.respirationValueInEarlierList)
        if (valueShown) {
            await dumpPageSourceOnFailure('Step 1 - value unexpectedly displayed in Earlier')
            throw new Error('Respiration value was displayed in the Earlier care note list, but the field was left blank')
        }
        console.log('✓ Blank Respiration value is not displayed in the Earlier care note list')
    })

    // Step 4: enter a value within the valid accepted range (1-99).
    it('Step 2 - Valid value within accepted range is entered, displayed, and plotted', async function () {
        await openRespirationCareNote(NON_BASELINE_RESIDENT)
        await setRespiration(VALID_RESPIRATION)
        await expectRangeValidation(false)
        await completeCareNote()
    })

    // Step 5: enter a value outside the accepted range (1-99) —
    // expect an error message and that saving is prevented.
    it('Step 3 - Value outside the accepted range shows an error and prevents saving', async function () {
        await openRespirationCareNote(NON_BASELINE_RESIDENT)
        await runAcceptedRangeBoundaryAnalysis()
    })

    // Step 6: for a resident WITH a baseline, a value outside
    // their personal baseline (18-30) but still within the
    // accepted range (1-99) shows personalised guidance and is
    // still saveable.
    it('Step 4 - Baseline resident: value outside baseline range shows guidance and can still be saved', async function () {
        await openRespirationCareNote(BASELINE_RESIDENT)

        for (const value of [String(BASELINE_MIN - 1), String(BASELINE_MAX + 1)]) {
            console.log(`Testing baseline boundary value: "${value}"`)
            await setRespiration(value)
            await expectRangeValidation(false)
            await expectGuidance('present')
        }

        await completeCareNote()
    })

    // Step 7: for a resident WITH a baseline, a value inside
    // their personal baseline range shows no guidance at all.
    it('Step 5 - Baseline resident: value inside baseline range shows no guidance, then complete the record', async function () {
        await openRespirationCareNote(BASELINE_RESIDENT)
        await setRespiration(VALID_RESPIRATION)
        await expectRangeValidation(false)
        await expectGuidance('none')
        await completeCareNote()
    })

})
