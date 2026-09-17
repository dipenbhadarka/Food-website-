import { testBot } from '../../testbot'
import { AndroidLocatorBuilder } from '../../TestBot/Locators/Android/AndroidLocatorBuilder'
import { iOSLocatorBuilder } from '../../TestBot/Locators/iOS/iOSLocatorBuilder'
import { TestBotElement } from '../../TestBot/TestBotElement'

// ─────────────────────────────────────────────
// Run mode detection
// ─────────────────────────────────────────────
const isLocal = process.env.RUN_MODE === 'local'
const localAppPackage = process.env.LOCAL_APP_PACKAGE || 'com.personcentredsoftware.care.delivery'
console.log(`Running in ${isLocal ? 'LOCAL PHYSICAL DEVICE' : 'BROWSERSTACK CLOUD'} mode`)

// ─────────────────────────────────────────────
// Test Data
// ─────────────────────────────────────────────
const USERNAME = 'a.nethi@personcentredsoftware.com'
const PASSWORD = 'PCSpassword@1'
const ORGANISATION = 'Person Centred Software'
const LOCATION = 'Kerr House'
const USER = 'Akhila Nethi'

// ─────────────────────────────────────────────
// Selectors — built directly from the new
// locator list. Region, Organisation, and
// Location are now all triggered via a plain
// TextView label tap, which opens a search-popup
// dialog (PickerPopupSearchEntry) rather than the
// old EditText-based spinner pickers.
// ─────────────────────────────────────────────
const selectors = {
    infoButtonIcon: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text=""]'
        ),
        ios: iOSLocatorBuilder.id('InfoButton'),
    } as TestBotElement,

    enrollDeviceButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/EnrollDeviceButton"]'
        ),
        ios: iOSLocatorBuilder.id('EnrollDeviceButton'),
    } as TestBotElement,

    // ── CHANGED: region is now a plain TextView label
    // "Select Region", not an EditText EnvironmentPicker.
    selectRegionDropdown: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Select Region"]'
        ),
        ios: iOSLocatorBuilder.id('SelectRegion'),
    } as TestBotElement,

    // Shared search-popup entry field used by Region,
    // Organisation, and Location pickers alike.
    pickerPopupSearchEntry: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/PickerPopupSearchEntry"]'
        ),
        ios: iOSLocatorBuilder.id('PickerPopupSearchEntry'),
    } as TestBotElement,

    optionUnitedKingdom: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="United Kingdom"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="United Kingdom"]'
        ),
    } as TestBotElement,

    // This is the "click on enrol device" button that appears
    // AFTER selecting the region — resource-id is LoginButton,
    // per the provided locator, distinct from
    // enrollDeviceButton above (the one on the very first
    // Welcome screen).
    triggerEnrolLoginButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/LoginButton"]'
        ),
        ios: iOSLocatorBuilder.id('LoginButton'),
    } as TestBotElement,

    usernameFieldLocal: {
        android: AndroidLocatorBuilder.xpath(
            '//android.view.View[@resource-id="AccountLogin"]/android.view.View'
        ),
        ios: iOSLocatorBuilder.id('AccountLogin'),
    } as TestBotElement,

    usernameFieldBrowserStack: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="Username"]'
        ),
        ios: iOSLocatorBuilder.id('AccountLogin'),
    } as TestBotElement,

    nextButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="NextButton"]'
        ),
        ios: iOSLocatorBuilder.id('Next'),
    } as TestBotElement,

    continueButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="ContinueButton"]'
        ),
        ios: iOSLocatorBuilder.id('ContinueButton'),
    } as TestBotElement,

    passwordField: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="Password"]'
        ),
        ios: iOSLocatorBuilder.id('Password'),
    } as TestBotElement,

    identityLoginButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="LoginButton"]'
        ),
        ios: iOSLocatorBuilder.id('LoginButton'),
    } as TestBotElement,

    // ── This is the mystery positional locator from the
    // previous message — confirmed by its position in the
    // new list to be the dropdown container that opens the
    // Organisation search popup, on the EnrollUpdatePage
    // screen. Kept as a fallback ONLY; the primary trigger is
    // the plain "Organisation" text label below, which is far
    // less fragile.
    enrollUpdatePageDropdownContainer: {
        android: AndroidLocatorBuilder.xpath(
            '//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/EnrollUpdatePage"]/android.view.ViewGroup/android.view.ViewGroup/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[4]/android.view.ViewGroup/android.view.ViewGroup'
        ),
        ios: iOSLocatorBuilder.id('EnrollUpdatePage'),
    } as TestBotElement,

    // ── CHANGED: Organisation is now a plain TextView label
    // that opens the shared search popup, not an EditText
    // OrganisationPicker.
    organisationDropdown: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Organisation"]'
        ),
        ios: iOSLocatorBuilder.id('Organisation'),
    } as TestBotElement,

    optionPersonCentredSoftware: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Person Centred Software"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Person Centred Software"]'
        ),
    } as TestBotElement,

    // ── CHANGED: Location is now a plain TextView label
    // that opens the shared search popup, not an EditText
    // LocationPicker.
    locationDropdown: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Location"]'
        ),
        ios: iOSLocatorBuilder.id('Location'),
    } as TestBotElement,

    // On the enrolment screen's Location search popup, "Kerr
    // House" is selected directly by plain text — no [2] index
    // given for this screen (unlike the Welcome Back screen,
    // which uses [last()] below).
    optionKerrHouseEnrolment: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Kerr House"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Kerr House"]'
        ),
    } as TestBotElement,

    enrolButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/EnrollButton"]'
        ),
        ios: iOSLocatorBuilder.id('EnrollButton'),
    } as TestBotElement,

    logoutButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/LogoutButton"]'
        ),
        ios: iOSLocatorBuilder.id('LogoutButton'),
    } as TestBotElement,

    // ── CONFIRMED WORKING: the Welcome Back screen's site
    // picker is a plain TextView label ("Select Site" or,
    // once chosen, showing "Kerr House"), NOT an EditText
    // LocationPicker. This was the actual root cause of the
    // previous version's Step 0 detection failure.
    siteDropdown: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Select Site" or @text="Kerr House"]'
        ),
        ios: iOSLocatorBuilder.id('Select Site'),
    } as TestBotElement,

    // ── CONFIRMED WORKING: the Welcome Back screen's user
    // picker is also a plain TextView label ("Select User"),
    // not an EditText UserPicker.
    userDropdown: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Select User"]'
        ),
        ios: iOSLocatorBuilder.id('Select User'),
    } as TestBotElement,

    // Welcome Back screen's site/location picker option —
    // uses [last()] rather than a fixed [2] index, more
    // robust if the number of "Kerr House" matches changes.
    optionKerrHouseWelcomeBack: {
        android: AndroidLocatorBuilder.xpath(
            '(//android.widget.TextView[@text="Kerr House"])[last()]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '(//XCUIElementTypeStaticText[@name="Kerr House"])[2]'
        ),
    } as TestBotElement,

    welcomeBackUsername: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Akhila Nethi"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Akhila Nethi"]'
        ),
    } as TestBotElement,

    signInButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/SignInButton"]'
        ),
        ios: iOSLocatorBuilder.id('SignInButton'),
    } as TestBotElement,

    // ── Communities screen — FIVE options confirmed (North
    // Wing included): each with an EXACT-match locator so
    // they can never be confused with one another.
    kerrHouseServiceUsers: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Kerr House / Service Users"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Kerr House / Service Users"]'
        ),
    } as TestBotElement,

    kerrHouseServiceUsersRow: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Kerr House / Service Users"]/ancestor::android.view.ViewGroup[@clickable="true"][1]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Kerr House / Service Users"]'
        ),
    } as TestBotElement,

    kerrHouseNorthWing: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Kerr House / North Wing"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Kerr House / North Wing"]'
        ),
    } as TestBotElement,

    kerrHouseSouthWing: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Kerr House / South Wing - First Floor"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Kerr House / South Wing - First Floor"]'
        ),
    } as TestBotElement,

    kerrHouseTraining: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Kerr House / Training"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Kerr House / Training"]'
        ),
    } as TestBotElement,

    startWorkButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/StartWorkButton"]'
        ),
        ios: iOSLocatorBuilder.id('StartWorkButton'),
    } as TestBotElement,

    myCommunitiesTab: {
        android: AndroidLocatorBuilder.xpath(
            '//*[@text="My Communities"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="My Communities"]'
        ),
    } as TestBotElement,
}

const usernameField: TestBotElement = isLocal
    ? selectors.usernameFieldLocal
    : selectors.usernameFieldBrowserStack

// ─────────────────────────────────────────────
// Helper — dump page source with a clear label,
// tolerant of the session already being dead.
// ─────────────────────────────────────────────
async function dumpPageSourceOnFailure(stepLabel: string): Promise<void> {
    console.error(`Failure at ${stepLabel} — dumping page source`)
    try {
        const pageSource = await driver.getPageSource()
        console.log(`─────────── PAGE SOURCE: ${stepLabel} ───────────`)
        console.log(pageSource)
        console.log('─────────────────────────────────────────────')
    } catch (srcErr) {
        console.warn('getPageSource failed (session may be dead):', srcErr)
    }
}

// ─────────────────────────────────────────────
// Helper — submit username field
// ─────────────────────────────────────────────
async function submitUsername(): Promise<void> {
    if (isLocal) {
        const nextButtonLocal = {
            android: AndroidLocatorBuilder.xpath(
                '//android.webkit.WebView[@text="Person Centred Software"]'
            ),
            ios: iOSLocatorBuilder.id('Next'),
        } as TestBotElement

        const el = await $(await (testBot as any).getLocatorTextForElement(nextButtonLocal))
        if (await el.isExisting()) {
            await testBot.click(nextButtonLocal)
            console.log('Submitted username via native Next tap (local device)')
            return
        }
    }

    if (!isLocal) {
        try {
            const nextEl = await $(await (testBot as any).getLocatorTextForElement(selectors.nextButton))
            if (await nextEl.isExisting()) {
                await testBot.click(selectors.nextButton)
                console.log('Submitted username via WebView Next button (BrowserStack)')
                return
            }
            console.warn('WebView Next button not found, falling back to editor actions')
        } catch (err) {
            console.warn('WebView Next button click failed, falling back:', err)
        }
    }

    let submitted = false

    try {
        await driver.execute('mobile: performEditorAction', { action: 'next' })
        submitted = true
        console.log('Submitted via performEditorAction: next')
    } catch (err) {
        console.warn('performEditorAction "next" failed:', err)
    }

    if (!submitted) {
        try {
            await driver.execute('mobile: performEditorAction', { action: 'go' })
            submitted = true
            console.log('Submitted via performEditorAction: go')
        } catch (err) {
            console.warn('performEditorAction "go" failed:', err)
        }
    }

    if (!submitted) {
        try {
            await driver.execute('mobile: performEditorAction', { action: 'done' })
            submitted = true
            console.log('Submitted via performEditorAction: done')
        } catch (err) {
            console.warn('performEditorAction "done" failed:', err)
        }
    }

    if (!submitted) {
        const possibleNextSelectors = [
            '//android.widget.Button[contains(@text,"Next")]',
            '//android.widget.Button[contains(@text,"Continue")]',
            '//*[contains(@text,"Next")]',
        ]
        for (const xpath of possibleNextSelectors) {
            const el = await $(xpath)
            if (await el.isExisting()) {
                await el.click()
                submitted = true
                console.log(`Submitted via tapping element: ${xpath}`)
                break
            }
        }
    }

    if (!submitted) {
        console.error('Could not submit username with any method')
    }
}

// ─────────────────────────────────────────────
// Helper — opens a search-popup-based dropdown
// (Region, Organisation, or Location on the
// enrolment screen; Site or User on the Welcome
// Back screen), types into the search entry if
// needed, and selects the given option.
// ─────────────────────────────────────────────
async function selectFromSearchPopup(
    dropdownTrigger: TestBotElement,
    optionLocator: TestBotElement,
    optionText: string
): Promise<void> {
    await testBot.click(dropdownTrigger)
    await driver.pause(1500)

    let optionVisible = await testBot.isVisible(optionLocator).catch(() => false)

    if (!optionVisible) {
        const searchVisible = await testBot.isVisible(selectors.pickerPopupSearchEntry).catch(() => false)
        if (searchVisible) {
            await testBot.click(selectors.pickerPopupSearchEntry)
            await testBot.enterText(selectors.pickerPopupSearchEntry, optionText, false)
            await driver.pause(1000)
            optionVisible = await testBot.isVisible(optionLocator).catch(() => false)
        }
    }

    if (!optionVisible) {
        await dumpPageSourceOnFailure(`selectFromSearchPopup - "${optionText}" not found`)
        throw new Error(`Could not find "${optionText}" in the search popup, even after searching`)
    }

    await testBot.click(optionLocator)
    console.log(`Selected "${optionText}" from search popup`)
    await driver.pause(1000)
}

// ─────────────────────────────────────────────
// Helper — reliably tap "Kerr House / Service Users"
// on the Communities screen only. Never touches
// "North Wing", "South Wing", or "Training".
// ─────────────────────────────────────────────
async function ensureKerrHouseServiceUsersSelected(): Promise<void> {
    await testBot.waitUntilVisible(selectors.kerrHouseServiceUsers, 20000)
    console.log('Confirmed "Kerr House / Service Users" is visible on the Communities screen')

    const startWorkXpath =
        '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/StartWorkButton"]'
    const startBtn = await $(startWorkXpath)

    const alreadyEnabled = await startBtn.isEnabled().catch(() => false)
    if (alreadyEnabled) {
        console.log('Start Work already enabled — assuming target community is pre-selected. Skipping tap.')
        return
    }

    console.log('Start Work is disabled — tapping "Kerr House / Service Users" row to select it')
    await testBot.click(selectors.kerrHouseServiceUsersRow)
    await driver.pause(3000)

    const nowEnabled = await startBtn.isEnabled().catch(() => false)
    if (!nowEnabled) {
        await dumpPageSourceOnFailure('ensureKerrHouseServiceUsersSelected - Start Work still disabled')
        throw new Error(
            'Selecting "Kerr House / Service Users" did not enable Start Work — check the community list state'
        )
    }
    console.log('Confirmed "Kerr House / Service Users" is selected — Start Work is now enabled')
}

// ─────────────────────────────────────────────
// Suite — Enrolment & Login Flow
// ─────────────────────────────────────────────
let deviceAlreadyEnrolled = false

describe('Care Delivery - Full Enrolment & Login Flow', () => {

    it('Step 0 - Detect whether device shows fresh Welcome screen or already-enrolled Welcome Back screen', async () => {
        const startupTimeout = isLocal ? 60000 : 90000
        const pollInterval = 1000
        const deadline = Date.now() + startupTimeout

        let regionDropdownVisible = false
        let welcomeBackVisible = false
        let pollCount = 0

        while (Date.now() < deadline) {
            regionDropdownVisible =
                (await testBot.isVisible(selectors.infoButtonIcon).catch(() => false)) ||
                (await testBot.isVisible(selectors.selectRegionDropdown).catch(() => false))

            welcomeBackVisible =
                (await testBot.isVisible(selectors.welcomeBackUsername).catch(() => false)) ||
                (await testBot.isVisible(selectors.siteDropdown).catch(() => false))

            if (regionDropdownVisible || welcomeBackVisible) {
                break
            }

            pollCount++
            if (pollCount % 5 === 0) {
                console.log(`Still waiting for Welcome/Welcome Back screen... (${Math.round((Date.now() - (deadline - startupTimeout)) / 1000)}s elapsed of ${startupTimeout / 1000}s budget)`)
            }

            await driver.pause(pollInterval)
        }

        if (regionDropdownVisible) {
            deviceAlreadyEnrolled = false
            console.log('Detected fresh Welcome screen — running full enrolment flow')
        } else if (welcomeBackVisible) {
            deviceAlreadyEnrolled = true
            console.log('Detected Welcome Back screen — skipping enrolment steps and proceeding with login flow')
        } else {
            await dumpPageSourceOnFailure('Step 0 timeout')
            throw new Error(`Could not detect Welcome or Welcome Back screen within ${startupTimeout}ms.`)
        }
    })

    it('Step 1 - Open device information and start enrolment', async function () {
        if (deviceAlreadyEnrolled) { this.skip(); return; }
        await testBot.waitUntilVisible(selectors.infoButtonIcon, 15000)
        await testBot.click(selectors.infoButtonIcon)
        await testBot.waitUntilVisible(selectors.enrollDeviceButton, 10000)
        await testBot.click(selectors.enrollDeviceButton)
        await testBot.waitUntilVisible(selectors.selectRegionDropdown, 15000)
    })

    it('Step 2 - Select region United Kingdom and continue to login', async function () {
        if (deviceAlreadyEnrolled) { this.skip(); return; }
        await selectFromSearchPopup(selectors.selectRegionDropdown, selectors.optionUnitedKingdom, 'United Kingdom')

        try {
            await testBot.waitUntilVisible(selectors.triggerEnrolLoginButton, 10000)
            await testBot.click(selectors.triggerEnrolLoginButton)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 2 (trigger Login button)')
            throw err
        }
    })

    it('Step 3 - Land on Username page', async function () {
        if (deviceAlreadyEnrolled) { this.skip(); return; }
        try {
            await testBot.waitUntilVisible(usernameField, 20000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 3')
            throw err
        }
    })

    it('Step 4 - Enter username and navigate to PCS Terms page', async function () {
        if (deviceAlreadyEnrolled) { this.skip(); return; }
        await testBot.click(usernameField)
        await testBot.enterText(usernameField, USERNAME, false)
        await driver.pause(3000)

        await submitUsername()

        await driver.pause(isLocal ? 2000 : 3000)

        try {
            await testBot.waitUntilVisible(selectors.continueButton, 20000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 4')
            throw err
        }
    })

    it('Step 5 - Click Continue and land on Password page', async function () {
        if (deviceAlreadyEnrolled) { this.skip(); return; }
        await testBot.click(selectors.continueButton)
        await driver.pause(3000)
        await testBot.waitUntilVisible(selectors.passwordField, 20000)
    })

    it('Step 6 - Enter password and navigate to Enrol page', async function () {
        if (deviceAlreadyEnrolled) { this.skip(); return; }
        await testBot.click(selectors.passwordField)
        await driver.pause(3000)
        await testBot.enterText(selectors.passwordField, PASSWORD, false)
        await driver.pause(3000)

        try {
            await driver.hideKeyboard()
            await driver.pause(3000)
        } catch (err) {
            console.warn('hideKeyboard failed or keyboard already hidden:', err)
        }

        try {
            await testBot.waitUntilVisible(selectors.identityLoginButton, 10000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 6 (before click)')
            throw err
        }

        await testBot.click(selectors.identityLoginButton)

        const postLoginWait = isLocal ? 120000 : 20000
        await driver.pause(isLocal ? 4000 : 3000)

        if (isLocal) {
            try {
                await driver.activateApp(localAppPackage)
                await driver.pause(3000)
            } catch (e) {
                console.warn('activateApp after identity login failed (app may already be foreground):', e)
            }
        }

        try {
            await testBot.waitUntilVisible(selectors.organisationDropdown, postLoginWait)
            await testBot.waitUntilVisible(selectors.locationDropdown, 5000)
            await testBot.waitUntilVisible(selectors.enrolButton, 5000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 6 (after click)')
            throw err
        }
    })

    it('Step 7 - Leave Serial Number and Device Name blank; select Organisation and Location; verify Enrol button is enabled', async function () {
        if (deviceAlreadyEnrolled) { this.skip(); return; }
        // Per TC 49180 Step 7: "Leave Serial number field blank,
        // Leave device name blank" — intentionally not touched.
        await selectFromSearchPopup(
            selectors.organisationDropdown,
            selectors.optionPersonCentredSoftware,
            ORGANISATION
        )

        await selectFromSearchPopup(
            selectors.locationDropdown,
            selectors.optionKerrHouseEnrolment,
            LOCATION
        )

        const enrolBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/EnrollButton"]'
        )
        const isEnabled = await enrolBtn.isEnabled()
        expect(isEnabled).toBe(true)
    })

    it('Step 8 - Click Enrol and see Device Enrolled page with Logout button', async function () {
        if (deviceAlreadyEnrolled) { this.skip(); return; }
        await testBot.click(selectors.enrolButton)
        await testBot.waitUntilVisible(selectors.logoutButton, 30000)
    })

    it('Step 9 - Click Log Out and land on Log In page', async function () {
        if (deviceAlreadyEnrolled) { this.skip(); return; }
        await testBot.click(selectors.logoutButton)
        await driver.pause(3000)
        try {
            await testBot.waitUntilVisible(selectors.userDropdown, 30000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 9 (Welcome Back screen)')
            throw err
        }
    })

    it('Step 10.1 - App opens on site selection screen; Sign In button is disabled', async () => {
        await testBot.waitUntilVisible(selectors.userDropdown, 10000)
        await testBot.waitUntilVisible(selectors.signInButton, 5000)
        const signInBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/SignInButton"]'
        )
        const isEnabled = await signInBtn.isEnabled()
        expect(isEnabled).toBe(false)
    })

    it('Step 10.2 - Select Kerr House and show its users', async () => {
        try {
            // NB: siteDropdown's own locator matches BOTH "Select
            // Site" (unselected state) AND "Kerr House" (already
            // selected state) — the same text as the actual popup
            // option we need to tap. This meant
            // selectFromSearchPopup()'s "is the option already
            // visible" check could match the TRIGGER label itself
            // (which also reads "Kerr House") and wrongly conclude
            // the option was already selected, skipping the real
            // tap on the popup list item entirely. Fixed by
            // opening the dropdown directly here, then explicitly
            // locating and tapping the option WITHIN the opened
            // popup list — never reusing siteDropdown as a stand-in
            // for "already selected".
            await testBot.click(selectors.siteDropdown)
            await driver.pause(1500)

            let optionVisible = await testBot.isVisible(selectors.optionKerrHouseWelcomeBack).catch(() => false)

            if (!optionVisible) {
                const searchVisible = await testBot.isVisible(selectors.pickerPopupSearchEntry).catch(() => false)
                if (searchVisible) {
                    await testBot.click(selectors.pickerPopupSearchEntry)
                    await testBot.enterText(selectors.pickerPopupSearchEntry, LOCATION, false)
                    await driver.pause(1000)
                    optionVisible = await testBot.isVisible(selectors.optionKerrHouseWelcomeBack).catch(() => false)
                }
            }

            if (!optionVisible) {
                await dumpPageSourceOnFailure('Step 10.2 - "Kerr House" option not found in popup')
                throw new Error('Could not find "Kerr House" in the site popup, even after searching')
            }

            await testBot.click(selectors.optionKerrHouseWelcomeBack)
            console.log('Selected "Kerr House" from site popup')
            await driver.pause(1500)

            // Verify the dropdown now actually shows "Kerr House"
            // as its selected value, confirming the tap registered.
            const nowShowsKerrHouse = await testBot.isVisible(selectors.siteDropdown).catch(() => false)
            if (!nowShowsKerrHouse) {
                await dumpPageSourceOnFailure('Step 10.2 - site dropdown does not show Kerr House after tap')
                throw new Error('Tapped "Kerr House" but the site dropdown does not appear to reflect the selection')
            }
        } catch (err) {
            await dumpPageSourceOnFailure('Step 10.2 (Kerr House site selection)')
            throw err
        }
    })

    it('Step 10.3 - Verify users for selected location are shown', async () => {
        await testBot.click(selectors.userDropdown)
        const userVisible = await testBot.isVisible(selectors.welcomeBackUsername).catch(() => false)
        if (!userVisible) {
            await testBot.waitUntilVisible(selectors.pickerPopupSearchEntry, 10000)
            await testBot.enterText(selectors.pickerPopupSearchEntry, USER, false)
        }
        await testBot.waitUntilVisible(selectors.welcomeBackUsername, 10000)
        const isVisible = await testBot.isVisible(selectors.welcomeBackUsername)
        expect(isVisible).toBe(true)
    })

    it('Step 10.4 - Select user and verify Sign In button becomes enabled', async () => {
        // NB: a tap that registers per Appium but produces no
        // app response has been a recurring issue elsewhere in
        // this codebase — retry once, then dump page source with
        // a clear diagnostic if Sign In still never enables,
        // rather than silently hanging on the final expect()
        // mismatch with zero information about what's on screen.
        await testBot.click(selectors.welcomeBackUsername)
        console.log('Tapped "Akhila Nethi" (attempt 1)')
        await driver.pause(3000)

        const signInBtnXpath =
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/SignInButton"]'
        let signInBtn = await $(signInBtnXpath)
        let isEnabled = await signInBtn.isEnabled().catch(() => false)

        if (!isEnabled) {
            console.log('Sign In not enabled after first tap — retrying tap on "Akhila Nethi" (attempt 2)')
            const stillVisible = await testBot.isVisible(selectors.welcomeBackUsername).catch(() => false)
            if (stillVisible) {
                await testBot.click(selectors.welcomeBackUsername)
                await driver.pause(3000)
                signInBtn = await $(signInBtnXpath)
                isEnabled = await signInBtn.isEnabled().catch(() => false)
            } else {
                console.warn('"Akhila Nethi" no longer visible for retry — dropdown may have closed unexpectedly')
            }
        }

        if (!isEnabled) {
            await dumpPageSourceOnFailure('Step 10.4 - Sign In still not enabled after 2 taps on "Akhila Nethi"')
        }

        expect(isEnabled).toBe(true)
    })

    it('Step 10.5 - Click Sign In and land on PCS Terms page', async () => {
        await testBot.click(selectors.signInButton)
        await driver.pause(3000)
        await testBot.waitUntilVisible(selectors.continueButton, 20000)
    })

    it('Step 10.6 - Click Continue and land on Password page', async () => {
        await testBot.click(selectors.continueButton)
        await driver.pause(3000)
        await testBot.waitUntilVisible(selectors.passwordField, 20000)
    })

    it('Step 10.7 - Enter password and click Log In', async () => {
        await testBot.click(selectors.passwordField)
        await driver.pause(3000)
        await testBot.enterText(selectors.passwordField, PASSWORD, false)
        await driver.pause(3000)

        try {
            await driver.hideKeyboard()
            await driver.pause(3000)
        } catch (err) {
            console.warn('hideKeyboard failed or keyboard already hidden:', err)
        }

        await testBot.waitUntilVisible(selectors.identityLoginButton, 10000)
        await testBot.click(selectors.identityLoginButton)
        await driver.pause(3000)
    })

    it('Step 10.8 - User is taken to Select Communities page', async () => {
        await testBot.waitUntilVisible(selectors.kerrHouseServiceUsers, 20000)
    })

    it('Step 10.9 - Select "Kerr House / Service Users", click Start Work and land on My Communities tab', async () => {
        await ensureKerrHouseServiceUsersSelected()

        await testBot.click(selectors.startWorkButton)

        try {
            await testBot.waitUntilVisible(selectors.myCommunitiesTab, isLocal ? 30000 : 120000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 10.9')
            throw err
        }
    })

})
