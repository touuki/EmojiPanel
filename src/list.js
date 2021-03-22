import Frequent from './frequent';

const Emojis = require('./emojis');

const list = (options, panel, json, emit) => {
    const categories = panel.querySelector('.' + options.classnames.categories);
    const searchInput = panel.querySelector('.' + options.classnames.searchInput);
    const searchTitle = panel.querySelector('.' + options.classnames.searchTitle);
    const frequentResults = panel.querySelector('.' + options.classnames.frequentResults);
    const results = panel.querySelector('.' + options.classnames.results);
    const emptyState = panel.querySelector('.' + options.classnames.noResults);
    const footer = panel.querySelector('.' + options.classnames.footer);

    // Update the category links
    while (categories.firstChild) {
        categories.removeChild(categories.firstChild);
    }

    if (options.frequent == true) {
        const categoryLink = document.createElement('button');
        categoryLink.classList.add(options.classnames.emoji);
        categoryLink.setAttribute('title', options.locale.frequent);
        categoryLink.innerHTML = json.frequent_svg;
        categoryLink.addEventListener('click', e => {
            const title = options.container.querySelector('.' + options.classnames.frequentTitle);
            results.scrollTop = title.offsetTop - results.offsetTop;
        });
        categories.appendChild(categoryLink);
    }

    json.categories.forEach(category => {

        // Don't show the link to a hidden category
        if (options.hidden_categories.indexOf(category.category) > -1) {
            return;
        }

        const categoryLink = document.createElement('button');
        categoryLink.classList.add(options.classnames.emoji);
        categoryLink.setAttribute('title', category.category_label);
        categoryLink.innerHTML = category.svg;
        categoryLink.addEventListener('click', e => {
            const title = options.container.querySelector('#' + category.category);
            results.scrollTop = title.offsetTop - results.offsetTop;
        });
        categories.appendChild(categoryLink);
    });

    // Handle the search input
    if (options.search == true) {
        searchInput.addEventListener('input', e => {
            const emojis = results.querySelectorAll('.' + options.classnames.emoji);
            const titles = results.querySelectorAll('.' + options.classnames.category);

            const value = e.target.value.replace(/-/g, '').toLowerCase();
            if (value.length > 0) {
                const matched = [];
                json.categories.forEach(category => {
                    category.emojis.forEach(emoji => {
                        const keywordMatch = emoji.keywords.find(keyword => {
                            keyword = keyword.replace(/-/g, '').toLowerCase();
                            return keyword.indexOf(value) > -1;
                        });
                        if (keywordMatch) {
                            matched.push(emoji.char);
                        }
                    });
                });
                if (matched.length == 0) {
                    emptyState.style.display = 'block';
                } else {
                    emptyState.style.display = 'none';
                }

                emit('search', { value, matched });

                emojis.forEach(emoji => {
                    if (matched.indexOf(emoji.dataset.char) == -1) {
                        emoji.style.display = 'none';
                    } else {
                        emoji.style.display = 'inline-block';
                    }
                });
                titles.forEach(title => {
                    title.style.display = 'none';
                });
                searchTitle.style.display = 'block';

                if (options.frequent == true) {
                    frequentResults.style.display = 'none';
                }
            } else {
                emojis.forEach(emoji => {
                    emoji.style.display = 'inline-block';
                });
                titles.forEach(title => {
                    title.style.display = 'block';
                });
                searchTitle.style.display = 'none';
                emptyState.style.display = 'none';

                if (options.frequent == true) {
                    frequentResults.style.display = 'block';
                }
            }

            results.scrollTop = 0;
        });
    }

    // Fill the results with emojis
    results.querySelector('.EmojiPanel-loading').remove();

    if (options.frequent == true) {
        frequentResults.style.display = 'block';

        let num = Frequent.list.length;
        if (options.frequent_max_num && num > options.frequent_max_num) {
            num = options.frequent_max_num
        }
        for (let i = 0; i < num; i++) {
            const emoji = Frequent.findEmoji(Frequent.list[i], json)
            if (emoji) {
                frequentResults.appendChild(Emojis.createButton(emoji, options, emit));
            }
        }

        results.appendChild(frequentResults);
    }

    json.categories.forEach(category => {
        // Don't show any hidden categories
        if (options.hidden_categories.indexOf(category.name) > -1) {
            return;
        }

        // Create the category title
        const title = document.createElement('p');
        title.classList.add(options.classnames.category);
        title.id = category.category;
        title.innerHTML = category.category_label;
        results.appendChild(title);

        // Create the emoji buttons
        category.emojis.forEach(emoji => results.appendChild(Emojis.createButton(emoji, options, emit)));
    });
};

module.exports = list;
