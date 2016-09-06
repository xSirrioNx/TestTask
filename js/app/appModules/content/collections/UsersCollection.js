/**
 * Created by SirrioN on 21.08.2016.
 */
define([
        'backbone',
        'backbone.paginator',
        'usersModel'],
    function (Backbone,
              backbonePaginator,
              UsersModel) {
        
        var UsersCollection = Backbone.PageableCollection.extend({
            url: function () {
                console.debug("qwe", UsersModel );
                return "generated.json";
            },
	        state: {
		        pageSize: 12
	        },
            mode: "client",
            model: UsersModel
        });

        return UsersCollection;
    });
