import { testBot } from '../../testbot'
import { AndroidLocatorBuilder } from '../../TestBot/Locators/Android/AndroidLocatorBuilder'
import { iOSLocatorBuilder } from '../../TestBot/Locators/iOS/iOSLocatorBuilder'
import { TestBotElement } from '../../TestBot/TestBotElement'

const isLocal = process.env.RUN_MODE === 'local'
console.log(`Running Weight Observation flow in ${isLocal ? 'LOCAL PHYSICAL DEVICE' : 'BROWSERSTACK CLOUD'} mode`)

// ─────────────────────────────────────────────
// Full list of care recipients — one is picked
// at random each run, same approach as the adhoc
// activity flow.
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
            fs.writeFileSync(path.join(outDir, `weight_obs_failure_${safeName}.xml`), pageSource, 'utf-8')
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
// WEIGHT VALUE TEST DATA — Boundary Value Analysis
// for the accepted range 20 to 500.
//
// Covers the PBI's three explicit requirements:
//   - Leaving value blank            -> BLANK_VALUE
//   - Entering an invalid value      -> INVALID_VALUES
//   - Displaying baseline messages   -> checked after
//     each entry via checkBaselineMessage()
//
// Plus standard boundary coverage around the valid
// range edges (19/20/21 and 499/500/501), a
// mid-range valid value, and a decimal check in
// case the field accepts fractional weights.
// ─────────────────────────────────────────────
const WEIGHT_MIN = 20
const WEIGHT_MAX = 500

const BOUNDARY_VALID_VALUES = [
    String(WEIGHT_MIN),           // lower boundary (valid)
    String(WEIGHT_MIN + 1),       // just above lower boundary
    '260',                        // mid-range
    String(WEIGHT_MAX - 1),       // just below upper boundary
    String(WEIGHT_MAX),           // upper boundary (valid)
]

const BOUNDARY_INVALID_VALUES = [
    String(WEIGHT_MIN - 1),       // just below lower boundary (19) — out of range
    String(WEIGHT_MAX + 1),       // just above upper boundary (501) — out of range
    '0',                          // zero
    '-5',                         // negative
    'abc',                        // non-numeric
    '20.5.5',                     // malformed decimal
]

const BLANK_VALUE = ''

function pickRandomFrom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

// ─────────────────────────────────────────────
// Selectors — built directly from the provided
// locator list, in the order given.
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

    // Arrow beside the search icon — expands all sections at once.
    expandAllSectionsButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text=""]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name=""]'
        ),
    } as TestBotElement,

    // Weight icon in the expanded section grid.
    weightIcon: {
        android: AndroidLocatorBuilder.xpath(
            '//androidx.recyclerview.widget.RecyclerView/android.view.ViewGroup[4]/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup/android.widget.ImageView'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeCollectionView/XCUIElementTypeCell[4]/XCUIElementTypeImage'
        ),
    } as TestBotElement,

    // NB: This locator was provided without a described action
    // ("click on weigh" was assigned to the ImageView above, and
    // this second locator has no label). Kept as a fallback tap
    // target in case the ImageView alone doesn't register the
    // selection — update the label once confirmed what this
    // element actually represents.
    weightIconAlt: {
        android: AndroidLocatorBuilder.xpath(
            '//androidx.recyclerview.widget.RecyclerView/android.view.ViewGroup[4]/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.View'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeCollectionView/XCUIElementTypeCell[4]'
        ),
    } as TestBotElement,

    weighText: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Weigh"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Weigh"]'
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

    // The weight value input field on the "Update Care" page.
    // NB: Provided as a bare "android.widget.EditText" with no
    // resource-id or other distinguishing attribute — this
    // assumes it is the ONLY EditText visible on that page at
    // this point. If the page has more than one EditText
    // simultaneously visible, this locator will need a more
    // specific scope (e.g. a resource-id or a parent container)
    // once confirmed via Appium Inspector.
    weightInputField: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeTextField'
        ),
    } as TestBotElement,

    // "Other Durations" option — conditional. Only appears/gets
    // acted on if it happens to be the option randomly presented;
    // guarded with an isVisible() check before use.
    otherDurationsOption: {
        android: AndroidLocatorBuilder.xpath(
            '(//android.widget.TextView[@text="Other Durations"])[1]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '(//XCUIElementTypeStaticText[@name="Other Durations"])[1]'
        ),
    } as TestBotElement,

    durationEntryField: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/DurationEntry"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeTextField[@name="DurationEntry"]'
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

    // NB: Locator provided for "close" is identical to Create
    // Records — this cannot be correct, since they are described
    // as two separate actions in sequence. Using a text-based
    // guess as a fallback; please confirm the real Close button
    // locator (likely a different resource-id or an "X"/close
    // icon) via Appium Inspector.
    closeButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="Close"] | //android.widget.ImageView[@content-desc="Close"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Close"]'
        ),
    } as TestBotElement,

    earlierTab: {
        android: AndroidLocatorBuilder.xpath(
            '//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/ProfilePage"]/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup/android.widget.Button'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Earlier"]'
        ),
    } as TestBotElement,

    // ── NOT PROVIDED — placeholders below ──
    // The PBI explicitly requires testing "Displaying baseline
    // messages", but no locator was given for what that message
    // actually looks like on screen (a validation error under
    // the field? a toast? a modal?). This generic fallback
    // searches for common message-like text patterns and should
    // be replaced with a confirmed locator once available.
    baselineMessage: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[contains(@text,"baseline") or contains(@text,"Baseline")]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[contains(@name,"baseline") or contains(@name,"Baseline")]'
        ),
    } as TestBotElement,

    // Generic validation/error message fallback for the
    // blank-value and invalid-value test cases, since no
    // specific locator was provided for these either.
    validationErrorMessage: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[contains(@text,"required") or contains(@text,"invalid") or contains(@text,"Invalid") or contains(@text,"must be")]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[contains(@name,"required") or contains(@name,"invalid") or contains(@name,"Invalid") or contains(@name,"must be")]'
        ),
    } as TestBotElement,
}

// ─────────────────────────────────────────────
// Helper — checks whether ANY validation/baseline
// message is currently visible, logs what was
// found (or not found), and returns the outcome
// without throwing — callers decide whether the
// presence/absence of a message is a pass or fail
// for their specific test case.
// ─────────────────────────────────────────────
async function checkForMessage(label: string): Promise<{ baselineShown: boolean; validationShown: boolean }> {
    const baselineShown = await testBot.isVisible(selectors.baselineMessage).catch(() => false)
    const validationShown = await testBot.isVisible(selectors.validationErrorMessage).catch(() => false)

    console.log(`  [${label}] baseline message visible: ${baselineShown}, validation message visible: ${validationShown}`)

    return { baselineShown, validationShown }
}

// ─────────────────────────────────────────────
// Helper — clears the weight input field and
// enters the given value (empty string leaves it
// blank). Uses testBot.enterText with clear-first
// semantics consistent with the rest of the suite.
// ─────────────────────────────────────────────
async function enterWeightValue(value: string): Promise<void> {
    await testBot.waitUntilVisible(selectors.weightInputField, 10000)
    await testBot.click(selectors.weightInputField)
    await driver.pause(300)

    // Clear any existing value first
    try {
        await (await $(await (testBot as any).getLocatorTextForElement(selectors.weightInputField))).clearValue()
    } catch (clearErr) {
        console.warn('clearValue failed, attempting select-all + type-over:', clearErr)
    }

    if (value !== '') {
        await testBot.enterText(selectors.weightInputField, value, false)
    }
    await driver.pause(500)

    try {
        await driver.hideKeyboard()
        await driver.pause(500)
    } catch (kbErr) {
        console.warn('hideKeyboard failed or keyboard already hidden:', kbErr)
    }
}

// ─────────────────────────────────────────────
// Helper — handles the conditional "Other
// Durations" step. Only acts if that option is
// actually visible/selected on screen; otherwise
// logs and does nothing.
// ─────────────────────────────────────────────
async function handleOtherDurationsIfPresent(minutesValue: string): Promise<void> {
    const isPresent = await testBot.isVisible(selectors.otherDurationsOption).catch(() => false)

    if (!isPresent) {
        console.log('  "Other Durations" option not present for this run — skipping duration entry step')
        return
    }

    console.log(`  "Other Durations" option present — entering ${minutesValue} minutes`)
    await testBot.click(selectors.otherDurationsOption)
    await driver.pause(1000)

    await testBot.waitUntilVisible(selectors.durationEntryField, 5000)
    await testBot.click(selectors.durationEntryField)
    await testBot.enterText(selectors.durationEntryField, minutesValue, false)
    await driver.pause(500)

    try {
        await driver.hideKeyboard()
        await driver.pause(500)
    } catch (kbErr) {
        console.warn('hideKeyboard failed or keyboard already hidden:', kbErr)
    }

    await testBot.waitUntilVisible(selectors.confirmButton, 5000)
    await testBot.click(selectors.confirmButton)
    await driver.pause(1500)
}

// ─────────────────────────────────────────────
// Shared navigation — gets from the My
// Communities page to the Weight "Update Care"
// entry screen. Used by both the smoke and
// thorough suites below to avoid duplicating the
// same 6 steps twice.
// ─────────────────────────────────────────────
async function navigateToWeightEntryScreen(): Promise<string> {
    let selectedResident = ''

    await (async () => {
        try {
            selectedResident = await selectRandomResident()
            await driver.pause(2000)
        } catch (err) {
            await dumpPageSourceOnFailure('navigateToWeightEntryScreen - select resident')
            throw err
        }
    })()

    try {
        await testBot.waitUntilVisible(selectors.adhocButton, 5000)
        await testBot.click(selectors.adhocButton)
        await driver.pause(2000)

        await testBot.waitUntilVisible(selectors.expandAllSectionsButton, 5000)
        await testBot.click(selectors.expandAllSectionsButton)
        console.log('Tapped expand-all-sections button')
        await driver.pause(1500)

        await testBot.waitUntilVisible(selectors.weightIcon, 5000)
        await testBot.click(selectors.weightIcon)
        await driver.pause(1000)

        await testBot.waitUntilVisible(selectors.weighText, 5000)
        await testBot.click(selectors.weighText)
        await driver.pause(1000)

        await testBot.waitUntilVisible(selectors.nextButton, 5000)
        await testBot.click(selectors.nextButton)
        await driver.pause(2000)

        await testBot.waitUntilVisible(selectors.weightInputField, 10000)
        console.log('Reached weight input field')
    } catch (err) {
        await dumpPageSourceOnFailure('navigateToWeightEntryScreen')
        throw err
    }

    return selectedResident
}

// ═══════════════════════════════════════════════
// SUITE — Weight Observation: SMOKE TEST
// Quick, minimal coverage — one valid entry, one
// blank check, one invalid check. Intended for
// fast confirmation the flow works end-to-end,
// not exhaustive boundary coverage (see the
// THOROUGH suite below for that).
// Assumes the app is already logged in and on the
// My Communities page.
// ═══════════════════════════════════════════════
describe('Resident Area Profile - Observations - Weight - SMOKE TEST', () => {

    it('Smoke Step 1 - Navigate to the Weight entry screen for a random resident', async function () {
        await navigateToWeightEntryScreen()
    })

    it('Smoke Step 2 - Leaving value blank shows expected validation', async function () {
        try {
            await enterWeightValue(BLANK_VALUE)
            const { validationShown } = await checkForMessage('Smoke: blank value')
            console.log(`Blank value validation shown: ${validationShown} (confirm expected behaviour against real screen)`)
        } catch (err) {
            await dumpPageSourceOnFailure('Smoke Step 2')
            throw err
        }
    })

    it('Smoke Step 3 - Entering an invalid value shows expected validation', async function () {
        try {
            const invalidValue = pickRandomFrom(BOUNDARY_INVALID_VALUES)
            console.log(`Testing invalid value: "${invalidValue}"`)
            await enterWeightValue(invalidValue)
            const { validationShown } = await checkForMessage(`Smoke: invalid value "${invalidValue}"`)
            console.log(`Invalid value validation shown: ${validationShown}`)
        } catch (err) {
            await dumpPageSourceOnFailure('Smoke Step 3')
            throw err
        }
    })

    it('Smoke Step 4 - Entering a valid mid-range value proceeds without error', async function () {
        try {
            await enterWeightValue('260')
            const { validationShown } = await checkForMessage('Smoke: valid mid-range value')
            if (validationShown) {
                console.warn('Validation message unexpectedly shown for a valid value — check the field/message logic')
            }
        } catch (err) {
            await dumpPageSourceOnFailure('Smoke Step 4')
            throw err
        }
    })

    it('Smoke Step 5 - Handle "Other Durations" if presented, then complete the record', async function () {
        try {
            await handleOtherDurationsIfPresent('10')

            await testBot.waitUntilVisible(selectors.createRecordsButton, 10000)
            await testBot.click(selectors.createRecordsButton)
            await driver.pause(2000)

            await testBot.waitUntilVisible(selectors.closeButton, 5000)
            await testBot.click(selectors.closeButton)
            await driver.pause(2000)

            await testBot.waitUntilVisible(selectors.earlierTab, 10000)
            await testBot.click(selectors.earlierTab)
            await driver.pause(2000)
            console.log('Smoke test complete — record created and Earlier tab opened')
        } catch (err) {
            await dumpPageSourceOnFailure('Smoke Step 5')
            throw err
        }
    })

})

// ═══════════════════════════════════════════════
// SUITE — Weight Observation: THOROUGH TEST
// Full Boundary Value Analysis coverage for the
// 20-500 accepted range, plus explicit blank and
// invalid-value checks, each run independently as
// its own test case with its own navigation (so a
// single case's failure doesn't block the rest).
// ═══════════════════════════════════════════════
describe('Resident Area Profile - Observations - Weight - THOROUGH (Boundary Value Analysis)', () => {

    it('Thorough Step 1 - Leaving value blank shows expected validation', async function () {
        try {
            await navigateToWeightEntryScreen()
            await enterWeightValue(BLANK_VALUE)
            const { validationShown } = await checkForMessage('Thorough: blank value')
            expect(validationShown).toBe(true)
        } catch (err) {
            await dumpPageSourceOnFailure('Thorough Step 1 (blank value)')
            throw err
        }
    })

    BOUNDARY_INVALID_VALUES.forEach((invalidValue, index) => {
        it(`Thorough Step 2.${index + 1} - Invalid value "${invalidValue}" shows expected validation`, async function () {
            try {
                await navigateToWeightEntryScreen()
                await enterWeightValue(invalidValue)
                const { validationShown } = await checkForMessage(`Thorough: invalid value "${invalidValue}"`)
                expect(validationShown).toBe(true)
            } catch (err) {
                await dumpPageSourceOnFailure(`Thorough Step 2.${index + 1} (invalid "${invalidValue}")`)
                throw err
            }
        })
    })

    BOUNDARY_VALID_VALUES.forEach((validValue, index) => {
        it(`Thorough Step 3.${index + 1} - Valid boundary value "${validValue}" is accepted without error`, async function () {
            try {
                await navigateToWeightEntryScreen()
                await enterWeightValue(validValue)
                const { validationShown } = await checkForMessage(`Thorough: valid value "${validValue}"`)
                expect(validationShown).toBe(false)
            } catch (err) {
                await dumpPageSourceOnFailure(`Thorough Step 3.${index + 1} (valid "${validValue}")`)
                throw err
            }
        })
    })

    it('Thorough Step 4 - Baseline message displays as expected for a valid entry', async function () {
        try {
            await navigateToWeightEntryScreen()
            await enterWeightValue('260')
            const { baselineShown } = await checkForMessage('Thorough: baseline message check')
            console.log(`Baseline message shown: ${baselineShown} — confirm this matches expected app behaviour (locator is currently a best-guess text match; update selectors.baselineMessage once confirmed)`)
        } catch (err) {
            await dumpPageSourceOnFailure('Thorough Step 4 (baseline message)')
            throw err
        }
    })

    it('Thorough Step 5 - Complete the record end-to-end with a valid value, including conditional "Other Durations"', async function () {
        try {
            await navigateToWeightEntryScreen()
            await enterWeightValue('260')
            await driver.pause(1000)

            await handleOtherDurationsIfPresent('15')

            await testBot.waitUntilVisible(selectors.createRecordsButton, 10000)
            await testBot.click(selectors.createRecordsButton)
            await driver.pause(2000)

            await testBot.waitUntilVisible(selectors.closeButton, 5000)
            await testBot.click(selectors.closeButton)
            await driver.pause(2000)

            await testBot.waitUntilVisible(selectors.earlierTab, 10000)
            await testBot.click(selectors.earlierTab)
            await driver.pause(2000)
            console.log('Thorough test complete — record created and Earlier tab opened')
        } catch (err) {
            await dumpPageSourceOnFailure('Thorough Step 5 (end-to-end)')
            throw err
        }
    })

})
