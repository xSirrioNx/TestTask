/**
 * Created by SirrioN on 21.08.2016.
 */
define(["backbone",
        "text!app/appModules/sidebar/templates/SidebarTemplate.html"
    ],

    function (Backbone,
              SidebarTemplate) {

        var Settings = Backbone.Model.extend({
            defaults: {
                title: "Test task"
            }
        });

        var SidebarView = Backbone.View.extend({

            template: _.template(SidebarTemplate),
            events: {},
            tagName: "div",
            className: "mdl-layout__drawer",

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

        return SidebarView;

    });