/**
 * @file Automatically creates the background and foreground images.
 */

import { randfloat } from "./util.js";
import { Canvas } from "./canvas.js";
import { Color } from "./color.js";

const bg = new Canvas("canvas.bg");
const underlay = new Canvas("canvas.underlay");
const fg = new Canvas("canvas.fg");

const light = new Color("#fab866");
const dark = light.clone().lighten(-16);
const gap = new Color("#4f3410bf");

bg.copyDims(underlay).cover(light);

fg.copyDims(underlay);

// Make squares
const panelSize = bg.width() / 6;
const squareSize = panelSize / 6;
for (let y = 0; y < Math.ceil(bg.height() / squareSize); y++) {
    for (let x = 0; x < Math.ceil(bg.width() / squareSize); x++) {
        const dims = [
            x * squareSize,
            y * squareSize,
            squareSize,
            squareSize,
        ];

        // Randomize the gradients’ angles for << INTERESTINGNESS >>
        const angle = randfloat(0, 2 * Math.PI);
        const rotX = angle => Math.SQRT1_2 * Math.cos(angle) + 1 / 2;
        const rotY = angle => -Math.SQRT1_2 * Math.sin(angle) + 1 / 2;
        const rotatedDims = [
            (x + rotX(angle)) * squareSize,
            (y + rotY(angle)) * squareSize,
            ((x + 1) - rotX(angle)) * squareSize,
            ((y + 1) - rotY(angle)) * squareSize,
        ];

        const gradient = bg.context.createLinearGradient(...rotatedDims);
        gradient.addColorStop(0, light);
        gradient.addColorStop(1, light.hslLinear(dark, Math.random()));
        bg.instRect(x * squareSize, y * squareSize, squareSize, squareSize, gradient);
    }
}

// separators
for (let x = 1; x < Math.floor(fg.width() / panelSize); x++) {
    const dims = [
        x * panelSize - 1.5,
        0,
        3,
        fg.height(),
    ];
    fg.instRect(...dims, gap);
}