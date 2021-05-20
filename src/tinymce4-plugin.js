const Create = require('./create');
const Emojis = require('./emojis');
const List = require('./list');
const classnames = require('./classnames');

if(!Array.prototype.find){
  Array.prototype.find = function(callback) {
      return callback && (this.filter(callback)|| [])[0];
  };
}

(function (tinymce) {

  tinymce.PluginManager.add('emojipanel', function (editor) {

    editor.addButton('emoticons', {
      type: 'panelbutton',
      panel: {
        role: 'application',
        autohide: true,
        html: function () {
          this.emojiPanel_options = {
            frequent: true,
            hidden_categories: [],

            sprites_url: editor.settings.emojipanel_sprites_url,

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
          }
          const create = Create(this.emojiPanel_options);

          return create.panel.outerHTML;
        },
        onpostrender: function (e) {
          Emojis.load(this.emojiPanel_options, (err, json) => List(this.emojiPanel_options, this.getEl(), json));
        },
        onclick: function (e) {
          let button = null;
          if (editor.dom.is(e.target, 'button.emoji')) {
            button = e.target;
          } else {
            button = editor.dom.getParent(e.target, 'button.emoji')
          }
          if (button && editor.dom.getParent(button, '.' + this.emojiPanel_options.classnames.results)) {
            editor.insertContent(button.getAttribute('data-char'));
          }
        }
      },
      tooltip: 'Emoticons'
    });
  });

})(window.tinymce);