define([
    "dojo/ready",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Deferred",
    "dojo/_base/array",
    "dojo/dom",
    "dojo/aspect",
    
    "dijit/form/Button",
    
    "dijit/registry",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/Dialog",
    "dojo/text!./templates/ConfirmDialog.html"
], function(
    ready,
    declare,
    lang,
    Deferred,
    array,
    dom,
    aspect,
        
    Button,

    registry,
    _Widget,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    Dialog,
    template){

    var ConfirmDialog = declare("my.ConfirmDialog", [Dialog, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
      title: "Confirm",
      message: "Are you sure?",

        constructor: function(/*Object*/ kwArgs) {
            lang.mixin(this, kwArgs);
            
            //var template = dojo.cache("my.ConfirmDialog", "templates/ConfirmDialog.html");
            var message = this.message;
            
            var contentWidget = new (declare(
                [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin],
                {
                    templateString: template,
                    message: message,
                    class: "ConfirmDialog"
                }
            )); 
            contentWidget.startup();
            this.content = contentWidget;
        },
    
        postCreate: function() {
            this.inherited(arguments);
            this.connect(this.content.cancelButton, "onClick", "onCancel");
        },
 
        onExecute: function() {
            //console.log("OK");
        },
        
        onCancel: function() {
            //console.log("Cancel");            
        }
    
    });

    MessageBox = {
        confirm: function(kwArgs) {
            var confirmDialog = new ConfirmDialog(kwArgs);
            confirmDialog.startup();
            
            var deferred = new Deferred();
            var signal, signals = [];
            
            var destroyDialog = function() {
                array.forEach(signals, function(signal) {
                    signal.remove();
                });
                delete signals;
                confirmDialog.destroyRecursive();
            }
            
            signal = aspect.after(confirmDialog, "onExecute", function() {
                destroyDialog();
                deferred.resolve('MessageBox.OK');
            });
            signals.push(signal);
        
            signal = aspect.after(confirmDialog, "onCancel", function() {
                destroyDialog();   
                deferred.cancel('MessageBox.Cancel');            
            });
            signals.push(signal);
            
            confirmDialog.show();
            return deferred;
        }
       };


    return MessageBox;

});