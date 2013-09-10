/*
 Death to incompatibility
 This will offer better alternatives to an unsupported browser
 Freely distributable under MIT-style license to use, modify or publish as required
 */
 define([
      "dojo/_base/declare"
    ], function (declare) {
    return declare( "scidrive.killie", null, {
    /*************************/
    /* Configure the message */
    /*************************/
    CSS_FILE: 'scidrive/killie.css',
    MESSAGE_TITLE: "Your browser is not supported!",
    MESSAGE_OPTIONS: "To start enjoying a better and more secure web we recommend installing:",
    BROWSERS: [{
        "href" : "http://www.google.com/chrome",
        "name" : "Chrome"
    },{
        "href" : "http://www.mozilla.com/en-US/firefox/upgrade.html?from=getfirefox",
        "name" : "Firefox"
    },{
        "href" : "http://www.apple.com/safari/",
        "name" : "Safari"
    },{
        "href" : "http://www.opera.com/download/",
        "name" : "Opera"
    }
    ],
    MESSAGE_FRAME: "If you're unable to install a new browser, try the <a href=\"http://www.google.com/chromeframe/\" class=\"icon chrome-frame\">Chrome Frame</a> plugin for Internet Explorer.",

    /**********************************/
    /* No need to configure this part */
    /**********************************/
    msg: document.createElement('div'),
    msgAnim: null,
    // Animation, il, i,

    constructor: function(args) {
        for (i = 0, il = this.BROWSERS.length; i < il; i += 1) {
            if (i) {
                this.MESSAGE_OPTIONS += (i + 1 < il) ? ',' : ' or';
            }
            this.MESSAGE_OPTIONS += ' <a class="icon ' + this.BROWSERS[i].name.toLowerCase() + '" href="' + this.BROWSERS[i].href + '">' + this.BROWSERS[i].name + '</a>';
        }
    },

    //quick and dirty animation class
    Animation: function (el, duration) {
        var properties = {},
        interval = 25,
        intDur = duration / interval,
        itt = 0,
        timer = false;

        function clear() {
            clearInterval(timer);
            itt = 0;
        }

        function cubicOut(t, b, c, d) {
            t = t / d - 1;
            return c * (t * t * t + 1) + b;
        }

        function animateFunc() {
            for (var i in properties) {
                if (properties.hasOwnProperty(i)) {
                    el.style[i] = Math.round(cubicOut(itt, properties[i].from, properties[i].to - properties[i].from, intDur)) + 'px';
                }
            }
            itt += 1;
            if (itt > intDur)
                clear();
        }

        return {
            el : el,
            animate : function (anims) {
                var i;
                properties = {};
                for (i in anims)
                    if (anims.hasOwnProperty(i)) {
                        properties[i] = {
                            from : parseInt(this.el.style[i], 10),
                            to : anims[i]
                        };
                    }
                if (timer)
                    clear();
                timer = setInterval(animateFunc, interval);
            }
        };
    },
    //css file loader with callback on complete
    loadCSS: function(url, callback) {
        var file = document.createElement('link'),
        html = document.getElementsByTagName('html')[0],
        img = document.createElement('img');
        //setup the file params
        file.type = 'text/css';
        file.rel = 'stylesheet';
        file.href = url;
        document.getElementsByTagName('head')[0].appendChild(file);
        if (callback) {
            img.src = url;
            img.onerror = function() {
                setTimeout(callback, 100);
                html.removeChild(img);
            }
            html.appendChild(img);
        }
        return file;
    },

    init: function() {
        var killie = this;
        var inner = document.createElement('div'),
        cls = document.createElement('a');
        //close button
        cls.className = 'close';
        cls.innerHTML = '<strong>x</strong><span> close</span>';
        cls.onclick = function() {
            killie.msgAnim.animate({
                'top' : -killie.msg.offsetHeight
            });
        };
        //the inner content
        inner.className = "inner";
        inner.innerHTML = '<h3>' + this.MESSAGE_TITLE + '</h3><p>' + this.MESSAGE_OPTIONS + '</p><p>' +this.MESSAGE_FRAME + '</p>';
        inner.appendChild(cls);
        //message
        this.msg.id = 'browser-user-message';
        this.msg.appendChild(inner);
        //create the global animation class that we will use
        this.msgAnim = new this.Animation(this.msg, 700);
        console.debug(this.msgAnim);
        //add css and fire the show event when the css is loaded
        this.loadCSS(this.CSS_FILE, function () {
            document.body.appendChild(killie.msg);
            //hide it by default
            killie.msg.style.top = '-' + killie.msg.offsetHeight + 'px';
            //scroll it down
            killie.msgAnim.animate({
                'top' : 0
            });
        });
    }

    });
});