/* Copyright 2007 by Oliver Steele.  Available under the MIT License. */

// OL 3.4 compatibility
Test.addProperty != Object.addProperty
    || (Test.addProperty = function(name, value) {this.prototype[name] = value});


/*
 * New assertions
 */

Test.addProperty('assertNotEquals', function(expected, actual, message) {
    if (expected == actual) {
        this.fail(this.format(jsTrue(message) ? message :  "==",
                              expected, actual));
    }
    canvas.setAttribute('runTests', canvas.runTests + 1)
});

Test.addProperty('assertContains', function(collection, value, message) {
    if (!Array.contains(collection, value)) {
        this.fail(this.format(jsTrue(message) ? message :  "contains",
                              collection, actual));
    }
    canvas.setAttribute('runTests', canvas.runTests + 1)
});

Test.addProperty('assertNotContains', function(collection, value, message) {
    if (Array.contains(collection, value)) {
        this.fail(this.format(jsTrue(message) ? message :  "does not contain",
                              collection, value));
    }
    canvas.setAttribute('runTests', canvas.runTests + 1)
});

Test.addProperty('assertFasterThan', function(expected, actual, message) {
    actual <= expected ||
        this.fail([message || '', message && ': ' || '',
                   actual, "ms not < ", expected, "ms"].join(''));
    canvas.setAttribute('runTests', canvas.runTests + 1)
});


/*
 *
 */

TestSuite.prototype.initSuiteWithoutRestriction =
    TestSuite.prototype.initSuite;

TestSuite.addProperty('initSuite', function() {
    this.initSuiteWithoutRestriction.apply(this, arguments);
    var methodName = global['testCase'] || null;
    if (!methodName)
        return;
    //Debug.write("Only running", methodName);
    var count = 0;
    for (v in this.tests) {
        var tc = this.tests[v];
        if (typeof tc != 'undefined') {
            var selected = [];
            for (var i in tc)
                if (tc[i] == methodName) {
                    count += 1;
                    selected.push(tc[i]);
                }
            this.tests[v] = selected;
        }
    }
});
