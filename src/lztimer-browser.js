/* Copyright 2008 by Oliver Steele.  Available under the MIT License. */

var TimingReporter = {
    timings: {},

    handleMessage: function(operation, name, time) {
        switch (operation) {
        case "elapsed":
            name = name.replace(/^time(.)/, function(_,s) {
                return s.toLowerCase();
            });
            (this.timings[name] = this.timings[name]||[]).push(time);
            this.updateDisplay();
            break;
        }
    },

    updateDisplay: function() {
        var self = this;
        if (!window.$)
            return this.thread = this.thread || setTimeout(function() {self.updateDisplay()}, 500);
        $('#results').remove();
        var html = ['<div id="results" style="">',
            '<table><tr><th>Test</th><th>Time (&plusmn;&sigma;)</th><th>Trials</th><th>Data</th></tr>'];
        function toSeconds(value) {
            return String(value).replace(/(\.\d\d).*/, '$1') + 's';
        }
        for (var name in this.timings) {
            var times = this.timings[name];
            html.push('<tr><td class="function-name">', name,
                      '</td><td class="time">',
                      toSeconds(times.mean()),
                      '&plusmn;',
                      toSeconds(times.stddev()),
                      '</td><td class="trials">',
                      times.length,
                      '</td><td class="data">',
                      times.map(toSeconds).join(', '),
                      '</td></tr>');
        }
        html.push('</table></div>');
        $('body').prepend(html.join(''));
        //$('object, embed').css({height:'50%'});
    }
};

Array.prototype.map = function(fn) {
    var len = this.length,
        result = new Array(len);
    for (var ix = 0; ix < len; ix++)
        if (ix in this)
            result[ix] = fn(this[ix], ix);
    return result;
};

Array.prototype.sum = function() {
    var sum = 0;
    for (var ix = 0; ix < this.length; ix++)
        sum += this[ix];
    return sum;
};

Array.prototype.mean = function() {
    return this.sum() / this.length;
};

Array.prototype.stddev = function() {
    var mean = this.mean(),
        variance = 0;
    for (var ix = 0; ix < this.length; ix++) {
        var d = this[ix] - mean;
        variance += d * d;
    }
    return Math.sqrt(variance);
};

(function(queue) {
    receiveMessage = function() {TimingReporter.handleMessage.apply(TimingReporter, arguments)};
    for (var ix = 0; ix < queue.length; ix++)
        receiveMessage.apply(null, queue[ix]);
})(window.receiveMessage&&receiveMessage.queue||[]);
