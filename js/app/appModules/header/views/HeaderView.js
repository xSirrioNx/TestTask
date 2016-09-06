/**
 * Created by SirrioN on 21.08.2016.
 */
define(["backbone",
        "text!app/appModules/header/templates/HeaderTemplate.html"
    ],

    function (Backbone,
              HeaderTemplate) {

        var Settings = Backbone.Model.extend({
            defaults: {
                title: "Test task"
            }
        });

        var HeaderView = Backbone.View.extend({

            template: _.template(HeaderTemplate),
            events: {},
            tagName: "header",
            className: "mdl-layout__header",

            initialize: function (options) {
                this.settings = options ? new Settings(options) : new Settings();
            },

            render: function () {
                this.$el.html(this.template({
                    title: this.settings.get("title")
                }));
                return this;
            }
        });

        return HeaderView;

    });