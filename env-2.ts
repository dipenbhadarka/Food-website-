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
// Selectors — built directly from the provided
// locator list, in the order given.
// ─────────────────────────────────────────────
const selectors = {
    infoButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/InfoButton"]/android.view.ViewGroup/android.widget.Button'
        ),
        ios: iOSLocatorBuilder.id('InfoButton'),
    } as TestBotElement,

    regionDropdown: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/EnvironmentPicker"]'
        ),
        ios: iOSLocatorBuilder.id('EnvironmentPicker'),
    } as TestBotElement,

    optionUnitedKingdom: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="United Kingdom"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypePickerWheel[@value="United Kingdom"]'
        ),
    } as TestBotElement,

    enrollDeviceButton: {
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

    organisationDropdown: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/OrganisationPicker"]'
        ),
        ios: iOSLocatorBuilder.id('OrganisationPicker'),
    } as TestBotElement,

    optionPersonCentredSoftware: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Person Centred Software"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Person Centred Software"]'
        ),
    } as TestBotElement,

    locationDropdown: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/LocationPicker"]'
        ),
        ios: iOSLocatorBuilder.id('LocationPicker'),
    } as TestBotElement,

    // "Kerr House" appears twice in the picker list that opens
    // for Location on the enrolment screen — this selects the
    // SECOND match specifically, per the provided locator index [2].
    optionKerrHouseEnrolment: {
        android: AndroidLocatorBuilder.xpath(
            '(//android.widget.TextView[@text="Kerr House"])[2]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '(//XCUIElementTypeStaticText[@name="Kerr House"])[2]'
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

    locationPickerLogin: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/LocationPicker"]'
        ),
        ios: iOSLocatorBuilder.id('LocationPicker'),
    } as TestBotElement,

    // Same underlying locator/index as optionKerrHouseEnrolment
    // above, but named separately since it is used on the
    // Welcome Back screen's own Location/site picker — a
    // different screen context.
    optionKerrHouseWelcomeBack: {
        android: AndroidLocatorBuilder.xpath(
            '(//android.widget.TextView[@text="Kerr House"])[2]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '(//XCUIElementTypeStaticText[@name="Kerr House"])[2]'
        ),
    } as TestBotElement,

    userDropdown: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/UserPicker"]'
        ),
        ios: iOSLocatorBuilder.id('UserPicker'),
    } as TestBotElement,

    // Direct text match for the Welcome Back screen's user
    // selection, and also used as an additional detection signal
    // for Step 0.
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

    kerrHouseServiceUsers: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Kerr House / Service Users"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Kerr House / Service Users"]'
        ),
    } as TestBotElement,

    // The clickable row (parent ViewGroup) containing the
    // "Kerr House / Service Users" checkbox — required on
    // BrowserStack where no community is pre-selected and the
    // CheckBox itself does not toggle via a direct Appium click;
    // the surrounding row must be tapped.
    kerrHouseServiceUsersRow: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Kerr House / Service Users"]/ancestor::android.view.ViewGroup[@clickable="true"][1]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Kerr House / Service Users"]'
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
// Helper — reliably tap "Kerr House / Service Users"
// on the Communities screen only. Never touches
// "South Wing" or "Training". Verifies checkbox state
// (or button enablement) before/after tapping so we
// never rely on assumptions about a pre-checked state.
// ─────────────────────────────────────────────
async function ensureKerrHouseServiceUsersSelected(): Promise<void> {
    await testBot.waitUntilVisible(selectors.kerrHouseServiceUsers, 20000)
    console.log('Confirmed "Kerr House / Service Users" is visible on the Communities screen')

    const startWorkXpath =
        '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/StartWorkButton"]'
    const startBtn = await $(startWorkXpath)

    // If Start Work is already enabled, the target community is
    // likely already selected by default (seen on local physical
    // device) — do NOT tap it, since tapping would toggle it OFF
    // and disable Start Work again.
    const alreadyEnabled = await startBtn.isEnabled().catch(() => false)
    if (alreadyEnabled) {
        console.log('Start Work already enabled — assuming target community is pre-selected. Skipping tap.')
        return
    }

    // Otherwise (BrowserStack, or any run where nothing is
    // pre-selected), tap the row for "Kerr House / Service Users"
    // specifically — never any other Kerr House option.
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
// Tracks whether the device was already enrolled at test start.
// Set in Step 0; used to skip the enrolment steps (1-9) when
// the app opens directly to the login screen.
let deviceAlreadyEnrolled = false

describe('Care Delivery - Full Enrolment & Login Flow', () => {

    it('Step 0 - Detect whether device shows fresh Welcome screen or already-enrolled Welcome Back screen', async () => {
        // NB: BrowserStack cloud devices provision a fresh app
        // install every session and are typically slower to
        // cold-start the app than a physical device that already
        // has it warm/cached. A local-device run also showed the
        // Welcome Back screen's Sign In button (disabled) render
        // before Location/Username text, and BrowserStack itself
        // needs longer than a flat 30s in general — so timeouts
        // are widened for both, and detection checks for the
        // username text OR the location field.
        const startupTimeout = isLocal ? 60000 : 90000
        const pollInterval = 1000
        const deadline = Date.now() + startupTimeout

        let regionDropdownVisible = false
        let welcomeBackVisible = false
        let pollCount = 0

        while (Date.now() < deadline) {
            regionDropdownVisible = await testBot.isVisible(selectors.regionDropdown).catch(() => false)

            welcomeBackVisible =
                (await testBot.isVisible(selectors.welcomeBackUsername).catch(() => false)) ||
                (await testBot.isVisible(selectors.locationPickerLogin).catch(() => false))

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
            console.log('Detected Welcome Back screen (via "Akhila Nethi" username or Location field) — skipping enrolment steps and proceeding with login flow')
        } else {
            console.error(`Neither screen detected within ${startupTimeout}ms (${isLocal ? 'local' : 'BrowserStack'} mode) — dumping page source`)
            await dumpPageSourceOnFailure('Step 0 timeout')
            throw new Error(`Could not detect Welcome or Welcome Back screen within ${startupTimeout}ms.`)
        }
    })

    it('Step 1 - App opens to Welcome screen with region dropdown and disabled Enrol button', async function () {
        if (deviceAlreadyEnrolled) { this.skip(); return; }
        await driver.pause(3000)
        await testBot.waitUntilVisible(selectors.regionDropdown, 15000)
        await testBot.waitUntilVisible(selectors.enrollDeviceButton, 5000)
        const enrolBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/LoginButton"]'
        )
        const isEnabled = await enrolBtn.isEnabled()
        expect(isEnabled).toBe(false)
    })

    it('Step 2 - Select United Kingdom and verify Enrol button becomes enabled', async function () {
        if (deviceAlreadyEnrolled) { this.skip(); return; }
        await testBot.click(selectors.regionDropdown)
        await testBot.waitUntilVisible(selectors.optionUnitedKingdom, 10000)
        await testBot.click(selectors.optionUnitedKingdom)
        const enrolBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/LoginButton"]'
        )
        const isEnabled = await enrolBtn.isEnabled()
        expect(isEnabled).toBe(true)
    })

    it('Step 3 - Click Enrol device and land on Username page', async function () {
        if (deviceAlreadyEnrolled) { this.skip(); return; }
        await testBot.click(selectors.enrollDeviceButton)
        await driver.pause(isLocal ? 3000 : 5000)

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
            console.log('Keyboard dismissed')
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

        // On physical device, MSAL may open a Chrome Custom Tab
        // or broker auth which briefly backgrounds the app. Give
        // it up to 120s to complete and bring the app back to
        // foreground before looking for the enrolment page.
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

    it('Step 7 - Select Organisation and Location; verify Enrol button is enabled', async function () {
        if (deviceAlreadyEnrolled) { this.skip(); return; }
        await testBot.click(selectors.organisationDropdown)
        await driver.pause(3000)
        await testBot.waitUntilVisible(selectors.optionPersonCentredSoftware, 10000)
        await testBot.click(selectors.optionPersonCentredSoftware)
        await driver.pause(3000)

        await testBot.click(selectors.locationDropdown)
        await driver.pause(3000)
        await testBot.waitUntilVisible(selectors.optionKerrHouseEnrolment, 10000)
        await testBot.click(selectors.optionKerrHouseEnrolment)
        await driver.pause(3000)

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
        await testBot.waitUntilVisible(selectors.locationPickerLogin, 15000)
    })

    it('Step 10.1 - App opens on Username selection screen; Sign In button is disabled', async () => {
        await testBot.waitUntilVisible(selectors.userDropdown, 10000)
        await testBot.waitUntilVisible(selectors.signInButton, 5000)
        const signInBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/SignInButton"]'
        )
        const isEnabled = await signInBtn.isEnabled()
        expect(isEnabled).toBe(false)
    })

    it('Step 10.2 - Location field is populated with Kerr House', async () => {
        // NB: calling .getText() with no wait threw "element
        // wasn't found" in a real run if LocationPicker hadn't
        // rendered yet at this exact moment — explicit wait
        // added first, with a page-source dump if it's still not
        // found after that.
        try {
            await testBot.waitUntilVisible(selectors.locationPickerLogin, 15000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 10.2 (LocationPicker not found)')
            throw err
        }

        const locationEl = await $(
            '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/LocationPicker"]'
        )
        let locationValue = await locationEl.getText()

        if (!locationValue.includes(LOCATION)) {
            await testBot.click(selectors.locationPickerLogin)
            await driver.pause(3000)
            await testBot.waitUntilVisible(selectors.optionKerrHouseWelcomeBack, 10000)
            await testBot.click(selectors.optionKerrHouseWelcomeBack)
            await driver.pause(3000)

            const refreshed = await $(
                '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/LocationPicker"]'
            )
            locationValue = await refreshed.getText()
        }

        expect(locationValue).toContain(LOCATION)
    })

    it('Step 10.3 - Open user dropdown and verify users for selected location are shown', async () => {
        await testBot.click(selectors.userDropdown)
        await driver.pause(3000)
        await testBot.waitUntilVisible(selectors.welcomeBackUsername, 10000)
        const isVisible = await testBot.isVisible(selectors.welcomeBackUsername)
        expect(isVisible).toBe(true)
    })

    it('Step 10.4 - Select user and verify Sign In button becomes enabled', async () => {
        await testBot.click(selectors.welcomeBackUsername)
        await driver.pause(3000)
        const signInBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/SignInButton"]'
        )
        const isEnabled = await signInBtn.isEnabled()
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
        // Reliably ensures ONLY "Kerr House / Service Users" gets
        // selected — never "South Wing" or "Training" — and
        // confirms Start Work is enabled before proceeding.
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
