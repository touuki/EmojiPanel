import Frequent from './frequent';

let json = require('../dist/twemoji.json');
const Emojis = {
    load: options => new Promise((resolve, reject) => {
        if (options.extra_json_url) {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', options.extra_json_url, true);
            xhr.onreadystatechange = () => {
                if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                    json = JSON.parse(xhr.responseText);
                    resolve(json);
                }
            };
            xhr.send();
        } else {
            resolve(json)
        }
    }),
    createEl: (emoji, options) => {
        if (!options.fallback_emoji) {
            const sprite = document.createElement('div');
            sprite.style.height = '20px'
            sprite.style.width = '20px'
            sprite.style['background-image'] = `url("${options.sprites_url}")`;
            sprite.style['background-size'] = `${20 * json.numPerLine}px`;
            sprite.style['background-position'] = `-${emoji.position[0]/json.spriteSize*20}px -${emoji.position[1]/json.spriteSize*20}px`;
            return sprite.outerHTML;
        }

        // Fallback to the emoji char if the pack does not have the sprite, or no pack
        return emoji.char;
    },
    createButton: (emoji, options, emit) => {

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.innerHTML = Emojis.createEl(emoji, options);
        button.classList.add('emoji');
        button.dataset.char = emoji.char;

        if (emit) {
            button.addEventListener('click', () => {
                emit('select', emoji);
                if (options.frequent == true &&
                    Frequent.add(emoji)) {
                    let frequentResults = document.querySelector(`.${options.classnames.frequentResults}`);

                    frequentResults.appendChild(Emojis.createButton(emoji, options, emit));
                    frequentResults.style.display = 'block';
                }

                if (options.editable) {
                    Emojis.write(emoji, options);
                }
            });
        }

        return button;
    },
    write: (emoji, options) => {
        const input = options.editable;
        if (!input) {
            return;
        }

        // Insert the emoji at the end of the text by default
        let offset = input.textContent.length;
        if (input.dataset.offset) {
            // Insert the emoji where the rich editor caret was
            offset = input.dataset.offset;
        }

        // Update the offset to after the inserted emoji
        input.dataset.offset = parseInt(input.dataset.offset, 10) + 1;
    }
};

module.exports = Emojis;
