/**
 * Created by SirrioN on 21.08.2016.
 */
define(['backbone'],
    function (Backbone) {
        
    var UsersModel = Backbone.Model.extend({
        defaults: {
            selected: false,
            checked: false
        },
    });
    return UsersModel;
});
