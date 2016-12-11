var CustomElement = require('../../remetric-admin/utils/custom-element');

var CTA = CustomElement.generate(function CTA(options) {
    var _ = this,
        cta = options.cta;

    CustomElement.call(_, options);

    _.set('cta', cta);

    _.defineProperties({
        id: 'cta-' + Date.now(),
        api: options.api,
        marketing: options.marketing,
        realTime: options.realTime
    });

    _.$(_.$element).addClass('cta cta-chat cta-position-' + cta.data.position);
    _.$(_.$element).appendTo('body');
    _.$(_.$element).attr('id', _.id);

    if (cta.data.colours) {
        _.$('<style type="text/css">#' + _.id + ' .primary-bg { background: ' + cta.data.colours.primary + '}</style>').insertAfter(_.$element);
    }
});

CTA.definePrototype({
});

module.exports = CTA;
