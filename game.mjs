import { debug, displayDebugInfo } from "./debug.mjs";
import DIMENSIONS from "./dimensions.mjs";
import GAME_STATES from "./gameStates.mjs";
import { SPRITES, TILE_KEYS, TILES } from "./tiles.mjs"
import getGameLevelDataFrom from "./level.mjs"
import KEYS from "./io.mjs";
import { addComment, drawComments, getComments, updateComments } from "./commentator.mjs";
import Zombie from "./components/zombie.mjs";
import Component from "./components/component.mjs";
import Player from "./components/player.mjs";
import Potion from "./components/potion.mjs";
import Tools from "./util.mjs";

const _td = DIMENSIONS.tileDimension;
const _rows = DIMENSIONS.screenRows;        // Remember that rows are y (vertical)
const _cols = DIMENSIONS.screenColumns;     // Remember that cols are x (horizontal)
const _sx = DIMENSIONS.startX;
const _sy = DIMENSIONS.startY;
const _width = DIMENSIONS.totalWidth;
const _height = DIMENSIONS.totalHeight;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.setAttribute("width", DIMENSIONS.totalWidth);
canvas.setAttribute("height", DIMENSIONS.totalHeight);

const PLAYER_SYMBOLE = "H"

const LEVEL_FILES = [ // Easier to added more level later
    "./levels/level1.lvl",
    "./levels/level2.lvl",
    "./levels/level3.lvl"
]

let currentLevelIndex = 0;

let level = null;
let background = null;
let player = null;
let components = [];
let exitDoor = null;

let isGameOver = false;

let gameState = GAME_STATES.init;
let hasGameStarted = false;

let splashCounter = 0;
const SPLASH_FRAMES = 180; // ~3 sec at 60 fps

let menuSelectedIndex = 0;
const MENU_ITEMS = [
    "Start Game",
    "Instructions",
    "Quit"
];

//#region GAME ENGINE

async function init(levelIndex = 0) {

    currentLevelIndex = levelIndex

    level = await getGameLevelDataFrom(LEVEL_FILES[currentLevelIndex]);
    background = renderStructure(level.structure);  // This is a solution to save us drawing later, It draws the full map to the background variable.

    components = []
    player = null;
    isGameOver = false;
    exitDoor = null;

    let doors = [];

    // The following loop creates all the game components.
    // It is messy and could be simpler 
    for (let i = 0; i < level.components.length; i++) {
        if (level.components[i][0].trim() == PLAYER_SYMBOLE) {
            player = Player.createPlayer(level.components[i])
        } else {

            let comp = null;
            switch (level.components[i][0]) {

                case Component.ids.zombie: comp = Zombie.createZombie(level.components[i]);
                    break;

                case Component.ids.potion: comp = Potion.createPotion(level.components[i]);
                    break;

                default: comp = Component.createComponent(level.components[i]);
                    break;
            }

            if (comp.symbole === Component.ids.door) {
            doors.push(comp);
            }

            components.push(comp);

        }

    }

    if (doors.length > 0) {
        exitDoor = doors[doors.length - 1]
    }

    if (!hasGameStarted) {
        hasGameStarted = true;
        loop();
    }

}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

async function updatePlayState() {

    if (isGameOver) {
        return;
    }

    let dr = 0;
    let dc = 0;

    if (KEYS.ArrowDown) {
        dr = 1;
    } else if (KEYS.ArrowUp) {
        dr = -1;
    }

    if (KEYS.ArrowLeft) {
        dc = -1;
    } else if (KEYS.ArrowRight) {
        dc = 1;
    }

    let tr = player.row + dr;
    let tc = player.col + dc;

    // Do not walk through walls.
    if (level.structure[tr][tc] !== TILES["."].symbole) {
        tr = player.row;
        tc = player.col;
    }

    // Interactions between player and components
    let keep = [];
    for (let component of components) {

        if (component.row == tr && component.col == tc) {
            if (component.symbole == "K") {
                Player.addToInventory("Key");
                addComment("Found a shiny new key");
            }
            else if (component.symbole == "D" && Player.hasItemInInventory("Key")) {
                
                Player.removeFromInventory("Key");
                addComment("You unlock the door.");

                if (exitDoor &&
                    component.row === exitDoor.row &&
                    component.col === exitDoor.col) {

                        addComment("You found the exit!")

                        if (currentLevelIndex + 1 < LEVEL_FILES.length) {
                            addComment("You step into the next level...");
                            await init(currentLevelIndex + 1);
                            return;
                        } else {
                            addComment("You escaped the dungeon. You win!");
                            isGameOver = true;
                        }
                    }
            }

            else if (component.symbole == Component.ids.zombie) {
                tr = player.row;
                tc = player.col;

                Zombie.fightZombie(component, player)

                if (component.health > 0) {
                    keep.push(component);
                }
            }
            else if (component.symbole == Component.ids.potion) {
                console.log(component);
                player[component.attribute] += component.effect;
                addComment("You drank " + component.name + " effect is " + component.effect);
            }
            else if (component.symbole == "F"){
                const before = player.health;
                const HEAL_AMOUNT = 3;
                player.health = Math.min(Player.MAX_HEALTH, player.health + HEAL_AMOUNT);
                const healed = player.health - before;

                if (healed > 0) {
                    addComment("The healer tends your wounds. +" + healed + " health");
                } else {
                    addComment("The healer nods. You are already in perfect health");
                }
            }
            else {
                keep.push(component)
                tr = player.row;
                tc = player.col;
            }
        } else {

            if (component.symbole == "Z") {
                Zombie.update(component, level.structure);
            }

            keep.push(component)
        }
    }

    components = keep;

    player.row = tr;
    player.col = tc;

    if (player.health <= 0) {

        isGameOver = true;
    }

    updateComments();

}

function updateMenu() {

    if (KEYS.ArrowUp) {
        menuSelectedIndex--;
    } else if (KEYS.ArrowDown) {
        menuSelectedIndex++;
    }

    if (menuSelectedIndex < 0) {
        menuSelectedIndex = MENU_ITEMS.length - 1;
    }
    if (menuSelectedIndex >= MENU_ITEMS.length) {
        menuSelectedIndex = 0;
    }

    if (KEYS.Enter) {
        const choice = MENU_ITEMS[menuSelectedIndex];

        if (choice === "Start Game") {
            init(0);
            gameState = GAME_STATES.play;
        } else if (choice === "Instructions") {
            gameState = GAME_STATES.pause;
        } else if (choice === "Quit") {
            gameState = GAME_STATES.idle;
        }
    }
}

function update() {
    
    if (gameState === GAME_STATES.init) {

        if (KEYS.ArrowUp || KEYS.ArrowDown || KEYS.ArrowLeft || KEYS.ArrowRight || KEYS.Enter) {
            gameState = GAME_STATES.menu;
            return;
        }

        splashCounter++;
        if (splashCounter > SPLASH_FRAMES) {
            gameState = GAME_STATES.menu;
        }
        return;

    }

    if (gameState === GAME_STATES.menu) {
        updateMenu();
        return;
    }

    if (gameState === GAME_STATES.pause) {
        if (KEYS.Enter || KEYS.Escape) {
            gameState = GAME_STATES.menu;
        }
        return;
    }

    if (gameState === GAME_STATES.idle) {
        return;
    }

    if (gameState === GAME_STATES.play) {
        updatePlayState();
        return;
    }
}

function draw() {

    if (gameState === GAME_STATES.init) {
        drawSplashScreen();
        return;
    }

    if (gameState === GAME_STATES.menu) {
        drawMenuScreen();
        return;
    }

    if (gameState === GAME_STATES.pause) {
        drawInstructionScreen();
        return;
    }

    if (gameState === GAME_STATES.idle) {
        drawIdleScreen();
        return;
    }

    drawPlayState();
}


function drawPlayState() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    ctx.save();

    ctx.drawImage(background, 0, 0);
    Player.draw(ctx);
    drawHUD(ctx);

    // The following loop draws all the remaning items.
    // It can be done much cleaner, infact there are clues in the current loop as to how it could be made cleaner.
    for (let item of components) {

        let y = (item.row * _td) + _sx;
        let x = (item.col * _td) + _sy;

        try {
            if (item.symbole == "P") {
                Potion.draw(ctx, item);
            } else {
                TILES[item.symbole].draw(ctx, x, y, _td, _td);
            }
        } catch (error) {
            console.warn("No draw function for ", type);
        }

    }

    if (isGameOver) {
        ctx.fillStyle = "White";
        ctx.font = "60px 'Jacquard 12'";
        let txt = "GAME OVER";
        let bounds = Tools.getTextBounds(ctx, txt);
        let x = (_width * 0.5) - (bounds.width * 0.5);
        let y = (_height * 0.5) - (bounds.height * 0.5);
        ctx.fillText(txt, x, y);
    } else {
        drawComments(ctx);
    }

    // Code after this point is for debuging suport. 
    if (debug) {
        displayDebugInfo(ctx)
    }

    ctx.restore();
}

function drawSplashScreen() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.save();

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    
    ctx.fillStyle = "white";
    ctx.font = "48px 'Jacquard 12'";
    let title = "Quest";
    let bounds = Tools.getTextBounds(ctx, title);
    let x = (_width * 0.5) - (bounds.width * 0.5);
    let y = (_height * 0.5) - (bounds.height * 0.5);
    ctx.fillText(title, x, y);

    ctx.font = "18px 'Tiny5'";
    const subtitle = "Press any key to continue";
    bounds = Tools.getTextBounds(ctx, subtitle);
    x = (_width * 0.5) - (bounds.width * 0.5);
    y += DIMENSIONS.tileDimension * 3;
    ctx.fillText(subtitle, x, y);

    ctx.restore();
}

function drawMenuScreen() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.save();

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    
    ctx.fillStyle = "white";
    ctx.font = "36px 'Jacquard 12'";
    let title = "Main Menu";
    let bounds = Tools.getTextBounds(ctx, title);
    let x = (_width * 0.5) - (bounds.width * 0.5);
    let y = DIMENSIONS.padding * 3;
    ctx.fillText(title, x, y);

    ctx.font = "20px 'Tiny5'";
    for (let i = 0; i < MENU_ITEMS.length; i++) {
        const label = (i === menuSelectedIndex ? ">" : " ") + MENU_ITEMS[i];
        bounds = Tools.getTextBounds(ctx, label);
        x = (_width * 0.5) - (bounds.width * 0.5);
        y += DIMENSIONS.tileDimension * 2;
        ctx.fillText(label, x, y);
    }

    ctx.restore();
}

function drawInstructionScreen() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.save();

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    ctx.fillStyle = "white";
    ctx.font = "24px 'Tiny5'";
    let y = DIMENSIONS.padding * 2;

    const lines = [
        "Arrow keys - move",
        "Walk into Zombies to fight",
        "Pick up keys (K) nad Potion (P)",
        "Open doors (D) when you have a key",
        "",
        "Press ENTER to return to the menu"
    ];

    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], DIMENSIONS.padding * 2, y);
        y += DIMENSIONS.tileDimension * 2;
    }

    ctx.restore();
}

function drawIdleScreen() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.save();

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    ctx.fillStyle = "white";
    ctx.font = "32px 'Jacquard 12'";
    const txt = "Thanks for Playing!";
    const bounds = Tools.getTextBounds(ctx, txt);
    const x = (_width * 0.5) - (bounds.width * 0.5);
    const y = (_height * 0.5);
    ctx.fillText(txt, x, y);

    ctx.restore();
}

//#endregion

function drawHUD(ctx) {
    let healthDisplay = ["❤️", "❤️", "💛", "💛", "💛", "💚", "💚", "💚", "💚", "💚"].slice(0, player.health).join("");
    healthDisplay = healthDisplay.padEnd(Player.MAX_HEALTH * 2, "💀");
    ctx.fillText(healthDisplay, DIMENSIONS.padding, DIMENSIONS.padding * 0.75);

}

//#region utility functions

function renderStructure(structure) {

    const offscreen = new OffscreenCanvas(_width, _height);
    const ctx = offscreen.getContext('2d');

    for (let i = 0; i < _rows; i++) {
        for (let j = 0; j < _cols; j++) {

            if (structure.length > i && structure[i].length > j) {
                let type = structure[i][j];
                if (TILES[type]) {
                    try {
                        TILES[type].draw(ctx, _sx + j * _td, _sy + i * _td, _td, _td);
                    } catch (err) {
                        console.warn("No draw function for ", type)
                    }
                } else {
                    console.warn("Tile type is not defined ", type);
                }
            }
        }
    }

    return offscreen.transferToImageBitmap();
}

//#endregion




// Start game.
await init(0);
