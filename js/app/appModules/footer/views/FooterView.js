/**
 * Created by SirrioN on 21.08.2016.
 */
define(["backbone",
        "text!app/appModules/footer/templates/FooterTemplate.html"
    ],

    function (Backbone,
              FooterTemplate) {

        var Settings = Backbone.Model.extend({
            defaults: {
                title: "Test task",
                copyright: "Copyright © 2016 SirrioN"
            }
        });

        var FooterView = Backbone.View.extend({

            template: _.template(FooterTemplate),
            events: {},
            tagName: "footer",
            className: "mdl-mini-footer",

            initialize: function (options) {
                this.settings = options ? new Settings(options) : new Settings();
            },

            render: function () {
                this.$el.html(this.template({
                    title: this.settings.get("title"),
                    copyright: this.settings.get("copyright")
                }));
                return this;
            }
        });

        return FooterView;

    });