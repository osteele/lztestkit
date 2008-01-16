/* Copyright 2007-2008 by Oliver Steele.  Released under the MIT License. */

var Mock = {
    configure: function(options) {
        this.options = options;
    },
    create: function(master) {
        return new MockObject(master);
    },
    callback: function(value) {
        return new this.Callback(value);
    },
    expectEvent: function(sender, eventName, expected) {
        var self = this,
            delegate = new LzDelegate({run:run}, 'run', sender, eventName)
        delegate.sender = sender;
        delegate.eventName = eventName;
        delegate.error = 'was not sent';
        this._events.push(delegate);
        function run(value) {
            if (!delegate.error)
                return;
            delegate.error = 'was called, but with the wrong arguments';
            if (typeof expected == 'undefined' && typeof value == 'undefined'
                || Expect.value(expected, value, function(message) {
                    delegate.error = message;
                }))
                delegate.error = null;
        }
    },
    verify: function(testCase) {
        var mocks = this['_registered'] || [];
        delete this.mocks;
        for (var i = 0; i < mocks.length; i++)
            mocks[i].mock.verify(testCase);
    },
    verifyEvents: function(fail) {
        var events = this._events;
        this._events = [];
        for (var i = 0; i < events.length; i++) {
            var delegate = events[i];
            delegate.unregisterAll();
            if (delegate.error)
                fail.apply(null, [delegate.sender+'.'+delegate.eventName+':']
                           .concat(delegate.error));
        }
    },
    // private:
    _register: function(mock) {
        (this._registered = this['_registered'] || []).push(mock);
    },
    _events: [],
    Callback: function(value) {
        this.exec = function(fn) {
            if (fn instanceof Function)
                this['async']
                ? setTimeout(function() {fn.call(null, value)}, 10)
                : fn.call(null, value);
        }
    },
    _combineAdjacentStrings: function(array) {
        var result = [],
            previous = null;
        for (var i = 0; i < array.length; i++) {
            var item = array[i];
            if (typeof item == 'string' && typeof previous == 'string')
                result[result.length-1] += ' ' + item;
            else
                result[result.length] = previous = item;
        }
        return result;
    }
}


function MockObject(master) {
    var self = this,
        expector = {},
        expectations = [],
        stubs = {},
        error = false,
        errors = [];
    Mock._register(this);
    addMethods(master);
    typeof master == 'function' && addMethods(new master);
    var mock = this.mock = {expects: expector, verify: verify, testCase: null};
    this['expects'] || (this.expects = expector);
    this['verify'] || (this.verify = verify);
    this.stubs = this.stub = function(name) {
        var callback = null,
            returnValue = null,
            stub = stubs[name] = {
                applyTo:function(args) {
                    Mock['trace'] && Debug.write('stub', name, args);
                    if (callback)
                        for (var i = 0; i < args.length; i++) {
                            if (typeof args[i] == 'function') {
                                args[i].apply(null, callback);
                                break;
                            }
                        }
                    return typeof returnValue ? undefined : returnValue[0];
                },
                callback:function(value) {
                    callback = Array.slice(arguments, 0);
                },
                calling:function(value) {
                    callback = Array.slice(arguments, 0);
                },
                returning:function(value) {
                    returnValue = [value];
                }
            };
        stub.by = stub.and = stub;
        return stub;
    };
    function addMethods(object) {
        for (var name in object)
            typeof object[name] == 'function' && addMethod(name);
    }
    function addMethod(name) {
        self[name] = function() {
            Mock['trace'] && Debug.write('call', name, arguments);
            // stop checking if we've already had an error
            if (error) return;
            var stub = stubs[name];
            // if there's no expectation, or this isn't the next
            // expectation, then it's only okay if there's a stub
            if (!expectations.length || expectations[0].name != name) {
                return stub
                    ? stub.applyTo(arguments)
                    : fail(['unexpected call to ', master, '.', name, '()'].
                           join(''));
            }
            var expectation = expectations.shift(),
                actualArgs = arguments;
            Expect.arguments(expectation.arguments, arguments, function() {
                Array.prototype.push.call(arguments, '\n  in call to', name);
                fail.apply(null, Mock._combineAdjacentStrings(arguments));
            });
            for (var ix = 0; ix < arguments.length; ix++)
                if (expectation.arguments[ix] instanceof Mock.Callback)
                    expectation.arguments[ix].exec(arguments[ix]);
            if (stub)
                return stub.applyTo(arguments);
            return expectation.value;
        };
        expector[name] = function() {
            Mock['trace'] && Debug.write('expect', name, arguments);
            var options = {},
                expectation = {
                    name: name,
                    arguments: Array.slice(arguments, 0),
                    value: null
                };
            expectations.push(expectation);

            return HopKit.make(function(define) {
                define('calls', calls),
                define('returns', returns);
                define.alias('calls.back', 'calls');
                define.empty('and');
                define.modifier.dictionary(options);
                define.modifier('eventually');
            });

            function calls(pos, value) {
                if (arguments.length < 2) {
                    var args = expectation.arguments,
                        len = args.length;
                    value = pos;
                    for (var i = 0; i < len; i++)
                        if (args[i] == Function) {
                            pos = i;
                            break;
                        }
                }
                var cb = expectation.arguments[pos] = Mock.callback(value);
                cb.async = options.eventually;
            };
            function returns(value) {
                expectation.value = value;
            }
        }
    }
    function fail() {
        Debug.error.apply(Debug, arguments);
        var testCase = mock.testCase;
        Debug.write(testCase);
        if (testCase)
            testCase.fail.call(testCase, arguments.join(' '));
        else
            errors.push(Array.slice(arguments, 0));
        error = true;
    }
    function verify(testcase) {
        expectations.length &&
            fail(['expected call to ', master, '.', expectations[0].name,
                  '(); didn\'t happen'].join(''));
        if (arguments.length) {
            for (var ix = 0; ix < errors.length; ix++)
                testcase.fail(errors[ix].join(' '));
            errors.length || testcase.assertTrue(true);
        }
        expectations = [];
        errors = [];
        error = false;
        Mock.verifyEvents(function() {
            fail.apply(null, arguments);
            testcase.fail(Array.slice(arguments, 0).join(' '));
        });
    }
}

var Expect = {
    limit: null,

    _makeContext: function(expected, actual, parent) {
        return {expected: expected,
                actual: actual,
                parent: parent,
                isExpectationContext: true,
                where: null,
                at: function(where) {this.where=where; return this},
                fail:reportError};

        function reportError() {
            var message = ['Values differ'],
                first = true;
                context = this;
            while (true) {
                if (!context['isExpectationContext']) {
                    context.apply(null, message);
                    return false;
                }
                if (!first)
                    message.push('\n  ');
                first = false;
                context.where && message.push('at', context.where);
                message.push('in', context.expected, '; expected', context.actual||undefined);
                context = context.parent;
            }
        }
    },

    arguments: function(expected, actual, context) {
        context = this._makeContext(expected, actual, context);
        if (expected.length != actual.length)
            return context.fail('length == ' + actual.length);
        for (var ix = 0; ix < arguments.length; ix++) {
            var e = expected[ix],
                a = actual[ix];
            if (!this.value(e, a, context.at('position ' + (ix+1))))
                return false;
        }
        return true;
    },

    value: function(expected, actual, context) {
        context = this._makeContext(expected, actual, context);
        if (expected == actual)
            return true;
        if (this.limit != null) {
            if (this.limit <= 0)
                return;
            this.limit -= 1;
            0 && Debug.write('cf', expected, 'and', actual);
        }
        if (expected instanceof Function &&
            (actual instanceof expected || actual === null))
            return true;
        if (expected instanceof Function)
            return context.fail('function');
        if (expected instanceof LzDataElement)
            return this._xml(expected, actual, context);
        if (expected instanceof Mock.Callback) {
            if (!actual || typeof actual == 'function' || actual instanceof LzDelegate)
                return true;
            return context.fail('callback');
        }
        //if (expected.__proto__ != actual.__proto__)
        //    return fail(expected, 'and', actual, 'have different prototypes');
        if (typeof expected == 'object' && typeof actual == 'object') {
            for (var name in expected)
                if (!this.value(expected[name], actual[name],
                                context.at('property ' + name)))
                    return false;
            return true;
        }
        return context.fail();
    },

    _xml: function(expected, actual, context) {
        if (expected.nodeName != actual.nodeName)
            return context.at('nodeName').fail();
        var eattributes = expected['attributes']||{},
            echildren = expected['childNodes']||[];
        for (var aname in eattributes) {
            var evalue = expected.attributes[aname],
                avalue = actual.attributes[aname],
                con = this._makeContext(evalue, avalue, context);
            con.at('attribute ' + aname);
            if (typeof avalue == 'undefined')
                return con.fail();
            if (evalue == '*')
                continue;
            if (evalue.charAt(0) == '{' && evalue.charAt(evalue.length-1) == '}')
                evalue = eval(evalue.substring(1, evalue.length-1));
            switch (evalue) {
            case Number:
                if (typeof avalue != 'number' && parseInt(avalue) != avalue)
                    return con.fail();
                break;
            case String:
                break;
            default:
                if (evalue != avalue)
                    return con.fail();
            }
        }
        var includesText = false;
        for (var ix = 0; ix < echildren.length; ix++) {
            var echild = echildren[ix];
            if (echild instanceof LzDataText) {
                includesText = true;
                continue;
            }
            var cname = echild.nodeName,
                achild = null;
            for (var j = 0; j < actual.childNodes.length; j++) {
                if (actual.childNodes[j]['nodeName'] == cname)
                    achild = achild || actual.childNodes[j];
            }
            if (!achild)
                return context.at('child named ' + cname).fail();
            if (echild['text']) {
                if (echild.text != achild.childNodes[0].data)
                    return context.fail(/*echild.text, achild*/);
            } else
                if (!Expect.value(echild, achild, context))
                    return;
        }
        if (includesText)
            return Expect.value(expected.toString(), actual.toString(), context);
        return true;
    }
}

function mock(object) {
    return Mock.create.apply(Mock, arguments);
}

// OL 3.4 compatibility
Test.addProperty != Object.addProperty
    || (Test.addProperty = function(name, value) {this.prototype[name] = value});

Test.addProperty('mock', function(object) {
    var mock = Mock.create.apply(Mock, arguments);
    mock.mock.testCase = this;
    return mock;
});

Test.addProperty('mock', function(object) {
    var mock = Mock.create.apply(Mock, arguments);
    mock.mock.testCase = this;
    return mock;
});


/*
 * JavaScript extensions
 */

Array['slice'] || (Array.slice = (function() {
    var slice = Array.prototype.slice;
    return function(array) {
        return slice.apply(array, slice.call(arguments, 1));
    }
})());
