import Frequent from './frequent';

let json = require('../dist/twemoji.json');
const Emojis = {
    load: function(options, callback) {
        if (options.extra_json_url) {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', options.extra_json_url, true);
            xhr.onreadystatechange = () => {
                if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                    json = JSON.parse(xhr.responseText);
                    callback(null, json);
                }
            };
            xhr.send();
        } else {
            callback(null, json)
        }
    },
    createEl: (emoji, options) => {
        if (options.sprites_url) {
            const sprite = document.createElement('div');
            sprite.style.height = '20px'
            sprite.style.width = '20px'
            sprite.style['background-image'] = `url("${options.sprites_url}")`;
            sprite.style['background-size'] = `${20 * json.numPerLine}px`;
            sprite.style['background-position'] = `-${emoji.position[0] / json.spriteSize * 20}px -${emoji.position[1] / json.spriteSize * 20}px`;
            return sprite.outerHTML;
        }

        // Fallback to the emoji char if the pack does not have the sprite, or no pack
        return emoji.char;
    },
    createButton: (emoji, options) => {

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.innerHTML = Emojis.createEl(emoji, options);
        button.classList.add('emoji');
        button.dataset.char = emoji.char;

        button.addEventListener('click', () => {
            if (options.frequent == true &&
                Frequent.add(emoji)) {
                let frequentResults = document.querySelector(`.${options.classnames.frequentResults}`);

                frequentResults.appendChild(Emojis.createButton(emoji, options));
            }

            if (options.editable) {
                Emojis.write(emoji, options);
            }
        });

        return button;
    },
    write: (emoji, options) => {
        const input = options.editable;

        if (typeof input.selectionStart !== 'undefined') {
            const selectionStart = input.selectionStart;
            const selectionEnd = input.selectionEnd;
            input.value = input.value.substring(0, selectionStart)
                + emoji.char + input.value.substring(selectionEnd, input.value.length);
            input.focus();
            input.selectionStart = selectionStart + emoji.char.length;
            input.selectionEnd = selectionStart + emoji.char.length;
        } else {
            input.value += emoji.char;
            input.focus();
        }
    }
};

module.exports = Emojis;
