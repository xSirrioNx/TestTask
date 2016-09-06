/**
 * Created by SirrioN on 21.08.2016.
 */
define(["backbone",
    "router",
        "headerView",
        "sidebarView",
        "contentView",
        "footerView"],

    function (Backbone,
              Router,
              HeaderView,
              SidebarView,
              ContentView,
              FooterView) {

        var Settings = Backbone.Model.extend({
            defaults: {
                title: "Test task"
            }
        });

        var AppView = Backbone.View.extend({

            events: {},
            tagName: "div",
            className: "mdl-layout mdl-js-layout mdl-layout--fixed-header",

            initialize: function (options) {
                _.bindAll.apply(_, [this].concat(_.functions(this)));
                this.settings = options ? new Settings(options) : new Settings();

                // this.on("isUsersPage", this.switchPage);
                this.router = new Router();
                this.listenTo(this.router, "changePage", this.switchPage);
                Backbone.history.start();

                this.headerView = new HeaderView({
                    title: this.settings.get("task")
                });
                this.sidebar = new SidebarView({
                    title: this.settings.get("task")
                });
                this.content = new ContentView();
                this.footer = new FooterView();
            },
            render: function () {
                this.$el.prepend(this.headerView.render().el);
                this.$el.append(this.sidebar.render().el);
                this.$el.append(this.content.render().el);
                this.$el.append(this.footer.render().el);
                return this;
            },
            switchPage: function (state, urlParams) {
                this.$el.toggleClass("isUsersPage", state);
            }
        });

        return AppView;

    });
