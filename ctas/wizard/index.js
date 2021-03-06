/*
    A CTA that builds a sequence of related forms
*/

var CTA = require('../cta'),
    CONFIG = {
        template: require('./template.html'),
        partials: {
            form: require('./form.html'),
            field: require('./field.html')
        },
        transforms: {
            placeholder: function placeholder(a, b) {
                return typeof a !== 'undefined' ? a : b;
            },
        }
    };

var Wizard = CTA.createElement(CONFIG, function Wizard(options) {
    var _ = this;

    options = _.merge({
        type: 'wizard',
        closable: true
    }, options);

    CTA.call(_, options);

    _.defineProperties({
        forms: _.get('cta.forms') || {},
        response: {}
    });

    _.changeForm( _.initialForm );
});

Wizard.definePrototype({
    registerEvents: function registerEvents($el) {
        var _ = this;

        CTA.prototype.registerEvents.call(_, $el);

        $el.on('submit', 'form', function() {
            var form = this;

            (form.data('form').validate || _.validateForm).call(_, form, function(err) {
                var data = _.serializeForm( form );
                _.api.track('submit', data, _);
                _.set('currentForm.response', data );
                _.emit('submit', data, _.get('currentForm'));
                _.changeForm( +1 );
            });

            return false;
        });

        $el.on('click', '.close', function() {
            _.fadeOut();
            return false;
        });

        $el.on('click', '[data-cancel]', function() {
            _.emit('cancel', _.get('currentForm'));
            return false;
        });
    }
});

Wizard.definePrototype({
    validateForm: function validateForm(form, done) {
        done(undefined, form);
    }
});

Wizard.definePrototype({
    changeForm: function changeForm(formOrKeyOrDelta) {
        var _ = this,
            form;

        if (typeof _.forms === 'object' && !!Object.keys(_.forms).length) {
            if (typeof formOrKeyOrDelta === 'string') {
                form = _.forms[formOrKeyOrDelta];
            } else if (typeof formOrKeyOrDelta === 'number') {
                var keys = Object.keys(_.forms),
                    nextIndex = findCurrentIndex(_.forms, _.get('currentForm')) + formOrKeyOrDelta;

                form = _.forms[ keys[nextIndex] ];
            } else if (formOrKeyOrDelta === 'object') {
                form = formOrKeyOrDelta;
            }
        } else if (typeof formOrKeyOrDelta === 'object') {
            form = formOrKeyOrDelta;
        }

        if (typeof formOrKeyOrDelta === 'undefined' && !form) {
            form = _.forms[Object.keys(_.forms)[0]];
        }

        if (!form) {
            if (_.debug) console.warn('No form supplied.');
            if (_.get('currentForm')) _.fadeOut();
            return false;
        }

        form.id = form.id || parseInt(Date.now() * Math.random());

        _.set('currentForm', form);

        if (form.redirect) {
            window.location.href = form.redirect;
        }

        return form;
    },
});

function findCurrentIndex(forms, form) {
    if (forms instanceof Array) {
        return forms.indexOf(form);
    }

    var i = 0;

    for (var key in forms) {
        if (forms[key] === form) {
            return i;
        }

        i++;
    }
}

module.exports = Wizard;
