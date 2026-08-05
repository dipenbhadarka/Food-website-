import { testBot } from '../../testbot'
import { AndroidLocatorBuilder } from '../../TestBot/Locators/Android/AndroidLocatorBuilder'
import { iOSLocatorBuilder } from '../../TestBot/Locators/iOS/iOSLocatorBuilder'
import { TestBotElement } from '../../TestBot/TestBotElement'

// ─────────────────────────────────────────────
// Run mode detection
// ─────────────────────────────────────────────
const isLocal = process.env.RUN_MODE === 'local'
const localAppPackage = process.env.LOCAL_APP_PACKAGE || 'com.personcentredsoftware.care.delivery'
console.log(`▶ Running in ${isLocal ? 'LOCAL PHYSICAL DEVICE' : 'BROWSERSTACK CLOUD'} mode`)

// ─────────────────────────────────────────────
// Test Data
// ─────────────────────────────────────────────
const USERNAME = 'a.nethi@personcentredsoftware.com'
const PASSWORD = 'PCSpassword@1'
const ORGANISATION = 'Person Centred Software'
const LOCATION = 'Kerr House'
const USER = 'Akhila Nethi'

// NB: This is the exact community text we must select on
// the "What communities are you working in today?" screen.
// There are FOUR similar options on that screen:
//   "Kerr House"                              (parent group, not selectable)
//   "Kerr House / Service Users"              <-- THIS is the one we want
//   "Kerr House / South Wing - First Floor"   (do NOT select this)
//   "Kerr House / Training"                   (do NOT select this)
const TARGET_COMMUNITY = 'Kerr House / Service Users'

// ─────────────────────────────────────────────
// Selectors
// ─────────────────────────────────────────────
const selectors = {
    regionDropdown: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/EnvironmentPicker"]'
        ),
        ios: iOSLocatorBuilder.id('EnvironmentPicker'),
    } as TestBotElement,

    enrollDeviceButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/LoginButton"]'
        ),
        ios: iOSLocatorBuilder.id('LoginButton'),
    } as TestBotElement,

    optionUnitedKingdom: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@resource-id="android:id/text1" and @text="United Kingdom"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypePickerWheel[@value="United Kingdom"]'
        ),
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

    locationDropdown: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/LocationPicker"]'
        ),
        ios: iOSLocatorBuilder.id('LocationPicker'),
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

    userDropdown: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/UserPicker"]'
        ),
        ios: iOSLocatorBuilder.id('UserPicker'),
    } as TestBotElement,

    signInButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/SignInButton"]'
        ),
        ios: iOSLocatorBuilder.id('SignInButton'),
    } as TestBotElement,

    // ── Communities screen — all four options present,
    // each with an EXACT-match locator so they can never
    // be confused with one another. ──
    kerrHouseServiceUsers: {
        android: AndroidLocatorBuilder.xpath(
            `//android.widget.TextView[@text="${TARGET_COMMUNITY}"]`
        ),
        ios: iOSLocatorBuilder.xpath(
            `//XCUIElementTypeStaticText[@name="${TARGET_COMMUNITY}"]`
        ),
    } as TestBotElement,

    // The clickable row (parent ViewGroup) containing the
    // "Kerr House / Service Users" checkbox — required on
    // BrowserStack where no community is pre-selected and
    // the CheckBox itself does not toggle via a direct
    // Appium click; the surrounding row must be tapped.
    kerrHouseServiceUsersRow: {
        android: AndroidLocatorBuilder.xpath(
            `//android.widget.TextView[@text="${TARGET_COMMUNITY}"]/ancestor::android.view.ViewGroup[@clickable="true"][1]`
        ),
        ios: iOSLocatorBuilder.xpath(
            `//XCUIElementTypeStaticText[@name="${TARGET_COMMUNITY}"]`
        ),
    } as TestBotElement,

    // Explicitly defined so we can positively confirm we
    // are NOT on this option before/after selecting.
    kerrHouseSouthWing: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Kerr House / South Wing - First Floor"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Kerr House / South Wing - First Floor"]'
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

function pickerOption(text: string): TestBotElement {
    return {
        android: AndroidLocatorBuilder.xpath(
            `//android.widget.TextView[@resource-id="android:id/text1" and @text="${text}"]`
        ),
        ios: iOSLocatorBuilder.xpath(
            `//XCUIElementTypePickerWheel[@value="${text}"]`
        ),
    } as TestBotElement
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
// Helper — robust picker selection with scroll fallback
// ─────────────────────────────────────────────
async function selectPickerOptionRobust(value: string): Promise<void> {
    const option = pickerOption(value)

    try {
        await testBot.waitUntilVisible(option, 5000)
        await testBot.click(option)
        console.log(`Selected "${value}" directly`)
        return
    } catch (err) {
        console.warn(`Direct selection of "${value}" failed, trying scroll fallback`)
    }

    try {
        const scrolled = await $(
            'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
            `.scrollIntoView(new UiSelector().text("${value}"))`
        )
        if (await scrolled.isExisting()) {
            await scrolled.click()
            console.log(`Selected "${value}" via UiScrollable scroll`)
            return
        }
    } catch (err) {
        console.warn(`UiScrollable fallback for "${value}" failed:`, err)
    }

    try {
        const anyText = await $(`//*[@text="${value}"]`)
        if (await anyText.isExisting()) {
            await anyText.click()
            console.log(`Selected "${value}" via generic text match`)
            return
        }
    } catch (err) {
        console.warn(`Generic text match for "${value}" failed:`, err)
    }

    console.error(`Could not select "${value}" with any method — dumping page source`)
    try {
        const pageSource = await driver.getPageSource()
        console.log(`─────────── PAGE SOURCE: PICKER "${value}" ───────────`)
        console.log(pageSource)
        console.log('─────────────────────────────────────────────')
    } catch (srcErr) {
        console.warn('getPageSource failed (session may be dead):', srcErr)
    }
    throw new Error(`Could not select picker option "${value}"`)
}

// ─────────────────────────────────────────────
// Helper — reliably tap "Kerr House / Service Users"
// on the Communities screen only. Never touches
// "South Wing" or "Training". Verifies checkbox state
// (or button enablement) before/after tapping so we
// never rely on assumptions about a pre-checked state.
// ─────────────────────────────────────────────
async function ensureKerrHouseServiceUsersSelected(): Promise<void> {
    const targetXpath = `//android.widget.TextView[@text="${TARGET_COMMUNITY}"]`

    await testBot.waitUntilVisible(selectors.kerrHouseServiceUsers, 20000)
    console.log(`Confirmed "${TARGET_COMMUNITY}" is visible on the Communities screen`)

    const startWorkXpath =
        '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/StartWorkButton"]'
    const startBtn = await $(startWorkXpath)

    // If Start Work is already enabled, the target community
    // is likely already selected by default (seen on local
    // physical device) — do NOT tap it, since tapping would
    // toggle it OFF and disable Start Work again.
    const alreadyEnabled = await startBtn.isEnabled().catch(() => false)
    if (alreadyEnabled) {
        console.log('Start Work already enabled — assuming target community is pre-selected. Skipping tap.')
        return
    }

    // Otherwise (BrowserStack, or any run where nothing is
    // pre-selected), tap the row for "Kerr House / Service
    // Users" specifically — never any other Kerr House option.
    console.log(`Start Work is disabled — tapping "${TARGET_COMMUNITY}" row to select it`)
    await testBot.click(selectors.kerrHouseServiceUsersRow)
    await driver.pause(1000)

    const nowEnabled = await startBtn.isEnabled().catch(() => false)
    if (!nowEnabled) {
        console.error(`Start Work still disabled after tapping "${TARGET_COMMUNITY}" — dumping page source`)
        try {
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE: COMMUNITY SELECTION ───────────')
            console.log(pageSource)
            console.log('────────────────────────────────────────────────────')
        } catch (srcErr) {
            console.warn('getPageSource failed:', srcErr)
        }
        throw new Error(
            `Selecting "${TARGET_COMMUNITY}" did not enable Start Work — check the community list state`
        )
    }
    console.log(`Confirmed "${TARGET_COMMUNITY}" is selected — Start Work is now enabled`)
}

// ─────────────────────────────────────────────
// Device state flag — set by Step 0 below, read
// by every later step in this suite. If the
// device is already enrolled ("Welcome Back"
// screen appears instead of the fresh Welcome
// screen with the region dropdown), enrolment
// Steps 1-9 are skipped automatically and the
// suite jumps straight to the login flow
// (Step 10.1 onward), which is what the "Welcome
// Back" screen actually needs.
// ─────────────────────────────────────────────
let deviceAlreadyEnrolled = false

// ─────────────────────────────────────────────
// Suite — Enrolment & Login Flow
// ─────────────────────────────────────────────
describe('Care Delivery - Full Enrolment & Login Flow', () => {

    it('Step 0 - Detect whether device shows fresh Welcome screen or already-enrolled Welcome Back screen', async () => {
        await driver.pause(3000)

        const regionDropdownVisible = await testBot.isVisible(selectors.regionDropdown).catch(() => false)
        const loginLocationVisible = await testBot.isVisible(selectors.locationPickerLogin).catch(() => false)

        if (regionDropdownVisible) {
            deviceAlreadyEnrolled = false
            console.log('Detected FRESH Welcome screen (region dropdown present) — will run full enrolment flow')
        } else if (loginLocationVisible) {
            deviceAlreadyEnrolled = true
            console.log('Detected "Welcome Back" screen (device already enrolled) — will SKIP enrolment steps 1-9 and go straight to login')
        } else {
            console.warn('Could not confidently detect screen state — dumping page source, defaulting to attempt full enrolment flow')
            try {
                const pageSource = await driver.getPageSource()
                console.log('─────────── PAGE SOURCE AT STEP 0 ───────────')
                console.log(pageSource)
                console.log('──────────────────────────────────────────')
            } catch (srcErr) {
                console.warn('getPageSource failed:', srcErr)
            }
            deviceAlreadyEnrolled = false
        }
    })

    it('Step 1 - App opens to Welcome screen with region dropdown and disabled Enrol button', async function () {
        if (deviceAlreadyEnrolled) {
            console.log('Skipping Step 1 — device already enrolled')
            this.skip()
            return
        }
        await testBot.waitUntilVisible(selectors.regionDropdown, 15000)
        await testBot.waitUntilVisible(selectors.enrollDeviceButton, 5000)
        const enrolBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/LoginButton"]'
        )
        const isEnabled = await enrolBtn.isEnabled()
        expect(isEnabled).toBe(false)
    })

    it('Step 2 - Select United Kingdom and verify Enrol button becomes enabled', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 2 — device already enrolled'); this.skip(); return }
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
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 3 — device already enrolled'); this.skip(); return }
        await testBot.click(selectors.enrollDeviceButton)
        await driver.pause(isLocal ? 3000 : 5000)

        try {
            await testBot.waitUntilVisible(usernameField, 20000)
        } catch (err) {
            console.error('Username field not found — dumping page source')
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE AT STEP 3 ───────────')
            console.log(pageSource)
            console.log('──────────────────────────────────────────')
            throw err
        }
    })

    it('Step 4 - Enter username and navigate to PCS Terms page', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 4 — device already enrolled'); this.skip(); return }
        await testBot.click(usernameField)
        await testBot.enterText(usernameField, USERNAME, false)
        await driver.pause(500)

        await submitUsername()

        await driver.pause(isLocal ? 2000 : 3000)

        try {
            await testBot.waitUntilVisible(selectors.continueButton, 20000)
        } catch (err) {
            console.error('Continue button not found — dumping page source')
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE AT STEP 4 ───────────')
            console.log(pageSource)
            console.log('──────────────────────────────────────────')
            throw err
        }
    })

    it('Step 5 - Click Continue and land on Password page', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 5 — device already enrolled'); this.skip(); return }
        await testBot.click(selectors.continueButton)
        await driver.pause(2000)
        await testBot.waitUntilVisible(selectors.passwordField, 20000)
    })

    it('Step 6 - Enter password and navigate to Enrol page', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 6 — device already enrolled'); this.skip(); return }
        await testBot.click(selectors.passwordField)
        await driver.pause(500)
        await testBot.enterText(selectors.passwordField, PASSWORD, false)
        await driver.pause(500)

        try {
            await driver.hideKeyboard()
            await driver.pause(1000)
            console.log('Keyboard dismissed')
        } catch (err) {
            console.warn('hideKeyboard failed or keyboard already hidden:', err)
        }

        try {
            await testBot.waitUntilVisible(selectors.identityLoginButton, 10000)
        } catch (err) {
            console.error('Identity Login button not found — dumping page source')
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE AT STEP 6 (before click) ───────────')
            console.log(pageSource)
            console.log('────────────────────────────────────────────────────────')
            throw err
        }

        await testBot.click(selectors.identityLoginButton)

        // On physical device, MSAL may open a Chrome Custom Tab
        // or broker auth which briefly backgrounds the app.
        // Give it up to 120s to complete and bring the app back
        // to foreground before looking for the enrolment page.
        const postLoginWait = isLocal ? 120000 : 20000
        await driver.pause(isLocal ? 5000 : 3000)

        if (isLocal) {
            try {
                await driver.activateApp(localAppPackage)
                await driver.pause(2000)
            } catch (e) {
                console.warn('activateApp after identity login failed (app may already be foreground):', e)
            }
        }

        try {
            await testBot.waitUntilVisible(selectors.organisationDropdown, postLoginWait)
            await testBot.waitUntilVisible(selectors.locationDropdown, 5000)
            await testBot.waitUntilVisible(selectors.enrolButton, 5000)
        } catch (err) {
            console.error('Enrol page did not load after clicking Login — dumping page source')
            try {
                const pageSource = await driver.getPageSource()
                console.log('─────────── PAGE SOURCE AT STEP 6 (after click) ───────────')
                console.log(pageSource)
                console.log('───────────────────────────────────────────────────────')
            } catch (srcErr) {
                console.warn('getPageSource failed (session may be dead):', srcErr)
            }
            throw err
        }
    })

    it('Step 7 - Select Organisation and Location; verify Enrol button is enabled', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 7 — device already enrolled'); this.skip(); return }
        await testBot.click(selectors.organisationDropdown)
        await driver.pause(1000)
        await selectPickerOptionRobust(ORGANISATION)
        await driver.pause(1000)

        await testBot.click(selectors.locationDropdown)
        await driver.pause(1000)
        await selectPickerOptionRobust(LOCATION)
        await driver.pause(1000)

        const enrolBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/EnrollButton"]'
        )
        const isEnabled = await enrolBtn.isEnabled()
        expect(isEnabled).toBe(true)
    })

    it('Step 8 - Click Enrol and see Device Enrolled page with Logout button', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 8 — device already enrolled'); this.skip(); return }
        await testBot.click(selectors.enrolButton)
        await testBot.waitUntilVisible(selectors.logoutButton, 30000)
    })

    it('Step 9 - Click Log Out and land on Log In page', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 9 — device already enrolled'); this.skip(); return }
        await testBot.click(selectors.logoutButton)
        await driver.pause(2000)
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
        const locationEl = await $(
            '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/LocationPicker"]'
        )
        let locationValue = await locationEl.getText()

        if (!locationValue.includes(LOCATION)) {
            await testBot.click(selectors.locationPickerLogin)
            await driver.pause(1000)
            await selectPickerOptionRobust(LOCATION)
            await driver.pause(1000)

            const refreshed = await $(
                '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/LocationPicker"]'
            )
            locationValue = await refreshed.getText()
        }

        expect(locationValue).toContain(LOCATION)
    })

    it('Step 10.3 - Open user dropdown and verify users for selected location are shown', async () => {
        await testBot.click(selectors.userDropdown)
        await driver.pause(1000)
        await testBot.waitUntilVisible(pickerOption(USER), 10000)
        const isVisible = await testBot.isVisible(pickerOption(USER))
        expect(isVisible).toBe(true)
    })

    it('Step 10.4 - Select user and verify Sign In button becomes enabled', async () => {
        await selectPickerOptionRobust(USER)
        await driver.pause(1000)
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
        await driver.pause(2000)
        await testBot.waitUntilVisible(selectors.passwordField, 20000)
    })

    it('Step 10.7 - Enter password and click Log In', async () => {
        await testBot.click(selectors.passwordField)
        await driver.pause(500)
        await testBot.enterText(selectors.passwordField, PASSWORD, false)
        await driver.pause(500)

        try {
            await driver.hideKeyboard()
            await driver.pause(1000)
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
        // Reliably ensures ONLY "Kerr House / Service Users"
        // gets selected — never "South Wing" or "Training" —
        // and confirms Start Work is enabled before proceeding.
        await ensureKerrHouseServiceUsersSelected()

        await testBot.click(selectors.startWorkButton)

        try {
            await testBot.waitUntilVisible(selectors.myCommunitiesTab, 30000)
        } catch (err) {
            console.error('My Communities tab not found after Start Work — dumping page source')
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE AT STEP 10.9 ───────────')
            console.log(pageSource)
            console.log('────────────────────────────────────────────────')
            throw err
        }
    })

})


// ═══════════════════════════════════════════════
// SUITE 2 — Finish and Sign Out Flow
// (continues in the SAME session after Suite 1
// above completes)
// ═══════════════════════════════════════════════

// ─────────────────────────────────────────────
// Finish and Sign Out Flow — selectors
// Assumes the app is ALREADY logged in and on the
// My Communities page when this file starts.
//
// IMPORTANT: every xpath string below starts with
// a plain "//" — never "[//" — since a stray
// leading bracket (an artifact of markdown link
// auto-formatting when pasting XPaths) silently
// breaks the locator and returns zero elements
// every time, with no error thrown.
// ─────────────────────────────────────────────
const finishSignOutSelectors = {
    globalNavMenuButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/GlobalCommunitiesPage"]/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[3]/android.view.ViewGroup/android.widget.Button'
        ),
        ios: iOSLocatorBuilder.id('GlobalNavMenuButton'),
    } as TestBotElement,

    finishAndSignOutButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/FinishWorkButton"]'
        ),
        ios: iOSLocatorBuilder.id('FinishWorkButton'),
    } as TestBotElement,

    justFinishingUpTitle: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Just Finishing Up"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Just Finishing Up"]'
        ),
    } as TestBotElement,

    userDropdownAfterSignOut: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/UserPicker"]'
        ),
        ios: iOSLocatorBuilder.id('UserPicker'),
    } as TestBotElement,
}

// Confirmed-by-log text button (tried first — this one
// was proven to exist and be clickable in a real run)
const signOutTextButtonXpath = '//android.widget.Button[@text="Sign Out"]'

// Icon locator described as "the only signout button"
// (fallback if the text button is not present)
const signOutIconXpath =
    '//androidx.recyclerview.widget.RecyclerView/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[3]/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.ImageView'

async function findSignOutControl() {
    const textBtn = await $(signOutTextButtonXpath)
    if (await textBtn.isExisting()) {
        console.log(`✓ Found Sign Out control (text button): ${signOutTextButtonXpath}`)
        return textBtn
    }
    console.warn('Text-based Sign Out button not found, trying icon fallback')

    const iconBtn = await $(signOutIconXpath)
    if (await iconBtn.isExisting()) {
        console.log(`✓ Found Sign Out control (icon): ${signOutIconXpath}`)
        return iconBtn
    }

    console.error('✖ Sign Out control not found via either method — dumping page source')
    try {
        const pageSource = await driver.getPageSource()
        console.log('─────────── PAGE SOURCE: SIGN OUT CONTROL NOT FOUND ───────────')
        console.log(pageSource)
        console.log('────────────────────────────────────────────────────────────')
    } catch (srcErr) {
        console.warn('getPageSource failed:', srcErr)
    }
    throw new Error('Sign Out control not found via text button or icon fallback.')
}

// ─────────────────────────────────────────────
// Close (X) button — candidates tried in order.
// Unlike before, if NONE match, this now returns
// null instead of throwing — Step 3 will log a
// warning and skip gracefully rather than killing
// the whole run, since Close is not required to
// reach Sign Out (Step 4 re-opens the flow fresh
// regardless of whether Step 3 succeeded).
// ─────────────────────────────────────────────
const closeButtonCandidates: string[] = [
    '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/CloseButton"]',
    '//android.widget.ImageView[@resource-id="com.personcentredsoftware.care.delivery:id/CloseButton"]',
    '//android.widget.Button[@content-desc="Close"]',
    '//android.widget.ImageView[@content-desc="Close"]',
    '//android.widget.Button[@text="Close"]',
    '//android.widget.Button[@text="Cancel"]',
    '//android.widget.ImageButton[@content-desc="Close"]',
]

async function findCloseButtonOrNull() {
    for (const xpath of closeButtonCandidates) {
        const el = await $(xpath)
        if (await el.isExisting()) {
            console.log(`✓ Found Close button using: ${xpath}`)
            return el
        }
    }
    console.warn('⚠ Close button not found with any candidate locator — skipping Step 3 gracefully')
    try {
        const pageSource = await driver.getPageSource()
        console.log('─────────── PAGE SOURCE: CLOSE BUTTON NOT FOUND (non-fatal) ───────────')
        console.log(pageSource)
        console.log('────────────────────────────────────────────────────────────────────')
    } catch (srcErr) {
        console.warn('getPageSource failed:', srcErr)
    }
    return null
}

// ─────────────────────────────────────────────
// Suite — Finish and Sign Out Flow
// (Community page → Logout only)
// ─────────────────────────────────────────────
describe('Care Delivery - Finish and Sign Out Flow', () => {

    // ── Step 1: Open global nav menu without completing any care notes ──
    it('Step 1 - Without completing any care notes, open the global nav menu', async () => {
        try {
            await testBot.waitUntilVisible(finishSignOutSelectors.globalNavMenuButton, 15000)
            await testBot.click(finishSignOutSelectors.globalNavMenuButton)
            await driver.pause(1500)

            await testBot.waitUntilVisible(finishSignOutSelectors.finishAndSignOutButton, 10000)
            console.log('Global nav menu opened — Finish and Sign Out button is visible')
        } catch (err) {
            console.error('Global nav menu or Finish and Sign Out button not found — dumping page source')
            try {
                const pageSource = await driver.getPageSource()
                console.log('─────────── PAGE SOURCE AT STEP 1 ───────────')
                console.log(pageSource)
                console.log('─────────────────────────────────────────')
            } catch (srcErr) {
                console.warn('getPageSource failed:', srcErr)
            }
            throw err
        }
    })

    // ── Step 2: Click Finish and Sign Out ──
    it('Step 2 - Click Finish and Sign Out; verify Just Finishing Up screen with Sign Out control enabled', async () => {
        try {
            await testBot.click(finishSignOutSelectors.finishAndSignOutButton)
            await driver.pause(2000)

            await testBot.waitUntilVisible(finishSignOutSelectors.justFinishingUpTitle, 15000)
            console.log('Landed on "Just Finishing Up" screen')

            const signOutControl = await findSignOutControl()
            const isEnabled = await signOutControl.isEnabled()
            expect(isEnabled).toBe(true)
            console.log('Sign Out control is enabled as expected (no pending uploads)')

        } catch (err) {
            console.error('Just Finishing Up screen or Sign Out control check failed — dumping page source')
            try {
                const pageSource = await driver.getPageSource()
                console.log('─────────── PAGE SOURCE AT STEP 2 ───────────')
                console.log(pageSource)
                console.log('─────────────────────────────────────────')
            } catch (srcErr) {
                console.warn('getPageSource failed:', srcErr)
            }
            throw err
        }
    })

    // ── Step 3: Close via X icon (non-fatal if not found) ──
    it('Step 3 - Close the Just Finishing Up screen using the X icon if available', async () => {
        const closeBtn = await findCloseButtonOrNull()

        if (!closeBtn) {
            console.warn('Skipping Step 3 assertion — Close button was not found on this screen')
            return
        }

        try {
            await closeBtn.click()
            await driver.pause(1500)

            const stillOnFinishingUp = await testBot.isVisible(finishSignOutSelectors.justFinishingUpTitle)
            expect(stillOnFinishingUp).toBe(false)
            console.log('Closed Just Finishing Up screen via X icon — returned to app, still signed in')

        } catch (err) {
            console.error('Close (X) button click failed — dumping page source')
            try {
                const pageSource = await driver.getPageSource()
                console.log('─────────── PAGE SOURCE AT STEP 3 ───────────')
                console.log(pageSource)
                console.log('─────────────────────────────────────────')
            } catch (srcErr) {
                console.warn('getPageSource failed:', srcErr)
            }
            throw err
        }
    })

    // ── Step 4: Re-open Finishing Up screen and Sign Out ──
    it('Step 4 - From Just Finishing Up screen, click Sign Out; land on Log In screen', async () => {
        try {
            // If Step 3 closed the screen, this re-opens it fresh.
            // If Step 3 was skipped (no close button found), we may
            // already be on the Just Finishing Up screen — check first.
            const alreadyOnFinishingUp = await testBot.isVisible(finishSignOutSelectors.justFinishingUpTitle)

            if (!alreadyOnFinishingUp) {
                await testBot.waitUntilVisible(finishSignOutSelectors.globalNavMenuButton, 15000)
                await testBot.click(finishSignOutSelectors.globalNavMenuButton)
                await driver.pause(1000)

                await testBot.waitUntilVisible(finishSignOutSelectors.finishAndSignOutButton, 10000)
                await testBot.click(finishSignOutSelectors.finishAndSignOutButton)
                await driver.pause(1500)

                await testBot.waitUntilVisible(finishSignOutSelectors.justFinishingUpTitle, 15000)
            } else {
                console.log('Already on Just Finishing Up screen — skipping re-open')
            }

            const signOutControl = await findSignOutControl()
            await signOutControl.click()
            await driver.pause(2000)

            await testBot.waitUntilVisible(finishSignOutSelectors.userDropdownAfterSignOut, 15000)
            console.log('Signed out successfully — landed on Log In screen; device remains enrolled')

        } catch (err) {
            console.error('Sign Out flow failed — dumping page source')
            try {
                const pageSource = await driver.getPageSource()
                console.log('─────────── PAGE SOURCE AT STEP 4 ───────────')
                console.log(pageSource)
                console.log('─────────────────────────────────────────')
            } catch (srcErr) {
                console.warn('getPageSource failed:', srcErr)
            }
            throw err
        }
    })

})
