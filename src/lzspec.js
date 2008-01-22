/* Copyright 2007-2008 by Oliver Steele.  Released under the MIT License. */

JSSpec.define('send', function(sender, name) {
    Mock.expectEvent.apply(Mock, arguments);
});

// OL 3.4 compatibility
Test.addProperty != Object.addProperty
    || (Test.addProperty = function(name, value) {this.prototype[name] = value});

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
    return ExpectValue(value, this);
});

TestCase.addProperty('value', function(value) {
    return ExpectValue(value, this);
});

TestCase.prototype.expect.event = function(sender, eventName) {
    Mock.exectEvent(sender, eventName);
}

function xExpectValue(value, testCase) {
    this.value = value;
    this.testCase = testCase;
    this.should = this.be = this.is = this;
}

xExpectValue.prototype = {
    a: function(klass) {
        this.testCase.assertTrue(this.value instanceof klass, klass);
    },

    an: function(klass) {
        return this.a.apply(this, arguments);
    },

    property: function(propertyName) {
        var self = this,
            actual = this.value;
        var chain = {
            equal: function(value) {
                var testCase = self.testCase;
                //testCase.assertEquals(value, actual[propertyName], propertyName);
                var failed = false;
                Expect.value(value, actual[propertyName], function() {
                    Array.prototype.push.call(arguments, '\n   at property \''
                                              + propertyName + '\' of',
                                             actual);
                    arguments = Mock._combineAdjacentStrings(arguments);
                    Debug.error.apply(Debug, arguments);
                    testCase.fail.call(testCase, arguments.join(''));
                    failed = true;
                })
                failed || testCase.assertTrue(true);
                return chain;
            }
        }
        chain.be = chain.equal;
        chain.should = chain.and = chain;
        return chain;
    },

    properties: function(properties) {
        var value = this.value,
            testCase = this.testCase;
        for (var propertyName in properties) {
            var expect = properties[propertyName],
                actual = value[propertyName];
            if (expect instanceof Date && expect/1 == actual/1)
                expect = actual;
            if (expect instanceof Array && actual instanceof Array
                && equalArrays(expect, actual))
                expect = actual;
            testCase.assertEquals(expect, actual, propertyName);
        }

        function equalArrays(a, b) {
            if (a.length != b.length)
                return false;
            for (var ix = 0; ix < a.length; ix++)
                if (a[ix] != b[ix])
                    return false;
            return true;
        }
    }
}

function ExpectValue(value, testCase, context) {
    var options = {};
    if (arguments.length < 3)
        context = [];
    return Fluently.make(function(define) {
        define.synonym('should');
        define.synonym('be');
        define.modifier.dictionary(options);
        define.modifier('not');
        define('and').sets(options, 'not').to(false);
        define('equal', function(expected) {
            if (options.not) {
                return Expect.value(expected, value, function(){})
                    ? fail(value, 'should not equal', expected)
                    : success();
            } else {
                Expect.value(expected,
                             typeof value == 'undefined' ? undefined : value,
                             fail)
                    && success();
            }
        });
        define('include', function(properties) {
            var failed = false;
            for (var name in properties) {
                if (value[name] == undefined)
                    f(value, 'does not include', name);
                else
                    Expect.value(properties[name], value[name], function() {
                        arguments = Array.prototype.concat.call(arguments,
                                                                'at', name);
                        f.apply(null, arguments);
                    });
            }
            if (options.not)
                failed
                ? success()
                : fail(value, 'should not include', properties);
            function f() {
                failed = true;
                options.not || fail.apply(null, arguments);
            }
        });
        define('property', function(propertyName) {
            return ExpectValue(value[propertyName], testCase,
                               ['property', propertyName, context ? ' in ' : ''].
                               concat(context));
        });
        define('a', function(klass) {
            options.not
                ? testCase.assertFalse(value instanceof klass, klass)
                : testCase.assertTrue(value instanceof klass, klass);
        });
        define.synonym('an', 'a');
    });
    function fail() {
        if (context.length)
            arguments = Array.prototype.concat.call(arguments, context);
        arguments = Mock._combineAdjacentStrings(arguments);
        Debug.error.apply(Debug, arguments);
        testCase && testCase.fail.call(testCase, arguments.join(' '));
    }
    function success() {
        testCase.assertTrue(true);
    }
}
