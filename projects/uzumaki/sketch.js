const CONTAINER_ID = "#uzumaki";
const THETA_MAX = 23*Math.PI;
const SIZE_MAX = 0.04;
const SIZE_DELTA = 0.015;
const FOLLOW_GAP = 5;
const DEMO = true;

var BG_COLOR = "#000";
var FG_COLOR = "#fff";
var SP_COLOR = "#f00";

var canvas;     // the p5 canvas
var spirals;    // list of active spirals
var sizeScalar; // scalar used in ellipse sizing

var display;    // toggle for displaying text
var paused;     // toggle for pausing
var follow;     // toggle for follow mode
var trace;      // toggle for clearing old frames

var interval;   // interval id for spiral drawing
var pScreen;    // flag for pause screen display
var fCount;     // counter for follow mode
// TODO: add overlay for size and speed display
// TODO: change pausing to noLoop()
//
// BONUS: styles of respective element is set to alt color scheme on shift!
//          [Space] - spawn RED ball
//          [S]     - sepia colorway
//          [H]     - hyper colorway
//          [I]     - indigo colorway
//          [F]     - fall colorway
//          [T]     - techno colorway
//
// TODO: style-pass 
//
// TODO: take new gallery photos when done w new features :)

/** P5 EVENT FUNCTIONS **/

function setup() {
    // initialize canvas
    let sketch = document.querySelector(CONTAINER_ID + " .sketch");
    canvas = createCanvas(sketch.offsetWidth, sketch.offsetHeight);
    canvas.parent(sketch);
    background(BG_COLOR);
    
    // initialize globals
    spirals = [];
    sizeScalar = SIZE_MAX; // starts at "large"
    cycleSize(); // set size to "medium"
    display = "block";
    paused = DEMO;
    pScreen = DEMO;
    follow = false;
    trace = true;
    
    // draw pause screen
    if (paused) drawPauseScreen();
    
    // initialize spirals array
    let spiral = {r: 0.009, h: 0.007, theta: THETA_MAX, spot: false};
    spirals = [spiral];
    
    // push style changes to page
    updateCSS();
}

function windowResized() {
    resize();
    if (paused) drawPauseScreen();
}

function draw() {
    push();
    // translate the origin point to the bottom(ish) of the screen
    translate(width / 2, height * 0.83333);
    
    if (!paused) {
        // clear previous frame if not tracing
        if (!trace) background(BG_COLOR);
        
        // plot all spiral dots
        for (var i = 0; i < spirals.length; i++) {
            drawEllipse(getNextEllipse(spirals[i]));
        }
    }
    pop();
}

function touchStarted() {
    //startSpirals(); 
    // TODO: add check for mobile as this fires on trackpad in chrome
}

function touchEnded() {
    //stopSpirals();
}

function mouseClicked() {
    if (pScreen) {
        // clear pause screen
        background(BG_COLOR);
        pScreen = false;
        
        // update text to "paused"
        let overlay = document.querySelector(CONTAINER_ID + " .overlay");
        overlay.innerHTML = "P A U S E D";
    }
    
    paused = !paused;
    updateCSS();
}

function keyPressed() {
    if (key == ' ') {                       // [Spa]wn
        startSpirals();
    } else if (key == 's' || key == 'S') {  // [S]ize
        cycleSize();
    } else if (key == 'h' || key == 'H') {  // [H]ide
        toggleDisplay();
    } else if (key == 'i' || key == 'I') {  // [I]nvert
        invert();
    } else if (key == 'f' || key == 'F') {  // [F]ollow
        follow = !follow;
    } else if (key == 't' || key == 'T') {  // [T]race
        trace = !trace;
    }
}

function keyReleased() {
    if (key == ' ') {
        stopSpirals();
    }
}

/** CUSTOM UTILITY FUNCTIONS **/

// resizes the canvas
function resize() {
    let sketch = document.querySelector(CONTAINER_ID + " .sketch");
    resizeCanvas(sketch.offsetWidth, sketch.offsetHeight);
}

// start adding spirals
function startSpirals() {
    if (follow) {
        fCount = 0;
        addFollowing();
    } else {
        addSpiral();
        interval = setInterval(addSpiral, 200);
    }
}

// stop adding spirals
function stopSpirals() {
    clearInterval(interval);
}

// cycles size value through S, M, L
function cycleSize() {
    // decrement size scalar
    sizeScalar -= SIZE_DELTA;
    
    // if less than 0, reset to max
    if (sizeScalar <= 0) {
        sizeScalar = SIZE_MAX;
    }
}

// toggle display of text section
function toggleDisplay() {
    if (display == "block") display = "none";
    else display = "block";
    
    updateCSS();
}

// invert bg & fg colors
function invert() {
    let temp = BG_COLOR;
    BG_COLOR = FG_COLOR;
    FG_COLOR = temp;
    
    background(BG_COLOR);
    
    if (pScreen) drawPauseScreen();
    
    updateCSS();
}

// inverts colors of body
function updateCSS() {
    // update colors
    let elements = [];
    elements.push(document.querySelector("h2"));
    elements.push(document.querySelector("body"));
    elements.push(document.querySelector(CONTAINER_ID + " .overlay"));
    elements.forEach(function(element) {
        if (element != null) {
            element.style.backgroundColor = BG_COLOR;
            element.style.color = FG_COLOR;
        }
    });
    
    // hide/display text
    let overlay = document.querySelector(CONTAINER_ID + " .overlay");
    if (overlay != null) {
        if (!paused) overlay.style.display = "none";
        else overlay.style.display = display;
    }
}

// returns ratio of point's distance to origin
function getMouseDist() {
    let oriX = width / 2,
        oriY = height * 0.83333,
        dx = oriX - mouseX,
        dy = oriY - mouseY,
        maxDist = oriY,
        actDist = Math.sqrt(dx*dx + dy*dy);
    
    return (maxDist - actDist) / maxDist;
}

// return random number between lo and hi
function getRandRange(lo, hi) {
    let delta = hi - lo;
    
    return Math.random() * delta + lo;
}

// creates a new spiralling dot to draw
function addSpiral() {
    spirals.push(getSpiral());
}

// creates a new following dot to draw
function addFollowing() {
    // add next spiral to spirals
    if (fCount == 0 || spirals.length == 0) {
        spirals.push(getSpiral());
    } else {
        let last = spirals[spirals.length - 1],
            copy = {
                r: last.r,
                h: last.h,
                theta: keyIsDown(SHIFT) ? 0 : THETA_MAX, 
                spot: keyIsDown(SHIFT)
            };
        spirals.push(copy);
    }
    
    // increment counter and set timer for next call
    fCount++;
    interval = setTimeout(addFollowing, fCount * FOLLOW_GAP);
}

// returns a randomly parameterized spiral object
function getSpiral() {
    let spiral = {
            r: getRandRange(0.006, 0.010), 
            h: getRandRange(0.004, 0.008),
            theta: keyIsDown(SHIFT) ? 0 : THETA_MAX, 
            spot: keyIsDown(SHIFT)
    };
    
    return spiral;
}

function getNextEllipse(spiral, delta) {
    // initialize spiral parameters
    let r = spiral.r * width,
        h = spiral.h * height,
        theta = spiral.theta;

    // get cartesian pts from polar fxn
    let x = r * theta * cos(1 * theta),
        y = r * -theta * sin(1 * theta),
        z = -h * theta;
    
    // convert cartesian pts to isometric perspective
    let isoX = ((x - y) * (Math.sqrt(3)/2)),
        isoY = (((x + y) * (1/2)) + z);
    
    // set size of ellipse based on distance from viewer
    let baseSize = (width * 0.2) + 400,
        size = (baseSize + (0.666 * x) + (0.666 * y)) * sizeScalar;
    
    // make sure size does not underflow
    if (size < 1) size = 1;
    
    // terminate spiral when at the origin
    let terminal = theta < 0 || theta > THETA_MAX;
    if (terminal) spirals.splice(spirals.indexOf(spiral), 1);
    
    // create ellipse object
    var ellipse = {
        x: isoX, 
        y: isoY, 
        size: size,
        stroke: trace ? 0 : 3,
        color: spiral.spot ? SP_COLOR : FG_COLOR,
        kill: terminal
    };
    
    // update theta
    thetaVel = (delta == null) ? (getMouseDist() * 0.1) : delta;
    if (spiral.spot) thetaVel *= -1;
    spiral.theta -= thetaVel;
    
    return ellipse;
}

// draw given ellipse to canvas
function drawEllipse(e) {
    if (e.kill) {
        noFill();
        stroke(e.color);
        strokeWeight(e.stroke);
    } else {
        noStroke();
        fill(e.color);
    }
    
    ellipseMode(CENTER);
    ellipse(e.x, e.y, e.size, e.size);
}

// draws a full spiral and "play" text for start screen
function drawPauseScreen() {
    let spiral = {r: 0.009, h: 0.007, theta: THETA_MAX, spot: false};
    
    push();
    background(BG_COLOR);
    
    // translate the origin point to the bottom(ish) of the screen
    translate(width / 2, height * 0.83333);
    
    // draw full spiral
    while (spiral.theta > 0) {
        drawEllipse(getNextEllipse(spiral, 0.1));
    }
    pop();
    
    // push "play" text to overlay
    let overlay = document.querySelector(CONTAINER_ID + " .overlay");
    overlay.innerHTML = "C L I C K  T O  S T A R T";
    pScreen = true;
}