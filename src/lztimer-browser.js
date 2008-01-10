/* Copyright 2008 by Oliver Steele.  Available under the MIT License. */

var TimingReporter = {
    timings: {},

    handleMessage: function(operation, name, time) {
        switch (operation) {
        case "elapsed":
            name = name.replace(/^time(.)/, function(_,s) {
                return s.toLowerCase();
            });
            this.timings[name] = Math.max(this.timings[name]||0, time);
            this.updateDisplay();
            console.info(arguments);
            break;
        }
    },

    updateDisplay: function() {
        var self = this;
        if (!window.$)
            return this.thread = this.thread || setTimeout(function() {self.updateDisplay()}, 500);
        this.thread && clearTimeout(this.thread);
        $('#results').remove();
        var html = ['<div id="results" style="">',
            '<table><tr><th>Test</th><th>Time</th>'];
        for (var name in this.timings)
            html.push('<tr><td>', name, '</td><td>',
                      String(this.timings[name]/1000).replace(/(\.\d\d).*/, '$1'),
                      's</td></tr>');
        html.push('</table></div>');
        $('body').prepend(html.join(''));
        //$('object, embed').css({height:'50%'});
    }
};

(function(queue) {
//    console.info('queue', queue);
    receiveMessage = function() {TimingReporter.handleMessage.apply(TimingReporter, arguments)};
    for (var ix = 0; ix < queue.length; ix++)
        receiveMessage.apply(null, queue[ix]);
})(window.receiveMessage&&receiveMessage.queue||[]);
