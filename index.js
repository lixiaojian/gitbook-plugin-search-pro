var Entities = require('html-entities').AllHtmlEntities;

var Html = new Entities();

// Map of Lunr ref to document
var documentsStore = {};

module.exports = {
    book: {
        assets: './assets',
        js: [
            'jquery.mark.min.js',
            'search.js'
        ],
        css: [
            'search.css'
        ]
    },

    hooks: {
        // Index each page
        'page': function(page) {
            if (this.output.name != 'website' || page.search === false) {
                return page;
            }

            var text;
           
            this.log.debug.ln('index page', page.path);

            text = page.content;
            // Decode HTML
            text = Html.decode(text);
            // Strip HTML tags
            text = text.replace(/(<([^>]+)>)/ig, '');
            text = text.replace(/[\n ]+/g, ' ');
            var keywords = [];
            if (page.search) {
                keywords = page.search.keywords || [];
            }

            // Add to index
            var doc = {
                url: this.output.toURL(page.path),
                title: page.title,
                summary: page.description,
                keywords: keywords.join(' '),
                body: text
            };

            documentsStore[doc.url] = doc;

            return page;
        },

        // Write index to disk
        'finish': function() {
            if (this.output.name != 'website') return;
            //这里可以自定义搜索文件的名称
            var fileCategory =  this.config.get('pluginsConfig')['search-lixj']['fileCategoey'] || 'plus';
            var fileName = 'search_'+ fileCategory +'_index.json';
            return this.output.writeFile(fileName, JSON.stringify(documentsStore));
        }
    }
};