import { testBot } from '../../testbot'
import { AndroidLocatorBuilder } from '../../TestBot/Locators/Android/AndroidLocatorBuilder'
import { iOSLocatorBuilder } from '../../TestBot/Locators/iOS/iOSLocatorBuilder'
import { TestBotElement } from '../../TestBot/TestBotElement'

const NON_BASELINE_RESIDENT =
    process.env.RESPIRATION_NON_BASELINE_RESIDENT || 'Ah-Na Gravy'
const BASELINE_RESIDENT =
    process.env.RESPIRATION_BASELINE_RESIDENT || 'Albie Armstrong'

// Accepted range: 1 - 99
const CLINICAL_MIN = 1
const CLINICAL_MAX = 99

// Baseline (personalised) range, per the
// BaselineObservation form: 18 - 30 (rpm)
const BASELINE_MIN = 18
const BASELINE_MAX = 30

const VALID_RESPIRATION = '24'

function locator(androidXpath: string, iosXpath: string): TestBotElement {
    return {
        android: AndroidLocatorBuilder.xpath(androidXpath),
        ios: iOSLocatorBuilder.xpath(iosXpath),
    } as TestBotElement
}

function residentLocator(name: string): TestBotElement {
    return locator(
        `//android.widget.TextView[@text="${name}"]`,
        `//XCUIElementTypeStaticText[@name="${name}"]`
    )
}

const selectors = {
    adhocButton: locator(
        '//android.widget.TextView[@text="Adhoc"]',
        '//XCUIElementTypeStaticText[@name="Adhoc"]'
    ),

    expandAllSectionsButton: locator(
        '//android.widget.Button[@text="\uE0A4"]',
        '//XCUIElementTypeButton[@name=""]'
    ),

    // ── CHANGED from Temperature: label text ──
    respirationText: locator(
        '//android.widget.TextView[@text="Respiration"]',
        '//XCUIElementTypeStaticText[@name="Respiration"]'
    ),

    respirationSelectionButton: locator(
        '//android.widget.TextView[@text="Respiration"]/ancestor::android.view.ViewGroup[@clickable="true"][1]',
        '//XCUIElementTypeStaticText[@name="Respiration"]/ancestor::XCUIElementTypeOther[1]'
    ),

    suppliedRespirationImage: locator(
        '//androidx.recyclerview.widget.RecyclerView/android.view.ViewGroup[4]/android.view.ViewGroup/android.view.ViewGroup[3]/android.view.ViewGroup/android.widget.ImageView',
        '//XCUIElementTypeStaticText[@name="Respiration"]/preceding-sibling::XCUIElementTypeImage[1]'
    ),

    nextButton: locator(
        '//android.widget.Button[@text="Next"]',
        '//XCUIElementTypeButton[@name="Next"]'
    ),

    // ── CHANGED from Temperature: your provided bare EditText
    // (identical structurally to Temperature's own bare EditText
    // locator — no change needed to the xpath itself, only the
    // variable name) ──
    respirationInput: locator(
        '//android.widget.EditText',
        '//XCUIElementTypeTextField'
    ),

    // NB: no confirmed validation message text was provided for
    // Respiration, unlike Temperature's confirmed string. Using a
    // generic "range" contains() match as a placeholder — please
    // confirm the real message text.
    validationError: locator(
        '//android.widget.TextView[contains(@text,"range")]',
        '//XCUIElementTypeStaticText[contains(@name,"range")]'
    ),

    // Guidance text confirmed from the BaselineObservation form's
    // guidance columns.
    lowBaselineGuidance: locator(
        '//android.widget.TextView[contains(@text,"Respiration rate is too low")]',
        '//XCUIElementTypeStaticText[contains(@name,"Respiration rate is too low")]'
    ),

    highBaselineGuidance: locator(
        '//android.widget.TextView[contains(@text,"Respiration rate is too high")]',
        '//XCUIElementTypeStaticText[contains(@name,"Respiration rate is too high")]'
    ),

    tenMinuteDuration: locator(
        '//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/DurationField"]//android.widget.TextView[@text="10 mins"]',
        '//XCUIElementTypeOther[@name="DurationField"]//XCUIElementTypeStaticText[@name="10 mins"]'
    ),

    confirmButton: locator(
        '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/ConfirmButton"]',
        '//XCUIElementTypeButton[@name="ConfirmButton"]'
    ),

    createRecordsButton: locator(
        '//android.widget.Button[@text="Create Records"]',
        '//XCUIElementTypeButton[@name="Create Records"]'
    ),

    closeButton: locator(
        '//android.widget.Button[@text="Close"]',
        '//XCUIElementTypeButton[@name="Close"]'
    ),

    earlierTab: locator(
        '//*[@text="Earlier"]',
        '//*[@name="Earlier"]'
    ),

    earlierCloseButton: locator(
        '(//android.widget.Button[@text=""])[1] | //android.widget.Button[@content-desc="Close"]',
        '(//XCUIElementTypeButton[@name=""])[1] | //XCUIElementTypeButton[@name="Close"]'
    ),

    myCommunitiesTab: locator(
        '//*[@text="My Communities"]',
        '//*[@name="My Communities"]'
    ),
}

async function dumpPageSourceOnFailure(step: string): Promise<void> {
    console.error(`Failure at ${step}`)
    try {
        console.log(await driver.getPageSource())
    } catch (error) {
        console.error('Could not get page source', error)
    }
}

async function isVisible(element: TestBotElement): Promise<boolean> {
    return testBot.isVisible(element).catch(() => false)
}

async function selectResident(name: string): Promise<void> {
    if (await isVisible(residentLocator(name))) {
        await testBot.click(residentLocator(name))
        return
    }

    if ((process.env.PLATFORM || 'android').toLowerCase() === 'android') {
        const resident = await $(
            'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
            `.scrollIntoView(new UiSelector().text("${name}"))`
        )
        await resident.waitForDisplayed({ timeout: 20000 })
        await resident.click()
        return
    }

    throw new Error(`Resident "${name}" is not visible`)
}

// ── CHANGED from Temperature: function name +
// "Respiration" text target, same structure ──
async function openRespirationCareNote(residentName: string): Promise<void> {
    await testBot.waitUntilVisible(selectors.myCommunitiesTab, 120000)

    await selectResident(residentName)
    console.log(`Selected resident: ${residentName}`)

    await testBot.waitUntilVisible(selectors.adhocButton, 10000)
    await testBot.click(selectors.adhocButton)

    let respirationVisible = await isVisible(selectors.respirationText)

    if (!respirationVisible && await isVisible(selectors.expandAllSectionsButton)) {
        await testBot.click(selectors.expandAllSectionsButton)
        await driver.pause(500)
        respirationVisible = await isVisible(selectors.respirationText)
    }

    if (!respirationVisible) {
        const respiration = await $(
            'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
            '.scrollIntoView(new UiSelector().text("Respiration"))'
        )
        await respiration.waitForDisplayed({ timeout: 10000 })
    }

    await selectRespirationTile()

    await testBot.waitUntilVisible(selectors.nextButton, 10000)
    await testBot.click(selectors.nextButton)

    await testBot.waitUntilVisible(selectors.respirationInput, 10000)
}

async function tapElementCenter(element: any): Promise<void> {
    const location = await element.getLocation()
    const size = await element.getSize()
    const x = Math.round(location.x + size.width / 2)
    const y = Math.round(location.y + size.height / 2)

    await driver.performActions([{
        type: 'pointer',
        id: 'respiration-tap',
        parameters: { pointerType: 'touch' },
        actions: [
            { type: 'pointerMove', duration: 0, x, y },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 100 },
            { type: 'pointerUp', button: 0 },
        ],
    }])
}

async function selectRespirationTile(): Promise<void> {
    const respirationTextXpath = await (testBot as any)
        .getLocatorTextForElement(selectors.respirationText)
    const respirationText = await $(respirationTextXpath)
    await respirationText.waitForDisplayed({ timeout: 10000 })

    await tapElementCenter(respirationText)
    await driver.pause(1000)

    if (!(await isVisible(selectors.nextButton))) {
        const suppliedXpath = await (testBot as any)
            .getLocatorTextForElement(selectors.suppliedRespirationImage)
        const suppliedImage = await $(suppliedXpath)

        if (await suppliedImage.isDisplayed().catch(() => false)) {
            await tapElementCenter(suppliedImage)
            await driver.pause(1000)
        }
    }

    if (!(await isVisible(selectors.nextButton))) {
        throw new Error('Respiration tile was tapped but Next did not appear')
    }
}

async function setRespiration(value: string): Promise<void> {
    const xpath = await (testBot as any)
        .getLocatorTextForElement(selectors.respirationInput)
    const input = await $(xpath)
    await input.waitForDisplayed({ timeout: 10000 })
    await input.click()
    await input.clearValue()
    await input.setValue(value)

    try {
        await driver.hideKeyboard()
    } catch {
        // The keyboard may already be closed on cloud devices.
    }
    await driver.pause(700)
}

async function clearRespiration(): Promise<void> {
    const xpath = await (testBot as any)
        .getLocatorTextForElement(selectors.respirationInput)
    const input = await $(xpath)
    await input.waitForDisplayed({ timeout: 10000 })
    await input.click()
    await input.clearValue()

    try {
        await driver.hideKeyboard()
    } catch {
        // The keyboard may already be closed on cloud devices.
    }
    await driver.pause(700)

    const value = (process.env.PLATFORM || 'android').toLowerCase() === 'android'
        ? await input.getAttribute('text')
        : await input.getValue()

    if (value !== '') {
        throw new Error(`Respiration field was not blank. Current value: "${value}"`)
    }
}

async function expectClinicalValidation(expected: boolean): Promise<void> {
    const displayed = await isVisible(selectors.validationError)
    if (displayed !== expected) {
        throw new Error(
            `Expected clinical validation to be ${expected ? 'displayed' : 'hidden'}`
        )
    }
}

async function expectGuidance(
    expected: 'present' | 'none'
): Promise<void> {
    const lowVisible = await isVisible(selectors.lowBaselineGuidance)
    const highVisible = await isVisible(selectors.highBaselineGuidance)
    const guidanceVisible = lowVisible || highVisible

    if (expected === 'present' && !guidanceVisible) {
        throw new Error('Expected personalized Respiration guidance')
    }
    if (expected === 'none' && guidanceVisible) {
        throw new Error('Personalized guidance was shown inside the baseline range')
    }
}

async function runClinicalBoundaryAnalysis(): Promise<void> {
    for (const value of [String(CLINICAL_MIN - 1), String(CLINICAL_MAX + 1)]) {
        await setRespiration(value)
        await expectClinicalValidation(true)
    }
}

async function selectRequiredDuration(): Promise<void> {
    for (let attempt = 0; attempt < 5; attempt++) {
        if (await isVisible(selectors.tenMinuteDuration)) {
            await testBot.click(selectors.tenMinuteDuration)
            return
        }

        const { width, height } = await driver.getWindowSize()
        await driver.execute('mobile: swipeGesture', {
            left: Math.floor(width * 0.2),
            top: Math.floor(height * 0.6),
            width: Math.floor(width * 0.6),
            height: Math.floor(height * 0.3),
            direction: 'up',
            percent: 0.5,
        })
        await driver.pause(750)
    }

    throw new Error('Required 10 mins duration was not found')
}

async function completeCareNote(): Promise<void> {
    await selectRequiredDuration()

    const confirmXpath = await (testBot as any)
        .getLocatorTextForElement(selectors.confirmButton)
    const confirmButton = await $(confirmXpath)
    await confirmButton.waitForDisplayed({ timeout: 10000 })
    await confirmButton.waitForEnabled({ timeout: 10000 })
    await confirmButton.click()

    await testBot.waitUntilVisible(selectors.createRecordsButton, 10000)
    await testBot.click(selectors.createRecordsButton)

    await testBot.waitUntilVisible(selectors.closeButton, 10000)
    await testBot.click(selectors.closeButton)

    await testBot.waitUntilVisible(selectors.earlierTab, 10000)
    await testBot.click(selectors.earlierTab)

    await testBot.waitUntilVisible(selectors.earlierCloseButton, 10000)
    await testBot.click(selectors.earlierCloseButton)

    await testBot.waitUntilVisible(selectors.myCommunitiesTab, 30000)
}

async function runStep(step: string, action: () => Promise<void>): Promise<void> {
    try {
        await action()
    } catch (error) {
        await dumpPageSourceOnFailure(step)
        throw error
    }
}

describe('Resident Area Profile - Observations - Respiration', () => {

    it('Validates boundaries, re-enters a valid baseline value and completes the care note', async () => {
        await runStep('baseline Respiration', async () => {
            await openRespirationCareNote(BASELINE_RESIDENT)

            await runClinicalBoundaryAnalysis()

            await setRespiration(String(BASELINE_MIN - 1))
            await expectClinicalValidation(false)
            await expectGuidance('present')

            await setRespiration(String(BASELINE_MAX + 1))
            await expectClinicalValidation(false)
            await expectGuidance('present')

            await setRespiration(VALID_RESPIRATION)
            await expectClinicalValidation(false)
            await expectGuidance('none')

            await completeCareNote()
        })
    })

    it('Leaves Respiration blank for a new non-baseline resident and completes the care note', async () => {
        await runStep('blank non-baseline Respiration', async () => {
            await openRespirationCareNote(NON_BASELINE_RESIDENT)
            await clearRespiration()
            await expectClinicalValidation(false)
            await completeCareNote()
        })
    })

    it('Rejects zero and negative Respiration values, then completes with a valid value', async () => {
        await runStep('zero and negative Respiration', async () => {
            await openRespirationCareNote(NON_BASELINE_RESIDENT)

            for (const value of ['0', '-1']) {
                await setRespiration(value)
                await expectClinicalValidation(true)
            }

            await setRespiration(VALID_RESPIRATION)
            await expectClinicalValidation(false)
            await completeCareNote()
        })
    })

})
