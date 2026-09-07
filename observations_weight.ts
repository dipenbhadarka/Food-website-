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

async function dumpPageSourceOnFailure(stepLabel: string) {
    console.error(
        `Failure at ${stepLabel} — dumping page source`
    )

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

// ═══════════════════════════════════════════════
// SELECT RANDOM RESIDENT
// ═══════════════════════════════════════════════

async function selectRandomResident(): Promise<string> {
    console.log(
        '▶ Scanning screen for visible care recipients...'
    )

    const visibleCandidates: string[] = []

    for (const candidateName of CARE_RECIPIENTS) {
        const locator =
            residentLocator(candidateName)

        const isPresent =
            await testBot
                .isVisible(locator)
                .catch(() => false)

        if (isPresent) {
            visibleCandidates.push(
                candidateName
            )
        }
    }

    console.log(
        `▶ Found ${visibleCandidates.length} visible candidate(s):`,
        visibleCandidates
    )

    // ─────────────────────────────────────────
    // Scroll fallback
    // ─────────────────────────────────────────

    if (visibleCandidates.length === 0) {
        console.warn(
            'No residents immediately visible — using scroll fallback'
        )

        const shuffled =
            [...CARE_RECIPIENTS].sort(
                () => Math.random() - 0.5
            )

        for (const candidateName of shuffled) {
            try {
                const scrolled =
                    await $(
                        'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
                            `.scrollIntoView(new UiSelector().textMatches("^${candidateName}$"))`
                    )

                if (
                    await scrolled.isExisting()
                ) {
                    await scrolled.click()

                    console.log(
                        `▶ Selected resident: "${candidateName}"`
                    )

                    return candidateName
                }
            } catch (err) {
                console.warn(
                    `"${candidateName}" not found — trying next resident`
                )
            }
        }

        await dumpPageSourceOnFailure(
            'selectRandomResident - no resident found'
        )

        throw new Error(
            'Could not select any resident'
        )
    }

    // ─────────────────────────────────────────
    // Random visible resident
    // ─────────────────────────────────────────

    const randomIndex =
        Math.floor(
            Math.random() *
                visibleCandidates.length
        )

    const selectedResident =
        visibleCandidates[randomIndex]

    console.log(
        `▶ Randomly selected resident: "${selectedResident}"`
    )

    await testBot.click(
        residentLocator(
            selectedResident
        )
    )

    await driver.pause(2000)

    return selectedResident
}

// ═══════════════════════════════════════════════
// ONLY TWO WEIGHT TEST VALUES
// ═══════════════════════════════════════════════

const VALID_WEIGHT = '260'
const INVALID_WEIGHT = '501'

// ═══════════════════════════════════════════════
// SELECTORS
// ═══════════════════════════════════════════════

const selectors = {
    // ─────────────────────────────────────────
    // Adhoc
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
    // Expand all
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
    // Weigh
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
    // Next
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
    // Weight field
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
    // Other Durations
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
    // Duration entry
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
    // Continue / Confirm
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
    // Care Note / Create Records
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
    // IMPORTANT:
    // BOTTOM CLOSE BUTTON AFTER CARE NOTE
    // ═════════════════════════════════════════

    careNoteCloseButton: {
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
                '//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/ProfilePage"]/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup/android.widget.Button'
            ),
        ios:
            iOSLocatorBuilder.xpath(
                '//XCUIElementTypeButton[@name="Earlier"]'
            ),
    } as TestBotElement,

    // ═════════════════════════════════════════
    // RIGHT-SIDE CLOSE ICON ON EARLIER PAGE
    // ═════════════════════════════════════════

    earlierCloseIcon: {
        android:
            AndroidLocatorBuilder.xpath(
                '(//android.widget.Button[@text=""])[1] | ' +
                    '//android.widget.ImageView[@content-desc="Close"] | ' +
                    '//android.widget.Button[@content-desc="Close"] | ' +
                    '//android.widget.Button[@text="Close"]'
            ),

        ios:
            iOSLocatorBuilder.xpath(
                '(//XCUIElementTypeButton[@name=""])[1] | ' +
                    '//XCUIElementTypeButton[@name="Close"]'
            ),
    } as TestBotElement,

    // ─────────────────────────────────────────
    // My Communities
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

    // ─────────────────────────────────────────
    // Validation error
    // ─────────────────────────────────────────

    validationErrorMessage: {
        android:
            AndroidLocatorBuilder.xpath(
                '//android.widget.TextView[' +
                    'contains(@text,"required") or ' +
                    'contains(@text,"invalid") or ' +
                    'contains(@text,"Invalid") or ' +
                    'contains(@text,"must be") or ' +
                    'contains(@text,"20") or ' +
                    'contains(@text,"500")' +
                    ']'
            ),

        ios:
            iOSLocatorBuilder.xpath(
                '//XCUIElementTypeStaticText[' +
                    'contains(@name,"required") or ' +
                    'contains(@name,"invalid") or ' +
                    'contains(@name,"Invalid") or ' +
                    'contains(@name,"must be") or ' +
                    'contains(@name,"20") or ' +
                    'contains(@name,"500")' +
                    ']'
            ),
    } as TestBotElement,

    // ─────────────────────────────────────────
    // Baseline message
    // ─────────────────────────────────────────

    baselineMessage: {
        android:
            AndroidLocatorBuilder.xpath(
                '//android.widget.TextView[' +
                    'contains(@text,"baseline") or ' +
                    'contains(@text,"Baseline")' +
                    ']'
            ),

        ios:
            iOSLocatorBuilder.xpath(
                '//XCUIElementTypeStaticText[' +
                    'contains(@name,"baseline") or ' +
                    'contains(@name,"Baseline")' +
                    ']'
            ),
    } as TestBotElement,
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

    try {
        const element =
            await $(
                await (
                    testBot as any
                ).getLocatorTextForElement(
                    selectors.weightInputField
                )
            )

        await element.clearValue()
    } catch (clearErr) {
        console.warn(
            'Could not clear weight field:',
            clearErr
        )
    }

    await testBot.enterText(
        selectors.weightInputField,
        value,
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
}

// ═══════════════════════════════════════════════
// CHECK VALIDATION MESSAGE
// ═══════════════════════════════════════════════

async function checkValidationMessage(
    label: string
): Promise<boolean> {
    const validationShown =
        await testBot
            .isVisible(
                selectors.validationErrorMessage
            )
            .catch(() => false)

    console.log(
        `[${label}] Validation message visible: ${validationShown}`
    )

    return validationShown
}

// ═══════════════════════════════════════════════
// SELECT DURATION
// ═══════════════════════════════════════════════

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

    console.log(
        `▶ Selecting duration: "${randomDuration}"`
    )

    const durationXpath =
        `//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/DurationField"]` +
        `//android.widget.TextView[@text="${randomDuration}"]`

    let durationEl =
        await $(
            durationXpath
        )

    for (
        let attempt = 0;
        attempt < 4;
        attempt++
    ) {
        if (
            (await durationEl.isExisting()) &&
            (await durationEl.isDisplayed())
        ) {
            break
        }

        console.log(
            `Duration not visible — scrolling attempt ${
                attempt + 1
            }`
        )

        const {
            width,
            height,
        } =
            await driver.getWindowSize()

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

        durationEl =
            await $(
                durationXpath
            )
    }

    if (
        !(await durationEl.isExisting())
    ) {
        console.warn(
            `Duration "${randomDuration}" not found — trying Other Durations`
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
        durationEl =
            await $(
                durationXpath
            )

        await durationEl.click()

        console.log(
            `Tapped "${randomDuration}"`
        )

        await driver.pause(1500)

        const confirmButton =
            await $(
                '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/ConfirmButton"]'
            )

        confirmEnabled =
            await confirmButton
                .waitForEnabled({
                    timeout: 5000,
                })
                .catch(
                    () => false
                )
    }

    return confirmEnabled
}

// ═══════════════════════════════════════════════
// OTHER DURATIONS
// ═══════════════════════════════════════════════

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

    console.log(
        '▶ Other Durations is visible'
    )

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

// ═══════════════════════════════════════════════
// NAVIGATE TO WEIGHT ENTRY
// ═══════════════════════════════════════════════

async function navigateToWeightEntryScreen(): Promise<string> {
    try {
        const selectedResident =
            await selectRandomResident()

        console.log(
            `▶ Selected resident: "${selectedResident}"`
        )

        await testBot.waitUntilVisible(
            selectors.adhocButton,
            5000
        )

        await testBot.click(
            selectors.adhocButton
        )

        await driver.pause(2000)

        // ─────────────────────────────────────
        // Expand all sections
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
                '▶ Expanded all sections'
            )

            await driver.pause(2000)
        } catch (err) {
            console.warn(
                'Expand-all button not available — continuing'
            )
        }

        // ─────────────────────────────────────
        // Find Weigh
        // ─────────────────────────────────────

        let weighFound =
            await testBot
                .isVisible(
                    selectors.weighText
                )
                .catch(() => false)

        if (!weighFound) {
            console.log(
                'Weigh not immediately visible — scrolling'
            )

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

        console.log(
            '▶ Selected Weigh'
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
            '▶ Clicked Next'
        )

        await driver.pause(2000)

        // ─────────────────────────────────────
        // Weight screen
        // ─────────────────────────────────────

        await testBot.waitUntilVisible(
            selectors.weightInputField,
            10000
        )

        console.log(
            '✓ Weight entry screen displayed'
        )

        return selectedResident
    } catch (err) {
        await dumpPageSourceOnFailure(
            'navigateToWeightEntryScreen'
        )

        throw err
    }
}

// ═══════════════════════════════════════════════
// RETURN TO WEIGHT SCREEN FOR SAME RESIDENT
// ═══════════════════════════════════════════════

async function returnToWeightEntryScreenForResident(
    residentName: string
): Promise<void> {
    try {
        console.log(
            `▶ Returning to weight screen for "${residentName}"`
        )

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
                'Resident not visible — scrolling'
            )

            try {
                const scrolled =
                    await $(
                        'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
                            `.scrollIntoView(new UiSelector().textMatches("^${residentName}$"))`
                    )

                residentFound =
                    await scrolled.isExisting()
            } catch (err) {
                console.warn(
                    'Scroll failed:',
                    err
                )
            }
        }

        if (!residentFound) {
            throw new Error(
                `Resident "${residentName}" not found`
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

            await driver.pause(1500)
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
                    'Unable to scroll to Weigh'
                )
            }
        }

        if (!weighFound) {
            throw new Error(
                'Weigh option not found'
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
            '✓ Returned to Weight entry screen'
        )
    } catch (err) {
        await dumpPageSourceOnFailure(
            'returnToWeightEntryScreenForResident'
        )

        throw err
    }
}

// ═══════════════════════════════════════════════
// FINAL NAVIGATION
//
// CARE NOTE
//    ↓
// BOTTOM CLOSE BUTTON
//    ↓
// EARLIER PAGE
//    ↓
// RIGHT-SIDE CLOSE ICON
//    ↓
// MY COMMUNITIES
// ═══════════════════════════════════════════════

async function closeCareNoteThenEarlier(): Promise<void> {
    console.log(
        '════════ FINAL NAVIGATION STARTED ════════'
    )

    // ═════════════════════════════════════════
    // STEP 1
    // CARE NOTE → BOTTOM CLOSE BUTTON
    // ═════════════════════════════════════════

    console.log(
        '▶ Step 1: Looking for bottom Close button on Care Note'
    )

    await testBot.waitUntilVisible(
        selectors.careNoteCloseButton,
        10000
    )

    console.log(
        '✓ Bottom Close button is visible'
    )

    await testBot.click(
        selectors.careNoteCloseButton
    )

    console.log(
        '✓ Clicked bottom Close button on Care Note'
    )

    await driver.pause(2000)

    // ═════════════════════════════════════════
    // STEP 2
    // OPEN EARLIER PAGE
    // ═════════════════════════════════════════

    console.log(
        '▶ Step 2: Opening Earlier page'
    )

    await testBot.waitUntilVisible(
        selectors.earlierTab,
        10000
    )

    await testBot.click(
        selectors.earlierTab
    )

    console.log(
        '✓ Earlier page opened'
    )

    await driver.pause(2000)

    // ═════════════════════════════════════════
    // STEP 3
    // EARLIER PAGE → RIGHT-SIDE CLOSE ICON
    // ═════════════════════════════════════════

    console.log(
        '▶ Step 3: Looking for right-side Close icon'
    )

    await testBot.waitUntilVisible(
        selectors.earlierCloseIcon,
        10000
    )

    console.log(
        '✓ Right-side Close icon is visible'
    )

    await testBot.click(
        selectors.earlierCloseIcon
    )

    console.log(
        '✓ Clicked right-side Close icon'
    )

    await driver.pause(2000)

    // ═════════════════════════════════════════
    // STEP 4
    // VERIFY MY COMMUNITIES
    // ═════════════════════════════════════════

    console.log(
        '▶ Step 4: Verifying redirect to My Communities'
    )

    await testBot.waitUntilVisible(
        selectors.myCommunitiesTab,
        30000
    )

    const communitiesVisible =
        await testBot
            .isVisible(
                selectors.myCommunitiesTab
            )
            .catch(() => false)

    if (!communitiesVisible) {
        throw new Error(
            'My Communities screen was not displayed after closing Earlier page'
        )
    }

    console.log(
        '✓ Successfully redirected to My Communities'
    )

    console.log(
        '════════ FINAL NAVIGATION COMPLETED ════════'
    )
}

// ═══════════════════════════════════════════════
// SMOKE TEST
// ═══════════════════════════════════════════════

describe(
    'Resident Area Profile - Observations - Weight - SMOKE TEST',
    () => {
        let residentName = ''

        // ═══════════════════════════════════════
        // STEP 1
        // Navigate to Weight
        // ═══════════════════════════════════════

        it(
            'Smoke Step 1 - Navigate to Weight entry screen',
            async function () {
                try {
                    residentName =
                        await navigateToWeightEntryScreen()

                    console.log(
                        `✓ Resident selected: "${residentName}"`
                    )
                } catch (err) {
                    await dumpPageSourceOnFailure(
                        'Smoke Step 1'
                    )

                    throw err
                }
            }
        )

        // ═══════════════════════════════════════
        // STEP 2
        // ONLY INVALID WEIGHT
        // ═══════════════════════════════════════

        it(
            `Smoke Step 2 - Invalid weight "${INVALID_WEIGHT}" shows validation`,
            async function () {
                try {
                    console.log(
                        `▶ Testing invalid weight: ${INVALID_WEIGHT}`
                    )

                    await enterWeightValue(
                        INVALID_WEIGHT
                    )

                    const validationShown =
                        await checkValidationMessage(
                            'Invalid weight'
                        )

                    if (
                        !validationShown
                    ) {
                        throw new Error(
                            `Invalid weight "${INVALID_WEIGHT}" did not display validation message`
                        )
                    }

                    console.log(
                        '✓ Invalid weight validation verified'
                    )
                } catch (err) {
                    await dumpPageSourceOnFailure(
                        'Smoke Step 2 - Invalid Weight'
                    )

                    throw err
                }
            }
        )

        // ═══════════════════════════════════════
        // STEP 3
        // ONLY VALID WEIGHT
        // ═══════════════════════════════════════

        it(
            `Smoke Step 3 - Valid weight "${VALID_WEIGHT}" is accepted`,
            async function () {
                try {
                    console.log(
                        `▶ Testing valid weight: ${VALID_WEIGHT}`
                    )

                    await enterWeightValue(
                        VALID_WEIGHT
                    )

                    const validationShown =
                        await checkValidationMessage(
                            'Valid weight'
                        )

                    if (
                        validationShown
                    ) {
                        throw new Error(
                            `Valid weight "${VALID_WEIGHT}" displayed validation message`
                        )
                    }

                    console.log(
                        '✓ Valid weight accepted'
                    )
                } catch (err) {
                    await dumpPageSourceOnFailure(
                        'Smoke Step 3 - Valid Weight'
                    )

                    throw err
                }
            }
        )

        // ═══════════════════════════════════════
        // STEP 4
        // COMPLETE CARE NOTE
        // ═══════════════════════════════════════

        it(
            'Smoke Step 4 - Create Care Note and close using correct navigation flow',
            async function () {
                try {
                    console.log(
                        '▶ Selecting duration'
                    )

                    const confirmEnabled =
                        await selectDurationOption()

                    if (
                        !confirmEnabled
                    ) {
                        throw new Error(
                            'Continue button did not become enabled after selecting duration'
                        )
                    }

                    console.log(
                        '✓ Continue button enabled'
                    )

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

                    // ═══════════════════════════
                    // CREATE CARE NOTE / RECORD
                    // ═══════════════════════════

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

                    // ═══════════════════════════
                    // FINAL NAVIGATION
                    // ═══════════════════════════

                    await closeCareNoteThenEarlier()

                    console.log(
                        '✓ Smoke test completed successfully'
                    )
                } catch (err) {
                    await dumpPageSourceOnFailure(
                        'Smoke Step 4 - Create Care Note'
                    )

                    throw err
                }
            }
        )
    }
)

// ═══════════════════════════════════════════════
// THOROUGH TEST
//
// Only:
// 1. Invalid weight
// 2. Valid weight
// 3. Complete Care Note
// 4. Bottom Close
// 5. Earlier
// 6. Right-side Close
// 7. My Communities
// ═══════════════════════════════════════════════

describe(
    'Resident Area Profile - Observations - Weight - THOROUGH',
    () => {
        let residentName = ''

        // ═══════════════════════════════════════
        // STEP 1
        // ═══════════════════════════════════════

        it(
            'Thorough Step 1 - Navigate to Weight entry screen',
            async function () {
                try {
                    residentName =
                        await navigateToWeightEntryScreen()

                    console.log(
                        `✓ Resident selected: "${residentName}"`
                    )
                } catch (err) {
                    await dumpPageSourceOnFailure(
                        'Thorough Step 1'
                    )

                    throw err
                }
            }
        )

        // ═══════════════════════════════════════
        // STEP 2
        // INVALID ONLY
        // ═══════════════════════════════════════

        it(
            `Thorough Step 2 - Invalid weight "${INVALID_WEIGHT}"`,
            async function () {
                try {
                    await enterWeightValue(
                        INVALID_WEIGHT
                    )

                    const validationShown =
                        await checkValidationMessage(
                            'Thorough Invalid Weight'
                        )

                    expect(
                        validationShown
                    ).toBe(true)

                    console.log(
                        '✓ Invalid weight validation passed'
                    )
                } catch (err) {
                    await dumpPageSourceOnFailure(
                        'Thorough Step 2 - Invalid Weight'
                    )

                    throw err
                }
            }
        )

        // ═══════════════════════════════════════
        // STEP 3
        // VALID ONLY
        // ═══════════════════════════════════════

        it(
            `Thorough Step 3 - Valid weight "${VALID_WEIGHT}"`,
            async function () {
                try {
                    await returnToWeightEntryScreenForResident(
                        residentName
                    )

                    await enterWeightValue(
                        VALID_WEIGHT
                    )

                    const validationShown =
                        await checkValidationMessage(
                            'Thorough Valid Weight'
                        )

                    expect(
                        validationShown
                    ).toBe(false)

                    console.log(
                        '✓ Valid weight accepted'
                    )
                } catch (err) {
                    await dumpPageSourceOnFailure(
                        'Thorough Step 3 - Valid Weight'
                    )

                    throw err
                }
            }
        )

        // ═══════════════════════════════════════
        // STEP 4
        // CREATE CARE NOTE
        // ═══════════════════════════════════════

        it(
            'Thorough Step 4 - Create Care Note and perform Close navigation',
            async function () {
                try {
                    // Make sure we are on Weight screen
                    await returnToWeightEntryScreenForResident(
                        residentName
                    )

                    // Enter ONLY valid weight
                    await enterWeightValue(
                        VALID_WEIGHT
                    )

                    console.log(
                        `✓ Entered valid weight: ${VALID_WEIGHT}`
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

                    // ═══════════════════════════
                    // CREATE CARE NOTE
                    // ═══════════════════════════

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

                    await driver.pause(
                        2000
                    )

                    // ═══════════════════════════
                    // IMPORTANT NAVIGATION
                    //
                    // 1. Bottom Close
                    // 2. Earlier
                    // 3. Right-side Close
                    // 4. My Communities
                    // ═══════════════════════════

                    await closeCareNoteThenEarlier()

                    console.log(
                        '✓ Thorough test completed successfully'
                    )
                } catch (err) {
                    await dumpPageSourceOnFailure(
                        'Thorough Step 4 - Final Navigation'
                    )

                    throw err
                }
            }
        )
    }
)
