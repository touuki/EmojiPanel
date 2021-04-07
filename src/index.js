const Create = require('./create');
const Emojis = require('./emojis');
const List = require('./list');
const classnames = require('./classnames');

const defaults = {
    search: false, // Not implement yet
    frequent: true,
    hidden_categories: [],

    //sprites_url: '/twemoji.png',
    extra_json_url: false,

    tether: true,
    placement: 'bottom',

    frequent_max_num: false,

    locale: {
        add: 'Add emoji',
        frequent: 'Frequently used',
        loading: 'Loading...',
        no_results: 'No results',
        search: 'Search',
        search_results: 'Search results'
    },
    icons: {
        search: '<span class="fas fa-search"></span>'
    },
    classnames
};

export default class EmojiPanel {
    constructor(options) {
        this.options = Object.assign({}, defaults, options);

        const els = ['container', 'trigger', 'editable'];
        els.forEach(el => {
            if (typeof this.options[el] == 'string') {
                this.options[el] = document.querySelector(this.options[el]);
            }
        });

        if (this.options.trigger) {
            this.options.trigger.addEventListener('click', this.init.bind(this));
        } else {
            this.init();
        }
    }

    init() {
        if (this._init) {
            return
        }
        this._init = true
        const create = Create(this.options, this.toggle.bind(this));
        this.panel = create.panel;
        this.tether = create.tether;

        Emojis.load(this.options)
            .then(json => {
                List(this.options, this.panel, json);
                if (this.options.trigger) {
                    this.toggle();
                    this.reposition();
                }
            });
    }

    toggle() {
        const open = this.panel.classList.toggle(this.options.classnames.open);
        const searchInput = this.panel.querySelector('.' + this.options.classnames.searchInput);

        if (open && this.options.search && searchInput) {
            searchInput.focus();
        }
    }

    reposition() {
        if (this.tether) {
            this.tether.position();
        }
    }
}

if (typeof window != 'undefined') {
    window.EmojiPanel = EmojiPanel;
}
