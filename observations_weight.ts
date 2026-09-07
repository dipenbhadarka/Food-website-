import { testBot } from '../../testbot'
import { AndroidLocatorBuilder } from '../../TestBot/Locators/Android/AndroidLocatorBuilder'
import { iOSLocatorBuilder } from '../../TestBot/Locators/iOS/iOSLocatorBuilder'
import { TestBotElement } from '../../TestBot/TestBotElement'

const isLocal = process.env.RUN_MODE === 'local'
console.log(
    `Running Weight Observation flow in ${
        isLocal ? 'LOCAL PHYSICAL DEVICE' : 'BROWSERSTACK CLOUD'
    } mode`
)

// ─────────────────────────────────────────────
// Full list of care recipients
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
// Page source dump on failure
// ─────────────────────────────────────────────

async function dumpPageSourceOnFailure(stepLabel: string) {
    console.error(`Failure at ${stepLabel} — dumping page source`)

    try {
        const pageSource = await driver.getPageSource()

        console.log(
            `─────────── PAGE SOURCE: ${stepLabel} ───────────`
        )
        console.log(pageSource)
        console.log(
            '─────────────────────────────────────────────'
        )

        try {
            const fs = require('fs')
            const path = require('path')

            const safeName = stepLabel.replace(/[^a-z0-9.]+/gi, '_')
            const outDir = path.resolve(__dirname, '../../../../run')

            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir, { recursive: true })
            }

            fs.writeFileSync(
                path.join(
                    outDir,
                    `weight_obs_failure_${safeName}.xml`
                ),
                pageSource,
                'utf-8'
            )
        } catch (writeErr) {
            console.warn(
                'Could not write page source to disk:',
                writeErr
            )
        }
    } catch (srcErr) {
        console.error(
            `getPageSource ALSO failed (${
                srcErr instanceof Error
                    ? srcErr.message
                    : srcErr
            }) — session likely dead.`
        )
    }
}

// ─────────────────────────────────────────────
// Random resident selection
// ─────────────────────────────────────────────

async function selectRandomResident(): Promise<string> {
    console.log(
        '▶ Scanning screen for all currently visible care recipients...'
    )

    const visibleCandidates: string[] = []

    for (const candidateName of CARE_RECIPIENTS) {
        const locator = residentLocator(candidateName)

        const isPresent = await testBot
            .isVisible(locator)
            .catch(() => false)

        if (isPresent) {
            visibleCandidates.push(candidateName)
        }
    }

    console.log(
        `▶ Found ${visibleCandidates.length} visible candidate(s):`,
        visibleCandidates
    )

    if (visibleCandidates.length === 0) {
        console.warn(
            'No candidates visible without scrolling — using scroll fallback'
        )

        const shuffled = [...CARE_RECIPIENTS].sort(
            () => Math.random() - 0.5
        )

        for (const candidateName of shuffled) {
            try {
                const scrolled = await $(
                    'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
                        `.scrollIntoView(new UiSelector().textMatches("^${candidateName}$"))`
                )

                if (await scrolled.isExisting()) {
                    await scrolled.click()

                    console.log(
                        `▶ Selected resident: "${candidateName}"`
                    )

                    return candidateName
                }
            } catch (err) {
                console.warn(
                    `"${candidateName}" not found — trying next`
                )
            }
        }

        await dumpPageSourceOnFailure(
            'selectRandomResident - no candidate found'
        )

        throw new Error(
            'Could not select any resident from CARE_RECIPIENTS'
        )
    }

    const randomIndex = Math.floor(
        Math.random() * visibleCandidates.length
    )

    const chosenName = visibleCandidates[randomIndex]

    console.log(
        `▶ Randomly chosen resident: "${chosenName}"`
    )

    await testBot.click(residentLocator(chosenName))

    console.log(
        `▶ Selected resident: "${chosenName}"`
    )

    return chosenName
}

// ─────────────────────────────────────────────
// Weight test data
// ─────────────────────────────────────────────

const WEIGHT_MIN = 20
const WEIGHT_MAX = 500

const BOUNDARY_VALID_VALUES = [
    String(WEIGHT_MIN),
    String(WEIGHT_MIN + 1),
    '260',
    String(WEIGHT_MAX - 1),
    String(WEIGHT_MAX),
]

const BOUNDARY_INVALID_VALUES = [
    String(WEIGHT_MIN - 1),
    String(WEIGHT_MAX + 1),
    '0',
    '-5',
    'abc',
    '20.5.5',
    '999999',
    '   ',
]

const BLANK_VALUE = ''

function pickRandomFrom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

// ─────────────────────────────────────────────
// Selectors
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

    expandAllSectionsButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="\uE0A4"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name=""]'
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

    weightInputField: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeTextField'
        ),
    } as TestBotElement,

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

    // ─────────────────────────────────────────
    // Close button on Earlier screen
    // ─────────────────────────────────────────

    closeButton: {
        android: AndroidLocatorBuilder.xpath(
            '(//android.widget.Button[@text=""])[1] | ' +
                '//android.widget.Button[@text="Close"] | ' +
                '//android.widget.ImageView[@content-desc="Close"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '(//XCUIElementTypeButton[@name=""])[1] | ' +
                '//XCUIElementTypeButton[@name="Close"]'
        ),
    } as TestBotElement,

    // ─────────────────────────────────────────
    // Earlier tab
    // ─────────────────────────────────────────

    earlierTab: {
        android: AndroidLocatorBuilder.xpath(
            '//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/ProfilePage"]/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup/android.widget.Button'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Earlier"]'
        ),
    } as TestBotElement,

    // ─────────────────────────────────────────
    // Destination screen
    // ─────────────────────────────────────────

    myCommunitiesTab: {
        android: AndroidLocatorBuilder.xpath(
            '//*[@text="My Communities"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//*[@name="My Communities"]'
        ),
    } as TestBotElement,

    baselineMessage: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[contains(@text,"baseline") or contains(@text,"Baseline")]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[contains(@name,"baseline") or contains(@name,"Baseline")]'
        ),
    } as TestBotElement,

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
// Validation message helper
// ─────────────────────────────────────────────

async function checkForMessage(
    label: string
): Promise<{
    baselineShown: boolean
    validationShown: boolean
}> {
    const baselineShown = await testBot
        .isVisible(selectors.baselineMessage)
        .catch(() => false)

    const validationShown = await testBot
        .isVisible(selectors.validationErrorMessage)
        .catch(() => false)

    console.log(
        `[${label}] baseline: ${baselineShown}, validation: ${validationShown}`
    )

    return {
        baselineShown,
        validationShown,
    }
}

// ─────────────────────────────────────────────
// Enter weight
// ─────────────────────────────────────────────

async function enterWeightValue(
    value: string
): Promise<void> {
    await testBot.waitUntilVisible(
        selectors.weightInputField,
        10000
    )

    await testBot.click(selectors.weightInputField)

    await driver.pause(300)

    try {
        await (
            await $(
                await (testBot as any).getLocatorTextForElement(
                    selectors.weightInputField
                )
            )
        ).clearValue()
    } catch (clearErr) {
        console.warn(
            'clearValue failed:',
            clearErr
        )
    }

    if (value !== '') {
        await testBot.enterText(
            selectors.weightInputField,
            value,
            false
        )
    }

    await driver.pause(500)

    try {
        await driver.hideKeyboard()
        await driver.pause(500)
    } catch (kbErr) {
        console.warn(
            'Keyboard already hidden:',
            kbErr
        )
    }
}

// ─────────────────────────────────────────────
// Select duration
// ─────────────────────────────────────────────

async function selectDurationOption(): Promise<boolean> {
    const DURATION_OPTIONS = [
        '5 mins',
        '10 mins',
        '15 mins',
        '20 mins',
        '30 mins',
        '45 mins',
        '60 mins',
    ]

    const randomDuration =
        DURATION_OPTIONS[
            Math.floor(
                Math.random() *
                    DURATION_OPTIONS.length
            )
        ]

    const durationXpath =
        `//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/DurationField"]` +
        `//android.widget.TextView[@text="${randomDuration}"]`

    console.log(
        `Selecting duration: "${randomDuration}"`
    )

    let durationEl = await $(
        durationXpath
    )

    for (let i = 0; i < 4; i++) {
        if (
            (await durationEl.isExisting()) &&
            (await durationEl.isDisplayed())
        ) {
            break
        }

        console.log(
            `Duration not visible — scrolling (${i + 1})`
        )

        const {
            width,
            height,
        } = await driver.getWindowSize()

        await driver.execute(
            'mobile: swipeGesture',
            {
                left: Math.floor(
                    width * 0.2
                ),
                top: Math.floor(
                    height * 0.6
                ),
                width: Math.floor(
                    width * 0.6
                ),
                height: Math.floor(
                    height * 0.3
                ),
                direction: 'up',
                percent: 0.5,
            }
        )

        await driver.pause(1200)

        durationEl = await $(
            durationXpath
        )
    }

    if (
        !(await durationEl.isExisting())
    ) {
        console.warn(
            `Could not find "${randomDuration}" — using Other Durations`
        )

        await handleOtherDurationsIfPresent(
            '10'
        )

        return await testBot
            .isVisible(
                selectors.confirmButton
            )
            .catch(() => false)
    }

    let confirmEnabled = false

    for (
        let attempt = 0;
        attempt < 3 &&
        !confirmEnabled;
        attempt++
    ) {
        durationEl = await $(
            durationXpath
        )

        await durationEl.click()

        console.log(
            `Tapped "${randomDuration}" — attempt ${
                attempt + 1
            }`
        )

        await driver.pause(1500)

        const confirmBtn =
            await $(
                '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/ConfirmButton"]'
            )

        confirmEnabled =
            await confirmBtn
                .waitForEnabled({
                    timeout: 5000,
                })
                .catch(
                    () => false
                )
    }

    return confirmEnabled
}

// ─────────────────────────────────────────────
// Other Durations
// ─────────────────────────────────────────────

async function handleOtherDurationsIfPresent(
    minutesValue: string
): Promise<void> {
    const isPresent =
        await testBot
            .isVisible(
                selectors.otherDurationsOption
            )
            .catch(() => false)

    if (!isPresent) {
        return
    }

    await testBot.click(
        selectors.otherDurationsOption
    )

    await driver.pause(1000)

    await testBot.waitUntilVisible(
        selectors.durationEntryField,
        5000
    )

    await testBot.click(
        selectors.durationEntryField
    )

    await testBot.enterText(
        selectors.durationEntryField,
        minutesValue,
        false
    )

    await driver.pause(500)

    try {
        await driver.hideKeyboard()
        await driver.pause(500)
    } catch (err) {
        console.warn(
            'Keyboard already hidden'
        )
    }

    await testBot.waitUntilVisible(
        selectors.confirmButton,
        5000
    )

    await testBot.click(
        selectors.confirmButton
    )

    await driver.pause(1500)
}

// ─────────────────────────────────────────────
// Return to Weight Entry Screen
// ─────────────────────────────────────────────

async function returnToWeightEntryScreenForResident(
    residentName: string
): Promise<void> {
    try {
        const locator =
            residentLocator(
                residentName
            )

        let residentFound =
            await testBot
                .isVisible(locator)
                .catch(() => false)

        if (!residentFound) {
            console.log(
                `"${residentName}" not immediately visible — scrolling`
            )

            try {
                const scrolled =
                    await $(
                        'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
                            `.scrollIntoView(new UiSelector().textMatches("^${residentName}$"))`
                    )

                residentFound =
                    await scrolled.isExisting()
            } catch (scrollErr) {
                console.warn(
                    'Scroll failed:',
                    scrollErr
                )
            }
        }

        if (!residentFound) {
            throw new Error(
                `Could not find resident "${residentName}"`
            )
        }

        await testBot.click(locator)

        await driver.pause(2000)

        await testBot.waitUntilVisible(
            selectors.adhocButton,
            5000
        )

        await testBot.click(
            selectors.adhocButton
        )

        await driver.pause(2000)

        try {
            await testBot.waitUntilVisible(
                selectors.expandAllSectionsButton,
                5000
            )

            await testBot.click(
                selectors.expandAllSectionsButton
            )

            await driver.pause(2000)
        } catch (err) {
            console.warn(
                'Expand-all not available'
            )
        }

        let weighFound =
            await testBot
                .isVisible(
                    selectors.weighText
                )
                .catch(() => false)

        if (!weighFound) {
            try {
                const scrolled =
                    await $(
                        'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
                            '.scrollIntoView(new UiSelector().textMatches("^Weigh$"))'
                    )

                weighFound =
                    await scrolled.isExisting()
            } catch (err) {
                console.warn(
                    'Unable to scroll to Weigh'
                )
            }
        }

        if (!weighFound) {
            throw new Error(
                'Could not find Weigh option'
            )
        }

        await testBot.click(
            selectors.weighText
        )

        await driver.pause(1000)

        await testBot.waitUntilVisible(
            selectors.nextButton,
            5000
        )

        await testBot.click(
            selectors.nextButton
        )

        await driver.pause(2000)

        await testBot.waitUntilVisible(
            selectors.weightInputField,
            10000
        )

        console.log(
            'Reached weight input screen'
        )
    } catch (err) {
        await dumpPageSourceOnFailure(
            'returnToWeightEntryScreenForResident'
        )

        throw err
    }
}

// ─────────────────────────────────────────────
// Initial navigation
// ─────────────────────────────────────────────

async function navigateToWeightEntryScreen(): Promise<string> {
    let selectedResident = ''

    try {
        selectedResident =
            await selectRandomResident()

        await driver.pause(2000)

        await testBot.waitUntilVisible(
            selectors.adhocButton,
            5000
        )

        await testBot.click(
            selectors.adhocButton
        )

        await driver.pause(2000)

        try {
            await testBot.waitUntilVisible(
                selectors.expandAllSectionsButton,
                5000
            )

            await testBot.click(
                selectors.expandAllSectionsButton
            )

            await driver.pause(2000)
        } catch (err) {
            console.warn(
                'Expand-all unavailable'
            )
        }

        let weighFound =
            await testBot
                .isVisible(
                    selectors.weighText
                )
                .catch(() => false)

        if (!weighFound) {
            try {
                const scrolled =
                    await $(
                        'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
                            '.scrollIntoView(new UiSelector().textMatches("^Weigh$"))'
                    )

                weighFound =
                    await scrolled.isExisting()
            } catch (err) {
                console.warn(
                    'Scroll to Weigh failed'
                )
            }
        }

        if (!weighFound) {
            throw new Error(
                'Could not find Weigh option'
            )
        }

        await testBot.click(
            selectors.weighText
        )

        await driver.pause(1000)

        await testBot.waitUntilVisible(
            selectors.nextButton,
            5000
        )

        await testBot.click(
            selectors.nextButton
        )

        await driver.pause(2000)

        await testBot.waitUntilVisible(
            selectors.weightInputField,
            10000
        )

        console.log(
            'Reached weight input screen'
        )
    } catch (err) {
        await dumpPageSourceOnFailure(
            'navigateToWeightEntryScreen'
        )

        throw err
    }

    return selectedResident
}

// ─────────────────────────────────────────────
// FINAL NAVIGATION
// ─────────────────────────────────────────────
//
// Flow:
// Create Records
//      ↓
// Earlier
//      ↓
// Close
//      ↓
// Earlier screen should disappear
//      ↓
// My Communities should appear
// ─────────────────────────────────────────────

async function closeEarlierAndVerifyRedirect(): Promise<void> {
    console.log(
        '▶ Starting final Close and Redirect flow'
    )

    // 1. Open Earlier
    await testBot.waitUntilVisible(
        selectors.earlierTab,
        10000
    )

    await testBot.click(
        selectors.earlierTab
    )

    await driver.pause(2000)

    console.log(
        '▶ Earlier screen opened'
    )

    // 2. Make sure Close button exists
    await testBot.waitUntilVisible(
        selectors.closeButton,
        5000
    )

    console.log(
        '▶ Close button is visible'
    )

    // 3. Click Close
    await testBot.click(
        selectors.closeButton
    )

    console.log(
        '▶ Close button clicked'
    )

    await driver.pause(2000)

    // 4. IMPORTANT:
    // Confirm that the Earlier/Close screen is no longer visible.
    const closeButtonStillVisible =
        await testBot
            .isVisible(
                selectors.closeButton
            )
            .catch(() => false)

    if (closeButtonStillVisible) {
        throw new Error(
            'Close button is still visible after clicking Close. Navigation did not complete.'
        )
    }

    console.log(
        '✓ Earlier screen successfully closed'
    )

    // 5. Verify redirect to My Communities
    await testBot.waitUntilVisible(
        selectors.myCommunitiesTab,
        30000
    )

    console.log(
        '✓ Successfully redirected to My Communities'
    )

    // 6. Final verification
    const communitiesVisible =
        await testBot
            .isVisible(
                selectors.myCommunitiesTab
            )
            .catch(() => false)

    if (!communitiesVisible) {
        throw new Error(
            'My Communities screen is not visible after Close'
        )
    }

    console.log(
        '✓ Final destination verified: My Communities'
    )
}

// ═══════════════════════════════════════════════
// SMOKE TEST
// ═══════════════════════════════════════════════

describe(
    'Resident Area Profile - Observations - Weight - SMOKE TEST',
    () => {
        it(
            'Smoke Step 1 - Navigate to Weight entry screen',
            async function () {
                await navigateToWeightEntryScreen()
            }
        )

        it(
            'Smoke Step 2 - Leaving value blank shows expected validation',
            async function () {
                try {
                    await enterWeightValue(
                        BLANK_VALUE
                    )

                    const {
                        validationShown,
                    } =
                        await checkForMessage(
                            'Smoke: blank value'
                        )

                    console.log(
                        `Blank validation shown: ${validationShown}`
                    )
                } catch (err) {
                    await dumpPageSourceOnFailure(
                        'Smoke Step 2'
                    )

                    throw err
                }
            }
        )

        it(
            'Smoke Step 3 - Invalid value shows expected validation',
            async function () {
                try {
                    const invalidValue =
                        pickRandomFrom(
                            BOUNDARY_INVALID_VALUES
                        )

                    console.log(
                        `Testing invalid value: "${invalidValue}"`
                    )

                    await enterWeightValue(
                        invalidValue
                    )

                    const {
                        validationShown,
                    } =
                        await checkForMessage(
                            `Smoke: invalid ${invalidValue}`
                        )

                    console.log(
                        `Invalid validation shown: ${validationShown}`
                    )
                } catch (err) {
                    await dumpPageSourceOnFailure(
                        'Smoke Step 3'
                    )

                    throw err
                }
            }
        )

        it(
            'Smoke Step 4 - Valid value is accepted',
            async function () {
                try {
                    await enterWeightValue(
                        '260'
                    )

                    const {
                        validationShown,
                    } =
                        await checkForMessage(
                            'Smoke: valid value'
                        )

                    if (
                        validationShown
                    ) {
                        throw new Error(
                            'Validation message unexpectedly displayed for valid value'
                        )
                    }
                } catch (err) {
                    await dumpPageSourceOnFailure(
                        'Smoke Step 4'
                    )

                    throw err
                }
            }
        )

        it(
            'Smoke Step 5 - Complete record and redirect after Close',
            async function () {
                try {
                    const confirmEnabled =
                        await selectDurationOption()

                    if (
                        !confirmEnabled
                    ) {
                        throw new Error(
                            'Continue button did not become enabled'
                        )
                    }

                    await testBot.waitUntilVisible(
                        selectors.confirmButton,
                        5000
                    )

                    await testBot.click(
                        selectors.confirmButton
                    )

                    console.log(
                        '✓ Clicked Continue'
                    )

                    await driver.pause(
                        2000
                    )

                    // Create Records
                    await testBot.waitUntilVisible(
                        selectors.createRecordsButton,
                        10000
                    )

                    await testBot.click(
                        selectors.createRecordsButton
                    )

                    console.log(
                        '✓ Clicked Create Records'
                    )

                    await driver.pause(
                        2000
                    )

                    // Final navigation
                    await closeEarlierAndVerifyRedirect()

                    console.log(
                        '✓ Smoke test completed successfully'
                    )
                } catch (err) {
                    await dumpPageSourceOnFailure(
                        'Smoke Step 5'
                    )

                    throw err
                }
            }
        )
    }
)

// ═══════════════════════════════════════════════
// THOROUGH TEST
// ═══════════════════════════════════════════════

describe(
    'Resident Area Profile - Observations - Weight - THOROUGH',
    () => {
        let residentName = ''

        it(
            'Thorough Step 1 - Select resident and test blank value',
            async function () {
                try {
                    residentName =
                        await navigateToWeightEntryScreen()

                    console.log(
                        `▶ Thorough suite resident: "${residentName}"`
                    )

                    await enterWeightValue(
                        BLANK_VALUE
                    )

                    const {
                        validationShown,
                    } =
                        await checkForMessage(
                            'Thorough: blank value'
                        )

                    expect(
                        validationShown
                    ).toBe(true)
                } catch (err) {
                    await dumpPageSourceOnFailure(
                        'Thorough Step 1'
                    )

                    throw err
                }
            }
        )

        BOUNDARY_INVALID_VALUES.forEach(
            (
                invalidValue,
                index
            ) => {
                it(
                    `Thorough Step 2.${
                        index + 1
                    } - Invalid value "${invalidValue}"`,
                    async function () {
                        try {
                            await returnToWeightEntryScreenForResident(
                                residentName
                            )

                            await enterWeightValue(
                                invalidValue
                            )

                            const {
                                validationShown,
                            } =
                                await checkForMessage(
                                    `Invalid ${invalidValue}`
                                )

                            expect(
                                validationShown
                            ).toBe(true)
                        } catch (err) {
                            await dumpPageSourceOnFailure(
                                `Thorough invalid ${invalidValue}`
                            )

                            throw err
                        }
                    }
                )
            }
        )

        BOUNDARY_VALID_VALUES.forEach(
            (
                validValue,
                index
            ) => {
                it(
                    `Thorough Step 3.${
                        index + 1
                    } - Valid value "${validValue}"`,
                    async function () {
                        try {
                            await returnToWeightEntryScreenForResident(
                                residentName
                            )

                            await enterWeightValue(
                                validValue
                            )

                            const {
                                validationShown,
                            } =
                                await checkForMessage(
                                    `Valid ${validValue}`
                                )

                            expect(
                                validationShown
                            ).toBe(false)
                        } catch (err) {
                            await dumpPageSourceOnFailure(
                                `Thorough valid ${validValue}`
                            )

                            throw err
                        }
                    }
                )
            }
        )

        it(
            'Thorough Step 4 - Baseline message for valid entry',
            async function () {
                try {
                    await returnToWeightEntryScreenForResident(
                        residentName
                    )

                    await enterWeightValue(
                        '260'
                    )

                    await selectDurationOption()

                    const {
                        baselineShown,
                    } =
                        await checkForMessage(
                            'Baseline message'
                        )

                    console.log(
                        `Baseline message shown: ${baselineShown}`
                    )
                } catch (err) {
                    await dumpPageSourceOnFailure(
                        'Thorough Step 4'
                    )

                    throw err
                }
            }
        )

        it(
            'Thorough Step 5 - Complete record and redirect after Close',
            async function () {
                try {
                    // Return to Weight screen
                    await returnToWeightEntryScreenForResident(
                        residentName
                    )

                    // Enter valid weight
                    await enterWeightValue(
                        '260'
                    )

                    await driver.pause(
                        1000
                    )

                    // Select duration
                    const confirmEnabled =
                        await selectDurationOption()

                    if (
                        !confirmEnabled
                    ) {
                        throw new Error(
                            'Continue button did not become enabled'
                        )
                    }

                    // Continue
                    await testBot.waitUntilVisible(
                        selectors.confirmButton,
                        5000
                    )

                    await testBot.click(
                        selectors.confirmButton
                    )

                    console.log(
                        '✓ Clicked Continue'
                    )

                    await driver.pause(
                        2000
                    )

                    // Create Records
                    await testBot.waitUntilVisible(
                        selectors.createRecordsButton,
                        10000
                    )

                    await testBot.click(
                        selectors.createRecordsButton
                    )

                    console.log(
                        '✓ Clicked Create Records'
                    )

                    await driver.pause(
                        2000
                    )

                    // ─────────────────────────
                    // Close Earlier screen
                    // and verify redirect
                    // ─────────────────────────

                    await closeEarlierAndVerifyRedirect()

                    console.log(
                        '✓ Thorough test completed successfully'
                    )
                } catch (err) {
                    await dumpPageSourceOnFailure(
                        'Thorough Step 5'
                    )

                    throw err
                }
            }
        )
    }
)
