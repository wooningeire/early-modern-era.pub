/**
 * @file Defines several common variables or functions to facilitate or to shorten typing.
 */

// NO DEPENDENCIES! NEVER! STOP WHAT YOU’RE DOING RIGHT NOW AND PUT DOWN THOSE import STATEMENTS

// for succinctness
export const qs = (selector, element=document) => element.querySelector(selector);
export const qsa = (selector, element=document) => element.querySelectorAll(selector);
export const ce = (tag, attributes={}, properties={}, parent) => {
    const element = document.createElement(tag);

    for (let [name, value] of Object.entries(attributes)) {
        element.setAttribute(name, value);
    }
    for (let [name, value] of Object.entries(properties)) {
        element[name] = value;
    }
    
    if (parent) parent.appendChild(element);

    return element;
};
export const cesvg = (tag, attributes={}, properties={}, parent) => {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);

    for (let [name, value] of Object.entries(attributes)) {
        element.setAttribute(name, value);
    }
    for (let [name, value] of Object.entries(properties)) {
        element[name] = value;
    }

    if (parent) parent.appendChild(element);

    return element;
};

export const relcoords = (mouseEvent, target, method=0) => {
    if (!target) target = mouseEvent.currentTarget;

    //if (!(mouseEvent instanceof MouseEvent)) throw new TypeError(`Expected MouseEvent; got ${mouseEvent.constructor.name}`);
    if (!(target instanceof HTMLElement)) throw new TypeError(`Expected HTMLElement; got ${target.constructor.name}`);

    let x;
    let y;

    let left;
    let top;

    switch (method) {
        // Method 0: Use `getClientBoundingRect`: accurate with relative positioning, but not when CSS transformations are applied.
        default:
        case 0: {
            let rect = target.getBoundingClientRect();

            left = rect.left;
            top = rect.top;
            break;
        }

        // Method 1: Use offset properties: accurate when CSS transformations are applied, but zeroed with relative positioning.
        case 1:
            left = target.offsetLeft;
            top = target.offsetTop;
            break;
    }

    x = mouseEvent.x - left;
    y = mouseEvent.y - top;

    return { x, y };
}

export const arrult = array => {
    if (!Array.isArray(array)) throw new TypeError(`Expected array; got ${array.constructor.name}`);
    return array[array.length - 1];
};
export const arrpenult = array => {
    if (!Array.isArray(array)) throw new TypeError(`Expected array; got ${array.constructor.name}`);
    return array[array.length - 2];
};

export const mod = (divisor, dividend) => divisor - Math.floor(divisor / dividend) * dividend;

export const randfloat = (min=0, max=1) => {
    return Math.random() * (max - min) + min;
};
export const randint = (min=0, max=1) => {
    return Math.floor(randfloat(min, max + 1));
};

// variables specific to this project
export const toolbar = qs("toolbar-");