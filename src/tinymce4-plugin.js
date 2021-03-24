const Create = require('./create');
const Emojis = require('./emojis');
const List = require('./list');
const classnames = require('./classnames');

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
        onPostRender: function (e) {
          Emojis.load(this.emojiPanel_options)
            .then(json => List(this.emojiPanel_options, this.getEl(), json));
        }
      },
      tooltip: 'Emoticons'
    });
  });

})(window.tinymce);