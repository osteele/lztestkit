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

TestCase.addProperty('captureEvent', function(sender, eventName) {
	var delegate = new LzDelegate({run:function() {
        holder.called = true;
	    holder.value = arguments[0];
	}}, 'run', sender, eventName),
	holder = {called:true, unregister:function(){delegate.unregisterAll()}};
	return holder;
});

TestCase.prototype.expect.event = function(sender, eventName) {
    Mock.exectEvent(sender, eventName);
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
        }),
        define('contain', function(item) {
            options.not
                ? testCase.assertNotContains(value, item)
                : testCase.assertContains(value, item);
        }),
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
        define('a', function(klassOrType) {
            var result = typeof value == klassOrType || value instanceof klassOrType;
            options.not
                ? testCase.assertFalse(result, klassOrType)
                : testCase.assertTrue(result, klassOrType);
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
