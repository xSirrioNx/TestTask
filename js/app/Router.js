/**
 * Created by SirrioN on 21.08.2016.
 */
define(["backbone"],
    function (Backbone) {
        var Router = Backbone.Router.extend({
            routes: {
                "": "greetingRoute",
                "users(/)": "usersRoute",
                "users(/:urlParams)": "usersRoute"
            },
            usersRoute: function (urlParams) {
                this.trigger("changePage", true, urlParams);
            },
            greetingRoute: function (urlParams) {
                this.trigger("changePage", false, urlParams);
            }
        });
        return Router;
    }
);
