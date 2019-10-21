var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var color = document.getElementById("color");
var rad = document.getElementById("rad");
var vel = document.getElementById("vel");
var mass = document.getElementById("mass");
var rot = document.getElementById("rot");
var reset = document.getElementById("reset");
var secret = document.getElementById("secret");

var controls = [rad, vel, mass, reset]
console.log(controls);
var playBtn = document.getElementById("play");
var stopBtn = document.getElementById("stop");

var bottom = document.getElementById("bottom");
var radText = document.getElementById("radText");
var massText = document.getElementById("massText");
var velText = document.getElementById("velText");
var massRText = document.getElementById("massRText");
var radText1 = document.getElementById("radText1");
var massText1 = document.getElementById("massText1");

var velText1 = document.getElementById("velText1");
var rotText = document.getElementById("rotText");
var currVelText = document.getElementById("currVelText");
var gravText = document.getElementById("gravText");
var escapeVelText = document.getElementById("escapeVelText");

var textSize = 0;
var showEnd = false;
var played = false;
var markers = [];
var paused = false;

var timeout1;
var timeout2;
var markersInterval;
var partyInterval;

const earth_rad = 6371000;
const earth_mass = 5.972 * Math.pow(10, 24);
const grav_const = 6.6726 * Math.pow(10, -11);

var launchTimer = {
    show: false,
    count: 0
}

var planet = {
    i: 0,
    rad: 0,
    y: canvas.height / 2,
    color: randColor()
}

var rocket = {
    shouldShoot: false,
    ready: false,
    shooting: false,
    speed: 0,
    imageObj: new Image(),
    grav_pull: 0
}

var sounds = [];
var backgroundMusic = document.createElement("audio");
var fire = document.createElement("audio");
var explosion = document.createElement("audio");
var fall = document.createElement("audio");
backgroundMusic.src = "music.mp3";
fire.src = "fire.mp3";
fall.src = "fall.mp3";
explosion.src = "boom.mp3";
backgroundMusic.loop = true;
fire.loop = false;
fall.loop = false;
explosion.loop = false;
sounds.push(backgroundMusic, fire, explosion, fall);

var sizeIterator = 1;
var showBoom = false;

resetSettings();

setInterval(gameLoop, 1/50);


var showIntro = true;
var introTime = 0;
var introText = setInterval(function () {
    if (introTime == 3) {
        showIntro = false;
    }
    introTime++;
}, 2000);
resetSimulation();

function gameLoop() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    textSize = ((canvas.width > canvas.height)?(canvas.height/80):(canvas.width/60));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!paused) {
        getG();
        planet.logic();
        rocket.logic();
    }
    for (var i = 0; i < markers.length; i++) {
        drawCircle(markers[i][0], markers[i][1], 3, true, "white", 1);
    }
    if (launchTimer.show) {
        ctx.font = textSize * 12 +"px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "white"
        ctx.fillText(launchTimer.count, canvas.width / 2, canvas.height / 2);
    }
    if (showBoom) {
        ctx.font = textSize * 15 + "px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "red"
        ctx.fillText("BOOM", canvas.width / 2, canvas.height / 2);
    }

    if (showEnd) {
    
        ctx.font = textSize * 10 +"px Arial";
        ctx.textAlign = "center";
      
        if (vel.value > planet.escapeVelocity) {
            ctx.fillStyle = "green"
            ctx.fillText("Escaped", canvas.width / 2, canvas.height / 2);
        } else {
            ctx.fillStyle = "red"
            ctx.fillText("Not escaped", canvas.width / 2, canvas.height / 2);
        }
        setTimeout(function () {
            showEnd = false;
        }, 1000);
    }

    planet.draw();
    rocket.draw();

    if (showIntro) {
       
        ctx.font = textSize * 8 + "px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "white"

        switch (introTime) {
            case 0:
            ctx.font = textSize * 8 + "px Arial";
            ctx.fillText("Objective:", canvas.width / 2, canvas.height / 2 - textSize * 4);
            ctx.font = textSize * 4 + "px Arial";
            ctx.fillText("Escape the Planet's", canvas.width / 2, canvas.height / 2 + textSize/2);
            ctx.fillText("Gravitational Field", canvas.width / 2, canvas.height / 2 + textSize*4);
            break;
            case 1:
            ctx.font = textSize * 8 + "px Arial";
            ctx.fillText("Experiment", canvas.width / 2, canvas.height / 2 - textSize * 4);
            ctx.font = textSize * 4.5 + "px Arial";
            ctx.fillText("with the sliders", canvas.width / 2, canvas.height / 2);
            break;
            case 2:
            ctx.font = textSize * 8 + "px Arial";
            ctx.fillText("To see", canvas.width / 2, canvas.height / 2 - textSize * 4);
            ctx.font = textSize * 4.5 + "px Arial";
            ctx.fillText("what changes", canvas.width / 2, canvas.height / 2);
            break;
            case 3:
            ctx.font = textSize * 8 + "px Arial";
            ctx.fillText("But first", canvas.width / 2, canvas.height / 2 - textSize * 4);
            ctx.font = textSize * 4.5 + "px Arial";
            ctx.fillText("try the defaults", canvas.width / 2, canvas.height / 2);
            break;
        } 
    }
}

planet.logic = function () {
    if (rocket.shooting) {
        if (planet.y != canvas.height * .75) {
            planet.y = canvas.height + planet.rad / 2 //* .75;
        }
        if(vel.value!=0){
            planet.rad = canvas.height / (vel.value/2.5);
        }
    

    } else if (rocket.shouldShoot) {
        console.log("Rocket Initiating Shoot")
        rocket.shoot();
        showIntro = false;
    } else if (planet.rad < canvas.height * 2) {
        //console.log("Zooming in to rocket")
        planet.i++;
        planet.y += 2.5;
        planet.rad += 2.2;
    }

    planet.x = canvas.width / 2;
    planet.haloRad = Math.sqrt(canvas.height) * 5 + planet.rad * 1.2;
    if (color.value != "#000000") {
        planet.color1 = color.value;
    } else {
        planet.color1 = planet.color;
    }
}
planet.draw = function () {
    var halo = ctx.createRadialGradient(planet.x, planet.y, planet.rad, planet.x, planet.y, planet.haloRad);
    halo.addColorStop(1, 'transparent');
    halo.addColorStop(0, planet.color1);

    ctx.beginPath();
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawCircle(planet.x, planet.y, planet.rad, false, `rgba(0,0,0,.1`, mass.value * (planet.rad / 800));
}

rocket.shoot = function () {
    backgroundMusic.pause();
    for (var i = 0; i < controls.length; i++) {
        controls[i].disabled = true;
    }
    rocket.y = planet.y - planet.rad;
    rocket.speed = vel.value;
    if (fire.paused) {
        fire.play();
    }
    showCounter();
    timeout1 = setTimeout(function () {
        console.log("Rocket shooting")
        rocket.ready = true;
        rocket.imageObj.src = "rocket1.png";
        markersInterval = setInterval(function f() {
            if (!paused) {
                markers.push([rocket.x, rocket.y]);
            }

        }, 2000);

    }, 3000);

    rocket.shooting = true;
}

rocket.logic = function () {

    if (rocket.ready && rocket.speed != 0) {

        var pixelSpeed = ((rocket.speed * 1000 * planet.rad) / planet.radius);

        rocket.x += Math.sin(rocket.rot * (Math.PI / 180)) * pixelSpeed;
        rocket.y -= Math.cos(rocket.rot * (Math.PI / 180)) * pixelSpeed;
        rocket.speed -= (rocket.grav_pull / 1000);

        if (rocket.speed > 0) {
            fire.volume = rocket.speed / vel.max;
        }

    } else {
        rocket.x = planet.x;
        rocket.y = planet.y - planet.rad;
    }


    if (rocket.y < 0) {
        pause();
        showEnd = true;
    }
    if (rocket.speed < 0) {

        fire.pause();
        if (fall.paused && !played) {
            showEnd = true;
            fall.play();
            rocket.imageObj.src = "rocket.png";
            played = true;
        }

        var rotToCenter = -Math.atan((rocket.x - planet.x) / (rocket.y - planet.y)) * (180 / Math.PI);

        rot.value = rotToCenter;
        updateStats();

        if (rocket.y > planet.y - planet.rad) {
            pause();

            showBoom = true;
            showEnd = false;

            playBtn.disabled = true;
            backgroundMusic.pause();
            rocket.imageObj.src = "";
            explosion.play();
            timeout2 = setTimeout(function () {
                showBoom = false;
            }, 200);

        }

    }

    currVelText.innerHTML = parseFloat(rocket.speed).toFixed(2) + "km/s";
    rocket.width = (planet.rad / 5);
    rocket.height = planet.rad * (rocket.imageObj.width / rocket.imageObj.height) / 5;
}

rocket.draw = function () {
    ctx.save()
    ctx.beginPath();
    var x = rocket.x - rocket.width / 2;
    var y = rocket.y - rocket.height / 2;
    ctx.translate(x + rocket.width / 2, y + rocket.height / 2);
    ctx.rotate(rocket.rot * (Math.PI / 180));
    ctx.translate(-1 * (x + rocket.width / 2), -1 * (y + rocket.height / 2));

    ctx.drawImage(rocket.imageObj, x, y, rocket.width, rocket.height);
    ctx.restore()
}

function resetSettings() {
    console.log("Resetting Settings")
    color.value = "#FFFFFF";
    mass.value = 1;
    rad.value = 1;
    vel.value = 9.5;
    rot.value = 0;
    updateStats();
}

function resetSimulation() {
    console.log("Resetting Simulation");
    rocket.y = planet.y - planet.rad;
    rocket.shouldShoot = false;
    rocket.ready = false;
    rocket.shooting = false;
    planet.rad = 0;
    planet.y = canvas.height / 2;
    playBtn.disabled = false;

    played = false;

    for (var i = 0; i < controls.length; i++) {
        controls[i].disabled = false;
    }

    updateStats();

    rocket.speed = 0;
    rocket.imageObj.src = "rocket.png";
    bottom.hidden = false;
    playBtn.hidden = false;
    paused = false;

    markers = [];
    playBtn.src = "play.png"

    clearTimeout(timeout1);
    clearTimeout(timeout2);
    clearInterval(markersInterval);
    noParty();
    planet.color = randColor();
    planet.color1 = planet.color;

    backgroundMusic.currentTime = 0;
    backgroundMusic.play()
    fire.pause()
    fire.currentTime = 0;
    explosion.pause();
    explosion.currentTime = 0;
    fall.pause();
    fall.currentTime = 0;
}

var partyStarted = false;

function party() {
    console.log("Starting party");

    if (!partyStarted) {
        var frequency = .3;
        var i = 0;

        partyStarted = true;
        partyInterval = setInterval(function () {

            red = Math.sin(frequency * i + 0) * 127 + 128;
            green = Math.sin(frequency * i + 2) * 127 + 128;
            blue = Math.sin(frequency * i + 4) * 127 + 128;
            i++;
            color.value = RGB2Color(red, green, blue);

        }, 45);
    } else {
        partyStarted = false;
        clearInterval(partyInterval);
    }
}

function updateStats() {
    //console.log("Updating stats");
    massText.innerHTML = mass.value;
    massText1.innerHTML = massText.innerHTML + " (Earth Masses)";

    radText.innerHTML = rad.value;
    radText1.innerHTML = radText.innerHTML + " (Earth Radii)";
    velText.innerHTML = vel.value + "km/s";
    velText1.innerHTML = velText.innerHTML;
    rotText.innerHTML = rot.value + "&deg";
    rocket.rot = rot.value;

    planet.mass = mass.value * earth_mass;
    planet.radius = rad.value * earth_rad;
    planet.escapeVelocity = Math.sqrt((2 * grav_const * planet.mass) / (planet.radius)).toFixed(3) / 1000;
    vel.max = planet.escapeVelocity + 5;
    escapeVelText.innerHTML = planet.escapeVelocity.toFixed(3) + "km/s";

}

function getG() {
    console.log("getting G");
    var r = ((planet.radius) * (planet.y - rocket.y)) / planet.rad;
    rocket.grav_pull = ((grav_const * planet.mass) / (r * r)) ;
    gravText.innerHTML = rocket.grav_pull.toFixed(3) + "m/s/s";
}

function play() {
    console.log("Resuming")
    console.log(rocket);

    if (!rocket.ready) {
        playBtn.src = "pause.png"
        rocket.shouldShoot = true;
    } else {
        if (paused) {
            paused = false;
            playBtn.src = "pause.png"
            fire.play();
        } else {

            pause();

        }
    }
}

function pause() {
    console.log("Pausing");
    paused = true;

    playBtn.src = "play.png"

    stopSound();
}

function showInfo() {
    alert("Team Rocket\nOrbital Motion Simulator\n-A Project for EF152\n\n\u2022 Lead Software Engineer: Andrei Cozma\n\u2022 Business Administration Director: Andrew Kloek\n\u2022 Graphics Designers: Marcus McCoy & Andrei Cozma\n\u2022 Logistics and Business Analytics: Andrew Kloek & Refati Rusitanmu\n\nDescription:\n\u2666 An Orbital Motion Simulator that teaches the Physics concept of escape velocity through a fun, interactive simulation.\n\u2666 An object escapes a planet's gravitational field when the gravitational acceleration (g) is not enough to slow it down to pull it back towards the planet.\nEscape Velocity (V):\n\u2022 V= sqrt((2GM)/r)\n\u2022 G = 6.6742E-11\n\u2022 M = The planet’s mass\n\u2022 r = The planet's radius\nGravitational Pull (g):\n\u2022 g = (GM)/(r^2)\n");
}

function stopSound() {
    console.log("Stopping sound")
    for (var i = 0; i < sounds.length; i++) {
        sounds[i].pause();
    }
}

function showCounter() {
    console.log("Showing countdown");
    launchTimer.count = 3;
    launchTimer.show = true;
    var interval = setInterval(function () {
        launchTimer.count--;
        if (launchTimer.count <= 0) {
            clearInterval(interval);
            launchTimer.show = false;
        }
    }, 1000);
}

function noParty() {
    clearInterval(partyInterval);
    console.log("Stopping party")
}

function myRnd(start, end) {
    return Math.floor(Math.random() * end) + start;
}

function randColor() {
    return ('rgba(' + myRnd(200, 255) + ', ' + myRnd(200, 255) + ',' + myRnd(0, 105) + Math.random() + ')')
}

function RGB2Color(r, g, b) {
    return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
}

function byte2Hex(n) {
    var nybHexString = "0123456789ABCDEF";
    return String(nybHexString.substr((n >> 4) & 0x0F, 1)) + nybHexString.substr(n & 0x0F, 1);
}

function drawCircle(x, y, radius, fill = false, color = "#000000", linewidth = 5) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);

    if (fill) {
        ctx.fillStyle = color;
        ctx.fill();
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = linewidth;
    ctx.stroke();
}

function drawRect(x, y, w, h, color = "#000000") {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.stroke();
    ctx.fill();
}
document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});