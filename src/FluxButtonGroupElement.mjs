import { FLUX_BUTTON_GROUP_EVENT_INPUT } from "./FLUX_BUTTON_GROUP_EVENT.mjs";
import { flux_css_api } from "../../flux-css-api/src/FluxCssApi.mjs";
import { BUTTON_TYPE_BUTTON, BUTTON_TYPE_RADIO } from "./BUTTON_TYPE.mjs";

/** @typedef {import("./Button.mjs").Button} Button */
/** @typedef {import("./Value.mjs").Value} Value */

const root_css = await flux_css_api.import(
    `${import.meta.url.substring(0, import.meta.url.lastIndexOf("/"))}/FluxButtonGroupElementRoot.css`
);

document.adoptedStyleSheets.unshift(root_css);

const css = await flux_css_api.import(
    `${import.meta.url.substring(0, import.meta.url.lastIndexOf("/"))}/FluxButtonGroupElement.css`
);

export class FluxButtonGroupElement extends HTMLElement {
    /**
     * @type {ShadowRoot}
     */
    #shadow;

    /**
     * @param {Button[] | null} buttons
     * @returns {FluxButtonGroupElement}
     */
    static new(buttons = null) {
        return new this(
            buttons ?? []
        );
    }

    /**
     * @param {Button[]} buttons
     * @private
     */
    constructor(buttons) {
        super();

        this.#shadow = this.attachShadow({
            mode: "closed"
        });

        this.#shadow.adoptedStyleSheets.push(css);

        this.buttons = buttons;
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
                    this.dispatchEvent(new CustomEvent(FLUX_BUTTON_GROUP_EVENT_INPUT, {
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
                    this.dispatchEvent(new CustomEvent(FLUX_BUTTON_GROUP_EVENT_INPUT, {
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
