import DIMENSIONS from "../dimensions.mjs";


// These are some local aliases for making the drawImage functioncall a bit easier to mentaly parse. 
// I am using _ to denote that these are aliases.
const _td = DIMENSIONS.tileDimension;
const _sx = DIMENSIONS.startX;
const _sy = DIMENSIONS.startY;

// In our code we should not be testing for hardcoded values like "Z", we should thest for abstractions like zombie.
const COMPONENTS = {
    zombie: "Z",
    key: "K",
    potion: "P",
    door: "D",
    trap: "R"
}

function createComponent(data) {

    // Everything that is added the screen should conceptualy be a component 
    // This just implies that they have a symbole, row and col attribute

    return {
        symbole: data[0].trim(),
        row: Number.parseInt(data[1]),
        col: Number.parseInt(data[2])
    }

}

function draw(ctx, comp, tileSett, tr, tc) {
    // Where the sprite is to be drawn on screen.
    let y = comp.row * _td + _sx;
    let x = comp.col * _td + _sy;
    // Where the sprite is collected from in the spritesheet.
    let sx = (tr * tileSett.dim) + tileSett.offsetX;
    let sy = (tc * tileSett.dim) + tileSett.offsetY;
    //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    ctx.drawImage(tileSett.image, sx, sy, tileSett.dim, tileSett.dim, x, y, _td, _td);
}

const Component = {
    ids: COMPONENTS,
    createComponent,
    draw
}

export default Component
