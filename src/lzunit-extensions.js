/* Copyright 2007-2008 by Oliver Steele.  Available under the MIT License. */

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

Test.addProperty('assertSameDate', function(expected, actual, message) {
    if (expected instanceof Date && actual instanceof Date
        && expected/1 == actual/1)
        expected = actual;
    this.assertSame(expected, actual, message);
});

Test.addProperty('assertFasterThan', function(expected, actual, message) {
    actual <= expected ||
        this.fail([message || '', message && ': ' || '',
                   actual, "ms not < ", expected, "ms"].join(''));
    canvas.setAttribute('runTests', canvas.runTests + 1)
});


/*
 * Pending
 */

Test.addProperty('pending', function(message) {
    Debug.write(['pending'].concat(arguments));
});


/*
 * Test case selection
 */

TestSuite.prototype.runWithoutRestriction =
    TestSuite.prototype.run;

TestSuite.addProperty('run', function() {
    this.selectTests();
    this.runWithoutRestriction.apply(this, arguments);
});

TestSuite.addProperty('selectTests', function() {
    var methodName = global['testCase'] || null;
    if (!methodName)
        return;
    if (methodName.indexOf('test') != 0)
        methodName = 'test' + methodName.slice(0,1).toUpperCase() + methodName.slice(1);
    Debug.write("Only running", methodName);
    for (v in this.tests) {
        var tc = this.tests[v] || null;
        if (tc) {
            var selected = [];
            for (var i in tc)
                tc[i] == methodName && selected.push(tc[i]);
            this.tests[v] = selected;
        }
    }
});
