const fsPromises = require('fs').promises
const path = require('path')
const gm = require('gm')

const packs = [
    {
        name: 'twemoji',
        spriteSize: 72,
        numPerLine: 25,
        getImgPath: codePoint => path.join(__dirname, '..', `twemoji/assets/72x72/${codePoint}.png`)
    }
];

const pathToJoyPixels = path.join(__dirname, '..', 'node_modules/emoji-toolkit')

const buildPack = async (pack) => {
    const categories = require('emoji-toolkit/categories.json')
    const categoriesObj = {}
    for (const category of categories) {
        category.svg = await fsPromises.readFile(path.join(pathToJoyPixels, `extras/category_icons/${category.category}.svg`), 'utf8')
        category.emojis = []
        categoriesObj[category.category] = category
    }
    const emojisObj = require('emoji-toolkit/emoji.json')
    const emojis = Object.values(emojisObj).sort((a, b) => a.order - b.order)
    const img = gm().in('-background', 'transparent')

    let xIndex = 0, yIndex = 0
    for (const emoji of emojis) {
        if (emoji.category in categoriesObj) {
            const imgPath = pack.getImgPath(emoji.code_points.fully_qualified)
            try {
                await fsPromises.access(imgPath)
            } catch (error) {
                continue
            }
            const position = [pack.spriteSize * xIndex, pack.spriteSize * yIndex]
            img.in('-page', `+${position[0]}+${position[1]}`, imgPath)
            categoriesObj[emoji.category].emojis.push({ code_point: emoji.code_points.base, position })
            ++xIndex >= pack.numPerLine && (xIndex = 0, yIndex++)
        }
    }

    await fsPromises.writeFile(path.join(__dirname, '..', `docs/${pack.name}.json`), JSON.stringify(categoriesObj))
    await fsPromises.writeFile(path.join(__dirname, '..', `dist/${pack.name}.json`), JSON.stringify(categoriesObj))
    await new Promise((resolve, reject) => img.mosaic().write(path.join(__dirname, '..', `dist/${pack.name}.png`),
        function (err) {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        }
    ))
    await fsPromises.copyFile(path.join(__dirname, '..', `dist/${pack.name}.png`), path.join(__dirname, '..', `docs/${pack.name}.png`))
};


const build = async () => {
    for (const pack of packs) {
        await buildPack(pack)
    }
    await fsPromises.copyFile(path.join(pathToJoyPixels, 'emoji.json'), path.join(__dirname, '..', 'docs/emoji.json'))
    await fsPromises.copyFile(path.join(pathToJoyPixels, 'emoji.json'), path.join(__dirname, '..', 'dist/emoji.json'))
};

build().catch(err => console.error(err));
