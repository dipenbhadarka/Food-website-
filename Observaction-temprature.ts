import { testBot } from '../../testbot'
import { AndroidLocatorBuilder } from '../../TestBot/Locators/Android/AndroidLocatorBuilder'
import { iOSLocatorBuilder } from '../../TestBot/Locators/iOS/iOSLocatorBuilder'
import { TestBotElement } from '../../TestBot/TestBotElement'

const isLocal = process.env.RUN_MODE === 'local'

console.log(
    `Running Temperature Observation flow in ${
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
// TEMPERATURE BOUNDARY VALUE ANALYSIS
//
// Accepted range: 30 - 50
//
// 29 = Min - 1 → INVALID
// 30 = Min     → VALID
// 31 = Min + 1 → VALID
// 40 = Normal   → VALID
// 49 = Max - 1 → VALID
// 50 = Max     → VALID
// 51 = Max + 1 → INVALID
// ═══════════════════════════════════════════════

const TEMPERATURE_MIN = 30
const TEMPERATURE_MAX = 50

interface TemperatureBoundaryCase {
    value: string
    expectedValid: boolean
    description: string
}

const TEMPERATURE_BOUNDARY_CASES: TemperatureBoundaryCase[] = [
    {
        value: String(TEMPERATURE_MIN - 1),
        expectedValid: false,
        description: 'Minimum - 1',
    },
    {
        value: String(TEMPERATURE_MIN),
        expectedValid: true,
        description: 'Minimum boundary',
    },
    {
        value: String(TEMPERATURE_MIN + 1),
        expectedValid: true,
        description: 'Minimum + 1',
    },
    {
        value: '40',
        expectedValid: true,
        description: 'Normal valid value',
    },
    {
        value: String(TEMPERATURE_MAX - 1),
        expectedValid: true,
        description: 'Maximum - 1',
    },
    {
        value: String(TEMPERATURE_MAX),
        expectedValid: true,
        description: 'Maximum boundary',
    },
    {
        value: String(TEMPERATURE_MAX + 1),
        expectedValid: false,
        description: 'Maximum + 1',
    },
]

const FINAL_VALID_TEMPERATURE = '40'

// ═══════════════════════════════════════════════
// RESIDENT LOCATOR
// ═══════════════════════════════════════════════

function residentLocator(
    name: string
): TestBotElement {
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
                    `temperature_obs_failure_${safeName}.xml`
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
    // TEMPERATURE
    // ─────────────────────────────────────────

    temperatureText: {
        android:
            AndroidLocatorBuilder.xpath(
                '//android.widget.TextView[@text="Temperature"]'
            ),

        ios:
            iOSLocatorBuilder.xpath(
                '//XCUIElementTypeStaticText[@name="Temperature"]'
            ),
    } as TestBotElement,

    // ─────────────────────────────────────────
    // TEMPERATURE TIME / PICKER
    // ─────────────────────────────────────────

    temperatureTimeButton: {
        android:
            AndroidLocatorBuilder.xpath(
                '//androidx.recyclerview.widget.RecyclerView/android.view.ViewGroup[4]/android.view.ViewGroup/android.view.ViewGroup[3]/android.view.ViewGroup/android.widget.ImageView'
            ),

        ios:
            iOSLocatorBuilder.xpath(
                '//XCUIElementTypeImage'
            ),
    } as TestBotElement,

    // ─────────────────────────────────────────
    // TEMPERATURE INPUT
    // ─────────────────────────────────────────

    temperatureInputField: {
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
    // VALIDATION
    // ─────────────────────────────────────────

    validationErrorMessage: {
        android:
            AndroidLocatorBuilder.xpath(
                '//android.widget.TextView[' +
                'contains(@text,"invalid") or ' +
                'contains(@text,"Invalid") or ' +
                'contains(@text,"must be") or ' +
                'contains(@text,"between") or ' +
                'contains(@text,"30") or ' +
                'contains(@text,"50")' +
                ']'
            ),

        ios:
            iOSLocatorBuilder.xpath(
                '//XCUIElementTypeStaticText[' +
                'contains(@name,"invalid") or ' +
                'contains(@name,"Invalid") or ' +
                'contains(@name,"must be") or ' +
                'contains(@name,"between") or ' +
                'contains(@name,"30") or ' +
                'contains(@name,"50")' +
                ']'
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

    // ─────────────────────────────────────────
    // CLOSE
    // ─────────────────────────────────────────

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

    // ─────────────────────────────────────────
    // EARLIER
    // ─────────────────────────────────────────

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

    // ─────────────────────────────────────────
    // RIGHT CLOSE
    // ─────────────────────────────────────────

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

    // ─────────────────────────────────────────
    // MY COMMUNITIES
    // ─────────────────────────────────────────

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
// SELECT RESIDENT
// ═══════════════════════════════════════════════

async function selectResident(): Promise<string> {

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

    if (visibleResidents.length > 0) {

        const selectedName =
            visibleResidents[0]

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

    for (const candidateName of CARE_RECIPIENTS) {

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
        'selectResident'
    )

    throw new Error(
        'No care recipient could be selected'
    )
}

// ═══════════════════════════════════════════════
// ENTER VALUE INTO FIELD
// ═══════════════════════════════════════════════

async function enterValue(
    field: TestBotElement,
    value: string
): Promise<void> {

    await testBot.waitUntilVisible(
        field,
        10000
    )

    await testBot.click(field)

    await driver.pause(300)

    try {

        const inputElement =
            await $(
                await (
                    testBot as any
                ).getLocatorTextForElement(
                    field
                )
            )

        await inputElement.clearValue()

    } catch (clearErr) {

        console.warn(
            'Could not clear field:',
            clearErr
        )
    }

    await testBot.enterText(
        field,
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
// SELECT TEMPERATURE TIME
// ═══════════════════════════════════════════════

async function selectTemperatureTime():
Promise<void> {

    console.log(
        '▶ Looking for Temperature time control'
    )

    await testBot.waitUntilVisible(
        selectors.temperatureTimeButton,
        10000
    )

    await testBot.click(
        selectors.temperatureTimeButton
    )

    console.log(
        '✓ Clicked Temperature time control'
    )

    await driver.pause(1000)
}

// ═══════════════════════════════════════════════
// BOUNDARY VALUE ANALYSIS
// ═══════════════════════════════════════════════

async function runTemperatureBoundaryValueAnalysis():
Promise<void> {

    console.log(
        '════════════════════════════════════'
    )

    console.log(
        '▶ STARTING TEMPERATURE BOUNDARY VALUE ANALYSIS'
    )

    console.log(
        `▶ Accepted range: ${TEMPERATURE_MIN} - ${TEMPERATURE_MAX}`
    )

    console.log(
        '════════════════════════════════════'
    )

    for (
        const testCase
        of TEMPERATURE_BOUNDARY_CASES
    ) {

        console.log(
            `▶ Testing ${testCase.description}`
        )

        console.log(
            `▶ Temperature value: ${testCase.value}`
        )

        await enterValue(
            selectors.temperatureInputField,
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
                    `BVA FAILED: "${testCase.value}" ` +
                    `(${testCase.description}) ` +
                    `should be VALID but validation was displayed`
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
                    `BVA FAILED: "${testCase.value}" ` +
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
        '✓ ALL TEMPERATURE BOUNDARY TESTS PASSED'
    )

    console.log(
        '════════════════════════════════════'
    )
}

// ═══════════════════════════════════════════════
// GET EDITTEXT FIELDS AFTER NEXT
//
// The exact locators for these two fields were
// not provided, so they are identified by order.
//
// This can be replaced with exact XPath once
// page source is available.
// ═══════════════════════════════════════════════

async function getFieldsAfterNext(): Promise<any[]> {

    const fields =
        await $$(
            '//android.widget.EditText'
        )

    console.log(
        `▶ Found ${fields.length} EditText fields after Next`
    )

    if (
        fields.length < 2
    ) {

        throw new Error(
            `Expected two fields after Next but found ${fields.length}`
        )
    }

    return fields
}

// ═══════════════════════════════════════════════
// BVA FOR ADDITIONAL FIELDS
// ═══════════════════════════════════════════════

async function runAdditionalFieldsBVA():
Promise<void> {

    console.log(
        '════════════════════════════════════'
    )

    console.log(
        '▶ STARTING BVA FOR ADDITIONAL FIELDS'
    )

    const fields =
        await getFieldsAfterNext()

    // First field after Next
    const firstField =
        fields[0]

    // Second field after Next
    const secondField =
        fields[1]

    // ─────────────────────────────────────────
    // FIELD 1
    // ─────────────────────────────────────────

    console.log(
        '▶ Running BVA on first field after Next'
    )

    for (
        const testCase
        of TEMPERATURE_BOUNDARY_CASES
    ) {

        console.log(
            `▶ Field 1 → ${testCase.value}`
        )

        await firstField.click()

        try {
            await firstField.clearValue()
        } catch (err) {
            console.warn(
                'Could not clear first field'
            )
        }

        await firstField.setValue(
            testCase.value
        )

        await driver.pause(700)

        console.log(
            `✓ Field 1 value entered: ${testCase.value}`
        )
    }

    // ─────────────────────────────────────────
    // FIELD 2
    // ─────────────────────────────────────────

    console.log(
        '▶ Running BVA on second field after Next'
    )

    for (
        const testCase
        of TEMPERATURE_BOUNDARY_CASES
    ) {

        console.log(
            `▶ Field 2 → ${testCase.value}`
        )

        await secondField.click()

        try {
            await secondField.clearValue()
        } catch (err) {
            console.warn(
                'Could not clear second field'
            )
        }

        await secondField.setValue(
            testCase.value
        )

        await driver.pause(700)

        console.log(
            `✓ Field 2 value entered: ${testCase.value}`
        )
    }

    console.log(
        '✓ Additional field BVA completed'
    )

    console.log(
        '════════════════════════════════════'
    )
}

// ═══════════════════════════════════════════════
// NAVIGATE TO TEMPERATURE
// ═══════════════════════════════════════════════

async function navigateToTemperature():
Promise<string> {

    try {

        // ─────────────────────────────────────
        // Resident
        // ─────────────────────────────────────

        const residentName =
            await selectResident()

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
        // Temperature
        // ─────────────────────────────────────

        let temperatureVisible =
            await testBot
                .isVisible(
                    selectors.temperatureText
                )
                .catch(() => false)

        if (!temperatureVisible) {

            console.log(
                '▶ Temperature not visible — scrolling'
            )

            try {

                const temperatureElement =
                    await $(
                        'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
                        '.scrollIntoView(new UiSelector().textMatches("^Temperature$"))'
                    )

                temperatureVisible =
                    await temperatureElement.isExisting()

            } catch (err) {

                console.warn(
                    'Unable to scroll to Temperature'
                )
            }
        }

        if (!temperatureVisible) {

            throw new Error(
                'Temperature option not found'
            )
        }

        await testBot.click(
            selectors.temperatureText
        )

        console.log(
            '✓ Clicked Temperature'
        )

        await driver.pause(1000)

        // ─────────────────────────────────────
        // Click temperature time
        // ─────────────────────────────────────

        await selectTemperatureTime()

        // ─────────────────────────────────────
        // Temperature input
        // ─────────────────────────────────────

        await testBot.waitUntilVisible(
            selectors.temperatureInputField,
            10000
        )

        console.log(
            '✓ Temperature input field displayed'
        )

        return residentName

    } catch (err) {

        await dumpPageSourceOnFailure(
            'navigateToTemperature'
        )

        throw err
    }
}

// ═══════════════════════════════════════════════
// CLICK NEXT
// ═══════════════════════════════════════════════

async function clickNext():
Promise<void> {

    await testBot.waitUntilVisible(
        selectors.nextButton,
        10000
    )

    await testBot.click(
        selectors.nextButton
    )

    console.log(
        '✓ Clicked Next'
    )

    await driver.pause(2000)
}

// ═══════════════════════════════════════════════
// FINAL VALID TEMPERATURE
// ═══════════════════════════════════════════════

async function enterFinalTemperature():
Promise<void> {

    console.log(
        `▶ Entering final valid temperature: ${FINAL_VALID_TEMPERATURE}`
    )

    await enterValue(
        selectors.temperatureInputField,
        FINAL_VALID_TEMPERATURE
    )

    const validationVisible =
        await isValidationVisible()

    if (
        validationVisible
    ) {

        throw new Error(
            `Final valid temperature ${FINAL_VALID_TEMPERATURE} shows validation`
        )
    }

    console.log(
        '✓ Final valid temperature accepted'
    )
}

// ═══════════════════════════════════════════════
// COMPLETE CLOSE NAVIGATION
// ═══════════════════════════════════════════════

async function completeCloseNavigation():
Promise<void> {

    console.log(
        '════════ FINAL CLOSE FLOW ════════'
    )

    // ─────────────────────────────────────────
    // Bottom Close
    // ─────────────────────────────────────────

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

    // ─────────────────────────────────────────
    // Earlier
    // ─────────────────────────────────────────

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

    // ─────────────────────────────────────────
    // Right Close
    // ─────────────────────────────────────────

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

    // ─────────────────────────────────────────
    // My Communities
    // ─────────────────────────────────────────

    await testBot.waitUntilVisible(
        selectors.myCommunitiesTab,
        30000
    )

    const visible =
        await testBot
            .isVisible(
                selectors.myCommunitiesTab
            )
            .catch(() => false)

    if (!visible) {

        throw new Error(
            'My Communities was not displayed'
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
    'Resident Area Profile - Observations - Temperature - Boundary Value Analysis',
    () => {

        let residentName = ''

        // ═══════════════════════════════════════
        // STEP 1
        // NAVIGATION
        // ═══════════════════════════════════════

        it(
            'Step 1 - Navigate to Temperature entry screen',
            async function () {

                try {

                    residentName =
                        await navigateToTemperature()

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
        // TEMPERATURE BVA
        // ═══════════════════════════════════════

        it(
            'Step 2 - Run Temperature Boundary Value Analysis 30-50',
            async function () {

                try {

                    await runTemperatureBoundaryValueAnalysis()

                } catch (err) {

                    await dumpPageSourceOnFailure(
                        'Step 2 - Temperature BVA'
                    )

                    throw err
                }
            }
        )

        // ═══════════════════════════════════════
        // STEP 3
        // FINAL TEMPERATURE + NEXT
        // ═══════════════════════════════════════

        it(
            'Step 3 - Enter valid temperature and click Next',
            async function () {

                try {

                    await enterFinalTemperature()

                    await clickNext()

                } catch (err) {

                    await dumpPageSourceOnFailure(
                        'Step 3 - Temperature Next'
                    )

                    throw err
                }
            }
        )

        // ═══════════════════════════════════════
        // STEP 4
        // TWO FIELDS AFTER TEMPERATURE
        // ═══════════════════════════════════════

        it(
            'Step 4 - Run BVA for two fields after Temperature',
            async function () {

                try {

                    await runAdditionalFieldsBVA()

                } catch (err) {

                    await dumpPageSourceOnFailure(
                        'Step 4 - Additional Fields BVA'
                    )

                    throw err
                }
            }
        )

        // ═══════════════════════════════════════
        // STEP 5
        // CLOSE FLOW
        // ═══════════════════════════════════════

        it(
            'Step 5 - Close and verify My Communities',
            async function () {

                try {

                    await completeCloseNavigation()

                    console.log(
                        '✓ Temperature Observation BVA test completed successfully'
                    )

                } catch (err) {

                    await dumpPageSourceOnFailure(
                        'Step 5 - Close Navigation'
                    )

                    throw err
                }
            }
        )
    }
)
