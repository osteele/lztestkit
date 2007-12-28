/* Copyright 2007 by Oliver Steele.  Available under the MIT License. */

// OL 3.4 compatibility
Test.addProperty != Object.addProperty
    || (Test.addProperty = function(name, value) {this.prototype[name] = value});

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
