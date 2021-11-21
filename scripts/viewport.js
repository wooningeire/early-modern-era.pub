import { qs, qsa } from "./util.js";
import { Canvas } from "./canvas.js";

const underlay = qs("canvas.underlay");
const underlayStyle = getComputedStyle(underlay);

const paint = new Canvas("canvas.paint");

const shiftStep = 50;

const viewportData = {
    translateX: 0,
    translateY: 0,
};

export const viewport = {
    translateX(value) {
        if (value === undefined) return viewportData.translateX;

        paint.translate(value - viewportData.translateX, 0);
        for (let element of qsa(".transformed-viewport")) {
            element.style.left = `${value}px`;
        }
        viewportData.translateX = value;

        return this;
    },
    translateY(value) {
        if (value === undefined) return viewportData.translateY;

        paint.translate(0, value - viewportData.translateY);
        for (let element of qsa(".transformed-viewport")) {
            element.style.top = `${value}px`;
        }
        viewportData.translateY = value;

        return this;
    },
};

addEventListener("keydown", event => {
    switch (event.key) {
        case "ArrowLeft":
            viewport.translateX(parseInt(underlayStyle.left) - shiftStep);
            break;

        case "ArrowRight":
            viewport.translateX(parseInt(underlayStyle.left) + shiftStep);
            break;
        
        case "ArrowUp":
            viewport.translateY(parseInt(underlayStyle.top) - shiftStep);
            break;

        case "ArrowDown":
            viewport.translateY(parseInt(underlayStyle.top) + shiftStep);
            break;

        case "R":
            viewport.translateX(0)
                    .translateY(0);
            break;
    }
}, false);