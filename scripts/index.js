/**
 * @file Sets up the applet’s main functionalities. This is the starting point for the applet’s JavaScript—all the other scripts are imported from here.
 */

import { qs, qsa, ce, toolbar } from "./util.js";
import { WorkRegion } from "./ce.js";
import { Canvas } from "./canvas.js";
import { Color } from "./color.js";

//const svg = qs("svg.underlay");
const paint = new Canvas("canvas.paint");

function resizeWorkRegion() {
    const workRegionStyle = getComputedStyle(qs("work-region"));

    const width = parseInt(workRegionStyle.width);
    const height = parseInt(workRegionStyle.height);

    //svg.setAttribute("width", width.toString());
    //svg.setAttribute("height", height.toString());

    paint.width(width).height(height)
            .strokeStyle("#000").cap("round").joint("round").strokeWidth(12);
}

addEventListener("load", () => {
    resizeWorkRegion();

    toolbar.buildRadioSet("era", 1,
        ["karae", "Kara-e", "", () => {
            toolbar.buildRadioSet("brush", 0,
                ["ink", "Ink", "", () => {
                    toolbar.buildRadioSet_size([2, 6, 10], 1);
                    toolbar.buildRadioSet_color(
                        ["#000000ff", "#000000df", "#000000af", "#0000007f", "#0000003f", "#0000001f"],
                    );
                    toolbar.buildRadioSet("alpha", 4,
                        ["31", "31"],
                        ["63", "63"],
                        ["127", "127"],
                        ["191", "191"],
                        ["255", "255"],
                    );
                    toolbar.buildRadioSet("taperresistance", 0,
                        ["6", "6"],
                    );
                }],
            );
        }],

        ["yamatoe", "Yamato-e", "", () => {
            toolbar.buildRadioSet("brush", 0,
                ["ink", "Ink", "", () => {
                    toolbar.buildRadioSet_size([2, 6, 12, 36], 2);
                    toolbar.buildRadioSet_color(
                        ["#e5e5e5d9", "#0c4766d9", "#c5c2bfd9", "#6d8793d9", "#856d53d9", "#1d502ad9", "#c1478ad9", "#880923d9", "#e6b5d0d9", "#000000d9",
                        "#0000001f"],
                    );
                    toolbar.buildRadioSet("alpha", 2,
                        ["31", "31"],
                        ["95", "95"],
                        ["255", "255"],
                    );
                    toolbar.buildRadioSet("taperresistance", 0,
                        ["2", "2"],
                    );
                }],

                ["watercolor", "Watercolor", "", () => {
                    toolbar.buildRadioSet_size([24, 48], 1);
                    toolbar.buildRadioSet_color(
                        ["#00000000", "#e5e5e5d9", "#0c4766d9", "#c5c2bfd9", "#6d8793d9", "#856d53d9", "#1d502ad9", "#c1478ad9", "#880923d9", "#e6b5d0d9",
                        "#000000d9", "#0000001f"],
                    );
                    toolbar.buildRadioSet("alpha", 0,
                        ["255", "255"],
                    );
                    toolbar.buildRadioSet("taperresistance", 0,
                        ["0", "0"],
                    );
                }],

                ["drier", "Drier", "", () => {
                    toolbar.buildRadioSet_size([8, 16, 54], 2);
                    toolbar.buildRadioSet_color(
                        ["#00000000"],
                    );
                    toolbar.buildRadioSet("alpha", 0,
                        ["191", "191"],
                    );
                    toolbar.buildRadioSet("taperresistance", 0,
                        ["0", "0"],
                    );
                }],
            );
        }],
    );

    // Load these scripts AFTER all else
    import("./generatebg.js");
    import("./paint.js");
    import("./viewport.js");
});

addEventListener("resize", () => {
    resizeWorkRegion();
});