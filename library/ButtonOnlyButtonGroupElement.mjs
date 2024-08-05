import { BUTTON_TYPE_BUTTON } from "./BUTTON_TYPE.mjs";
import { ButtonGroupElement } from "./ButtonGroupElement.mjs";
import css from "./ButtonOnlyButtonGroupElement.css" with { type: "css" };
import root_css from "./ButtonOnlyButtonGroupElementRoot.css" with { type: "css" };

/** @typedef {import("./Button.mjs").Button} Button */
/** @typedef {import("./ButtonGroupElementWithEvents.mjs").ButtonGroupElementWithEvents} ButtonGroupElementWithEvents */
/** @typedef {import("./ButtonOnlyButtonGroupElementWithEvents.mjs").ButtonOnlyButtonGroupElementWithEvents} ButtonOnlyButtonGroupElementWithEvents */
/** @typedef {import("./StyleSheetManager/StyleSheetManager.mjs").StyleSheetManager} StyleSheetManager */

export const BUTTON_ONLY_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX = "--button-only-button-group-";

export class ButtonOnlyButtonGroupElement extends HTMLElement {
    /**
     * @type {ButtonGroupElementWithEvents}
     */
    #button_group_element;
    /**
     * @type {ShadowRoot}
     */
    #shadow;

    /**
     * @param {Button[] | null} buttons
     * @param {StyleSheetManager | null} style_sheet_manager
     * @returns {Promise<ButtonOnlyButtonGroupElementWithEvents>}
     */
    static async new(buttons = null, style_sheet_manager = null) {
        if (style_sheet_manager !== null) {
            await style_sheet_manager.generateVariablesRootStyleSheet(
                BUTTON_ONLY_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX,
                {
                    [`${BUTTON_ONLY_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}active-button-background-color`]: "foreground-color",
                    [`${BUTTON_ONLY_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}active-button-foreground-color`]: "background-color",
                    [`${BUTTON_ONLY_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}background-color`]: "background-color",
                    [`${BUTTON_ONLY_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}button-background-color`]: "accent-color",
                    [`${BUTTON_ONLY_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}button-foreground-color`]: "accent-foreground-color",
                    [`${BUTTON_ONLY_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}focus-button-outline-color`]: "foreground-color",
                    [`${BUTTON_ONLY_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}focus-outline-color`]: "foreground-color",
                    [`${BUTTON_ONLY_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}foreground-color`]: "foreground-color"
                },
                true
            );

            await style_sheet_manager.addRootStyleSheet(
                root_css,
                true
            );
        } else {
            if (!document.adoptedStyleSheets.includes(root_css)) {
                document.adoptedStyleSheets.unshift(root_css);
            }
        }

        const button_only_button_group_element = new this();

        button_only_button_group_element.#shadow = button_only_button_group_element.attachShadow({
            mode: "closed"
        });

        await style_sheet_manager?.addStyleSheetsToShadow(
            button_only_button_group_element.#shadow
        );

        button_only_button_group_element.#shadow.adoptedStyleSheets.push(css);

        button_only_button_group_element.#button_group_element = await ButtonGroupElement.new(
            null,
            style_sheet_manager
        );
        button_only_button_group_element.#button_group_element.classList.add("buttons");
        button_only_button_group_element.#button_group_element.addEventListener("button-input", event => {
            button_only_button_group_element.dispatchEvent(new CustomEvent("button-click", {
                detail: Object.freeze({
                    value: event.detail.value
                })
            }));
        });
        button_only_button_group_element.#shadow.append(button_only_button_group_element.#button_group_element);

        button_only_button_group_element.buttons = buttons ?? [];

        return button_only_button_group_element;
    }

    /**
     * @private
     */
    constructor() {
        super();
    }

    /**
     * @returns {Button[]}
     */
    get buttons() {
        return this.#button_group_element.buttons;
    }

    /**
     * @param {Button[]} buttons
     * @returns {void}
     */
    set buttons(buttons) {
        this.#button_group_element.buttons = buttons.map(button => ({
            ...button,
            type: BUTTON_TYPE_BUTTON
        }));
    }

    /**
     * @returns {string[]}
     */
    get disabled() {
        return this.#button_group_element.disabled;
    }

    /**
     * @param {string[] | boolean} values
     * @returns {void}
     */
    set disabled(values) {
        this.#button_group_element.disabled = values;
    }
}

export const BUTTON_ONLY_BUTTON_GROUP_ELEMENT_TAG_NAME = "button-only-button-group";

customElements.define(BUTTON_ONLY_BUTTON_GROUP_ELEMENT_TAG_NAME, ButtonOnlyButtonGroupElement);
