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
// One resident is selected once and reused.
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
// 29  = Min - 1 → INVALID
// 30  = Min     → VALID
// 31  = Min + 1 → VALID
// 40  = Mid     → VALID
// 49  = Max - 1 → VALID
// 50  = Max     → VALID
// 51  = Max + 1 → INVALID
//
// Separate zero-value scenario:
// 0   → INVALID
// ═══════════════════════════════════════════════

const TEMPERATURE_MIN = 30
const TEMPERATURE_MAX = 50

const ZERO_TEMPERATURE = '0'
const FINAL_VALID_TEMPERATURE = '40'

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
        description: 'Mid-range valid value',
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

async function dumpPageSourceOnFailure(stepLabel: string): Promise<void> {
    console.error(
        `Failure at ${stepLabel} — dumping page source`
    )

    try {
        const pageSource = await driver.getPageSource()

        console.log(
            `────────── PAGE SOURCE: ${stepLabel} ──────────`
        )
        console.log(pageSource)
        console.log(
            '────────────────────────────────────────────'
        )

        try {
            const fs = require('fs')
            const path = require('path')

            const safeName = stepLabel.replace(
                /[^a-z0-9.]+/gi,
                '_'
            )

            const outDir = path.resolve(
                __dirname,
                '../../../../run'
            )

            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir, {
                    recursive: true,
                })
            }

            fs.writeFileSync(
                path.join(
                    outDir,
                    `temperature_observation_failure_${safeName}.xml`
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
            'Could not get page source. Session may be dead:',
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
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Adhoc"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Adhoc"]'
        ),
    } as TestBotElement,

    // ─────────────────────────────────────────
    // EXPAND ALL
    // ─────────────────────────────────────────

    expandAllSectionsButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="\uE0A4"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name=""]'
        ),
    } as TestBotElement,

    // ─────────────────────────────────────────
    // TEMPERATURE
    // Exact Android locator supplied by you.
    // ─────────────────────────────────────────

    temperatureIcon: {
        android: AndroidLocatorBuilder.xpath(
            '//androidx.recyclerview.widget.RecyclerView/android.view.ViewGroup[4]/android.view.ViewGroup/android.view.ViewGroup[3]/android.view.ViewGroup/android.widget.ImageView'
        ),

        // iOS locator was not supplied.
        // This is a label-based fallback and should be
        // confirmed in Appium Inspector before iOS execution.
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeImage[@name="Temperature"]'
        ),
    } as TestBotElement,

    // ─────────────────────────────────────────
    // NEXT
    // Exact Android locator supplied by you.
    // ─────────────────────────────────────────

    nextButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="Next"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Next"]'
        ),
    } as TestBotElement,

    // ─────────────────────────────────────────
    // TEMPERATURE INPUT
    // Exact Android locator supplied by you.
    // ─────────────────────────────────────────

    temperatureInputField: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeTextField'
        ),
    } as TestBotElement,

    // ─────────────────────────────────────────
    // VALIDATION MESSAGE
    // Generic fallback because no exact validation
    // locator was supplied.
    // ─────────────────────────────────────────

    validationErrorMessage: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[' +
            'contains(@text,"invalid") or ' +
            'contains(@text,"Invalid") or ' +
            'contains(@text,"must be") or ' +
            'contains(@text,"between") or ' +
            'contains(@text,"range") or ' +
            'contains(@text,"30") or ' +
            'contains(@text,"50")' +
            ']'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[' +
            'contains(@name,"invalid") or ' +
            'contains(@name,"Invalid") or ' +
            'contains(@name,"must be") or ' +
            'contains(@name,"between") or ' +
            'contains(@name,"range") or ' +
            'contains(@name,"30") or ' +
            'contains(@name,"50")' +
            ']'
        ),
    } as TestBotElement,

    // ─────────────────────────────────────────
    // DURATION
    // Reused from the existing observation flow.
    // ─────────────────────────────────────────

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

    // ─────────────────────────────────────────
    // CREATE RECORDS / CARE NOTE
    // ─────────────────────────────────────────

    createRecordsButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="Create Records"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Create Records"]'
        ),
    } as TestBotElement,

    // ─────────────────────────────────────────
    // BOTTOM CLOSE BUTTON AFTER CARE NOTE
    // ─────────────────────────────────────────

    careNoteBottomCloseButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="Close"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Close"]'
        ),
    } as TestBotElement,

    // ─────────────────────────────────────────
    // EARLIER TAB
    // ─────────────────────────────────────────

    earlierTab: {
        android: AndroidLocatorBuilder.xpath(
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
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Earlier"]'
        ),
    } as TestBotElement,

    // ─────────────────────────────────────────
    // RIGHT-SIDE CLOSE ICON ON EARLIER PAGE
    // ─────────────────────────────────────────

    earlierRightCloseIcon: {
        android: AndroidLocatorBuilder.xpath(
            '(//android.widget.Button[@text=""])[1] | ' +
            '//android.widget.Button[@content-desc="Close"] | ' +
            '//android.widget.ImageView[@content-desc="Close"] | ' +
            '//android.widget.Button[@text="Close"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '(//XCUIElementTypeButton[@name=""])[1] | ' +
            '//XCUIElementTypeButton[@name="Close"]'
        ),
    } as TestBotElement,

    // ─────────────────────────────────────────
    // DESTINATION
    // ─────────────────────────────────────────

    myCommunitiesTab: {
        android: AndroidLocatorBuilder.xpath(
            '//*[@text="My Communities"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//*[@name="My Communities"]'
        ),
    } as TestBotElement,
}

// ═══════════════════════════════════════════════
// SELECT ONE RESIDENT
// Selected once per suite and reused.
// ═══════════════════════════════════════════════

async function selectOneResident(): Promise<string> {
    console.log(
        '▶ Searching for one available care recipient...'
    )

    const visibleResidents: string[] = []

    for (const name of CARE_RECIPIENTS) {
        const visible = await testBot
            .isVisible(residentLocator(name))
            .catch(() => false)

        if (visible) {
            visibleResidents.push(name)
        }
    }

    if (visibleResidents.length > 0) {
        const selected =
            visibleResidents[
                Math.floor(
                    Math.random() * visibleResidents.length
                )
            ]

        await testBot.click(
            residentLocator(selected)
        )

        await driver.pause(2000)

        console.log(
            `✓ Selected one resident: "${selected}"`
        )

        return selected
    }

    console.log(
        '▶ No visible resident found — using scroll fallback'
    )

    const shuffled =
        [...CARE_RECIPIENTS].sort(
            () => Math.random() - 0.5
        )

    for (const name of shuffled) {
        try {
            const element = await $(
                'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
                `.scrollIntoView(new UiSelector().textMatches("^${name}$"))`
            )

            if (await element.isExisting()) {
                await element.click()
                await driver.pause(2000)

                console.log(
                    `✓ Selected one resident after scrolling: "${name}"`
                )

                return name
            }
        } catch (err) {
            console.warn(
                `Could not find "${name}"`
            )
        }
    }

    await dumpPageSourceOnFailure(
        'selectOneResident'
    )

    throw new Error(
        'Could not select one care recipient'
    )
}

// ═══════════════════════════════════════════════
// NAVIGATE TO TEMPERATURE ENTRY
//
// Resident
//   ↓
// Adhoc
//   ↓
// Temperature
//   ↓
// Next
//   ↓
// Temperature input
// ═══════════════════════════════════════════════

async function navigateToTemperatureEntryScreen(): Promise<string> {
    try {
        const residentName =
            await selectOneResident()

        // Adhoc
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

        // Expand all if available
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
                'Expand-all not available — continuing'
            )
        }

        // Temperature
        await testBot.waitUntilVisible(
            selectors.temperatureIcon,
            10000
        )

        await testBot.click(
            selectors.temperatureIcon
        )

        console.log(
            '✓ Clicked Temperature'
        )

        await driver.pause(1200)

        // Next
        await testBot.waitUntilVisible(
            selectors.nextButton,
            10000
        )

        await testBot.click(
            selectors.nextButton
        )

        console.log(
            '✓ Clicked Next after Temperature'
        )

        await driver.pause(2000)

        // Temperature input
        await testBot.waitUntilVisible(
            selectors.temperatureInputField,
            10000
        )

        console.log(
            '✓ Temperature input screen displayed'
        )

        return residentName
    } catch (err) {
        await dumpPageSourceOnFailure(
            'navigateToTemperatureEntryScreen'
        )

        throw err
    }
}

// ═══════════════════════════════════════════════
// RETURN TO TEMPERATURE ENTRY FOR SAME RESIDENT
// ═══════════════════════════════════════════════

async function returnToTemperatureEntryForResident(
    residentName: string
): Promise<void> {
    try {
        console.log(
            `▶ Returning to Temperature for "${residentName}"`
        )

        const locator =
            residentLocator(residentName)

        let residentFound =
            await testBot
                .isVisible(locator)
                .catch(() => false)

        if (!residentFound) {
            console.log(
                '▶ Resident not visible — scrolling'
            )

            try {
                const element = await $(
                    'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
                    `.scrollIntoView(new UiSelector().textMatches("^${residentName}$"))`
                )

                residentFound =
                    await element.isExisting()
            } catch (err) {
                console.warn(
                    'Resident scroll failed:',
                    err
                )
            }
        }

        if (!residentFound) {
            throw new Error(
                `Resident "${residentName}" was not found`
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

            await driver.pause(1200)
        } catch (err) {
            console.warn(
                'Expand-all not available — continuing'
            )
        }

        await testBot.waitUntilVisible(
            selectors.temperatureIcon,
            10000
        )

        await testBot.click(
            selectors.temperatureIcon
        )

        console.log(
            '✓ Clicked Temperature'
        )

        await driver.pause(1000)

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

        await testBot.waitUntilVisible(
            selectors.temperatureInputField,
            10000
        )

        console.log(
            '✓ Returned to Temperature input screen'
        )
    } catch (err) {
        await dumpPageSourceOnFailure(
            'returnToTemperatureEntryForResident'
        )

        throw err
    }
}

// ═══════════════════════════════════════════════
// ENTER TEMPERATURE
// ═══════════════════════════════════════════════

async function enterTemperatureValue(
    value: string
): Promise<void> {
    await testBot.waitUntilVisible(
        selectors.temperatureInputField,
        10000
    )

    await testBot.click(
        selectors.temperatureInputField
    )

    await driver.pause(300)

    try {
        const inputElement =
            await $(
                await (
                    testBot as any
                ).getLocatorTextForElement(
                    selectors.temperatureInputField
                )
            )

        await inputElement.clearValue()
    } catch (clearErr) {
        console.warn(
            'Could not clear temperature field:',
            clearErr
        )
    }

    await testBot.enterText(
        selectors.temperatureInputField,
        value,
        false
    )

    await driver.pause(700)

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
// VALIDATION CHECK
// ═══════════════════════════════════════════════

async function isValidationVisible(): Promise<boolean> {
    return await testBot
        .isVisible(
            selectors.validationErrorMessage
        )
        .catch(() => false)
}

// ═══════════════════════════════════════════════
// DURATION
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
        `▶ Selecting duration: ${randomDuration}`
    )

    let durationElement =
        await $(durationXpath)

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

        await driver.pause(1000)

        durationElement =
            await $(durationXpath)
    }

    if (
        !(await durationElement.isExisting())
    ) {
        console.warn(
            `Preset duration "${randomDuration}" not found — trying Other Durations`
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

    await durationElement.click()

    console.log(
        `✓ Selected duration: ${randomDuration}`
    )

    await driver.pause(1500)

    const confirmButton =
        await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/ConfirmButton"]'
        )

    return await confirmButton
        .waitForEnabled({
            timeout: 5000,
        })
        .catch(() => false)
}

// ═══════════════════════════════════════════════
// CREATE CARE NOTE
// Uses final valid temperature.
// ═══════════════════════════════════════════════

async function createCareNote(): Promise<void> {
    // Enter final valid temperature
    await enterTemperatureValue(
        FINAL_VALID_TEMPERATURE
    )

    const validationVisible =
        await isValidationVisible()

    if (validationVisible) {
        throw new Error(
            `Final valid temperature ${FINAL_VALID_TEMPERATURE} shows validation`
        )
    }

    console.log(
        `✓ Valid temperature ${FINAL_VALID_TEMPERATURE} accepted`
    )

    // Select duration
    const confirmEnabled =
        await selectDurationOption()

    if (!confirmEnabled) {
        throw new Error(
            'Continue button was not enabled after selecting duration'
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

    await driver.pause(2000)

    // Create care note / record
    await testBot.waitUntilVisible(
        selectors.createRecordsButton,
        10000
    )

    await testBot.click(
        selectors.createRecordsButton
    )

    console.log(
        '✓ Care Note / Record created'
    )

    await driver.pause(2000)
}

// ═══════════════════════════════════════════════
// FINAL NAVIGATION
//
// Care Note
//    ↓
// Bottom Close
//    ↓
// Earlier
//    ↓
// Right-side Close icon
//    ↓
// My Communities
// ═══════════════════════════════════════════════

async function completeCloseNavigation(): Promise<void> {
    console.log(
        '════════ FINAL CLOSE FLOW STARTED ════════'
    )

    // 1. Bottom Close button
    console.log(
        '▶ Clicking bottom Close button'
    )

    await testBot.waitUntilVisible(
        selectors.careNoteBottomCloseButton,
        10000
    )

    await testBot.click(
        selectors.careNoteBottomCloseButton
    )

    console.log(
        '✓ Bottom Close clicked'
    )

    await driver.pause(2000)

    // 2. Earlier
    console.log(
        '▶ Opening Earlier page'
    )

    await testBot.waitUntilVisible(
        selectors.earlierTab,
        10000
    )

    await testBot.click(
        selectors.earlierTab
    )

    console.log(
        '✓ Earlier opened'
    )

    await driver.pause(2000)

    // 3. Right-side Close icon
    console.log(
        '▶ Clicking right-side Close icon'
    )

    await testBot.waitUntilVisible(
        selectors.earlierRightCloseIcon,
        10000
    )

    await testBot.click(
        selectors.earlierRightCloseIcon
    )

    console.log(
        '✓ Right-side Close icon clicked'
    )

    await driver.pause(2000)

    // 4. Verify destination
    await testBot.waitUntilVisible(
        selectors.myCommunitiesTab,
        30000
    )

    const redirected =
        await testBot
            .isVisible(
                selectors.myCommunitiesTab
            )
            .catch(() => false)

    if (!redirected) {
        throw new Error(
            'My Communities was not displayed after closing Earlier'
        )
    }

    console.log(
        '✓ Redirected to My Communities'
    )

    console.log(
        '════════ FINAL CLOSE FLOW COMPLETED ════════'
    )
}

// ═══════════════════════════════════════════════
// SUITE 1 — ONE RESIDENT + ZERO VALUE
//
// Flow:
// Resident → Adhoc → Temperature → Next → 0
//
// Expected:
// Error / validation message
// User cannot save the zero value.
// ═══════════════════════════════════════════════

describe(
    'Resident Area Profile - Observations - Temperature - ZERO VALUE',
    () => {
        let residentName = ''

        it(
            'Step 1 - Select one resident and navigate to Temperature',
            async function () {
                try {
                    residentName =
                        await navigateToTemperatureEntryScreen()

                    console.log(
                        `✓ Zero-value scenario resident: "${residentName}"`
                    )
                } catch (err) {
                    await dumpPageSourceOnFailure(
                        'Zero Value - Step 1'
                    )
                    throw err
                }
            }
        )

        it(
            'Step 2 - Enter zero temperature and verify validation',
            async function () {
                try {
                    console.log(
                        `▶ Entering zero temperature: ${ZERO_TEMPERATURE}`
                    )

                    await enterTemperatureValue(
                        ZERO_TEMPERATURE
                    )

                    await driver.pause(800)

                    const validationVisible =
                        await isValidationVisible()

                    if (!validationVisible) {
                        throw new Error(
                            `Zero temperature "${ZERO_TEMPERATURE}" was accepted without validation`
                        )
                    }

                    console.log(
                        '✓ Zero value correctly rejected'
                    )
                } catch (err) {
                    await dumpPageSourceOnFailure(
                        'Zero Value - Step 2'
                    )
                    throw err
                }
            }
        )
    }
)

// ═══════════════════════════════════════════════
// SUITE 2 — TEMPERATURE BOUNDARY VALUE ANALYSIS
//
// Accepted range: 30 - 50
//
// Test values:
// 29 → INVALID
// 30 → VALID
// 31 → VALID
// 40 → VALID
// 49 → VALID
// 50 → VALID
// 51 → INVALID
//
// The same resident is reused throughout.
// ═══════════════════════════════════════════════

describe(
    'Resident Area Profile - Observations - Temperature - BOUNDARY VALUE ANALYSIS',
    () => {
        let residentName = ''

        it(
            'Step 1 - Select one resident and navigate to Temperature',
            async function () {
                try {
                    residentName =
                        await navigateToTemperatureEntryScreen()

                    console.log(
                        `✓ BVA scenario resident: "${residentName}"`
                    )
                } catch (err) {
                    await dumpPageSourceOnFailure(
                        'BVA - Step 1'
                    )
                    throw err
                }
            }
        )

        it(
            'Step 2 - Execute Temperature Boundary Value Analysis 30-50',
            async function () {
                try {
                    console.log(
                        `▶ Starting BVA. Accepted range: ${TEMPERATURE_MIN}-${TEMPERATURE_MAX}`
                    )

                    for (
                        const testCase
                        of TEMPERATURE_BOUNDARY_CASES
                    ) {
                        console.log(
                            `▶ Testing ${testCase.description}: ${testCase.value}`
                        )

                        // Re-enter the same resident/temperature screen
                        // between each test case so every value starts
                        // from a clean state.
                        await returnToTemperatureEntryForResident(
                            residentName
                        )

                        await enterTemperatureValue(
                            testCase.value
                        )

                        await driver.pause(700)

                        const validationVisible =
                            await isValidationVisible()

                        if (
                            testCase.expectedValid
                        ) {
                            if (
                                validationVisible
                            ) {
                                throw new Error(
                                    `BVA FAILED: ${testCase.value} should be VALID but validation was shown`
                                )
                            }

                            console.log(
                                `✓ PASS: ${testCase.value} accepted`
                            )
                        } else {
                            if (
                                !validationVisible
                            ) {
                                throw new Error(
                                    `BVA FAILED: ${testCase.value} should be INVALID but validation was not shown`
                                )
                            }

                            console.log(
                                `✓ PASS: ${testCase.value} rejected`
                            )
                        }
                    }

                    console.log(
                        '✓ All Temperature BVA values passed'
                    )
                } catch (err) {
                    await dumpPageSourceOnFailure(
                        'BVA - Step 2'
                    )
                    throw err
                }
            }
        )

        it(
            'Step 3 - Create Care Note with valid Temperature value',
            async function () {
                try {
                    // Start from a clean Temperature screen.
                    await returnToTemperatureEntryForResident(
                        residentName
                    )

                    await createCareNote()

                    console.log(
                        '✓ Care Note created with valid temperature'
                    )
                } catch (err) {
                    await dumpPageSourceOnFailure(
                        'BVA - Step 3 Create Care Note'
                    )
                    throw err
                }
            }
        )

        it(
            'Step 4 - Bottom Close → Earlier → Right-side Close → My Communities',
            async function () {
                try {
                    await completeCloseNavigation()

                    console.log(
                        '✓ Temperature BVA scenario completed successfully'
                    )
                } catch (err) {
                    await dumpPageSourceOnFailure(
                        'BVA - Step 4 Close Navigation'
                    )
                    throw err
                }
            }
        )
    }
)
