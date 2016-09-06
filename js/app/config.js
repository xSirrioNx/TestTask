/**
 * Created by SirrioN on 20.08.2016.
 */
require.config({
    baseUrl: "js/",
    paths: {
        "jquery": "libs/jquery",
        "underscore": "libs/underscore",
        "backbone": "libs/backbone",
        "material": "libs/material",
        "text": 'libs/text',
        "modelBinder": 'libs/backbone.ModelBinder',

        "appView": "app/AppView",
        "router": "app/Router",

        "headerView": "app/appModules/header/views/HeaderView",
        "sidebarView": "app/appModules/sidebar/views/SidebarView",
        "contentView": "app/appModules/content/views/ContentView",
        "greetingContentView": "app/appModules/content/views/GreetingContentView",
        "usersContentView": "app/appModules/content/views/UsersContentView",
        "footerView": "app/appModules/footer/views/FooterView",

        "tableView": "app/commonModules/table/views/TableView",
        "gridView": "app/commonModules/grid/views/GridView",
        "gridItemView": "app/commonModules/grid/views/GridItemView",

        "selectView": "app/simpleModules/select/views/SelectView",
        "selectItemView": "app/simpleModules/select/views/SelectItemView",
        "checkboxView": "app/simpleModules/checkbox/views/CheckboxView",
        "inputView": "app/simpleModules/input/views/InputView",
        "buttonView": "app/simpleModules/button/views/ButtonView",

        "backgrid": "libs/backgrid/backgrid",
        "backgridFilter": 'libs/backgrid/backgrid-filter',
        "lunr": "libs/backgrid/lunr",
        "backgridPaginator": 'libs/backgrid/backgrid.paginator',
        "backgridSelectAll": 'libs/backgrid/backgrid-select-all',
        "backbone.paginator": 'libs/backgrid/backbone.paginator',
        "usersModel": "app/appModules/content/models/UsersModel",
        "usersCollection": "app/appModules/content/collections/UsersCollection",

        "baron": "libs/baron"
    },
    waitSeconds: 15,
    shim: {
        baron: {
            deps: ['jquery']
        }
    }
});

var App = {};
require(["backbone",
        "appView",
        "router",
        "material",
        "text",
		"modelBinder",
        "baron"],
    function (Backbone,
              AppView) {
        App = new AppView();
        $("body").html(App.render().el);
        componentHandler.upgradeDom();
    }
);