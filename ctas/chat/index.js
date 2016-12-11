var CTA = require('../cta'),
    howler = require('howler');

var Chat = CTA.generate(function Chat(options) {
    var _ = this;

    options = {
        cta: options,
        api: options.api,
        marketing: options.marketing,
        realTime: options.realTime,
        data: {
            showInteractions: false,
            convo: options.api.user.convo
        },
        template: require('./index.html'),
        partials: {
            interactions: require('./interactions.html'),
            prompter: require('./prompter.html'),
        },
        transforms: {
            truncate: function truncate(str, length) {
                if (!str) return '';
                if (str.length < length) return str;
                return str.slice(0, length) + '...';
            },
            lastReceivedMessage: function lastReceivedMessage(events) {
                events = events.filter(function(e) {
                    return e.data.action === 'message' && e.data.from !== 'visitor';
                });

                if (!events.length) return;

                return events[events.length - 1];
            },
        },
        interactions: {
            toggleInteractions: {
                event: 'click',
                target: '[data-toggle-interactions]',
                action: function action(e, $el) {
                    var _ = this;
                    _.set('inited', true);
                    _.set('showInteractions', !_.get('showInteractions'));
                    _.scrollMessages();
                    _.$(_.$element).find('textarea').trigger('focus');
                    return false;
                },
            },
            sendMessage: {
                event: 'submit',
                target: 'form[data-send-message]',
                action: function action(e, $el) {
                    var _ = this,
                        $textarea = $el.find('textarea'),
                        body = $textarea.val().trim(),
                        thing = {
                            model: 'event',
                            data: {
                                action: 'message',
                                message: {
                                    body: body
                                },
                                convo: _.get('convo.id'),
                                from: 'visitor'
                            },
                            _publish: { pusher: true }
                        };

                    if (!body.length) return false;

                    $textarea.val('');

                    _.api.post('/things', { thing: thing }, function() { });
                    _.addMessage(thing);

                    return false;
                },
            },
            enterPress: {
                event: 'keypress',
                target: 'textarea',
                action: function action(e, $el) {
                    if ((e.keyCode ? e.keyCode : e.which) !== 13) return;
                    $el.closest('form').trigger('submit');
                    return false;
                },
            }
        }
    };

    CTA.call(_, options);

    _.defineProperties({
        bell: new howler.Howl({
            autoplay: false,
            src: [
                _.marketing.assetsUrl + '/audio/pling.ogg',
                _.marketing.assetsUrl + '/audio/pling.mp3',
                _.marketing.assetsUrl + '/audio/pling.wav'
            ]
        })
    });

    _.realTime.connect(function() {
        _.binder = _.binder || _.realTime.channel.bind('event', function(e) {
            if (e.data.action === 'message' && e.data.from !== 'visitor') {
                var $bubble = _.$(_.$element).find('.prompter .bubble');

                _.addMessage(e);
                _.bell.stop()
                _.bell.play();

                $bubble.hide().removeClass('animated bounceIn');

                setTimeout(function() {
                    $bubble.show().addClass('animated bounceIn');
                }, 20);
            }
        });
    });
});

Chat.definePrototype({
    addMessage: function addMessage(msg) {
        var _ = this;
        _.get('convo.events').push(msg);
        _.update();
        _.scrollMessages();
    },
    scrollMessages: function scrollMessages() {
        var _ = this,
            $messages = _.$(_.$element).find('.interactions .messages');

        $messages.scrollTop( $messages[0].scrollHeight );
    }
});

module.exports = Chat;
