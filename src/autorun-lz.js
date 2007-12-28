/* Copyright 2007 by Oliver Steele.  Available under the MIT License. */

TestSuite.prototype.sendLogDataWithoutBrowserJS =
    TestSuite.prototype.sendLogData;

TestSuite.addProperty('sendLogData', function(_, message) {
    var suiteCount = 0;
    for (var i = 0; i < canvas.subviews.length; i++)
        if (canvas.subviews[i] instanceof TestSuite)
            suiteCount++;
    var expr = 'window.suiteDone&&suiteDone(' + quote(message) +
        ',' + suiteCount + ')';
    LzBrowser.exec(expr);
    this.sendLogDataWithoutBrowserJS.apply(this, arguments);
    // This does just enough quoting to be useful here
    function quote(s) {
        return '"' + s.replace('"', '\\"').replace('\n', '\\n') + '"';
    }
});

// Execute javascript in the browser.  Throttled to avoid race
// condition with MSIE.
LzBrowser.exec = function(expr) {
    var nextTime = arguments.callee['nextTime'] || 0,
        now = (new Date).getTime();
    if (now < nextTime)
        return setTimeout(function(){LzBrowser.exec(expr)},
                          nextTime - now);
    _root.getURL('javascript:'+expr);
    arguments.callee.nextTime = now + 100;
}
