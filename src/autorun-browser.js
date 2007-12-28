/* Copyright 2007 by Oliver Steele.  Available under the MIT License. */

window.console || (window.console={info:function(){}});

var gRunner;

function LzTestRunner(files) {
    this.files = files;
    this.remaining = [].concat(files);
    this.current = null;
}

LzTestRunner.skip = 0;

LzTestRunner.run = function(options) {
    var files = options.files,
        matches = [];
    for (var i = 0; i < files.length; i++) {
        if (files[i].match(options.match || /.*/)
            && (options.exclude||[]).indexOf(files[i]) < 0)
            matches.push(files[i]);
    }
    gRunner = new LzTestRunner(matches);
    gRunner.run();
}

LzTestRunner.prototype = {
    run: function() {
        $('body').addClass('running');
        this.runNext();
    },

    runNext: function() {
        var remaining = this.remaining;
        remaining.length
            ? this.load(remaining.shift())
            : this.done();
    },

    done: function() {
        this.files.length
            ? this.success(true)
            : this.failed("No matching files");
    },

    success: function() {
        this.unload();
        this.status('success');
        $('body').removeClass('running').addClass('success');
        var files = this.files,
            html = [];
        this.message('Ran ' + files.length + ' test files with no errors');
        html.push('<ul>');
        for (var i = 0; i < files.length; i++) {
            var src = files[i],
                app = new LzTestApplication(src);
            html.push('<li><a href="', src, '">', app.name, '</a></li>');
        }
        html.push('</ul>');
        $('body').append('<div id="file-list"></div>');
        $('#file-list').html(html.join(''));
    },

    failed: function(message) {
        this.status(message || 'failed');
        $('body').removeClass('running').addClass('failed');
        this.current || this.message(message);
    },

    message: function(message) {
        $('body').append('<div class="status"></div>');
        $('body .status').text(message);
    },

    status: function(message) {
        console.info(message);
        document.title = 'autotest: ' + message;
    },

    load: function(file) {
        this.unload();
        var app = this.current = new LzTestApplication(file);
        this.status('running ' + app.url);
        app.load();
    },

    unload: function() {
        this.current && this.current.unload();
        this.current = null;
    },

    reportFailureCount: function(count) {
        var url = this.current.url;
        console.info('finished', this.current.name, 'with', count, 'failures');
        count
            ? this.failed(url + ' failed')
            : this.runNext();
    }
}

function LzTestApplication(url) {
    this.url = url;
    this.name = (url.replace(/\.lzx$/, '')
                 .replace(/^test-/, '')
                 .replace(/-local$/, '')
                 .replace(/-(\w)/, function(_,s) {return ' '+s.toUpperCase()})
                 .capitalize()
                );
}

LzTestApplication.prototype = {
    load: function() {
        if (LzTestRunner.skip)
            return gRunner.processFailureCount(0);
        var src = this.url + '?lzt=swf';
        var so = new SWFObject(src, 'lzapp', '100%', '100%', '8', '#FFFFFF');
        $('body').append('<div id="applet">Loading ' + src + '</div>');
        so.addParam('allowScriptAccess', 'always');
        so.write('applet');
        var self = this;
        this.suiteCount = null;
        window.suiteDone = function() { self.processLogMessage.apply(self, arguments); }
    },

    unload: function() {
        $('#applet').remove();
    },

    processLogMessage: function(message, suiteCount) {
        var match = message.match(/failures:\s*(\d+)/),
            failures = match && parseInt(match[1]);
        if (!match) {
            gRunner.failed(this.url + ' sent invalid message: ' + message);
            this.unload();
            return;
        }
        if (this.suiteCount == null)
            this.suiteCount = suiteCount;
        if (failures || --this.suiteCount == 0)
            gRunner.reportFailureCount(failures)
    }
}

function suiteDone(message) {
    var errorMessage = 'suiteDone called before LzTestAppliction.load is called';
    window.console && console.error
        ? console.error(errorMessage)
        : alert(errorMessage);
}

String.prototype.capitalize = function() {
    return this.slice(0,1).toUpperCase() + this.slice(1);
}
