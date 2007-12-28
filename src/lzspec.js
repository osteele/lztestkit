/* Copyright 2007 by Oliver Steele.  Released under the MIT License. */

JSSpec.define('send', function(sender, name) {
    Mock.expectEvent.apply(Mock, arguments);
});

TestCase.addProperty('calling', function(target, name) {
    return JSSpec.calling.apply(JSSpec, arguments).set('testCase', this);
});

TestCase.addProperty('constructing', function(klass) {
    var args = Array.prototype.slice.call(arguments, 1);
    return this.calling(makeConstructor.apply(klass, args));
    function makeConstructor() {
        switch (arguments.length) {
        case 0:
            return function() {return new klass}
            break;
        case 1:
            return function() {new klass(arguments[0])}
            break;
        default:
            Debug.error('unimplemented constructor arity:', arguments.length-1)
        }
    }
});

TestCase.addProperty('expect', function(value) {
    return new ExpectValue(value, this);
});

function ExpectValue(value, testCase) {
    this.value = value;
    this.testCase = testCase;
}

ExpectValue.prototype = {
    property: function(propertyName) {
        var actual = this.value,
            testCase = this.testCase;
        var chain = {
            equal: function(value) {
                testCase.assertEquals(value, actual[propertyName], propertyName);
            }
        }
        chain.should = chain;
        return chain;
    },

    properties: function(properties) {
        var value = this.value,
            testCase = this.testCase;
        for (var propertyName in properties)
            testCase.assertEquals(properties[propertyName], value[propertyName], propertyName);
    }
}
