
// This file shure does contain a lot of duplication, and depending on changes that could be done other places in the code
// we must ask ourselfs if most of this file is nessesary?

const SPRITES = {
    /* 
        The images is to be found in the assets folder
        They are available via the html document (look towards the end of the html doc and you will find them)
        The offset and dims are nessesary because the artists have chosen diffrent dimentions for their tiles, and diffrent starting locations
     */
    base: { image: document.querySelector('[data-sprite="base"]'), offsetX: 10, offsetY: 10, dim: 10 },
    heros: { image: document.querySelector('[data-sprite="heros"]'), offsetX: 0, offsetY: 0, dim: 16 },
    monsters: { image: document.querySelector('[data-sprite="monsters"]'), offsetX: 0, offsetY: 0, dim: 16 },
    items: { image: document.querySelector('[data-sprite="items"]'), offsetX: 0, offsetY: 0, dim: 16 },
}


const TILES = {
    ".": {
        symbole: ".", draw: (ctx, x, y, dim) => {
            // Wonder what that "large" array is about, why so many 4 
            let rows = [1, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 6];
            let col = 2
            let row = rows[Math.floor(Math.random() * rows.length)];
            let sx = (col * SPRITES.base.dim) + SPRITES.base.offsetX;
            let sy = (row * SPRITES.base.dim) + SPRITES.base.offsetY;
            //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
            ctx.drawImage(SPRITES.base.image, sx, sy, SPRITES.base.dim, SPRITES.base.dim, x, y, dim, dim);
        }
    },
    "0": {
        symbole: "0", draw: (ctx, x, y, dim) => {

            let columns = [12, 12, 12, 13];
            let col = columns[Math.floor(Math.random() * columns.length)]
            let row = 5
            let sx = (col * SPRITES.base.dim) + SPRITES.base.offsetX;
            let sy = (row * SPRITES.base.dim) + SPRITES.base.offsetY;
            //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
            ctx.drawImage(SPRITES.base.image, sx, sy, SPRITES.base.dim, SPRITES.base.dim, x, y, dim, dim);
        }
    },
    "1": {
        symbole: "1", draw: (ctx, x, y, dim) => {

            let columns = [10, 10, 11];
            let col = columns[Math.floor(Math.random() * columns.length)]
            let row = 9
            let sx = (col * SPRITES.base.dim) + SPRITES.base.offsetX;
            let sy = (row * SPRITES.base.dim) + SPRITES.base.offsetY;
            //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
            ctx.drawImage(SPRITES.base.image, sx, sy, SPRITES.base.dim, SPRITES.base.dim, x, y, dim, dim);
        }
    },
    "D": {
        symbole: "D", draw: (ctx, x, y, dim) => {

            let columns = [6];
            let col = columns[Math.floor(Math.random() * columns.length)]
            let row = 0
            let sx = (col * SPRITES.base.dim) + SPRITES.base.offsetX;
            let sy = (row * SPRITES.base.dim) + SPRITES.base.offsetY;
            //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
            ctx.drawImage(SPRITES.base.image, sx, sy, SPRITES.base.dim, SPRITES.base.dim, x, y, dim, dim);
        }
    },
    "K": {
        symbole: "K", draw: (ctx, x, y, dim) => {
            let col = 0;
            let row = 6;
            let sx = (col * SPRITES.items.dim) + SPRITES.items.offsetX;
            let sy = (row * SPRITES.items.dim) + SPRITES.items.offsetY;
            //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
            ctx.drawImage(SPRITES.items.image, sx, sy, SPRITES.items.dim, SPRITES.items.dim, x, y, dim * 1.1, dim * 1.1);
        }
    },
    "Z": {
        // Why is there a zombie in this file? Was there not a zombie.mjs file floating about?
        symbole: "Z", draw: (ctx, x, y, dim) => {
            let col = 0;
            let row = 0;
            let sx = (col * SPRITES.monsters.dim) + SPRITES.monsters.offsetX;
            let sy = (row * SPRITES.monsters.dim) + SPRITES.monsters.offsetY;
            //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
            ctx.drawImage(SPRITES.monsters.image, sx, sy, SPRITES.monsters.dim, SPRITES.monsters.dim, x, y, dim, dim);
        }
    },
    "F": { // Healer
        symbole: "F", draw: (ctx, x, y, dim) => {
            let col = 1;
            let row = 0;
            let sx = (col * SPRITES.monsters.dim) + SPRITES.monsters.offsetX;
            let sy = (row * SPRITES.monsters.dim) + SPRITES.monsters.offsetY;
            ctx.drawImage(SPRITES.monsters.image, sx, sy, SPRITES.monsters.dim, SPRITES.monsters.dim, x, y, dim, dim);
        }
    },
    "G": { // Key Thief
        symbole: "G", draw: (ctx, x, y, dim) => {
            let col = 2;
            let row = 0;
            let sx = (col * SPRITES.monsters.dim) + SPRITES.monsters.offsetX;
            let sy = (row * SPRITES.monsters.dim) + SPRITES.monsters.offsetY;
            ctx.drawImage(SPRITES.monsters.image, sx, sy, SPRITES.monsters.dim, SPRITES.monsters.dim, x, y, dim, dim);
        }
    },
    "R": {
        symbole: "R",
        draw: (ctx, x, y, dim) => {
            let col = 3;
            let row = 0;
            let sx = (col * SPRITES.items.dim) + SPRITES.items.offsetX;
            let sy = (row * SPRITES.items.dim) + SPRITES.items.offsetY;
            ctx.drawImage(SPRITES.items.image, sx, sy, SPRITES.items.dim, SPRITES.items.dim, x, y, dim, dim);
        }
    }
}

const TILE_KEYS = Object.keys(TILES)

export { TILES, TILE_KEYS, SPRITES }