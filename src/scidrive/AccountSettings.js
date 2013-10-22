define( [
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojox/grid/DataGrid",
    "dojo/request/xhr",
    "dojo/dom-construct",
    "dijit/form/Button",
    "dijit/Tooltip",
    "scidrive/OAuth",
    "dojo/text!./templates/AccountSettings.html"
],

function(declare, _WidgetBase, _TemplatedMixin, ContentPane, xhr, domConstruct, Button, Tooltip, OAuth, template) {
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
                        // iconClass: "toolbarButton",
                        // class: "toolbarShadedButton"
                        style: "margin: 15px;"
                    }, domConstruct.create('span', {}, identDiv));

                    domConstruct.create('span', {innerHTML: identity}, identDiv);

                    domConstruct.create('div', {
                        class:"dijitHidden",

                    }, identDiv);

                    domConstruct.place(identDiv, that.aliasesDiv);
                });

                console.debug(that.aliasesDiv.id);

                new Tooltip({
                    connectId: that.aliasesDiv,
                    selector: ".dijitButtonNode",
                    label: "Remove the OpenID identity from this user profile"
                });

            });
        },

        startup: function() {
            this.inherited(arguments);
        }
    });
}
);