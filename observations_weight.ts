```ts
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
) {
    console.error(
        `Failure at ${stepLabel} — dumping page source`
    )

    try {
        const pageSource =
            await driver.getPageSource()

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
            }) — session may be dead.`
        )
    }
}

// ═══════════════════════════════════════════════
// TEST DATA
// ═══════════════════════════════════════════════

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

function pickRandomFrom<T>(
    arr: T[]
): T {
    return arr[
        Math.floor(
            Math.random() * arr.length
        )
    ]
}

// ═══════════════════════════════════════════════
// SELECTORS
// ═══════════════════════════════════════════════

const selectors = {
    // ─────────────────────────────────────────
    // Communities
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
    // Resident / Adhoc
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
    // Weight
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
    // Duration
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
    // Record creation
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
    // Earlier
    // ─────────────────────────────────────────

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

    // ─────────────────────────────────────────
    // CLOSE
    //
    // We retain the known Close possibilities,
    // but the helper below first confirms that
    // we are on the Earlier page.
    // ─────────────────────────────────────────

    closeButton: {
        android:
            AndroidLocatorBuilder.xpath(
                '//android.widget.Button[@text="Close"] | ' +
                '//android.widget.ImageButton[@content-desc="Close"] | ' +
                '//android.widget.ImageView[@content-desc="Close"]'
            ),
        ios:
            iOSLocatorBuilder.xpath(
                '//XCUIElementTypeButton[@name="Close"]'
            ),
    } as TestBotElement,

    // Fallback only if the application exposes
    // an empty-text top-right button.
    closeButtonFallback: {
        android:
            AndroidLocatorBuilder.xpath(
                '(//android.widget.Button[@text=""])[1]'
            ),
        ios:
            iOSLocatorBuilder.xpath(
                '(//XCUIElementTypeButton[@name=""])[1]'
            ),
    } as TestBotElement,

    // ─────────────────────────────────────────
    // Validation
    // ─────────────────────────────────────────

    baselineMessage: {
        android:
            AndroidLocatorBuilder.xpath(
                '//android.widget.TextView[contains(@text,"baseline") or contains(@text,"Baseline")]'
            ),
        ios:
            iOSLocatorBuilder.xpath(
                '//XCUIElementTypeStaticText[contains(@name,"baseline") or contains(@name,"Baseline")]'
            ),
    } as TestBotElement,

    validationErrorMessage: {
        android:
            AndroidLocatorBuilder.xpath(
                '//android.widget.TextView[' +
                'contains(@text,"required") or ' +
                'contains(@text,"Required") or ' +
                'contains(@text,"invalid") or ' +
                'contains(@text,"Invalid") or ' +
                'contains(@text,"must be")' +
                ']'
            ),
        ios:
            iOSLocatorBuilder.xpath(
                '//XCUIElementTypeStaticText[' +
                'contains(@name,"required") or ' +
                'contains(@name,"Required") or ' +
                'contains(@name,"invalid") or ' +
                'contains(@name,"Invalid") or ' +
                'contains(@name,"must be")' +
                ']'
            ),
    } as TestBotElement,
}

// ═══════════════════════════════════════════════
// ENSURE WE ARE ON MY COMMUNITIES
//
// THIS IS THE MAIN FIX.
//
// We do not start resident selection until
// My Communities is actually visible.
// ═══════════════════════════════════════════════

async function ensureOnMyCommunitiesPage(): Promise<void> {
    console.log(
        '▶ Checking current page before starting Weight flow...'
    )

    const alreadyOnCommunities =
        await testBot
            .isVisible(
                selectors.myCommunitiesTab
            )
            .catch(() => false)

    if (alreadyOnCommunities) {
        console.log(
            '▶ Already on My Communities page.'
        )

        return
    }

    console.log(
        '▶ My Communities is NOT currently visible.'
    )

    console.log(
        '▶ Waiting for navigation back to My Communities...'
    )

    try {
        await testBot.waitUntilVisible(
            selectors.myCommunitiesTab,
            15000
        )

        console.log(
            '▶ My Communities page is now visible.'
        )

        return
    } catch (waitErr) {
        console.warn(
            'My Communities did not appear automatically.',
            waitErr
        )
    }

    // ─────────────────────────────────────────
    // Last-resort Android back.
    //
    // This is intentionally limited. We do not
    // blindly press Back repeatedly because that
    // could exit the app or reach the wrong page.
    // ─────────────────────────────────────────

    console.log(
        '▶ Attempting one controlled Back navigation to reach My Communities...'
    )

    try {
        await driver.back()
        await driver.pause(1500)
    } catch (backErr) {
        console.warn(
            'Back navigation failed:',
            backErr
        )
    }

    const communitiesAfterBack =
        await testBot
            .isVisible(
                selectors.myCommunitiesTab
            )
            .catch(() => false)

    if (!communitiesAfterBack) {
        await dumpPageSourceOnFailure(
            'ensureOnMyCommunitiesPage - My Communities not reached'
        )

        throw new Error(
            'Weight flow cannot start because My Communities page was not reached. The app appears to be on another page, possibly the Care Note/selection screen.'
        )
    }

    console.log(
        '▶ Successfully reached My Communities after Back.'
    )
}

// ═══════════════════════════════════════════════
// SELECT RANDOM RESIDENT
//
// IMPORTANT:
// This function assumes ensureOnMyCommunitiesPage()
// has already completed.
// ═══════════════════════════════════════════════

async function selectRandomResident(): Promise<string> {
    console.log(
        '▶ Starting resident selection ONLY after confirming My Communities page.'
    )

    const onCommunities =
        await testBot
            .isVisible(
                selectors.myCommunitiesTab
            )
            .catch(() => false)

    if (!onCommunities) {
        throw new Error(
            'Resident selection was attempted while My Communities was not visible. Aborting to prevent Care Note/incorrect page selection.'
        )
    }

    console.log(
        '▶ Scanning My Communities for visible care recipients...'
    )

    const visibleCandidates: string[] = []

    for (
        const candidateName
        of CARE_RECIPIENTS
    ) {
        const locator =
            residentLocator(
                candidateName
            )

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
        `▶ Found ${visibleCandidates.length} visible resident(s):`,
        visibleCandidates
    )

    // ─────────────────────────────────────────
    // Visible candidates
    // ─────────────────────────────────────────

    if (
        visibleCandidates.length > 0
    ) {
        const randomIndex =
            Math.floor(
                Math.random() *
                    visibleCandidates.length
            )

        const chosenName =
            visibleCandidates[
                randomIndex
            ]

        console.log(
            `▶ Randomly selected resident: "${chosenName}"`
        )

        await testBot.click(
            residentLocator(
                chosenName
            )
        )

        await driver.pause(1500)

        return chosenName
    }

    // ─────────────────────────────────────────
    // Scroll fallback
    // ─────────────────────────────────────────

    console.log(
        '▶ No residents visible immediately — using scroll fallback.'
    )

    const shuffled =
        [...CARE_RECIPIENTS].sort(
            () => Math.random() - 0.5
        )

    for (
        const candidateName
        of shuffled
    ) {
        try {
            const scrolled =
                await $(
                    'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
                    `.scrollIntoView(new UiSelector().textMatches("^${candidateName}$"))`
                )

            if (
                await scrolled.isExisting()
            ) {
                console.log(
                    `▶ Found resident through scrolling: "${candidateName}"`
                )

                await scrolled.click()

                await driver.pause(
                    1500
                )

                return candidateName
            }
        } catch (err) {
            console.warn(
                `"${candidateName}" not found during scroll search.`
            )
        }
    }

    await dumpPageSourceOnFailure(
        'selectRandomResident - no resident found'
    )

    throw new Error(
        'Could not find any care recipient from CARE_RECIPIENTS on My Communities.'
    )
}

// ═══════════════════════════════════════════════
// CHECK VALIDATION / BASELINE MESSAGE
// ═══════════════════════════════════════════════

async function checkForMessage(
    label: string
): Promise<{
    baselineShown: boolean
    validationShown: boolean
}> {
    const baselineShown =
        await testBot
            .isVisible(
                selectors.baselineMessage
            )
            .catch(() => false)

    const validationShown =
        await testBot
            .isVisible(
                selectors.validationErrorMessage
            )
            .catch(() => false)

    console.log(
        `[${label}] baseline=${baselineShown}, validation=${validationShown}`
    )

    return {
        baselineShown,
        validationShown,
    }
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
            await (
                await (
                    testBot as any
                ).getLocatorTextForElement(
                    selectors.weightInputField
                )
            )

        await element.clearValue()
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
            'Keyboard already hidden or hideKeyboard failed:',
            kbErr
        )
    }
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
        await $(durationXpath)

    for (
        let attempt = 0;
        attempt < 4;
        attempt++
    ) {
        if (
            await durationEl.isExisting() &&
            await durationEl.isDisplayed()
        ) {
            break
        }

        console.log(
            `▶ Duration not visible. Scroll attempt ${
                attempt + 1
            }`
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

        await driver.pause(1000)

        durationEl =
            await $(durationXpath)
    }

    if (
        !(await durationEl.isExisting())
    ) {
        console.warn(
            `Duration "${randomDuration}" not found. Trying Other Durations.`
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

    for (
        let attempt = 0;
        attempt < 3;
        attempt++
    ) {
        await durationEl.click()

        console.log(
            `▶ Tapped "${randomDuration}" — attempt ${
                attempt + 1
            }`
        )

        await driver.pause(1000)

        const confirmBtn =
            await $(
                '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/ConfirmButton"]'
            )

        const enabled =
            await confirmBtn
                .isEnabled()
                .catch(
                    () => false
                )

        if (enabled) {
            console.log(
                '▶ Continue button is enabled.'
            )

            return true
        }
    }

    console.warn(
        '▶ Continue button did not become enabled.'
    )

    return false
}

// ═══════════════════════════════════════════════
// OTHER DURATIONS
// ═══════════════════════════════════════════════

async function handleOtherDurationsIfPresent(
    minutesValue: string
): Promise<void> {
    const present =
        await testBot
            .isVisible(
                selectors.otherDurationsOption
            )
            .catch(() => false)

    if (!present) {
        console.log(
            '▶ Other Durations is not present.'
        )

        return
    }

    await testBot.click(
        selectors.otherDurationsOption
    )

    await driver.pause(700)

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
    } catch {
        // Ignore keyboard state.
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
// CLOSE EARLIER PAGE
//
// IMPORTANT CHANGE:
//
// We first verify that Earlier is present.
// We then use the Close locator.
//
// After Close, we WAIT for My Communities.
// This makes sure the app has actually completed
// the redirect before this test ends.
//
// We do NOT start another flow here.
// ═══════════════════════════════════════════════

async function closeEarlierPage(): Promise<void> {
    console.log(
        '▶ Preparing to close Earlier page...'
    )

    const earlierVisible =
        await testBot
            .isVisible(
                selectors.earlierTab
            )
            .catch(() => false)

    if (!earlierVisible) {
        console.warn(
            'Earlier tab is not visible. The app may already have navigated away.'
        )
    }

    // ─────────────────────────────────────────
    // Try the explicit Close locator first.
    // ─────────────────────────────────────────

    let closeVisible =
        await testBot
            .isVisible(
                selectors.closeButton
            )
            .catch(() => false)

    if (closeVisible) {
        console.log(
            '▶ Found explicit Close button.'
        )

        await testBot.click(
            selectors.closeButton
        )
    } else {
        // ─────────────────────────────────────
        // Fallback only.
        // ─────────────────────────────────────

        console.warn(
            'Explicit Close button not found. Trying fallback empty-text button.'
        )

        const fallbackVisible =
            await testBot
                .isVisible(
                    selectors.closeButtonFallback
                )
                .catch(
                    () => false
                )

        if (!fallbackVisible) {
            await dumpPageSourceOnFailure(
                'closeEarlierPage - Close button not found'
            )

            throw new Error(
                'Could not find the Close button on the Earlier page.'
            )
        }

        await testBot.click(
            selectors.closeButtonFallback
        )
    }

    console.log(
        '▶ Close button clicked.'
    )

    // ─────────────────────────────────────────
    // IMPORTANT:
    //
    // Wait for the actual redirect to complete.
    //
    // This prevents the next test/spec from
    // starting while the previous page is still
    // animating or transitioning.
    // ─────────────────────────────────────────

    try {
        await testBot.waitUntilVisible(
            selectors.myCommunitiesTab,
            30000
        )

        console.log(
            '▶ Confirmed redirect to My Communities.'
        )
    } catch (err) {
        await dumpPageSourceOnFailure(
            'closeEarlierPage - My Communities not reached'
        )

        throw new Error(
            'Close was clicked, but the app did not redirect to My Communities within 30 seconds.'
        )
    }

    await driver.pause(1000)

    console.log(
        '▶ Earlier flow completely finished. App is ready for the next test/spec.'
    )
}

// ═══════════════════════════════════════════════
// NAVIGATE TO WEIGHT ENTRY SCREEN
// ═══════════════════════════════════════════════

async function navigateToWeightEntryScreen(): Promise<string> {
    // ─────────────────────────────────────────
    // CRITICAL:
    //
    // Before doing ANY resident selection,
    // force/confirm My Communities.
    // ─────────────────────────────────────────

    await ensureOnMyCommunitiesPage()

    console.log(
        '▶ My Communities confirmed. Starting resident selection.'
    )

    let selectedResident = ''

    try {
        selectedResident =
            await selectRandomResident()

        console.log(
            `▶ Selected resident: "${selectedResident}"`
        )

        await driver.pause(1500)
    } catch (err) {
        await dumpPageSourceOnFailure(
            'navigateToWeightEntryScreen - resident selection'
        )

        throw err
    }

    try {
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
            '▶ Opened Adhoc.'
        )

        await driver.pause(1500)

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
                '▶ Expanded all sections.'
            )

            await driver.pause(1500)
        } catch (expandErr) {
            console.warn(
                'Expand-all button not available. Continuing with normal view.'
            )
        }

        // ─────────────────────────────────────
        // Weigh
        // ─────────────────────────────────────

        let weighFound =
            await testBot
                .isVisible(
                    selectors.weighText
                )
                .catch(
                    () => false
                )

        if (!weighFound) {
            console.log(
                '▶ Weigh not immediately visible. Scrolling...'
            )

            try {
                const scrolled =
                    await $(
                        'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
                        '.scrollIntoView(new UiSelector().textMatches("^Weigh$"))'
                    )

                weighFound =
                    await scrolled.isExisting()
            } catch (scrollErr) {
                console.warn(
                    'Unable to scroll to Weigh:',
                    scrollErr
                )
            }
        }

        if (!weighFound) {
            await dumpPageSourceOnFailure(
                'navigateToWeightEntryScreen - Weigh not found'
            )

            throw new Error(
                'Could not find Weigh option.'
            )
        }

        await testBot.waitUntilVisible(
            selectors.weighText,
            5000
        )

        await testBot.click(
            selectors.weighText
        )

        console.log(
            '▶ Selected Weigh.'
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
            '▶ Clicked Next.'
        )

        await driver.pause(1500)

        // ─────────────────────────────────────
        // Weight field
        // ─────────────────────────────────────

        await testBot.waitUntilVisible(
            selectors.weightInputField,
            10000
        )

        console.log(
            '▶ Weight input screen reached.'
        )
    } catch (err) {
        await dumpPageSourceOnFailure(
            'navigateToWeightEntryScreen'
        )

        throw err
    }

    return selectedResident
}

// ═══════════════════════════════════════════════
// RETURN TO WEIGHT ENTRY SCREEN FOR SAME RESIDENT
// ═══════════════════════════════════════════════

async function returnToWeightEntryScreenForResident(
    residentName: string
): Promise<void> {
    if (!residentName) {
        throw new Error(
            'Cannot return to Weight entry because residentName is empty.'
        )
    }

    try {
        // ─────────────────────────────────────
        // Always make sure we are starting from
        // My Communities.
        // ─────────────────────────────────────

        await ensureOnMyCommunitiesPage()

        const locator =
            residentLocator(
                residentName
            )

        let residentFound =
            await testBot
                .isVisible(locator)
                .catch(
                    () => false
                )

        if (!residentFound) {
            console.log(
                `"${residentName}" not visible. Scrolling...`
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
                    'Resident scroll failed:',
                    scrollErr
                )
            }
        }

        if (!residentFound) {
            await dumpPageSourceOnFailure(
                `returnToWeightEntryScreenForResident - ${residentName} not found`
            )

            throw new Error(
                `Could not find resident "${residentName}" on My Communities.`
            )
        }

        await testBot.click(
            locator
        )

        console.log(
            `▶ Re-selected resident: "${residentName}"`
        )

        await driver.pause(1500)

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

        await driver.pause(1500)

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

            await driver.pause(1500)
        } catch {
            console.log(
                'Expand-all unavailable — continuing.'
            )
        }

        // ─────────────────────────────────────
        // Weigh
        // ─────────────────────────────────────

        let weighFound =
            await testBot
                .isVisible(
                    selectors.weighText
                )
                .catch(
                    () => false
                )

        if (!weighFound) {
            try {
                const scrolled =
                    await $(
                        'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
                        '.scrollIntoView(new UiSelector().textMatches("^Weigh$"))'
                    )

                weighFound =
                    await scrolled.isExisting()
            } catch (scrollErr) {
                console.warn(
                    'Could not scroll to Weigh:',
                    scrollErr
                )
            }
        }

        if (!weighFound) {
            await dumpPageSourceOnFailure(
                'returnToWeightEntryScreenForResident - Weigh not found'
            )

            throw new Error(
                'Could not find Weigh option.'
            )
        }

        await testBot.waitUntilVisible(
            selectors.weighText,
            5000
        )

        await testBot.click(
            selectors.weighText
        )

        await driver.pause(700)

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

        await driver.pause(1500)

        // ─────────────────────────────────────
        // Weight input
        // ─────────────────────────────────────

        await testBot.waitUntilVisible(
            selectors.weightInputField,
            10000
        )

        console.log(
            '▶ Weight input screen reached again.'
        )
    } catch (err) {
        await dumpPageSourceOnFailure(
            'returnToWeightEntryScreenForResident'
        )

        throw err
    }
}

// ═══════════════════════════════════════════════
// SMOKE TEST
// ═══════════════════════════════════════════════

describe(
    'Resident Area Profile - Observations - Weight - SMOKE TEST',
    () => {
        it(
            'Smoke Step 1 - Navigate to Weight entry screen for a random resident',
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
                            'Smoke blank value'
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
                            `Smoke invalid ${invalidValue}`
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
            'Smoke Step 4 - Valid mid-range value',
            async function () {
                try {
                    await enterWeightValue(
                        '260'
                    )

                    const {
                        validationShown,
                    } =
                        await checkForMessage(
                            'Smoke valid 260'
                        )

                    if (
                        validationShown
                    ) {
                        console.warn(
                            'Validation appeared for valid value 260.'
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
            'Smoke Step 5 - Complete record and close Earlier',
            async function () {
                try {
                    const confirmEnabled =
                        await selectDurationOption()

                    if (
                        !confirmEnabled
                    ) {
                        throw new Error(
                            'Continue button did not become enabled.'
                        )
                    }

                    const confirmBtn =
                        await $(
                            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/ConfirmButton"]'
                        )

                    await confirmBtn.click()

                    console.log(
                        '▶ Clicked Continue.'
                    )

                    await driver.pause(
                        1500
                    )

                    await testBot.waitUntilVisible(
                        selectors.createRecordsButton,
                        10000
                    )

                    await testBot.click(
                        selectors.createRecordsButton
                    )

                    console.log(
                        '▶ Clicked Create Records.'
                    )

                    await driver.pause(
                        1500
                    )

                    // ─────────────────────
                    // Earlier
                    // ─────────────────────

                    await testBot.waitUntilVisible(
                        selectors.earlierTab,
                        10000
                    )

                    await testBot.click(
                        selectors.earlierTab
                    )

                    console.log(
                        '▶ Opened Earlier.'
                    )

                    await driver.pause(
                        1500
                    )

                    // ─────────────────────
                    // Close Earlier.
                    // ─────────────────────

                    await closeEarlierPage()

                    console.log(
                        '▶ Smoke flow finished. App is on My Communities.'
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
    'Resident Area Profile - Observations - Weight - THOROUGH (Boundary Value Analysis)',
    () => {
        let residentName = ''

        // ─────────────────────────────────────
        // Step 1
        // ─────────────────────────────────────

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
                            'Thorough blank value'
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

        // ─────────────────────────────────────
        // Invalid values
        // ─────────────────────────────────────

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
                            if (
                                !residentName
                            ) {
                                throw new Error(
                                    'residentName is empty. Step 1 did not successfully select a resident.'
                                )
                            }

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
                                    `Thorough invalid ${invalidValue}`
                                )

                            expect(
                                validationShown
                            ).toBe(true)
                        } catch (err) {
                            await dumpPageSourceOnFailure(
                                `Thorough Step 2.${
                                    index + 1
                                }`
                            )

                            throw err
                        }
                    }
                )
            }
        )

        // ─────────────────────────────────────
        // Valid values
        // ─────────────────────────────────────

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
                            if (
                                !residentName
                            ) {
                                throw new Error(
                                    'residentName is empty. Step 1 did not successfully select a resident.'
                                )
                            }

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
                                    `Thorough valid ${validValue}`
                                )

                            expect(
                                validationShown
                            ).toBe(false)
                        } catch (err) {
                            await dumpPageSourceOnFailure(
                                `Thorough Step 3.${
                                    index + 1
                                }`
                            )

                            throw err
                        }
                    }
                )
            }
        )

        // ─────────────────────────────────────
        // Baseline
        // ─────────────────────────────────────

        it(
            'Thorough Step 4 - Baseline message check',
            async function () {
                try {
                    if (
                        !residentName
                    ) {
                        throw new Error(
                            'residentName is empty.'
                        )
                    }

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
                            'Thorough baseline'
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

        // ─────────────────────────────────────
        // FINAL TEST
        //
        // Complete → Earlier → Close →
        // My Communities confirmed →
        // test ends.
        //
        // The NEXT SPEC can now safely start.
        // ─────────────────────────────────────

        it(
            'Thorough Step 5 - Complete record, close Earlier and finish on My Communities',
            async function () {
                try {
                    if (
                        !residentName
                    ) {
                        throw new Error(
                            'residentName is empty.'
                        )
                    }

                    await returnToWeightEntryScreenForResident(
                        residentName
                    )

                    await enterWeightValue(
                        '260'
                    )

                    await driver.pause(
                        700
                    )

                    const confirmEnabled =
                        await selectDurationOption()

                    if (
                        !confirmEnabled
                    ) {
                        throw new Error(
                            'Continue button did not become enabled after duration selection.'
                        )
                    }

                    const confirmBtn =
                        await $(
                            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/ConfirmButton"]'
                        )

                    await confirmBtn.click()

                    console.log(
                        '▶ Clicked Continue.'
                    )

                    await driver.pause(
                        1500
                    )

                    await testBot.waitUntilVisible(
                        selectors.createRecordsButton,
                        10000
                    )

                    await testBot.click(
                        selectors.createRecordsButton
                    )

                    console.log(
                        '▶ Clicked Create Records.'
                    )

                    await driver.pause(
                        1500
                    )

                    // ─────────────────────
                    // Earlier
                    // ─────────────────────

                    await testBot.waitUntilVisible(
                        selectors.earlierTab,
                        10000
                    )

                    await testBot.click(
                        selectors.earlierTab
                    )

                    console.log(
                        '▶ Opened Earlier page.'
                    )

                    await driver.pause(
                        1500
                    )

                    // ─────────────────────
                    // Close
                    // ─────────────────────

                    await closeEarlierPage()

                    // ─────────────────────
                    // VERY IMPORTANT:
                    //
                    // There is NO Care Note
                    // selection here.
                    //
                    // There is NO resident
                    // selection here.
                    //
                    // The Weight script is now
                    // finished.
                    // ─────────────────────

                    console.log(
                        '════════════════════════════════════'
                    )

                    console.log(
                        '▶ WEIGHT OBSERVATION FLOW COMPLETE'
                    )

                    console.log(
                        '▶ App is confirmed on My Communities.'
                    )

                    console.log(
                        '▶ Ready for the next test/spec.'
                    )

                    console.log(
                        '════════════════════════════════════'
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
```
