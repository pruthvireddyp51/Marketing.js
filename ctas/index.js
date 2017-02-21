var Generator = require('generate-js');

var CTAs = Generator.generate(function CTAs() {});

CTAs.definePrototype({
    Chat: require('./chat'),
    Wizard: require('./wizard')
});

module.exports = CTAs;