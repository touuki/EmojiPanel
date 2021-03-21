const fsPromises = require('fs').promises
const path = require('path')
const gm = require('gm')
const crypto = require('crypto')
const joypixels = require('emoji-toolkit')

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
        if (emoji.category in categoriesObj && !emoji.code_points.diversity_parent) {
            let imgPath = pack.getImgPath(emoji.code_points.fully_qualified)
            try {
                await fsPromises.access(imgPath)
            } catch (error) {
                if (emoji.code_points.fully_qualified.indexOf('-fe0f') != -1) {
                    imgPath = pack.getImgPath(emoji.code_points.fully_qualified.replace('-fe0f', ''))
                    try {
                        await fsPromises.access(imgPath)
                    } catch (error) {
                        continue
                    }
                } else {
                    continue
                }
            }
            const position = [pack.spriteSize * xIndex, pack.spriteSize * yIndex]
            img.in('-page', `+${position[0]}+${position[1]}`, imgPath)
            categoriesObj[emoji.category].emojis.push({ char: joypixels.convert(emoji.code_points.fully_qualified), position })
            ++xIndex >= pack.numPerLine && (xIndex = 0, yIndex++)
        }
    }

    pack.categories = categories

    await fsPromises.writeFile(path.join(__dirname, '..', `dist/${pack.name}.json`), JSON.stringify(pack))
    const md5sum = crypto.createHash('md5')
    md5sum.update(img._in.join(' '))
    const hash = md5sum.digest('hex').substr(0, 8)
    const pngPath = path.join(__dirname, '..', `dist/${pack.name}.${hash}.png`)
    try {
        await fsPromises.access(pngPath)
    } catch (error) {
        await new Promise((resolve, reject) => img.mosaic().write(pngPath,
            function (err) {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            }
        ))
        await fsPromises.copyFile(pngPath, path.join(__dirname, '..', `docs/${pack.name}.${hash}.png`))
    }
};


const build = async () => {
    for (const pack of packs) {
        await buildPack(pack)
    }
};

build().catch(err => console.error(err));
