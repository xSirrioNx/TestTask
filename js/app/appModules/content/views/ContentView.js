/**
 * Created by SirrioN on 21.08.2016.
 */
define(["backbone",
        "greetingContentView",
        "usersContentView",
        "text!app/appModules/content/templates/ContentTemplate.html"
    ],

    function (Backbone,
              GreetingContentView,
              UsersContentView,
              ContentTemplate) {

        var Settings = Backbone.Model.extend({
            defaults: {}
        });

        var ContentView = Backbone.View.extend({

            template: _.template(ContentTemplate),
            events: {},
            tagName: "main",
            className: "mdl-layout__content",

            initialize: function (options) {
                this.settings = options ? new Settings(options) : new Settings();

                this.greetingContent = new GreetingContentView();
                this.usersContent = new UsersContentView();
            },

            render: function () {
                this.$el.html(this.template());
                this.$el.find(".greeting-content").html(this.greetingContent.render().el);
                this.$el.find(".users-content").html(this.usersContent.render().el);
                return this;
            }
        });

        return ContentView;

    });