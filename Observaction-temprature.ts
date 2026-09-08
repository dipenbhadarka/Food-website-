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

```
return {
    android: AndroidLocatorBuilder.xpath(
        `//android.widget.TextView[@text="${name}"]`
    ),

    ios: iOSLocatorBuilder.xpath(
        `//XCUIElementTypeStaticText[@name="${name}"]`
    ),
} as TestBotElement
```

}

// ═══════════════════════════════════════════════
// PAGE SOURCE DUMP
// ═══════════════════════════════════════════════

async function dumpPageSourceOnFailure(
stepLabel: string
): Promise<void> {

```
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
```

}

// ═══════════════════════════════════════════════
// SELECTORS
// ═══════════════════════════════════════════════

const selectors = {

```
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

// PLATFORM-SAFE TEMPERATURE SELECTION CONTROL

temperatureSelectionButton: {
    android:
        AndroidLocatorBuilder.xpath(
            '//androidx.recyclerview.widget.RecyclerView/android.view.ViewGroup[4]/android.view.ViewGroup/android.view.ViewGroup[3]/android.view.ViewGroup/android.widget.ImageView'
        ),

    ios:
        iOSLocatorBuilder.xpath(
            '//XCUIElementTypeImage'
        ),
} as TestBotElement,

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
```

}

// ═══════════════════════════════════════════════
// SELECT RESIDENT
// ═══════════════════════════════════════════════

async function selectResident(): Promise<string> {

```
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

console.log(
    '▶ No resident immediately visible — scrolling'
)

for (
    const candidateName
    of CARE_RECIPIENTS
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
    'selectResident'
)

throw new Error(
    'No care recipient could be selected'
)
```

}

// ═══════════════════════════════════════════════
// ENTER TEMPERATURE VALUE
// ═══════════════════════════════════════════════

async function enterValue(
field: TestBotElement,
value: string
): Promise<void> {

```
console.log(
    `▶ Entering temperature value: ${value}`
)

await testBot.waitUntilVisible(
    field,
    10000
)

const locator =
    await (
        testBot as any
    ).getLocatorTextForElement(field)

const inputElement =
    await $(locator)

await inputElement.waitForDisplayed({
    timeout: 10000,
})

await inputElement.click()

await driver.pause(300)

try {

    await inputElement.clearValue()

} catch (clearErr) {

    console.warn(
        `Could not clear temperature field before entering ${value}:`,
        clearErr
    )
}

await inputElement.setValue(value)

await driver.pause(700)

try {

    await driver.hideKeyboard()

    await driver.pause(400)

} catch (err) {

    console.log(
        'Keyboard already hidden'
    )
}

console.log(
    `✓ Temperature value entered: ${value}`
)
```

}

// ═══════════════════════════════════════════════
// ENTER RAW FIELD VALUE
// ═══════════════════════════════════════════════

async function enterRawFieldValue(
field: any,
value: string
): Promise<void> {

```
await field.waitForDisplayed({
    timeout: 10000,
})

await field.click()

await driver.pause(300)

try {

    await field.clearValue()

} catch (clearErr) {

    console.warn(
        'Could not clear raw field:',
        clearErr
    )
}

await field.setValue(value)

await driver.pause(600)

try {

    await driver.hideKeyboard()

    await driver.pause(500)

} catch (err) {

    console.log(
        'Keyboard already hidden'
    )
}
```

}

// ═══════════════════════════════════════════════
// CHECK VALIDATION
// ═══════════════════════════════════════════════

async function isValidationVisible():
Promise<boolean> {

```
return await testBot
    .isVisible(
        selectors.validationErrorMessage
    )
    .catch(() => false)
```

}

// ═══════════════════════════════════════════════
// ASSERT BVA RESULT
// ═══════════════════════════════════════════════

async function assertBoundaryResult(
fieldName: string,
testCase: TemperatureBoundaryCase,
validationVisible: boolean
): Promise<void> {

```
if (testCase.expectedValid) {

    if (validationVisible) {

        throw new Error(
            `BVA FAILED: ${fieldName} value "${testCase.value}" ` +
            `(${testCase.description}) should be VALID ` +
            `but validation was displayed`
        )
    }

    console.log(
        `✓ PASS: ${fieldName} → ${testCase.value} accepted`
    )

    return
}

if (!validationVisible) {

    throw new Error(
        `BVA FAILED: ${fieldName} value "${testCase.value}" ` +
        `(${testCase.description}) should be INVALID ` +
        `but validation was NOT displayed`
    )
}

console.log(
    `✓ PASS: ${fieldName} → ${testCase.value} correctly rejected`
)
```

}

// ═══════════════════════════════════════════════
// TEMPERATURE BVA
// ═══════════════════════════════════════════════

async function runTemperatureBoundaryValueAnalysis():
Promise<void> {

```
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

await testBot.waitUntilVisible(
    selectors.temperatureInputField,
    10000
)

for (
    const testCase
    of TEMPERATURE_BOUNDARY_CASES
) {

    console.log(
        '────────────────────────────────────'
    )

    console.log(
        `▶ Testing Temperature: ${testCase.value}`
    )

    console.log(
        `▶ ${testCase.description}`
    )

    await enterValue(
        selectors.temperatureInputField,
        testCase.value
    )

    await driver.pause(800)

    const validationVisible =
        await isValidationVisible()

    await assertBoundaryResult(
        'Temperature',
        testCase,
        validationVisible
    )

    console.log(
        `✓ Completed Temperature test: ${testCase.value}`
    )

    await driver.pause(500)
}

console.log(
    '────────────────────────────────────'
)

console.log(
    `▶ Setting final valid Temperature: ${FINAL_VALID_TEMPERATURE}`
)

await enterValue(
    selectors.temperatureInputField,
    FINAL_VALID_TEMPERATURE
)

await driver.pause(800)

const finalValidationVisible =
    await isValidationVisible()

if (finalValidationVisible) {

    throw new Error(
        `Final Temperature value ${FINAL_VALID_TEMPERATURE} ` +
        `is showing validation`
    )
}

console.log(
    `✓ Temperature remains selected with value ${FINAL_VALID_TEMPERATURE}`
)

console.log(
    '✓ Temperature BVA completed successfully'
)

console.log(
    '════════════════════════════════════'
)
```

}

// ═══════════════════════════════════════════════
// GET FIELDS AFTER NEXT
// ═══════════════════════════════════════════════

async function getFieldsAfterNext(): Promise<any[]> {

```
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
        `Expected at least two fields after Next but found ${fields.length}`
    )
}

return fields
```

}

// ═══════════════════════════════════════════════
// RESET RAW FIELD
// ═══════════════════════════════════════════════

async function resetRawFieldToValidValue(
field: any,
fieldName: string
): Promise<void> {

```
console.log(
    `▶ Resetting ${fieldName} to valid value ${FINAL_VALID_TEMPERATURE}`
)

await enterRawFieldValue(
    field,
    FINAL_VALID_TEMPERATURE
)

await driver.pause(500)

const validationVisible =
    await isValidationVisible()

if (validationVisible) {

    throw new Error(
        `Unable to reset ${fieldName}. ` +
        `Valid value ${FINAL_VALID_TEMPERATURE} still shows validation.`
    )
}

console.log(
    `✓ ${fieldName} reset successfully`
)
```

}

// ═══════════════════════════════════════════════
// RUN BVA AGAINST RAW FIELD
// ═══════════════════════════════════════════════

async function runRawFieldBVA(
field: any,
fieldName: string
): Promise<void> {

```
console.log(
    '────────────────────────────────────'
)

console.log(
    `▶ STARTING BVA FOR ${fieldName}`
)

console.log(
    `▶ Expected range: ${TEMPERATURE_MIN} - ${TEMPERATURE_MAX}`
)

console.log(
    '────────────────────────────────────'
)

for (
    const testCase
    of TEMPERATURE_BOUNDARY_CASES
) {

    console.log(
        `▶ ${fieldName} → Testing ${testCase.value}`
    )

    console.log(
        `▶ ${testCase.description}`
    )

    await resetRawFieldToValidValue(
        field,
        fieldName
    )

    await enterRawFieldValue(
        field,
        testCase.value
    )

    await driver.pause(700)

    const validationVisible =
        await isValidationVisible()

    await assertBoundaryResult(
        fieldName,
        testCase,
        validationVisible
    )

    await driver.pause(500)
}

await resetRawFieldToValidValue(
    field,
    fieldName
)

console.log(
    `✓ ${fieldName} BVA PASSED`
)
```

}

// ═══════════════════════════════════════════════
// ADDITIONAL FIELDS BVA
// ═══════════════════════════════════════════════

async function runAdditionalFieldsBVA():
Promise<void> {

```
console.log(
    '════════════════════════════════════'
)

console.log(
    '▶ STARTING BVA FOR ADDITIONAL FIELDS'
)

console.log(
    `▶ Expected range: ${TEMPERATURE_MIN} - ${TEMPERATURE_MAX}`
)

console.log(
    '════════════════════════════════════'
)

const fields =
    await getFieldsAfterNext()

const firstField =
    fields[0]

const secondField =
    fields[1]

await runRawFieldBVA(
    firstField,
    'Field 1 after Next'
)

await runRawFieldBVA(
    secondField,
    'Field 2 after Next'
)

await enterRawFieldValue(
    firstField,
    FINAL_VALID_TEMPERATURE
)

await driver.pause(300)

await enterRawFieldValue(
    secondField,
    FINAL_VALID_TEMPERATURE
)

await driver.pause(500)

const finalValidation =
    await isValidationVisible()

if (finalValidation) {

    throw new Error(
        'Additional fields show validation even with final valid value 40'
    )
}

console.log(
    '✓ Final valid value 40 accepted in both additional fields'
)

console.log(
    '════════════════════════════════════'
)

console.log(
    '✓ ALL ADDITIONAL FIELD BVA TESTS PASSED'
)

console.log(
    '════════════════════════════════════'
)
```

}

// ═══════════════════════════════════════════════
// NAVIGATE TO TEMPERATURE
// ═══════════════════════════════════════════════

async function navigateToTemperature():
Promise<string> {

```
try {

    const residentName =
        await selectResident()

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

    let temperatureVisible =
        await testBot
            .isVisible(
                selectors.temperatureText
            )
            .catch(() => false)

    if (!temperatureVisible) {

        console.log(
            '▶ Temperature not immediately visible — scrolling'
        )

        try {

            const temperatureElement =
                await $(
                    'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
                    '.scrollIntoView(new UiSelector().text("Temperature"))'
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

    console.log(
        '▶ Selecting Temperature using platform-specific selection control'
    )

    await testBot.waitUntilVisible(
        selectors.temperatureSelectionButton,
        10000
    )

    const temperatureSelectionLocator =
        await (
            testBot as any
        ).getLocatorTextForElement(
            selectors.temperatureSelectionButton
        )

    const temperatureSelectionElement =
        await $(
            temperatureSelectionLocator
        )

    await temperatureSelectionElement.waitForExist({
        timeout: 10000,
    })

    await temperatureSelectionElement.waitForDisplayed({
        timeout: 10000,
    })

    if (
        typeof temperatureSelectionElement.waitForEnabled === 'function'
    ) {

        await temperatureSelectionElement.waitForEnabled({
            timeout: 10000,
        })
    }

    try {

        await temperatureSelectionElement.scrollIntoView()

        await driver.pause(300)

    } catch (scrollErr) {

        console.warn(
            'Could not scroll Temperature selection control into view'
        )
    }

    await temperatureSelectionElement.click()

    console.log(
        '✓ Temperature selection control clicked once'
    )

    await driver.pause(1200)

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
```

}

// ═══════════════════════════════════════════════
// CLICK NEXT
// ═══════════════════════════════════════════════

async function clickNext():
Promise<void> {

```
console.log(
    '▶ Preparing to continue from Temperature'
)

await testBot.waitUntilVisible(
    selectors.temperatureInputField,
    10000
)

console.log(
    `✓ Temperature value ${FINAL_VALID_TEMPERATURE} is ready`
)

try {

    await driver.hideKeyboard()

    await driver.pause(500)

} catch (err) {

    console.log(
        'Keyboard already hidden'
    )
}

const nextLocator =
    await (
        testBot as any
    ).getLocatorTextForElement(
        selectors.nextButton
    )

const nextElement =
    await $(nextLocator)

await nextElement.waitForExist({
    timeout: 10000,
})

await nextElement.waitForDisplayed({
    timeout: 10000,
})

await nextElement.waitForEnabled({
    timeout: 10000,
})

try {

    await nextElement.scrollIntoView()

    await driver.pause(300)

} catch (scrollErr) {

    console.warn(
        'Could not scroll Next button into view:',
        scrollErr
    )
}

await nextElement.click()

console.log(
    '✓ Clicked Next'
)

await driver.pause(2000)
```

}

// ═══════════════════════════════════════════════
// FINAL TEMPERATURE
// ═══════════════════════════════════════════════

async function enterFinalTemperature():
Promise<void> {

```
console.log(
    `▶ Confirming final valid temperature: ${FINAL_VALID_TEMPERATURE}`
)

await testBot.waitUntilVisible(
    selectors.temperatureInputField,
    10000
)

const locator =
    await (
        testBot as any
    ).getLocatorTextForElement(
        selectors.temperatureInputField
    )

const inputElement =
    await $(locator)

await inputElement.waitForDisplayed({
    timeout: 10000,
})

let currentValue = ''

try {

    currentValue =
        await inputElement.getValue()

} catch (err) {

    console.warn(
        'Could not read current temperature value'
    )
}

console.log(
    `▶ Current Temperature value: "${currentValue}"`
)

if (
    currentValue !== FINAL_VALID_TEMPERATURE
) {

    await enterValue(
        selectors.temperatureInputField,
        FINAL_VALID_TEMPERATURE
    )
}

await driver.pause(700)

const validationVisible =
    await isValidationVisible()

if (validationVisible) {

    throw new Error(
        `Final valid temperature ${FINAL_VALID_TEMPERATURE} shows validation`
    )
}

try {

    await driver.hideKeyboard()

    await driver.pause(500)

} catch (err) {

    console.log(
        'Keyboard already hidden'
    )
}

console.log(
    `✓ Final Temperature ${FINAL_VALID_TEMPERATURE} accepted`
)
```

}

// ═══════════════════════════════════════════════
// COMPLETE CLOSE NAVIGATION
// ═══════════════════════════════════════════════

async function completeCloseNavigation():
Promise<void> {

```
console.log(
    '════════ FINAL CLOSE FLOW ════════'
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
```

}

// ═══════════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════════

describe(
'Resident Area Profile - Observations - Temperature - Boundary Value Analysis',
() => {

```
    let residentName = ''

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
