/*
    A CTA that builds a social sharing widget
*/

var CTA = require('../cta'),
    loadExternal = require('load-external'),
    LazyLoader = require('../cta/lib/lazy-loader'),
    lazyLoader = new LazyLoader(),
    CONFIG = {
        template: require('./index.html'),
        transforms: {
            findNetwork: function findNetwork(key, data) {
                if (typeof data === 'string') {
                    key = data;
                }

                return {
                    href: 'https://' + key + '.com',
                    name: key,
                    icon: key
                };
            },
        }
    };

lazyLoader.register('font-awesome', function(done) {
    loadExternal('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css', done);
});

var Social = CTA.createElement(CONFIG, function Social(options) {
    var _ = this;

    CTA.call(_, options);

    _.set('iconPrefix', options.iconPrefix || 'fa fa-');
    _.set('networks', typeof _.get('cta.networks') === 'object' ? _.get('cta.networks') : {});
});

Social.definePrototype({
    ready: function ready() {
        var _ = this;

        lazyLoader.load('font-awesome', function() {
            CTA.prototype.ready.call(_);
        });

        return _;
    },

    registerEvents: function registerEvents($el) {
        var _ = this;

        CTA.prototype.registerEvents.call(_, $el);

        // $el.on('submit', 'form', function() {
        //     var form = this;

        //     (form.data('form').validate || _.validateForm).call(_, form, function(err) {
        //         _.set('currentForm.response', _.serialize( form ) );
        //         _.changeForm( +1 );
        //     });

        //     return false;
        // });
    }
});

module.exports = Social;