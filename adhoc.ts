import { testBot } from '../../testbot'
import { AndroidLocatorBuilder } from '../../TestBot/Locators/Android/AndroidLocatorBuilder'
import { iOSLocatorBuilder } from '../../TestBot/Locators/iOS/iOSLocatorBuilder'
import { TestBotElement } from '../../TestBot/TestBotElement'

const isLocal = process.env.RUN_MODE === 'local'
console.log(`Running Adhoc Activity flow in ${isLocal ? 'LOCAL PHYSICAL DEVICE' : 'BROWSERSTACK CLOUD'} mode`)

const RESIDENT_NAME = 'Freya Farrow'

// ─────────────────────────────────────────────
// Helper — dump page source safely, without
// throwing if the session itself is dead.
// ─────────────────────────────────────────────
async function dumpPageSourceOnFailure(stepLabel: string) {
    console.error(`Failure at ${stepLabel} — dumping page source`)
    try {
        const pageSource = await driver.getPageSource()
        console.log(`─────────── PAGE SOURCE: ${stepLabel} ───────────`)
        console.log(pageSource)
        console.log('─────────────────────────────────────────────')
    } catch (srcErr) {
        console.error(
            `getPageSource ALSO failed (${srcErr instanceof Error ? srcErr.message : srcErr}) — ` +
            'session likely dead. Consider restarting Appium/BrowserStack session.'
        )
    }
}

// ─────────────────────────────────────────────
// Freya Farrow — Adhoc Activity Flow selectors
// ─────────────────────────────────────────────
const adhocSelectors = {
    residentFreyaFarrow: {
        android: AndroidLocatorBuilder.xpath(
            `//android.widget.TextView[@text="${RESIDENT_NAME}"]`
        ),
        ios: iOSLocatorBuilder.xpath(
            `//XCUIElementTypeStaticText[@name="${RESIDENT_NAME}"]`
        ),
    } as TestBotElement,

    adhocButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Adhoc"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Adhoc"]'
        ),
    } as TestBotElement,

    activitiesListItem: {
        android: AndroidLocatorBuilder.xpath(
            '//androidx.recyclerview.widget.RecyclerView/android.view.ViewGroup[2]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeCollectionView/XCUIElementTypeCell[2]'
        ),
    } as TestBotElement,

    // NB: This arrow TOGGLES open/closed — tap once only.
    expandArrow: {
        android: AndroidLocatorBuilder.xpath(
            '(//android.widget.TextView[@text=""])[1]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '(//XCUIElementTypeStaticText[@name=""])[1]'
        ),
    } as TestBotElement,

    selectArtImage: {
        android: AndroidLocatorBuilder.xpath(
            '//androidx.recyclerview.widget.RecyclerView/android.view.ViewGroup[3]/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.widget.ImageView'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeCollectionView/XCUIElementTypeCell[3]/XCUIElementTypeImage'
        ),
    } as TestBotElement,

    nextButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="Next"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Next"]'
        ),
    } as TestBotElement,

    durationScreenTitle: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="How long did this care take?"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="How long did this care take?"]'
        ),
    } as TestBotElement,

    // Confirmed: plain grid button, no slider overlap.
    tenMinsOption: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="10 mins"] | //android.widget.Button[@text="10 mins"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="10 mins"] | //XCUIElementTypeButton[@name="10 mins"]'
        ),
    } as TestBotElement,

    // Confirmed: literal "Continue" button at the bottom
    // of the duration screen.
    confirmButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="Continue"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Continue"]'
        ),
    } as TestBotElement,

    createRecordsButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="Create Records"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Create Records"]'
        ),
    } as TestBotElement,

    // NB: Close button locator unconfirmed — falls back to
    // Create Records button if a dedicated close control
    // isn't found. Update once confirmed on real screen.
    closeAfterCreateButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="Create Records"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Create Records"]'
        ),
    } as TestBotElement,

    earlierTab: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Earlier"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Earlier"]'
        ),
    } as TestBotElement,
}

// ─────────────────────────────────────────────
// Suite — Freya Farrow Adhoc Activity Flow
// (assumes the app is already logged in and on
// the My Communities page — run this after the
// enrolment/login suite in the same session)
// ─────────────────────────────────────────────
describe('Care Delivery - Freya Farrow Adhoc Activity Flow', () => {

    it('Step 1 - Select resident "Freya Farrow" from the community list', async function () {
        try {
            await testBot.waitUntilVisible(adhocSelectors.residentFreyaFarrow, 20000)
            await testBot.click(adhocSelectors.residentFreyaFarrow)
            await driver.pause(2000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 1')
            throw err
        }
    })

    it('Step 2 - Click Adhoc', async function () {
        try {
            await testBot.waitUntilVisible(adhocSelectors.adhocButton, 15000)
            await testBot.click(adhocSelectors.adhocButton)
            await driver.pause(1500)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 2')
            throw err
        }
    })

    it('Step 3 - Select an activity from the list', async function () {
        try {
            await testBot.waitUntilVisible(adhocSelectors.activitiesListItem, 15000)
            await testBot.click(adhocSelectors.activitiesListItem)
            await driver.pause(1500)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 3')
            throw err
        }
    })

    it('Step 4 - Tap arrow to expand (toggle — tap once only)', async function () {
        try {
            await testBot.waitUntilVisible(adhocSelectors.expandArrow, 15000)
            await testBot.click(adhocSelectors.expandArrow)
            await driver.pause(1500)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 4')
            throw err
        }
    })

    it('Step 5 - Select the art', async function () {
        try {
            await testBot.waitUntilVisible(adhocSelectors.selectArtImage, 15000)
            await testBot.click(adhocSelectors.selectArtImage)
            await driver.pause(1500)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 5')
            throw err
        }
    })

    it('Step 6 - Click Next and verify duration screen loads', async function () {
        try {
            await testBot.waitUntilVisible(adhocSelectors.nextButton, 15000)
            await testBot.click(adhocSelectors.nextButton)
            await driver.pause(1500)
            await testBot.waitUntilVisible(adhocSelectors.durationScreenTitle, 15000)
            console.log('Duration screen loaded: "How long did this care take?"')
        } catch (err) {
            await dumpPageSourceOnFailure('Step 6')
            throw err
        }
    })

    it('Step 7 - Scroll down and select "10 mins" duration', async function () {
        try {
            await testBot.waitUntilVisible(adhocSelectors.durationScreenTitle, 15000)

            const tenMinsXpath =
                '//android.widget.TextView[@text="10 mins"] | //android.widget.Button[@text="10 mins"]'

            let found = false
            for (let i = 0; i < 5; i++) {
                const el = await $(tenMinsXpath)
                if (await el.isExisting() && await el.isDisplayed()) {
                    found = true
                    break
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
                await driver.pause(800)
            }

            if (!found) {
                throw new Error('"10 mins" button never became visible after scrolling')
            }

            const tenMinsEl = await $(tenMinsXpath)
            await tenMinsEl.click()
            console.log('Clicked "10 mins" duration button')
            await driver.pause(1000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 7')
            throw err
        }
    })

    it('Step 8 - Click Continue button at the bottom', async function () {
        try {
            await testBot.waitUntilVisible(adhocSelectors.confirmButton, 15000)

            try {
                await driver.hideKeyboard()
                await driver.pause(500)
            } catch (kbErr) {
                console.warn('hideKeyboard failed or keyboard already hidden:', kbErr)
            }

            const freshContinueBtn = await $(
                '//android.widget.Button[@text="Continue"]'
            )
            await freshContinueBtn.click()
            await driver.pause(1500)

            let advanced = await testBot.isVisible(adhocSelectors.createRecordsButton).catch(() => false)

            if (!advanced) {
                console.warn('Create Records not visible after Continue tap — retrying once')
                const retryBtn = await $('//android.widget.Button[@text="Continue"]')
                if (await retryBtn.isExisting()) {
                    await retryBtn.click()
                    await driver.pause(1500)
                    advanced = await testBot.isVisible(adhocSelectors.createRecordsButton).catch(() => false)
                }
            }

            if (!advanced) {
                console.warn('Still stuck — trying coordinate-based tap on Continue')
                const continueBtn = await $('//android.widget.Button[@text="Continue"]')
                if (await continueBtn.isExisting()) {
                    const location = await continueBtn.getLocation()
                    const size = await continueBtn.getSize()
                    const centerX = Math.floor(location.x + size.width / 2)
                    const centerY = Math.floor(location.y + size.height / 2)
                    console.log(`Tapping Continue at coordinates: ${centerX}, ${centerY}`)

                    await driver.action('pointer', { parameters: { pointerType: 'touch' } })
                        .move({ duration: 0, x: centerX, y: centerY })
                        .down({ button: 0 })
                        .pause(100)
                        .up({ button: 0 })
                        .perform()

                    await driver.pause(1500)
                }
            }
        } catch (err) {
            await dumpPageSourceOnFailure('Step 8')
            throw err
        }
    })

    it('Step 9 - Click Create Records', async function () {
        try {
            await testBot.waitUntilVisible(adhocSelectors.createRecordsButton, 15000)
            await testBot.click(adhocSelectors.createRecordsButton)
            await driver.pause(2000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 9')
            throw err
        }
    })

    it('Step 10 - Click Close', async function () {
        try {
            await testBot.waitUntilVisible(adhocSelectors.closeAfterCreateButton, 15000)
            await testBot.click(adhocSelectors.closeAfterCreateButton)
            await driver.pause(1500)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 10')
            throw err
        }
    })

    it('Step 11 - Click on "Earlier" tab', async function () {
        try {
            await testBot.waitUntilVisible(adhocSelectors.earlierTab, 15000)
            await testBot.click(adhocSelectors.earlierTab)
            await driver.pause(1500)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 11')
            throw err
        }
    })

})
