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

// ============================================================
// TEST DATA
// ============================================================

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

const WEIGHT_MIN = 20
const WEIGHT_MAX = 500

const VALID_VALUES = [
'20',
'21',
'260',
'499',
'500',
]

const INVALID_VALUES = [
'19',
'501',
'0',
'-5',
'abc',
'20.5.5',
'999999',
'   ',
]

const BLANK_VALUE = ''

const DURATION_OPTIONS = [
'5 mins',
'10 mins',
'15 mins',
'20 mins',
'30 mins',
'45 mins',
'60 mins',
]

// ============================================================
// LOCATORS
// ============================================================

const selectors = {

```
myCommunities: {
    android: AndroidLocatorBuilder.xpath(
        '//*[@text="My Communities"]'
    ),
    ios: iOSLocatorBuilder.xpath(
        '//*[@name="My Communities"]'
    ),
} as TestBotElement,

resident: (name: string): TestBotElement => ({
    android: AndroidLocatorBuilder.xpath(
        `//android.widget.TextView[@text="${name}"]`
    ),
    ios: iOSLocatorBuilder.xpath(
        `//XCUIElementTypeStaticText[@name="${name}"]`
    ),
} as TestBotElement),

adhocButton: {
    android: AndroidLocatorBuilder.xpath(
        '//android.widget.TextView[@text="Adhoc"]'
    ),
    ios: iOSLocatorBuilder.xpath(
        '//XCUIElementTypeStaticText[@name="Adhoc"]'
    ),
} as TestBotElement,

expandAll: {
    android: AndroidLocatorBuilder.xpath(
        '//android.widget.Button[@text="\uE0A4"]'
    ),
    ios: iOSLocatorBuilder.xpath(
        '//XCUIElementTypeButton[@name=""]'
    ),
} as TestBotElement,

weigh: {
    android: AndroidLocatorBuilder.xpath(
        '//android.widget.TextView[@text="Weigh"]'
    ),
    ios: iOSLocatorBuilder.xpath(
        '//XCUIElementTypeStaticText[@name="Weigh"]'
    ),
} as TestBotElement,

next: {
    android: AndroidLocatorBuilder.xpath(
        '//android.widget.Button[@text="Next"]'
    ),
    ios: iOSLocatorBuilder.xpath(
        '//XCUIElementTypeButton[@name="Next"]'
    ),
} as TestBotElement,

weightInput: {
    android: AndroidLocatorBuilder.xpath(
        '//android.widget.EditText'
    ),
    ios: iOSLocatorBuilder.xpath(
        '//XCUIElementTypeTextField'
    ),
} as TestBotElement,

otherDurations: {
    android: AndroidLocatorBuilder.xpath(
        '(//android.widget.TextView[@text="Other Durations"])[1]'
    ),
    ios: iOSLocatorBuilder.xpath(
        '(//XCUIElementTypeStaticText[@name="Other Durations"])[1]'
    ),
} as TestBotElement,

durationEntry: {
    android: AndroidLocatorBuilder.xpath(
        '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/DurationEntry"]'
    ),
    ios: iOSLocatorBuilder.xpath(
        '//XCUIElementTypeTextField[@name="DurationEntry"]'
    ),
} as TestBotElement,

confirm: {
    android: AndroidLocatorBuilder.xpath(
        '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/ConfirmButton"]'
    ),
    ios: iOSLocatorBuilder.xpath(
        '//XCUIElementTypeButton[@name="ConfirmButton"]'
    ),
} as TestBotElement,

createRecords: {
    android: AndroidLocatorBuilder.xpath(
        '//android.widget.Button[@text="Create Records"]'
    ),
    ios: iOSLocatorBuilder.xpath(
        '//XCUIElementTypeButton[@name="Create Records"]'
    ),
} as TestBotElement,

earlier: {
    android: AndroidLocatorBuilder.xpath(
        '//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/ProfilePage"]' +
        '/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup' +
        '/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[1]' +
        '/android.view.ViewGroup/android.widget.Button'
    ),
    ios: iOSLocatorBuilder.xpath(
        '//XCUIElementTypeButton[@name="Earlier"]'
    ),
} as TestBotElement,

close: {
    android: AndroidLocatorBuilder.xpath(
        '(//android.widget.Button[@text=""])[1]'
    ),
    ios: iOSLocatorBuilder.xpath(
        '(//XCUIElementTypeButton[@name=""])[1]'
    ),
} as TestBotElement,

validationError: {
    android: AndroidLocatorBuilder.xpath(
        '//android.widget.TextView[' +
        'contains(@text,"required") or ' +
        'contains(@text,"invalid") or ' +
        'contains(@text,"Invalid") or ' +
        'contains(@text,"must be") or ' +
        'contains(@text,"between") or ' +
        'contains(@text,"20") or ' +
        'contains(@text,"500")' +
        ']'
    ),
    ios: iOSLocatorBuilder.xpath(
        '//XCUIElementTypeStaticText[' +
        'contains(@name,"required") or ' +
        'contains(@name,"invalid") or ' +
        'contains(@name,"Invalid") or ' +
        'contains(@name,"must be") or ' +
        'contains(@name,"between") or ' +
        'contains(@name,"20") or ' +
        'contains(@name,"500")' +
        ']'
    ),
} as TestBotElement,
```

}

// ============================================================
// COMMON HELPERS
// ============================================================

async function isVisible(
locator: TestBotElement
): Promise<boolean> {
return testBot.isVisible(locator).catch(() => false)
}

async function dumpPageSource(label: string): Promise<void> {
console.error(`Page source requested: ${label}`)

```
try {
    const source = await driver.getPageSource()

    console.log(`========== PAGE SOURCE: ${label} ==========`)
    console.log(source)
    console.log(`============================================`)

    try {
        const fs = require('fs')
        const path = require('path')

        const directory = path.resolve(
            __dirname,
            '../../../../run'
        )

        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, {
                recursive: true,
            })
        }

        const safeLabel = label.replace(
            /[^a-z0-9]+/gi,
            '_'
        )

        fs.writeFileSync(
            path.join(
                directory,
                `weight_failure_${safeLabel}.xml`
            ),
            source,
            'utf8'
        )
    } catch (writeError) {
        console.warn(
            'Could not save page source:',
            writeError
        )
    }
} catch (error) {
    console.error(
        'Could not retrieve page source. Session may be dead:',
        error
    )
}
```

}

async function hideKeyboard(): Promise<void> {
try {
await driver.hideKeyboard()
} catch {
// Keyboard may already be hidden.
}

```
await driver.pause(500)
```

}

// ============================================================
// ENSURE WE ARE ON MY COMMUNITIES
// ============================================================

async function ensureMyCommunities(): Promise<void> {

```
console.log('Checking current application screen...')

if (await isVisible(selectors.myCommunities)) {
    console.log('Already on My Communities')
    return
}

console.log(
    'My Communities is not visible. Attempting to return to it.'
)

/*
 * First check whether the Earlier page is currently open.
 * If it is, close it and wait for My Communities.
 */

if (await isVisible(selectors.earlier)) {

    console.log(
        'Earlier page detected. Closing Earlier page.'
    )

    await testBot.click(selectors.close)

    await driver.pause(2000)

    if (
        await testBot.waitUntilVisible(
            selectors.myCommunities,
            10000
        ).catch(() => false)
    ) {
        console.log(
            'Successfully returned to My Communities'
        )
        return
    }
}

/*
 * If the resident profile is open, try the Earlier route.
 */

if (await isVisible(selectors.adhocButton)) {

    console.log(
        'Resident profile detected.'
    )

    if (await isVisible(selectors.earlier)) {

        await testBot.click(selectors.earlier)

        await driver.pause(1500)

        if (await isVisible(selectors.close)) {
            await testBot.click(selectors.close)
            await driver.pause(2000)
        }

        if (await isVisible(selectors.myCommunities)) {
            return
        }
    }
}

/*
 * Final verification.
 */

if (!(await isVisible(selectors.myCommunities))) {
    await dumpPageSource(
        'ensureMyCommunities_failed'
    )

    throw new Error(
        'Could not return to My Communities page.'
    )
}
```

}

// ============================================================
// RESIDENT SELECTION
// ============================================================

async function selectResident(): Promise<string> {

```
await testBot.waitUntilVisible(
    selectors.myCommunities,
    15000
)

console.log(
    'Scanning My Communities for available residents...'
)

const visibleResidents: string[] = []

for (const name of CARE_RECIPIENTS) {

    const visible = await isVisible(
        selectors.resident(name)
    )

    if (visible) {
        visibleResidents.push(name)
    }
}

if (visibleResidents.length > 0) {

    const selected =
        visibleResidents[
            Math.floor(
                Math.random() *
                visibleResidents.length
            )
        ]

    console.log(
        `Selected visible resident: ${selected}`
    )

    await testBot.click(
        selectors.resident(selected)
    )

    await driver.pause(2000)

    return selected
}

/*
 * If none are visible, use Android scrollIntoView.
 */

const shuffled = [...CARE_RECIPIENTS].sort(
    () => Math.random() - 0.5
)

for (const name of shuffled) {

    try {

        const element = await $(
            'android=new UiScrollable(' +
            'new UiSelector().scrollable(true).instance(0))' +
            `.scrollIntoView(` +
            `new UiSelector().textMatches("^${name}$"))`
        )

        if (await element.isExisting()) {

            console.log(
                `Selected resident after scrolling: ${name}`
            )

            await element.click()

            await driver.pause(2000)

            return name
        }

    } catch {
        console.log(
            `Resident "${name}" not found. Trying next.`
        )
    }
}

await dumpPageSource(
    'selectResident_no_resident_found'
)

throw new Error(
    'No care recipient could be selected.'
)
```

}

// ============================================================
// NAVIGATE TO WEIGHT SCREEN
// ============================================================

async function navigateToWeightScreen(): Promise<string> {

```
/*
 * IMPORTANT:
 *
 * This function ALWAYS starts from My Communities.
 *
 * This prevents the next test from accidentally starting
 * on Care Notes, Earlier, Resident Profile, or another
 * intermediate screen.
 */

await ensureMyCommunities()

const residentName =
    await selectResident()

console.log(
    `Opening Adhoc for "${residentName}"`
)

await testBot.waitUntilVisible(
    selectors.adhocButton,
    10000
)

await testBot.click(
    selectors.adhocButton
)

await driver.pause(2000)

/*
 * Expand all is optional.
 *
 * We do NOT use the old positional weightIcon locator.
 * The Weigh text locator is used instead.
 */

if (await isVisible(selectors.expandAll)) {

    try {

        await testBot.click(
            selectors.expandAll
        )

        console.log(
            'Expanded activity sections.'
        )

        await driver.pause(1500)

    } catch {
        console.log(
            'Could not expand sections. Continuing.'
        )
    }
}

/*
 * Find Weigh.
 */

let weighVisible =
    await isVisible(selectors.weigh)

if (!weighVisible) {

    console.log(
        'Weigh not visible. Scrolling.'
    )

    try {

        const weighElement = await $(
            'android=new UiScrollable(' +
            'new UiSelector().scrollable(true).instance(0))' +
            '.scrollIntoView(' +
            'new UiSelector().textMatches("^Weigh$"))'
        )

        weighVisible =
            await weighElement.isExisting()

    } catch (error) {

        console.warn(
            'Could not scroll to Weigh:',
            error
        )
    }
}

if (!weighVisible) {

    await dumpPageSource(
        'navigateToWeightScreen_weigh_not_found'
    )

    throw new Error(
        'Weigh option could not be found.'
    )
}

await testBot.click(
    selectors.weigh
)

await driver.pause(1000)

/*
 * Next.
 */

await testBot.waitUntilVisible(
    selectors.next,
    10000
)

await testBot.click(
    selectors.next
)

await driver.pause(1500)

/*
 * Weight input.
 */

await testBot.waitUntilVisible(
    selectors.weightInput,
    10000
)

console.log(
    'Weight entry screen is ready.'
)

return residentName
```

}

// ============================================================
// WEIGHT ENTRY
// ============================================================

async function enterWeight(
value: string
): Promise<void> {

```
await testBot.waitUntilVisible(
    selectors.weightInput,
    10000
)

await testBot.click(
    selectors.weightInput
)

await driver.pause(300)

try {

    const locatorText =
        await (testBot as any)
            .getLocatorTextForElement(
                selectors.weightInput
            )

    const element = await $(
        locatorText
    )

    await element.clearValue()

} catch {
    console.warn(
        'Could not clear input using clearValue.'
    )
}

if (value !== '') {

    await testBot.enterText(
        selectors.weightInput,
        value,
        false
    )
}

await driver.pause(500)

await hideKeyboard()
```

}

// ============================================================
// VALIDATION CHECK
// ============================================================

async function hasValidationError(): Promise<boolean> {

```
return isVisible(
    selectors.validationError
)
```

}

// ============================================================
// DURATION SELECTION
// ============================================================

async function selectDuration(): Promise<boolean> {

```
const duration =
    DURATION_OPTIONS[
        Math.floor(
            Math.random() *
            DURATION_OPTIONS.length
        )
    ]

console.log(
    `Selecting duration: ${duration}`
)

const durationXpath =
    `//android.view.ViewGroup[` +
    `@resource-id="com.personcentredsoftware.care.delivery:id/DurationField"` +
    `]//android.widget.TextView[` +
    `@text="${duration}"` +
    `]`

let durationElement =
    await $(durationXpath)

/*
 * Try to find the duration.
 */

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
        `Duration "${duration}" not visible. Scrolling.`
    )

    const size =
        await driver.getWindowSize()

    await driver.execute(
        'mobile: swipeGesture',
        {
            left: Math.floor(
                size.width * 0.2
            ),
            top: Math.floor(
                size.height * 0.6
            ),
            width: Math.floor(
                size.width * 0.6
            ),
            height: Math.floor(
                size.height * 0.3
            ),
            direction: 'up',
            percent: 0.5,
        }
    )

    await driver.pause(800)

    durationElement =
        await $(durationXpath)
}

if (
    !(
        await durationElement.isExisting()
    )
) {

    console.warn(
        `Duration "${duration}" was not found.`
    )

    return false
}

/*
 * Tap duration and verify Confirm becomes enabled.
 */

for (
    let attempt = 1;
    attempt <= 3;
    attempt++
) {

    await durationElement.click()

    await driver.pause(1000)

    const confirmButton =
        await $(
            '//android.widget.Button[' +
            '@resource-id="com.personcentredsoftware.care.delivery:id/ConfirmButton"' +
            ']'
        )

    const enabled =
        await confirmButton
            .waitForEnabled({
                timeout: 5000,
            })
            .catch(() => false)

    if (enabled) {

        console.log(
            `Duration "${duration}" selected successfully.`
        )

        return true
    }

    console.log(
        `Duration selection attempt ${attempt} did not enable Confirm.`
    )
}

return false
```

}

// ============================================================
// COMPLETE RECORD
// ============================================================

async function completeWeightRecord(): Promise<void> {

```
const durationSelected =
    await selectDuration()

if (!durationSelected) {

    throw new Error(
        'Confirm button did not become enabled after selecting a duration.'
    )
}

await testBot.click(
    selectors.confirm
)

await driver.pause(1500)

await testBot.waitUntilVisible(
    selectors.createRecords,
    10000
)

await testBot.click(
    selectors.createRecords
)

await driver.pause(2000)

/*
 * Earlier page.
 */

await testBot.waitUntilVisible(
    selectors.earlier,
    10000
)

await testBot.click(
    selectors.earlier
)

await driver.pause(1500)

/*
 * Close Earlier.
 */

await testBot.waitUntilVisible(
    selectors.close,
    10000
)

console.log(
    'Closing Earlier page.'
)

await testBot.click(
    selectors.close
)

await driver.pause(2000)

/*
 * VERY IMPORTANT:
 *
 * The test does not continue until My Communities
 * is actually visible.
 */

await testBot.waitUntilVisible(
    selectors.myCommunities,
    30000
)

console.log(
    'Successfully returned to My Communities.'
)
```

}

// ============================================================
// RESET FOR NEXT TEST
// ============================================================

async function prepareNextTest(): Promise<void> {

```
await driver.pause(1000)

/*
 * Never allow the next test to inherit the previous
 * test's screen.
 */

await ensureMyCommunities()

await testBot.waitUntilVisible(
    selectors.myCommunities,
    15000
)

console.log(
    'Application is ready for the next test.'
)
```

}

// ============================================================
// SMOKE TEST
// ============================================================

describe(
'Resident Area Profile - Observations - Weight - SMOKE',
() => {

```
    it(
        'Smoke - Blank weight shows validation',
        async function () {

            try {

                await navigateToWeightScreen()

                await enterWeight(
                    BLANK_VALUE
                )

                const validation =
                    await hasValidationError()

                expect(validation).toBe(true)

            } catch (error) {

                await dumpPageSource(
                    'Smoke_blank_weight'
                )

                throw error
            }
        }
    )

    it(
        'Smoke - Invalid weight shows validation',
        async function () {

            try {

                await prepareNextTest()

                await navigateToWeightScreen()

                const invalid =
                    INVALID_VALUES[
                        Math.floor(
                            Math.random() *
                            INVALID_VALUES.length
                        )
                    ]

                console.log(
                    `Testing invalid weight: ${invalid}`
                )

                await enterWeight(
                    invalid
                )

                const validation =
                    await hasValidationError()

                expect(validation).toBe(true)

            } catch (error) {

                await dumpPageSource(
                    'Smoke_invalid_weight'
                )

                throw error
            }
        }
    )

    it(
        'Smoke - Valid weight can continue',
        async function () {

            try {

                await prepareNextTest()

                await navigateToWeightScreen()

                await enterWeight(
                    '260'
                )

                const validation =
                    await hasValidationError()

                expect(validation).toBe(false)

            } catch (error) {

                await dumpPageSource(
                    'Smoke_valid_weight'
                )

                throw error
            }
        }
    )

    it(
        'Smoke - Complete weight observation',
        async function () {

            try {

                await prepareNextTest()

                await navigateToWeightScreen()

                await enterWeight(
                    '260'
                )

                const validation =
                    await hasValidationError()

                expect(validation).toBe(false)

                await completeWeightRecord()

            } catch (error) {

                await dumpPageSource(
                    'Smoke_complete_record'
                )

                throw error
            }
        }
    )
}
```

)

// ============================================================
// THOROUGH BOUNDARY TEST
// ============================================================

describe(
'Resident Area Profile - Observations - Weight - THOROUGH',
() => {

```
    /*
     * One resident is selected for the entire thorough run.
     *
     * The resident name is stored only so that logging can
     * identify the selected resident. Each individual test
     * still starts from My Communities.
     */

    let residentName = ''

    it(
        'Thorough - Select resident and test blank value',
        async function () {

            try {

                residentName =
                    await navigateToWeightScreen()

                console.log(
                    `Thorough tests using resident: ${residentName}`
                )

                await enterWeight(
                    BLANK_VALUE
                )

                const validation =
                    await hasValidationError()

                expect(validation).toBe(true)

            } catch (error) {

                await dumpPageSource(
                    'Thorough_blank_weight'
                )

                throw error
            }
        }
    )

    INVALID_VALUES.forEach(
        (invalidValue, index) => {

            it(
                `Thorough ${index + 1} - Invalid value "${invalidValue}"`,
                async function () {

                    try {

                        await prepareNextTest()

                        await navigateToWeightScreen()

                        console.log(
                            `Testing invalid value: "${invalidValue}"`
                        )

                        await enterWeight(
                            invalidValue
                        )

                        const validation =
                            await hasValidationError()

                        expect(validation).toBe(true)

                    } catch (error) {

                        await dumpPageSource(
                            `Thorough_invalid_${index + 1}`
                        )

                        throw error
                    }
                }
            )
        }
    )

    VALID_VALUES.forEach(
        (validValue, index) => {

            it(
                `Thorough ${index + 1} - Valid value "${validValue}"`,
                async function () {

                    try {

                        await prepareNextTest()

                        await navigateToWeightScreen()

                        console.log(
                            `Testing valid value: "${validValue}"`
                        )

                        await enterWeight(
                            validValue
                        )

                        const validation =
                            await hasValidationError()

                        expect(validation).toBe(false)

                    } catch (error) {

                        await dumpPageSource(
                            `Thorough_valid_${index + 1}`
                        )

                        throw error
                    }
                }
            )
        }
    )

    it(
        'Thorough - Complete valid weight observation',
        async function () {

            try {

                await prepareNextTest()

                await navigateToWeightScreen()

                console.log(
                    `Completing observation for resident: ${residentName}`
                )

                await enterWeight(
                    '260'
                )

                const validation =
                    await hasValidationError()

                expect(validation).toBe(false)

                await completeWeightRecord()

                /*
                 * Final assertion.
                 */

                expect(
                    await isVisible(
                        selectors.myCommunities
                    )
                ).toBe(true)

            } catch (error) {

                await dumpPageSource(
                    'Thorough_complete_record'
                )

                throw error
            }
        }
    )
}
```

)
