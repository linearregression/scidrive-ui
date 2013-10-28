define( [
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojox/grid/DataGrid",
    "dojo/request/xhr",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dijit/form/Button",
    "dijit/Tooltip",
    "scidrive/OAuth",
    "dojo/text!./templates/AccountSettings.html"
],

function(declare, _WidgetBase, _TemplatedMixin, ContentPane, xhr, domConstruct, domStyle, Button, Tooltip, OAuth, template) {
    return declare( "scidrive.AccountSettings", [_WidgetBase, _TemplatedMixin], {

        templateString: template,
        accountName: "account",
        layout: [{
            rows: [
                {name: "name", field: "name", width: "200px", },
                {name: "id", field: "id"}
            ]
        }],

        postCreate: function(args) {
            var that = this;
            this.inherited(arguments);

            var addButton1 = new Button({
                label: "Link VAO OpenID",
                style: "margin-top: 15px; margin-left: 15px;",
                onClick: function() {
                    var url = that.panel.current_panel.store.vospace.url + "/1/account/info/identity?provider=vao";

                    xhr(url, {
                        handleAs: 'text',
                        method: 'PUT',
                        headers: {
                            'Authorization': OAuth.sign(
                                "PUT", 
                                {url: url}, 
                                that.panel.current_panel.store.vospace.credentials)
                            .headers["Authorization"]
                        }
                    }).then(function(redirect) {
                        console.debug(redirect);
                        that._popupAuthWindow = window.open(
                            redirect, "",
                            "width=" + 400 + ",height=" + 400 +
                            ",status=1,location=1,resizable=yes");
                        that._authCheckInterval = window.setInterval(function() {
                            console.debug("Checking window to close");
                            if (!that._popupAuthWindow || that._popupAuthWindow.closed) {
                                that._popupAuthWindow = null;
                                // var darkCover = window.document.getElementById(window.popupManager.constants['darkCover']);
                                // if (darkCover) {
                                //     darkCover.style.visibility = 'hidden';
                                // }
                                if ((null !== that._authCheckInterval)) {
                                    window.clearInterval(that._authCheckInterval);
                                    that._authCheckInterval = null;
                                }
                                console.debug("Done!");
                            }
                        }, 80);
                    },
                    function(error) {
                        console.debug("error");
                        console.debug(error.xhr);
                    });
                }
            }, this.addButton1Elm);

            var addButton2 = new Button({
                label: "Link google OpenID",
                style: "margin-top: 15px; margin-left: 15px;",
                onClick: function() {
                    var url = that.panel.current_panel.store.vospace.url + "/1/account/info/identity?provider=google";

                    xhr(url, {
                        handleAs: 'json',
                        method: 'PUT',
                        headers: {
                            'Authorization': OAuth.sign(
                                "PUT", 
                                {url: url}, 
                                that.panel.current_panel.store.vospace.credentials)
                            .headers["Authorization"]
                        }
                    }).then(function(identities) {
                        console.debug("Alias add succeded");
                    },
                    function(error) {
                        console.debug(error);
                    });


                }
            }, this.addButton2Elm);

            var url = this.panel.current_panel.store.vospace.url + "/1/account/info/identities";
            xhr(url, {
                handleAs: 'json',
                headers: {
                    'Authorization': OAuth.sign(
                        "GET", 
                        {url: url}, 
                        this.panel.current_panel.store.vospace.credentials)
                    .headers["Authorization"]
                }
            }).then(function(identities) {
                identities.identities.map(function(identity) {
                    var identDiv = domConstruct.create("div");
                    var removeButton = new Button({
                        label: "&#10060;",
                        style: "margin: 15px;"
                    }, domConstruct.create('span', {}, identDiv));

                    // domStyle.style

                    domConstruct.create('span', {innerHTML: identity}, identDiv);

                    domConstruct.create('div', {
                        class:"dijitHidden",

                    }, identDiv);

                    domConstruct.place(identDiv, that.aliasesDiv);
                });

                new Tooltip({
                    connectId: that.aliasesDiv,
                    selector: ".dijitButtonNode",
                    label: "Unlink the OpenID identity from the profile"
                });

            });
        },

        startup: function() {
            this.inherited(arguments);
        }
    });
}
);