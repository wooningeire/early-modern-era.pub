/**
 * @file Handles all the interactions between the user and the painting canvases.
 */

import { qs, relcoords, arrult, arrpenult, mod } from "./util.js";
import { Canvas, P } from "./canvas.js";
import { Color } from "./color.js";

const { abs, sqrt, floor, cos, sin, random, PI, E } = Math;

const underlay = new Canvas("canvas.underlay");
const canvas = new Canvas("canvas.paint");
const pointses = []; // so that another stroke can be made without having to wait

let painted = false;
let brushActive = false;

//onbeforeunload = () => painted;

const ondown = event => {
    painted = true;

    brushActive = true;

    const points = [];
    pointses.push(points);

    recordPoint(points, event);
    drawPoint(arrpenult(points) || arrult(points), arrult(points));
};

const onmove = event => {
    const points = arrult(pointses);

    recordPoint(points, event);
    drawPoint(arrpenult(points) || arrult(points), arrult(points));
};

const onup = event => {
    brushActive = false;

    canvas.clear();

    //simplifyPoints(arrult(pointses));
    paintPoints(arrult(pointses)); // previous pointses have already been passed
};

canvas.canvas.addEventListener("mousedown", event => {
    if (event.button !== 0) return;
    ondown(event);
}, false);
canvas.canvas.addEventListener("touchstart", ondown, { passive: true });

addEventListener("mousemove", event => {
    if (!brushActive || event.button !== 0) return;
    onmove(event);
}, false);
addEventListener("touchmove", event => {
    event.preventDefault();
    onmove(event);
}, false);

addEventListener("mouseup", event => {
    if (!brushActive) return;
    onup(event);
}, false);
addEventListener("touchend", onup, false);

function recordPoint(array, mouseEvent) {
    if (["touchstart", "touchmove"].includes(mouseEvent.type)) {
        console.log(mouseEvent);
        const touch = mouseEvent.touches[0];
        [mouseEvent.x, mouseEvent.y] = [touch.pageX, touch.pageY];
    }

    const coords = relcoords(mouseEvent, underlay.canvas);
    const point = P(coords.x, coords.y, Date.now());
    array.push(point);

    return point;
}
function drawPoint(fromPoint, toPoint) {
    canvas.instLine(...fromPoint, ...toPoint);
}

function simplifyPoints(points, threshold=.3) {
    for (let i = 0; i < points.length - 2; i++) {
        const theta1 = points[i].slopeAngle(points[i + 1]);
        const theta2 = points[i + 1].slopeAngle(points[i + 2]);

        const diff = theta1 - theta2;
        const diffPrincipal = (diff + PI) % (2 * PI) - PI;

        if (diffPrincipal < threshold || points[i].equivalent(points[i + 1])) {
            points.splice(i + 1, 1);
            i--;
        }
    }
}

function paintPoints(points, a, b, centerOffset) {
    if (!points) return;

    const buffer = new Canvas().copyDims(underlay);

    const color = qs("toolbar- input[name='color']:checked").value;
    const size = parseInt(qs("toolbar- input[name='size']:checked").value);
    const alpha = parseInt(qs("toolbar- input[name='alpha']:checked").value);
    const taperResistance = parseInt(qs("toolbar- input[name='taperresistance']:checked").value);

    /*underlay.fillStyle("#f00");
    for (let point of points) {
        underlay.instCircle(...point, 5);
        underlay.context.fill();
    }*/

    switch (qs("toolbar- input[name='brush']:checked").value) {
        default:
        case "ink": {
            const minRadius = 0;
            const maxRadius = parseInt(size);

            let radius = NaN;
            let radiusTarget = NaN;

            buffer
                    .style(color)
                    .alpha(alpha)
                    .strokeWidth(0);

            if (points.length === 1) {
                createNewPoint(2);
            }

            for (let i = 0; i < points.length - 1; i++) {
                const [point, pointNext] = [points[i], points[i + 1]];

                if (point.equivalent(pointNext)) continue;

                // Create a target radius value that reflects the speed of the stroke (logistic)
                // 2 * (m - n) * (1 / (1 + e ** (-t / d)) - 1 / 2) + n
                radiusTarget =
                        2 * (maxRadius - minRadius) / (1 + E ** (-taperResistance * point.elapsedTime(pointNext) / point.distance(pointNext))) - maxRadius + 2 * minRadius;
                if (i === points.length - 2) radiusTarget /= 2; // Only the coolest tapering effect

                if (isNaN(radius)) radius = radiusTarget;

                // Draw a trapezoid that considers the change in radius
                const angle = point.principalAngle(pointNext);
                const tanPos = angle + PI / 2;
                const tanNeg = angle - PI / 2;

                buffer.pathStart();
                buffer.context.moveTo(point.x + radius * cos(tanPos), point.y + radius * sin(tanPos));
                buffer.context.lineTo(pointNext.x + radiusTarget * cos(tanPos), pointNext.y + radiusTarget * sin(tanPos));
                buffer.context.lineTo(pointNext.x + radiusTarget * cos(tanNeg), pointNext.y + radiusTarget * sin(tanNeg));
                buffer.context.lineTo(point.x + radius * cos(tanNeg), point.y + radius * sin(tanNeg));
                buffer.context.closePath();
                buffer.pathFill();

                // Draw a start circle
                buffer
                        .pathStart()
                        .pathArc(...point, radius, 0, 2 * PI)
                        .pathFill();

                // Draw an end circle
                buffer
                        .pathStart()
                        .pathArc(...pointNext, radiusTarget, 0, 2 * PI)
                        .pathFill();

                radius = radiusTarget;
            }

            underlay.image(buffer);
            break;
        }

        case "watercolor": {
            const [r, g, b, a] = new Canvas().copyDims(underlay)
                    .strokeWidth(size).cap("round").joint("round")
                    .qCurvePath(points)
                    .gco("source-in")
                    .image(underlay)
                    .totalColorWeighted();

            const newAlpha = sqrt(a) * 255 / points.length ** 2;
            const averageColor = new Color(r / a, g / a, b / a);

            buffer.shadowColor(averageColor).shadowBlur(size / 2)
                    .style(averageColor) // to avoid black edge
                    .alpha(newAlpha)
                    .strokeWidth(size).cap("round").joint("round")
                    .qCurvePath(points)
                    
                    .alpha(255)
                    .gco("destination-out")
                    .qCurvePath(points);

            underlay.gco("destination-out")
                    .strokeWidth(size).cap("round").joint("round")
                    .qCurvePath(points)

                    .gco("source-over")
                    .image(buffer);
            
            break;
        }

        case "drier": {
            const averageColor = averageColorInQCurve(points);
            averageColor.setAlpha(averageColor.getPerceivedLightness() * 4);

            buffer.strokeWidth(size).cap("round").joint("round")
                    .style(averageColor)
                    .qCurvePath(points);

            underlay.gco("destination-out").alpha(alpha)
                    .image(buffer)

                    .gco("source-over").alpha(alpha ** (1 / 2.3)) // arbitrary alpha
                    .image(buffer)
                    
                    .alpha(255);

            break;
        }

        /*case "watercolor": {
            const radius = 64;
            const maxAlpha = 95;
            const minAlpha = 63;
            const maxAlphaSpreadRadius = 16;

            const clippedBuffer = new Canvas(radius * 2, radius * 2)
                    .translate(radius, radius)
                    
                    .pathStart()
                    .pathArc(0, 0, radius)
                    .usePathToClip();

            const [x, y] = points[0];

            const averageColorRaw = clippedBuffer.image(underlay, -x, -y).averageColorWeighted();

            let averageColor = new Color(color);
            if (!isNaN(averageColorRaw[0])) {
                averageColor = averageColor.blend(new Color(averageColorRaw).setAlpha("50%"));
            }

            buffer
                    .image(underlay) // Transfer the current content onto the buffer.
                    .pathStart() // Draw a filled circle with the average color onto the buffer.
                    .pathArc(x, y, radius)
                    .pathFill(averageColor.setAlpha("2%").toString());

            const imageData = clippedBuffer
                    .clear()

                    .image(buffer, -x, -y)
                    
                    .iteratePixels(([r, g, b, a], i, imageData) => {
                        if (a == 0) return;

                        const { width, height } = imageData;

                        const x = (i / 4) % height - radius;
                        const y = floor((i / 4) / height) - radius;

                        const dist = abs(sqrt(x ** 2 + y ** 2) - radius);

                        let alpha;
                        if (0 <= dist && dist <= maxAlphaSpreadRadius) {
                            alpha = maxAlphaSpreadRadius * (dist - maxAlphaSpreadRadius) ** 2 / (maxAlpha - minAlpha) + minAlpha;
                        } else {
                            alpha = minAlpha;
                        }

                        imageData.data[i + 3] = alpha;
                    });

            clippedBuffer.imageData(imageData);

            underlay
                    .gco("destination-out") // Erase the target area on the underlay.

                    .pathStart()
                    .pathArc(x, y, radius)
                    .pathFill()

                    .gco("source-over") // Draw the new translucent content onto the underlay.

                    .image(clippedBuffer, x - radius, y - radius);
        }*/
        /*case "scallop": {
            let unslack = 1;
            for (let i = 0; i < points.length - 1; i++) {
                let theta = points[i].principalAngle(points[i + 1]); //console.log(i, theta, sign(Math.cos(theta)), sign(Math.sin(theta)), unslack);

                let c = ((a * b) ** 2 - a ** 2)

                let [x, y] = points[i];

                underlay.strokeStyle("#fff").strokeWidth(3).instCircle(...points[i], 8);
                
                if (isNaN(sign(Math.cos(theta))) && isNaN(sign(Math.sin(theta)))) continue;

                while (((x - points[i + 1].x) * -sign(Math.cos(theta)) > 0 || isNaN(sign(Math.cos(theta))))
                        && ((y - points[i + 1].y) * -sign(Math.sin(theta)) > 0 || isNaN(sign(Math.sin(theta))))) {
                    console.log("-", x - points[i + 1].x, y - points[i + 1].y, unslack); debugger;
                    
                    buffer.instEllipse(x, y, a, b);
                    //buffer.context.fill();

                    underlay.fillStyle("rgba(0, 0, 0, .4)").strokeStyle(0).instCircle(x, y, 5);
                    underlay.context.fill();

                    x += 2 * a * Math.cos(theta);
                    y += 2 * b * Math.sin(theta);

                    //x += centerOffset * unslack * a * Math.cos(theta);
                    //y += centerOffset * unslack * b * Math.sin(theta);
                }

                unslack = 1//Math.min(1, 1 - points[i].differenceX(points[i + 1]) / (centerOffset * a));
                debugger;
            }

            buffer.paste(underlay);

            break;
        }*/
    }

    function averageColorInQCurve(points) {
        return new Color(new Canvas().copyDims(underlay)
                .strokeWidth(size).cap("round").joint("round")
                .qCurvePath(points)
                .gco("source-in")
                .image(underlay)
                .averageColorWeighted());
    }
            
    function createNewPoint(n=1) {
        for (let i = 0; i < n; i++) {
            const dx = random() * 6 - 3;
            const dy = random() * 6 - 3;
            const dtime = floor(random() * 60 + 40);

            points.push(P(
                arrult(points).x + (dx !== 0 ? dx : 1),
                arrult(points).y + (dy !== 0 ? dy : 1),
                Number(arrult(points).time) + dtime,
            ));
        }
    }

    function sign(n) {
        return n / abs(n);
    }
}

/*
function paintPoints(points) {
    switch (qs("toolbar- input[name='brush']:checked").value) {
        default:
        case "ink": {
            const path = translatePointsToPath(points); console.log(path.outerHTML);
            qs("svg.underlay").appendChild(path);

            break;
        }
    }
}

function translatePointsToPath(points) {
    const path = cesvg("path");
    let d = `M${points[0].x},${points[0].y}`;

    for (let [x, y] of points) {
        d += `L${x},${y}`;
    }

    path.setAttributeNS("http://www.w3.org/2000/svg", "d", d);

    return path;
}*/