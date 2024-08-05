/** @typedef {import("./ButtonGroupElement.mjs").ButtonGroupElement} ButtonGroupElement */
/** @typedef {import("./ButtonGroupElementButtonInputEvent.mjs").ButtonGroupElementButtonInputEvent} ButtonGroupElementButtonInputEvent */

/**
 * @typedef {ButtonGroupElement & {addEventListener: (type: "button-input", callback: (event: ButtonGroupElementButtonInputEvent) => void, options?: boolean | AddEventListenerOptions) => void, removeEventListener: (type: "button-input", callback: (event: ButtonGroupElementButtonInputEvent) => void, options?: boolean | EventListenerOptions) => void}} ButtonGroupElementWithEvents
 */
