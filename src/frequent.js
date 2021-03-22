class Frequent {
    constructor() {
        try {
            this.list = JSON.parse(localStorage.getItem('EmojiPanel-frequent'));
            this.list.sort((a, b) => b.times - a.times)
        } catch (error) {
            this.list = []
        }
    }

    add(emoji) {
        if (this.list.find(row => row.char == emoji.char && row.times++)) {
            localStorage.setItem('EmojiPanel-frequent', JSON.stringify(this.list));
            return false;
        }

        this.list.push({
            char: emoji.char,
            times: 1
        })
        localStorage.setItem('EmojiPanel-frequent', JSON.stringify(this.list));
        return true;
    }

    findEmoji(row, json) {
        for (const category of json.categories) {
            const result = category.emojis.find(emoji => emoji.char == row.char)
            if (result) {
                return result
            }
        }
        return null
    }
}

export default new Frequent();