/**
 * Created by SirrioN on 21.08.2016.
 */
define(["backbone",
        "text!app/appModules/content/templates/GreetingContentTemplate.html"
    ],

    function (Backbone,
              GreetingContentTemplate) {

        var Settings = Backbone.Model.extend({
            defaults: {
            }
        });

        var GreetingContentView = Backbone.View.extend({

            template: _.template(GreetingContentTemplate),
            events: {},
            tagName: "div",
            className: "mdl-card mdl-shadow--2dp greeting-card",

            initialize: function (options) {
                this.settings = options ? new Settings(options) : new Settings();
            },

            render: function () {
                this.$el.html(this.template());
                return this;
            }
        });

        return GreetingContentView;

    });