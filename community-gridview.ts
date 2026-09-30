import { testBot } from '../../testbot'
import { AndroidLocatorBuilder } from '../../TestBot/Locators/Android/AndroidLocatorBuilder'
import { iOSLocatorBuilder } from '../../TestBot/Locators/iOS/iOSLocatorBuilder'
import { TestBotElement } from '../../TestBot/TestBotElement'

// ─────────────────────────────────────────────
// TC 47716 — Communities - Names/Room/Avatars -
// Grid View. Every step checks what a resident
// card DISPLAYS; nothing is entered. Step 6
// (adding a profile photo in Monitor, a separate
// web app) cannot be done from this mobile
// script and is intentionally excluded.
// ─────────────────────────────────────────────

// Resident names, exactly as provided.
const PREFERRED_NAME_RESIDENT = 'Albie Armstrong'
const NO_PREFERRED_NAME_RESIDENT = 'Ah-Na Gravy'
const LONG_NAME_RESIDENT = 'Nathaniel (with the long name) Normanstone-Nilhurst'
const NO_PHOTO_RESIDENT = 'Mitch Jones'
const NO_ROOM_RESIDENT = 'Zoe Atkins'
const ROOM_NUMBER_RESIDENT = 'Rosie Matthews'
const ROOM_NUMBER_RESIDENTS = [ROOM_NUMBER_RESIDENT]
const ROOM_NAME_RESIDENT = 'Robyn Partridge'
const LONG_ROOM_NAME_RESIDENT = 'Rico Dawson'

// ── NOT CONFIRMED ──
// The pill text for each room case was not provided, only
// the resident. These patterns come from the test case's
// expected results: "-No Room", "Room [number]", "[room
// name]". Please confirm the exact on-screen text.
const NO_ROOM_PILL_TEXT = 'No Room'
const ROOM_NUMBER_PILL_PREFIX = 'Room'
const ROOM_NUMBER_PILL_VALUE = '5'
const ROOM_NAME_TEXT = 'Victory Room'
const LONG_ROOM_NAME_TEXT = 'Chrysanthemum Cottage'

function locator(androidXpath: string, iosXpath: string): TestBotElement {
    return {
        android: AndroidLocatorBuilder.xpath(androidXpath),
        ios: iOSLocatorBuilder.xpath(iosXpath),
    } as TestBotElement
}

function residentNameLocator(name: string): TestBotElement {
    return locator(
        `//android.widget.TextView[@text="${name}"]`,
        `//XCUIElementTypeStaticText[@name="${name}"]`
    )
}

// ── The card that CONTAINS a given resident's name. Room pill
// and avatar are read relative to this card, so each check
// looks at the right resident rather than the first pill on
// the page. NOT CONFIRMED: assumes the name, pill and avatar
// share a common clickable/parent ViewGroup. If the card
// structure differs, the page-source dump will show it.
function cardAncestorXpath(name: string): string {
    return `//android.widget.TextView[@text="${name}"]/ancestor::android.view.ViewGroup[.//android.widget.TextView[@text="${name}"]][1]`
}

function roomPillTextXpath(name: string): string {
    // Any other TextView inside the same card that is not the name.
    return `${cardAncestorXpath(name)}//android.widget.TextView[@text!="${name}"]`
}

function avatarImageXpath(name: string): string {
    return `${cardAncestorXpath(name)}//android.widget.ImageView`
}

async function expectAvatarLoaded(name: string, step: string): Promise<void> {
    let displayedImage: WebdriverIO.Element | undefined

    await driver.waitUntil(async () => {
        const images = await $$(avatarImageXpath(name))
        for (const image of images) {
            if (await image.isDisplayed().catch(() => false)) {
                displayedImage = image
                return true
            }
        }
        return false
    }, {
        timeout: 30000,
        timeoutMsg: `${step}: avatar image for "${name}" is not displayed`,
    })

    if (!displayedImage) {
        throw new Error(`${step}: avatar image for "${name}" was not found`)
    }

    const { width, height } = await displayedImage.getSize()
    if (width <= 0 || height <= 0) {
        throw new Error(`${step}: avatar image for "${name}" has invalid dimensions ${width}x${height}`)
    }

    const imageData = await driver.takeElementScreenshot(displayedImage.elementId)
    if (!imageData) {
        throw new Error(`${step}: avatar image data for "${name}" could not be loaded`)
    }
}

const selectors = {
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

// Scrolls a resident's name into view if it is not already
// visible, then returns whether it is now on screen.
async function bringResidentIntoView(name: string): Promise<boolean> {
    if (await isVisible(residentNameLocator(name))) {
        return true
    }

    try {
        const el = await $(
            'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
            '.setMaxSearchSwipes(20)' +
            `.scrollIntoView(new UiSelector().text("${name}"))`
        )
        return await el.isExisting()
    } catch {
        return false
    }
}

// Reads the visible text of every TextView inside a
// resident's card, excluding the name itself.
async function readCardTexts(name: string): Promise<string[]> {
    for (let attempt = 0; attempt < 3; attempt++) {
        const elements = await $$(roomPillTextXpath(name))
        if (await elements.length > 0) break

        const { width, height } = await driver.getWindowSize()
        await driver.execute('mobile: swipeGesture', {
            left: Math.floor(width * 0.2),
            top: Math.floor(height * 0.55),
            width: Math.floor(width * 0.6),
            height: Math.floor(height * 0.3),
            direction: 'up',
            percent: 0.2,
        })
        await driver.pause(300)
    }

    const elements = await $$(roomPillTextXpath(name))
    const texts: string[] = []
    for (const el of elements) {
        const text = await el.getText().catch(() => '')
        if (text) texts.push(text)
    }
    return texts
}

// Prints every element inside a resident's card (class, text,
// resource-id, content-desc) so a failing room check shows the
// real card structure instead of just the texts we guessed at.
async function dumpCardStructure(name: string, label: string): Promise<void> {
    console.log(`──── ${label}: card structure for "${name}" ────`)
    try {
        const nodes = await $$(`${cardAncestorXpath(name)}//*`)
        console.log(`${label}: ${await nodes.length} element(s) inside the card`)
        for (const node of nodes) {
            const cls = await node.getAttribute('class').catch(() => '?')
            const text = await node.getAttribute('text').catch(() => '')
            const rid = await node.getAttribute('resource-id').catch(() => '')
            const desc = await node.getAttribute('content-desc').catch(() => '')
            console.log(`  <${cls}> text="${text}" id="${rid}" desc="${desc}"`)
        }
    } catch (err) {
        console.log(`${label}: could not read card structure`, err)
    }
    console.log('──────────────────────────────────────────')
}

async function runStep(step: string, action: () => Promise<void>): Promise<void> {
    try {
        await action()
    } catch (error) {
        await dumpPageSourceOnFailure(step)
        throw error
    }
}

async function expectResidentVisible(name: string, label: string): Promise<void> {
    const found = await bringResidentIntoView(name)
    if (!found) {
        throw new Error(`${label}: resident "${name}" was not found on the Communities page`)
    }
    console.log(`✓ ${label}: "${name}" is displayed`)
}

function expectEllipsis(texts: string[], expectedText: string, step: string): void {
    const displayedText = texts.find((text) =>
        expectedText.startsWith(text.replace(/(?:\.\.\.|\u2026).*$/, ''))
    )

    if (!displayedText) {
        throw new Error(`${step}: expected text derived from "${expectedText}", found ${JSON.stringify(texts)}`)
    }

    if (!/(?:\.\.\.|\u2026)/.test(displayedText)) {
        throw new Error(`${step}: "${displayedText}" is clipped or exposes the full value; expected visible tail ellipsis`)
    }
}

describe('Communities - Names/Room/Avatars - Grid View (TC 47716)', () => {

    // ── Step 1 — the page itself ──
    it('Step 1 - Communities page loads with My Communities selected and each resident shown once', async () => {
        await runStep('Step 1', async () => {
            await testBot.waitUntilVisible(selectors.myCommunitiesTab, 120000)
            console.log('✓ Communities page displayed, My Communities present')

            // "Residents are only displayed once": each provided
            // resident name should match exactly one element.
            const residents = [
                PREFERRED_NAME_RESIDENT,
                NO_PREFERRED_NAME_RESIDENT,
                NO_ROOM_RESIDENT,
                ROOM_NUMBER_RESIDENT,
                ROOM_NAME_RESIDENT,
                LONG_ROOM_NAME_RESIDENT,
            ]

            for (const name of residents) {
                await expectResidentVisible(name, 'Step 1')
                const matches = await $$(`//android.widget.TextView[@text="${name}"]`)
                const count = await matches.length
                if (count !== 1) {
                    throw new Error(`Step 1: "${name}" appears ${count} times, expected exactly once`)
                }
            }

            // NOT CONFIRMED: default grid view, alphabetical sort
            // order and suspended residents each need their own
            // locator (view toggle, full ordered name list, a known
            // suspended resident's name). Not provided, so not
            // asserted here rather than guessed.
            console.log('ℹ Grid view / alphabetical order / suspended residents not asserted - locators not provided')
        })
    })

    // ── Step 2 — preferred name ──
    it('Step 2 - Resident with a preferred name shows "[Preferred name] [Last name]"', async () => {
        await runStep('Step 2', async () => {
            await expectResidentVisible(PREFERRED_NAME_RESIDENT, 'Step 2')
        })
    })

    // ── Step 3 — no preferred name ──
    it('Step 3 - Resident with no preferred name shows "[First name] [Last name]"', async () => {
        await runStep('Step 3', async () => {
            await expectResidentVisible(NO_PREFERRED_NAME_RESIDENT, 'Step 3')
        })
    })

    // ── Step 4 — long name ──
    it('Step 4 - Resident with a long name is present and displayed on the card', async () => {
        await runStep('Step 4', async () => {
            await expectResidentVisible(LONG_NAME_RESIDENT, 'Step 4')

            const el = await $(`//android.widget.TextView[@text="${LONG_NAME_RESIDENT}"]`)
            if (!await el.isExisting() || !await el.isDisplayed()) {
                throw new Error(`Step 4: long-name element for "${LONG_NAME_RESIDENT}" is not displayed on the resident card`)
            }
        })
    })

    // ── Step 5 — no profile photo ──
    it('Step 5 - Resident with no profile photo shows the standard avatar', async () => {
        await runStep('Step 5', async () => {
            await expectResidentVisible(NO_PHOTO_RESIDENT, 'Step 5')
            await expectAvatarLoaded(NO_PHOTO_RESIDENT, 'Step 5')
            console.log(`✓ Step 5: the standard avatar for "${NO_PHOTO_RESIDENT}" is displayed with loaded image data`)
        })
    })

    // ── Step 6 — SKIPPED ──
    it.skip('Step 6 - Give a resident a profile photo in Monitor, then refresh (requires Monitor web app)', async () => {
        // Cannot be automated from this mobile script.
    })

    // ── Step 7 — photos load ──
    it('Step 7 - All profile photos load successfully', async () => {
        await runStep('Step 7', async () => {
            const residents = [
                PREFERRED_NAME_RESIDENT,
                NO_PREFERRED_NAME_RESIDENT,
                NO_PHOTO_RESIDENT,
                NO_ROOM_RESIDENT,
                ROOM_NUMBER_RESIDENT,
                LONG_NAME_RESIDENT,
                ROOM_NAME_RESIDENT,
                LONG_ROOM_NAME_RESIDENT,
            ]

            for (const name of residents) {
                await expectResidentVisible(name, 'Step 7')
                await expectAvatarLoaded(name, 'Step 7')
            }
            console.log('✓ Step 7: every checked card has a displayed avatar with loaded image data')
        })
    })

    // ── Step 8 — no room ──
    it('Step 8 - Resident with no room shows a "No Room" pill', async () => {
        await runStep('Step 8', async () => {
            await expectResidentVisible(NO_ROOM_RESIDENT, 'Step 8')
            const texts = await readCardTexts(NO_ROOM_RESIDENT)
            console.log(`ℹ Step 8: card texts = ${JSON.stringify(texts)}`)

            const hasNoRoom = texts.some((text) => text.trim() === NO_ROOM_PILL_TEXT)
            if (!hasNoRoom) {
                throw new Error(`Step 8: expected pill text to equal "${NO_ROOM_PILL_TEXT}" for "${NO_ROOM_RESIDENT}", found ${JSON.stringify(texts)}`)
            }
        })
    })

    // ── Step 9 — room number ──
    // The room pill can be stored two ways, and which one the app
    // uses is not confirmed, so BOTH are accepted and the log
    // says which was found:
    //   (a) one element reading "Room 12"
    //   (b) the word "Room" and the number as separate elements
    // A failure prints the exact texts found so the pattern can
    // be tightened to the real one.
    for (const residentName of ROOM_NUMBER_RESIDENTS) {
        it(`Step 9 - "${residentName}" shows the room number as "Room [number]" in a pill`, async () => {
            await runStep(`Step 9 (${residentName})`, async () => {
                await expectResidentVisible(residentName, 'Step 9')
                const texts = await readCardTexts(residentName)
                console.log(`ℹ Step 9 (${residentName}): card texts = ${JSON.stringify(texts)}`)
                await dumpCardStructure(residentName, `Step 9 (${residentName})`)

                const roomWord = ROOM_NUMBER_PILL_PREFIX.toLowerCase()

                // (a) a single "Room 12" element
                const combined = texts.find((t) => new RegExp(`^${ROOM_NUMBER_PILL_PREFIX}\\s*\\S+`, 'i').test(t.trim()))

                // (b) "Room" as its own element plus a number-only element
                const hasRoomWord = texts.some((t) => t.trim().toLowerCase() === roomWord)
                const numberOnly = texts.find((t) => /^\d+[A-Za-z]?$/.test(t.trim()))

                if (combined?.trim().toLowerCase() === `${ROOM_NUMBER_PILL_PREFIX} ${ROOM_NUMBER_PILL_VALUE}`.toLowerCase()) {
                    console.log(`✓ Step 9 (${residentName}): pill reads "${combined}" (single element)`)
                    return
                }
                if (hasRoomWord && numberOnly === ROOM_NUMBER_PILL_VALUE) {
                    console.log(`✓ Step 9 (${residentName}): pill is split - "Room" + "${numberOnly}"`)
                    return
                }
                if (numberOnly) {
                    console.log(`⚠ Step 9 (${residentName}): found a number "${numberOnly}" but no "Room" wording - the pill may show the bare number`)
                }

                throw new Error(
                    `Step 9 (${residentName}): expected "${ROOM_NUMBER_PILL_PREFIX} ${ROOM_NUMBER_PILL_VALUE}" but the card contains ${JSON.stringify(texts)}`
                )
            })
        })
    }

    // ── Step 10 — room name ──
    it('Step 10 - Resident with a room name shows the room name in a pill', async () => {
        await runStep('Step 10', async () => {
            await expectResidentVisible(ROOM_NAME_RESIDENT, 'Step 10')
            const texts = await readCardTexts(ROOM_NAME_RESIDENT)
            console.log(`ℹ Step 10: card texts = ${JSON.stringify(texts)}`)
            await dumpCardStructure(ROOM_NAME_RESIDENT, 'Step 10')

            if (!texts.includes(ROOM_NAME_TEXT)) {
                throw new Error(`Step 10: expected "${ROOM_NAME_TEXT}" for "${ROOM_NAME_RESIDENT}", found ${JSON.stringify(texts)}`)
            }
        })
    })

    // ── Step 11 — long room name ──
    it('Step 11 - Room name longer than the pill is shown truncated with ellipses', async () => {
        await runStep('Step 11', async () => {
            await expectResidentVisible(LONG_ROOM_NAME_RESIDENT, 'Step 11')
            const texts = await readCardTexts(LONG_ROOM_NAME_RESIDENT)
            console.log(`ℹ Step 11: card texts = ${JSON.stringify(texts)}`)
            await dumpCardStructure(LONG_ROOM_NAME_RESIDENT, 'Step 11')

            expectEllipsis(texts, LONG_ROOM_NAME_TEXT, 'Step 11')
        })
    })

})
