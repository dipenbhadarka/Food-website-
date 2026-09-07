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

// ═══════════════════════════════════════════════
// CARE RECIPIENTS
// ═══════════════════════════════════════════════

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

// ═══════════════════════════════════════════════
// WEIGHT BOUNDARY VALUE ANALYSIS
//
// Accepted range: 20 - 500
//
// 19  = Min - 1 → INVALID
// 20  = Min     → VALID
// 21  = Min + 1 → VALID
// 260 = Normal  → VALID
// 499 = Max - 1 → VALID
// 500 = Max     → VALID
// 501 = Max + 1 → INVALID
// ═══════════════════════════════════════════════

const WEIGHT_MIN = 20
const WEIGHT_MAX = 500

interface WeightBoundaryCase {
    value: string
    expectedValid: boolean
    description: string
}

const WEIGHT_BOUNDARY_CASES: WeightBoundaryCase[] = [
    {
        value: String(WEIGHT_MIN - 1),
        expectedValid: false,
        description: 'Minimum - 1',
    },
    {
        value: String(WEIGHT_MIN),
        expectedValid: true,
        description: 'Minimum boundary',
    },
    {
        value: String(WEIGHT_MIN + 1),
        expectedValid: true,
        description: 'Minimum + 1',
    },
    {
        value: '260',
        expectedValid: true,
        description: 'Normal valid value',
    },
    {
        value: String(WEIGHT_MAX - 1),
        expectedValid: true,
        description: 'Maximum - 1',
    },
    {
        value: String(WEIGHT_MAX),
        expectedValid: true,
        description: 'Maximum boundary',
    },
    {
        value: String(WEIGHT_MAX + 1),
        expectedValid: false,
        description: 'Maximum + 1',
    },
]

const FINAL_VALID_WEIGHT = '260'

// ═══════════════════════════════════════════════
// RESIDENT LOCATOR
// ═══════════════════════════════════════════════

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

// ═══════════════════════════════════════════════
// PAGE SOURCE DUMP
// ═══════════════════════════════════════════════

async function dumpPageSourceOnFailure(
    stepLabel: string
): Promise<void> {
    console.error(
        `Failure at ${stepLabel} — dumping page source`
    )

    try {
        const pageSource =
            await driver.getPageSource()

        console.log(
            `──────── PAGE SOURCE: ${stepLabel} ────────`
        )

        console.log(pageSource)

        console.log(
            '────────────────────────────────────────'
        )

        try {
            const fs = require('fs')
            const path = require('path')

            const safeName =
                stepLabel.replace(
                    /[^a-z0-9.]+/gi,
                    '_'
                )

            const outDir =
                path.resolve(
                    __dirname,
                    '../../../../run'
                )

            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(
                    outDir,
                    {
                        recursive: true,
                    }
                )
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
                'Could not save page source:',
                writeErr
            )
        }
    } catch (srcErr) {
        console.error(
            'Could not get page source:',
            srcErr
        )
    }
}

// ═══════════════════════════════════════════════
// SELECTORS
// ═══════════════════════════════════════════════

const selectors = {

    // ─────────────────────────────────────────
    // ADHOC
    // ─────────────────────────────────────────

    adhocButton: {
        android:
            AndroidLocatorBuilder.xpath(
                '//android.widget.TextView[@text="Adhoc"]'
            ),

        ios:
            iOSLocatorBuilder.xpath(
                '//XCUIElementTypeStaticText[@name="Adhoc"]'
            ),
    } as TestBotElement,

    // ─────────────────────────────────────────
    // EXPAND ALL
    // ─────────────────────────────────────────

    expandAllSectionsButton: {
        android:
            AndroidLocatorBuilder.xpath(
                '//android.widget.Button[@text="\uE0A4"]'
            ),

        ios:
            iOSLocatorBuilder.xpath(
                '//XCUIElementTypeButton[@name=""]'
            ),
    } as TestBotElement,

    // ─────────────────────────────────────────
    // WEIGH
    // ─────────────────────────────────────────

    weighText: {
        android:
            AndroidLocatorBuilder.xpath(
                '//android.widget.TextView[@text="Weigh"]'
            ),

        ios:
            iOSLocatorBuilder.xpath(
                '//XCUIElementTypeStaticText[@name="Weigh"]'
            ),
    } as TestBotElement,

    // ─────────────────────────────────────────
    // NEXT
    // ─────────────────────────────────────────

    nextButton: {
        android:
            AndroidLocatorBuilder.xpath(
                '//android.widget.Button[@text="Next"]'
            ),

        ios:
            iOSLocatorBuilder.xpath(
                '//XCUIElementTypeButton[@name="Next"]'
            ),
    } as TestBotElement,

    // ─────────────────────────────────────────
    // WEIGHT INPUT
    // ─────────────────────────────────────────

    weightInputField: {
        android:
            AndroidLocatorBuilder.xpath(
                '//android.widget.EditText'
            ),

        ios:
            iOSLocatorBuilder.xpath(
                '//XCUIElementTypeTextField'
            ),
    } as TestBotElement,

    // ─────────────────────────────────────────
    // VALIDATION MESSAGE
    // ─────────────────────────────────────────

    validationErrorMessage: {
        android:
            AndroidLocatorBuilder.xpath(
                '//android.widget.TextView[' +
                'contains(@text,"invalid") or ' +
                'contains(@text,"Invalid") or ' +
                'contains(@text,"must be") or ' +
                'contains(@text,"between") or ' +
                'contains(@text,"20") or ' +
                'contains(@text,"500")' +
                ']'
            ),

        ios:
            iOSLocatorBuilder.xpath(
                '//XCUIElementTypeStaticText[' +
                'contains(@name,"invalid") or ' +
                'contains(@name,"Invalid") or ' +
                'contains(@name,"must be") or ' +
                'contains(@name,"between") or ' +
                'contains(@name,"20") or ' +
                'contains(@name,"500")' +
                ']'
            ),
    } as TestBotElement,

    // ─────────────────────────────────────────
    // OTHER DURATIONS
    // ─────────────────────────────────────────

    otherDurationsOption: {
        android:
            AndroidLocatorBuilder.xpath(
                '(//android.widget.TextView[@text="Other Durations"])[1]'
            ),

        ios:
            iOSLocatorBuilder.xpath(
                '(//XCUIElementTypeStaticText[@name="Other Durations"])[1]'
            ),
    } as TestBotElement,

    // ─────────────────────────────────────────
    // DURATION ENTRY
    // ─────────────────────────────────────────

    durationEntryField: {
        android:
            AndroidLocatorBuilder.xpath(
                '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/DurationEntry"]'
            ),

        ios:
            iOSLocatorBuilder.xpath(
                '//XCUIElementTypeTextField[@name="DurationEntry"]'
            ),
    } as TestBotElement,

    // ─────────────────────────────────────────
    // CONTINUE
    // ─────────────────────────────────────────

    confirmButton: {
        android:
            AndroidLocatorBuilder.xpath(
                '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/ConfirmButton"]'
            ),

        ios:
            iOSLocatorBuilder.xpath(
                '//XCUIElementTypeButton[@name="ConfirmButton"]'
            ),
    } as TestBotElement,

    // ─────────────────────────────────────────
    // CREATE RECORDS
    // ─────────────────────────────────────────

    createRecordsButton: {
        android:
            AndroidLocatorBuilder.xpath(
                '//android.widget.Button[@text="Create Records"]'
            ),

        ios:
            iOSLocatorBuilder.xpath(
                '//XCUIElementTypeButton[@name="Create Records"]'
            ),
    } as TestBotElement,

    // ═════════════════════════════════════════
    // BOTTOM CLOSE AFTER CARE NOTE
    // ═════════════════════════════════════════

    careNoteBottomCloseButton: {
        android:
            AndroidLocatorBuilder.xpath(
                '//android.widget.Button[@text="Close"]'
            ),

        ios:
            iOSLocatorBuilder.xpath(
                '//XCUIElementTypeButton[@name="Close"]'
            ),
    } as TestBotElement,

    // ═════════════════════════════════════════
    // EARLIER TAB
    // ═════════════════════════════════════════

    earlierTab: {
        android:
            AndroidLocatorBuilder.xpath(
                '//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/ProfilePage"]' +
                '/android.view.ViewGroup' +
                '/android.view.ViewGroup[2]' +
                '/android.view.ViewGroup' +
                '/android.view.ViewGroup' +
                '/android.view.ViewGroup' +
                '/android.view.ViewGroup[1]' +
                '/android.view.ViewGroup' +
                '/android.widget.Button'
            ),

        ios:
            iOSLocatorBuilder.xpath(
                '//XCUIElementTypeButton[@name="Earlier"]'
            ),
    } as TestBotElement,

    // ═════════════════════════════════════════
    // RIGHT-SIDE CLOSE ICON ON EARLIER PAGE
    // ═════════════════════════════════════════

    earlierRightCloseIcon: {
        android:
            AndroidLocatorBuilder.xpath(
                '(//android.widget.Button[@text=""])[1] | ' +
                '//android.widget.Button[@content-desc="Close"] | ' +
                '//android.widget.ImageView[@content-desc="Close"]'
            ),

        ios:
            iOSLocatorBuilder.xpath(
                '(//XCUIElementTypeButton[@name=""])[1] | ' +
                '//XCUIElementTypeButton[@name="Close"]'
            ),
    } as TestBotElement,

    // ═════════════════════════════════════════
    // MY COMMUNITIES
    // ═════════════════════════════════════════

    myCommunitiesTab: {
        android:
            AndroidLocatorBuilder.xpath(
                '//*[@text="My Communities"]'
            ),

        ios:
            iOSLocatorBuilder.xpath(
                '//*[@name="My Communities"]'
            ),
    } as TestBotElement,
}

// ═══════════════════════════════════════════════
// SELECT RANDOM RESIDENT
// ═══════════════════════════════════════════════

async function selectRandomResident(): Promise<string> {

    console.log(
        '▶ Searching for visible care recipients...'
    )

    const visibleResidents: string[] = []

    for (const name of CARE_RECIPIENTS) {

        const visible =
            await testBot
                .isVisible(
                    residentLocator(name)
                )
                .catch(() => false)

        if (visible) {
            visibleResidents.push(name)
        }
    }

    // ─────────────────────────────────────────
    // Visible resident available
    // ─────────────────────────────────────────

    if (visibleResidents.length > 0) {

        const randomIndex =
            Math.floor(
                Math.random() *
                visibleResidents.length
            )

        const selectedName =
            visibleResidents[randomIndex]

        console.log(
            `▶ Selected resident: "${selectedName}"`
        )

        await testBot.click(
            residentLocator(selectedName)
        )

        await driver.pause(2000)

        return selectedName
    }

    // ─────────────────────────────────────────
    // Scroll fallback
    // ─────────────────────────────────────────

    console.log(
        '▶ No resident immediately visible — scrolling'
    )

    const shuffledResidents =
        [...CARE_RECIPIENTS].sort(
            () => Math.random() - 0.5
        )

    for (
        const candidateName
        of shuffledResidents
    ) {
        try {

            const element =
                await $(
                    'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
                    `.scrollIntoView(new UiSelector().textMatches("^${candidateName}$"))`
                )

            if (
                await element.isExisting()
            ) {
                await element.click()

                console.log(
                    `▶ Selected resident after scrolling: "${candidateName}"`
                )

                await driver.pause(2000)

                return candidateName
            }

        } catch (err) {

            console.warn(
                `"${candidateName}" not found`
            )
        }
    }

    await dumpPageSourceOnFailure(
        'selectRandomResident'
    )

    throw new Error(
        'No care recipient could be selected'
    )
}

// ═══════════════════════════════════════════════
// ENTER WEIGHT
// ═══════════════════════════════════════════════

async function enterWeightValue(
    value: string
): Promise<void> {

    await testBot.waitUntilVisible(
        selectors.weightInputField,
        10000
    )

    await testBot.click(
        selectors.weightInputField
    )

    await driver.pause(300)

    // Clear previous value
    try {

        const inputElement =
            await $(
                await (
                    testBot as any
                ).getLocatorTextForElement(
                    selectors.weightInputField
                )
            )

        await inputElement.clearValue()

    } catch (clearErr) {

        console.warn(
            'clearValue failed:',
            clearErr
        )
    }

    await testBot.enterText(
        selectors.weightInputField,
        value,
        false
    )

    await driver.pause(600)

    try {

        await driver.hideKeyboard()

        await driver.pause(500)

    } catch (err) {

        console.log(
            'Keyboard already hidden'
        )
    }
}

// ═══════════════════════════════════════════════
// CHECK VALIDATION
// ═══════════════════════════════════════════════

async function isValidationVisible():
Promise<boolean> {

    return await testBot
        .isVisible(
            selectors.validationErrorMessage
        )
        .catch(() => false)
}

// ═══════════════════════════════════════════════
// BOUNDARY VALUE ANALYSIS
// ═══════════════════════════════════════════════

async function runBoundaryValueAnalysis():
Promise<void> {

    console.log(
        '════════════════════════════════════'
    )

    console.log(
        '▶ STARTING WEIGHT BOUNDARY VALUE ANALYSIS'
    )

    console.log(
        `▶ Accepted range: ${WEIGHT_MIN} - ${WEIGHT_MAX}`
    )

    console.log(
        '════════════════════════════════════'
    )

    for (
        const testCase
        of WEIGHT_BOUNDARY_CASES
    ) {

        console.log(
            `▶ Testing ${testCase.description}`
        )

        console.log(
            `▶ Weight value: ${testCase.value}`
        )

        await enterWeightValue(
            testCase.value
        )

        await driver.pause(700)

        const validationVisible =
            await isValidationVisible()

        // ─────────────────────────────────────
        // EXPECTED VALID
        // ─────────────────────────────────────

        if (
            testCase.expectedValid
        ) {

            if (
                validationVisible
            ) {

                throw new Error(
                    `BVA FAILED: ` +
                    `"${testCase.value}" ` +
                    `(${testCase.description}) ` +
                    `should be VALID but validation message was displayed`
                )
            }

            console.log(
                `✓ PASS: ${testCase.value} is accepted`
            )
        }

        // ─────────────────────────────────────
        // EXPECTED INVALID
        // ─────────────────────────────────────

        else {

            if (
                !validationVisible
            ) {

                throw new Error(
                    `BVA FAILED: ` +
                    `"${testCase.value}" ` +
                    `(${testCase.description}) ` +
                    `should be INVALID but validation was not displayed`
                )
            }

            console.log(
                `✓ PASS: ${testCase.value} correctly rejected`
            )
        }

        await driver.pause(500)
    }

    console.log(
        '════════════════════════════════════'
    )

    console.log(
        '✓ ALL BOUNDARY VALUE TESTS PASSED'
    )

    console.log(
        '════════════════════════════════════'
    )
}

// ═══════════════════════════════════════════════
// NAVIGATE TO WEIGHT
// ═══════════════════════════════════════════════

async function navigateToWeightEntryScreen():
Promise<string> {

    try {

        // ─────────────────────────────────────
        // Resident
        // ─────────────────────────────────────

        const residentName =
            await selectRandomResident()

        // ─────────────────────────────────────
        // Adhoc
        // ─────────────────────────────────────

        await testBot.waitUntilVisible(
            selectors.adhocButton,
            5000
        )

        await testBot.click(
            selectors.adhocButton
        )

        console.log(
            '✓ Clicked Adhoc'
        )

        await driver.pause(2000)

        // ─────────────────────────────────────
        // Expand all
        // ─────────────────────────────────────

        try {

            await testBot.waitUntilVisible(
                selectors.expandAllSectionsButton,
                5000
            )

            await testBot.click(
                selectors.expandAllSectionsButton
            )

            console.log(
                '✓ Expanded all sections'
            )

            await driver.pause(1500)

        } catch (err) {

            console.warn(
                'Expand-all button unavailable — continuing'
            )
        }

        // ─────────────────────────────────────
        // Weigh
        // ─────────────────────────────────────

        let weighVisible =
            await testBot
                .isVisible(
                    selectors.weighText
                )
                .catch(() => false)

        if (!weighVisible) {

            console.log(
                '▶ Weigh not visible — scrolling'
            )

            try {

                const weighElement =
                    await $(
                        'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
                        '.scrollIntoView(new UiSelector().textMatches("^Weigh$"))'
                    )

                weighVisible =
                    await weighElement.isExisting()

            } catch (err) {

                console.warn(
                    'Unable to scroll to Weigh'
                )
            }
        }

        if (!weighVisible) {

            throw new Error(
                'Weigh option not found'
            )
        }

        await testBot.click(
            selectors.weighText
        )

        console.log(
            '✓ Clicked Weigh'
        )

        await driver.pause(1000)

        // ─────────────────────────────────────
        // Next
        // ─────────────────────────────────────

        await testBot.waitUntilVisible(
            selectors.nextButton,
            5000
        )

        await testBot.click(
            selectors.nextButton
        )

        console.log(
            '✓ Clicked Next'
        )

        await driver.pause(2000)

        // ─────────────────────────────────────
        // Weight input
        // ─────────────────────────────────────

        await testBot.waitUntilVisible(
            selectors.weightInputField,
            10000
        )

        console.log(
            '✓ Weight entry screen displayed'
        )

        return residentName

    } catch (err) {

        await dumpPageSourceOnFailure(
            'navigateToWeightEntryScreen'
        )

        throw err
    }
}

// ═══════════════════════════════════════════════
// SELECT DURATION
// ═══════════════════════════════════════════════

async function selectDurationOption():
Promise<boolean> {

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

    console.log(
        `▶ Selecting duration: ${randomDuration}`
    )

    const durationXpath =
        `//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/DurationField"]` +
        `//android.widget.TextView[@text="${randomDuration}"]`

    let durationElement =
        await $(durationXpath)

    // ─────────────────────────────────────────
    // Find duration
    // ─────────────────────────────────────────

    for (
        let attempt = 0;
        attempt < 4;
        attempt++
    ) {

        if (
            await durationElement.isExisting() &&
            await durationElement.isDisplayed()
        ) {
            break
        }

        console.log(
            `▶ Scrolling for duration — attempt ${attempt + 1}`
        )

        const {
            width,
            height,
        } =
            await driver.getWindowSize()

        await driver.execute(
            'mobile: swipeGesture',
            {
                left:
                    Math.floor(
                        width * 0.2
                    ),

                top:
                    Math.floor(
                        height * 0.6
                    ),

                width:
                    Math.floor(
                        width * 0.6
                    ),

                height:
                    Math.floor(
                        height * 0.3
                    ),

                direction: 'up',

                percent: 0.5,
            }
        )

        await driver.pause(1000)

        durationElement =
            await $(durationXpath)
    }

    // ─────────────────────────────────────────
    // Fallback to Other Durations
    // ─────────────────────────────────────────

    if (
        !(await durationElement.isExisting())
    ) {

        console.warn(
            'Preset duration not found — trying Other Durations'
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

    // ─────────────────────────────────────────
    // Click duration
    // ─────────────────────────────────────────

    await durationElement.click()

    console.log(
        `✓ Selected duration: ${randomDuration}`
    )

    await driver.pause(1500)

    const confirmButton =
        await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/ConfirmButton"]'
        )

    const confirmEnabled =
        await confirmButton
            .waitForEnabled({
                timeout: 5000,
            })
            .catch(() => false)

    console.log(
        `▶ Continue enabled: ${confirmEnabled}`
    )

    return confirmEnabled
}

// ═══════════════════════════════════════════════
// OTHER DURATIONS
// ═══════════════════════════════════════════════

async function handleOtherDurationsIfPresent(
    minutes: string
): Promise<void> {

    const visible =
        await testBot
            .isVisible(
                selectors.otherDurationsOption
            )
            .catch(() => false)

    if (!visible) {
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
        minutes,
        false
    )

    try {
        await driver.hideKeyboard()
    } catch (err) {
        // Ignore
    }

    await driver.pause(500)
}

// ═══════════════════════════════════════════════
// CREATE CARE NOTE
// ═══════════════════════════════════════════════

async function createCareNote():
Promise<void> {

    // ─────────────────────────────────────────
    // Final valid weight
    // ─────────────────────────────────────────

    console.log(
        `▶ Entering final valid weight: ${FINAL_VALID_WEIGHT}`
    )

    await enterWeightValue(
        FINAL_VALID_WEIGHT
    )

    const validationVisible =
        await isValidationVisible()

    if (validationVisible) {

        throw new Error(
            `Final valid weight ${FINAL_VALID_WEIGHT} shows validation`
        )
    }

    console.log(
        '✓ Final valid weight accepted'
    )

    // ─────────────────────────────────────────
    // Duration
    // ─────────────────────────────────────────

    const confirmEnabled =
        await selectDurationOption()

    if (!confirmEnabled) {

        throw new Error(
            'Continue button was not enabled after selecting duration'
        )
    }

    // ─────────────────────────────────────────
    // Continue
    // ─────────────────────────────────────────

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

    await driver.pause(2000)

    // ─────────────────────────────────────────
    // Create Records
    // ─────────────────────────────────────────

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

    console.log(
        '✓ Care Note created'
    )

    await driver.pause(2000)
}

// ═══════════════════════════════════════════════
// FINAL CLOSE NAVIGATION
//
// Create Records
//       ↓
// Bottom Close
//       ↓
// Earlier
//       ↓
// Right-side Close icon
//       ↓
// My Communities
// ═══════════════════════════════════════════════

async function completeCloseNavigation():
Promise<void> {

    console.log(
        '════════ FINAL CLOSE FLOW ════════'
    )

    // ═════════════════════════════════════════
    // STEP 1
    // BOTTOM CLOSE BUTTON
    // ═════════════════════════════════════════

    console.log(
        '▶ Looking for bottom Close button'
    )

    await testBot.waitUntilVisible(
        selectors.careNoteBottomCloseButton,
        10000
    )

    await testBot.click(
        selectors.careNoteBottomCloseButton
    )

    console.log(
        '✓ Clicked bottom Close button'
    )

    await driver.pause(2000)

    // ═════════════════════════════════════════
    // STEP 2
    // EARLIER PAGE
    // ═════════════════════════════════════════

    console.log(
        '▶ Looking for Earlier'
    )

    await testBot.waitUntilVisible(
        selectors.earlierTab,
        10000
    )

    await testBot.click(
        selectors.earlierTab
    )

    console.log(
        '✓ Clicked Earlier'
    )

    await driver.pause(2000)

    // ═════════════════════════════════════════
    // STEP 3
    // RIGHT SIDE CLOSE ICON
    // ═════════════════════════════════════════

    console.log(
        '▶ Looking for right-side Close icon'
    )

    await testBot.waitUntilVisible(
        selectors.earlierRightCloseIcon,
        10000
    )

    await testBot.click(
        selectors.earlierRightCloseIcon
    )

    console.log(
        '✓ Clicked right-side Close icon'
    )

    await driver.pause(2000)

    // ═════════════════════════════════════════
    // STEP 4
    // VERIFY MY COMMUNITIES
    // ═════════════════════════════════════════

    await testBot.waitUntilVisible(
        selectors.myCommunitiesTab,
        30000
    )

    const myCommunitiesVisible =
        await testBot
            .isVisible(
                selectors.myCommunitiesTab
            )
            .catch(() => false)

    if (!myCommunitiesVisible) {

        throw new Error(
            'My Communities was not displayed after right-side Close'
        )
    }

    console.log(
        '✓ My Communities displayed'
    )

    console.log(
        '════════ CLOSE FLOW COMPLETE ════════'
    )
}

// ═══════════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════════

describe(
    'Resident Area Profile - Observations - Weight - Boundary Value Analysis',
    () => {

        let residentName = ''

        // ═══════════════════════════════════════
        // STEP 1
        // NAVIGATION
        // ═══════════════════════════════════════

        it(
            'Step 1 - Navigate to Weight entry screen',
            async function () {

                try {

                    residentName =
                        await navigateToWeightEntryScreen()

                    console.log(
                        `✓ Using resident: "${residentName}"`
                    )

                } catch (err) {

                    await dumpPageSourceOnFailure(
                        'Step 1 - Navigation'
                    )

                    throw err
                }
            }
        )

        // ═══════════════════════════════════════
        // STEP 2
        // BOUNDARY VALUE ANALYSIS
        // ═══════════════════════════════════════

        it(
            'Step 2 - Run Boundary Value Analysis for Weight 20-500',
            async function () {

                try {

                    await runBoundaryValueAnalysis()

                } catch (err) {

                    await dumpPageSourceOnFailure(
                        'Step 2 - Boundary Value Analysis'
                    )

                    throw err
                }
            }
        )

        // ═══════════════════════════════════════
        // STEP 3
        // CREATE CARE NOTE
        // ═══════════════════════════════════════

        it(
            'Step 3 - Create Care Note with valid weight',
            async function () {

                try {

                    await createCareNote()

                } catch (err) {

                    await dumpPageSourceOnFailure(
                        'Step 3 - Create Care Note'
                    )

                    throw err
                }
            }
        )

        // ═══════════════════════════════════════
        // STEP 4
        // BOTTOM CLOSE → EARLIER → RIGHT CLOSE
        // ═══════════════════════════════════════

        it(
            'Step 4 - Bottom Close, Earlier, right-side Close and verify My Communities',
            async function () {

                try {

                    await completeCloseNavigation()

                    console.log(
                        '✓ Weight Observation BVA test completed successfully'
                    )

                } catch (err) {

                    await dumpPageSourceOnFailure(
                        'Step 4 - Close Navigation'
                    )

                    throw err
                }
            }
        )
    }
)
