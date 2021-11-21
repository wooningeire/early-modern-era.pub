/**
 * @file Declares any custom elements used in the page.
 */

import { ce } from "./util.js";
import { Color } from "./color.js";

export class Toolbar extends HTMLElement {
    buildRadioSet(radioName, defaultIndex, ...descriptors) {
        const classContainer = `field-container ${radioName}--container`;
    
        const existingContainer = this.getElementsByClassName(classContainer)[0];
        const newContainer = ce("div", {
            class: classContainer,
        });
    
        if (existingContainer) {
            this.insertBefore(newContainer, existingContainer);
            existingContainer.remove();
        } else {
            this.appendChild(newContainer);
        }
    
        const pairs = [];
        const checkedActions = new Map();
    
        for (let descriptor of descriptors) {
            const [value, label, labelStyle, checkedAction] = descriptor;
    
            const id = `${radioName}-${value}`;
    
            const radio = ce("input", {
                type: "radio",
                name: radioName,
                value,
                id,
            }, {}, newContainer);
    
            const button = ce("label", {
                for: id,
            }, {
                textContent: label || "",
            }, newContainer);

            if (labelStyle) button.style.cssText = labelStyle;
    
            pairs.push([radio, button]);
            if (checkedAction) {
                checkedActions.set(value, checkedAction);
            }
        }

        newContainer.addEventListener("change", event => {
            const action = checkedActions.get(event.target.value);
            if (action) action();
        }, false);
    
        // If something wasn’t set to be checked, check the first.
        if (isNaN(defaultIndex)) {
            pairs[0][0].click(); // Alternative to setting the checked property, which does not fire change events
        } else {
            pairs[defaultIndex][0].click();
        }
    
        return pairs;
    }

    buildRadioSet_size(sizes, defaultIndex=0) {
        const args = sizes.map((size, i) => [size.toString(), "", ""]);

        const pairs = this.buildRadioSet("size", defaultIndex, ...args);
        pairs.forEach(([radio, button]) => {
            ce("div", {
                class: "circle",
                style: `--size: ${radio.value}px; width: var(--size); height: var(--size);`,
            }, {}, button);
        });
        return pairs;
    }

    buildRadioSet_color(colors, defaultIndex=0) {
        colors = colors.map(colorRaw => new Color(colorRaw).toString("rgba"));
        const radioBuilderArgs = colors.map(color => [color, "", `background: ${color};`]);
        return this.buildRadioSet("color", defaultIndex, ...radioBuilderArgs);
    }
}
customElements.define("toolbar-", Toolbar);

export class WorkRegion extends HTMLElement {}
customElements.define("work-region", WorkRegion);