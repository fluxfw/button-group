import css from "./FluxButtonGroupElement.css" with { type: "css" };
import root_css from "./FluxButtonGroupElementRoot.css" with { type: "css" };
import { BUTTON_TYPE_BUTTON, BUTTON_TYPE_RADIO } from "./BUTTON_TYPE.mjs";

/** @typedef {import("./Button.mjs").Button} Button */
/** @typedef {import("./StyleSheetManager/StyleSheetManager.mjs").StyleSheetManager} StyleSheetManager */
/** @typedef {import("./Value.mjs").Value} Value */

export const FLUX_BUTTON_GROUP_ELEMENT_EVENT_INPUT = "flux-button-group-input";

export const FLUX_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX = "--flux-button-group-";

export class FluxButtonGroupElement extends HTMLElement {
    /**
     * @type {ShadowRoot}
     */
    #shadow;

    /**
     * @param {Button[] | null} buttons
     * @param {StyleSheetManager | null} style_sheet_manager
     * @returns {Promise<FluxButtonGroupElement>}
     */
    static async new(buttons = null, style_sheet_manager = null) {
        if (style_sheet_manager !== null) {
            await style_sheet_manager.generateVariablesRootStyleSheet(
                FLUX_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX,
                {
                    [`${FLUX_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}active-button-background-color`]: "accent-color",
                    [`${FLUX_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}active-button-bottom-border-color`]: "accent-color",
                    [`${FLUX_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}active-button-foreground-color`]: "accent-color-foreground-color",
                    [`${FLUX_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}active-button-left-border-color`]: "accent-color",
                    [`${FLUX_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}active-button-right-border-color`]: "accent-color",
                    [`${FLUX_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}active-button-top-border-color`]: "accent-color",
                    [`${FLUX_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}background-color`]: "background-color",
                    [`${FLUX_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}button-bottom-border-color`]: "background-color",
                    [`${FLUX_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}button-foreground-color`]: "foreground-color",
                    [`${FLUX_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}button-left-border-color`]: "background-color",
                    [`${FLUX_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}button-right-border-color`]: "background-color",
                    [`${FLUX_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}button-top-border-color`]: "background-color",
                    [`${FLUX_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}focus-button-outline-color`]: "foreground-color",
                    [`${FLUX_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}focus-outline-color`]: "foreground-color",
                    [`${FLUX_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}selected-button-background-color`]: "accent-color",
                    [`${FLUX_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}selected-button-bottom-border-color`]: "accent-color",
                    [`${FLUX_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}selected-button-foreground-color`]: "accent-color-foreground-color",
                    [`${FLUX_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}selected-button-left-border-color`]: "accent-color",
                    [`${FLUX_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}selected-button-right-border-color`]: "accent-color",
                    [`${FLUX_BUTTON_GROUP_ELEMENT_VARIABLE_PREFIX}selected-button-top-border-color`]: "accent-color"
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

        const flux_button_group_element = new this();

        flux_button_group_element.#shadow = flux_button_group_element.attachShadow({
            mode: "closed"
        });

        await style_sheet_manager?.addStyleSheetsToShadow(
            flux_button_group_element.#shadow
        );

        flux_button_group_element.#shadow.adoptedStyleSheets.push(css);

        flux_button_group_element.buttons = buttons ?? [];

        return flux_button_group_element;
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
        return this.#button_elements.map(button_element => ({
            disabled: button_element.disabled,
            label: button_element.innerText,
            selected: button_element.previousElementSibling?.checked ?? false,
            title: button_element.title,
            type: button_element.previousElementSibling?.type ?? button_element.type,
            value: button_element.value
        }));
    }

    /**
     * @param {Button[]} buttons
     * @returns {void}
     */
    set buttons(buttons) {
        this.#button_elements.forEach(button_element => {
            button_element.parentElement.remove();
        });

        for (const button of buttons) {
            const type = button.type ?? BUTTON_TYPE_RADIO;

            const container_element = document.createElement("div");

            const button_element = document.createElement("button");
            button_element.disabled = button.disabled ?? false;
            button_element.innerText = button.label;
            if ((button.title ?? "") !== "") {
                button_element.title = button.title;
            }
            button_element.type = BUTTON_TYPE_BUTTON;
            button_element.value = button.value;
            if (type === button_element.type) {
                button_element.dataset.button_only = true;
            }

            let input_element;
            if (type !== button_element.type) {
                input_element = document.createElement("input");
                input_element.checked = button.selected ?? false;
                input_element.disabled = button_element.disabled;
                if (type === BUTTON_TYPE_RADIO) {
                    input_element.name = type;
                }
                input_element.type = type;
                input_element.value = button_element.value;
                container_element.append(input_element);

                input_element.addEventListener("input", () => {
                    this.dispatchEvent(new CustomEvent(FLUX_BUTTON_GROUP_ELEMENT_EVENT_INPUT, {
                        detail: {
                            selected: input_element.checked,
                            value: input_element.value
                        }
                    }));
                });
            }

            container_element.append(button_element);

            button_element.addEventListener("click", () => {
                if (type === button_element.type) {
                    this.dispatchEvent(new CustomEvent(FLUX_BUTTON_GROUP_ELEMENT_EVENT_INPUT, {
                        detail: {
                            selected: false,
                            value: button_element.value
                        }
                    }));
                } else {
                    input_element.click();
                }
            });

            this.#shadow.append(container_element);
        }
    }

    /**
     * @returns {string[]}
     */
    get disabled() {
        return this.values.filter(value => value.disabled).map(value => value.value);
    }

    /**
     * @param {string[] | boolean} values
     * @returns {void}
     */
    set disabled(values) {
        this.values = this.values.map(value => ({
            ...value,
            disabled: typeof values === "boolean" ? values : values.includes(value.value)
        }));
    }

    /**
     * @returns {string[]}
     */
    get selected() {
        return this.values.filter(value => value.selected).map(value => value.value);
    }

    /**
     * @param {string[] | boolean} values
     * @returns {void}
     */
    set selected(values) {
        this.values = this.values.map(value => ({
            ...value,
            selected: typeof values === "boolean" ? values : values.includes(value.value)
        }));
    }

    /**
     * @returns {Value[]}
     */
    get values() {
        return this.#button_elements.map(button_element => ({
            disabled: button_element.disabled,
            selected: button_element.previousElementSibling?.checked ?? false,
            value: button_element.value
        }));
    }

    /**
     * @param {Value[]} values
     * @returns {void}
     */
    set values(values) {
        for (const button_element of this.#button_elements) {
            const value = values.find(_value => _value.value === button_element.value) ?? null;
            button_element.disabled = value?.disabled ?? false;
            if (button_element.previousElementSibling !== null) {
                button_element.previousElementSibling.checked = value?.selected ?? false;
                button_element.previousElementSibling.disabled = button_element.disabled;
            }
        }
    }

    /**
     * @returns {HTMLButtonElement[]}
     */
    get #button_elements() {
        return Array.from(this.#shadow.querySelectorAll("button"));
    }
}

export const FLUX_BUTTON_GROUP_ELEMENT_TAG_NAME = "flux-button-group";

customElements.define(FLUX_BUTTON_GROUP_ELEMENT_TAG_NAME, FluxButtonGroupElement);
