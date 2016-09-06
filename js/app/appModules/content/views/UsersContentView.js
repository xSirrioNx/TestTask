/**
 * Created by SirrioN on 21.08.2016.
 */
define(["backbone",
        "usersCollection",
        "tableView",
        "gridView",
        "selectView",
        "inputView",
        "text!app/appModules/content/templates/UsersContentTemplate.html",
    ],

    function (Backbone,
              UsersCollection,
              TableView,
              GreedView,
              SelectView,
              InputView,
              UsersContentTemplate) {

        var Settings = Backbone.Model.extend({
            defaults: {}
        });

        Backgrid.Extension.ClientSideFilter = Backgrid.Extension.ClientSideFilter.extend({
            search: function (query) {
                console.debug(query);
                var matcher = _.bind(this.makeMatcher(query), this);
                var col = this.collection;
                if (col.pageableCollection) col.pageableCollection.getFirstPage({silent: true});
                col.reset(this.shadowCollection.filter(matcher), {reindex: false});
            }
        });

        var UsersContentView = Backbone.View.extend({

            template: _.template(UsersContentTemplate),
            events: {
                "click .mdl-card__title .left-section button": "onViewTypeButtonClick"
            },
            tagName: "div",
            className: "mdl-card mdl-shadow--2dp users-card",

            initialize: function (options) {
                this.settings = options ? new Settings(options) : new Settings();
                this.usersCollection = new UsersCollection();
                this.listenTo(this.usersCollection, "sync", this.onCollectionSynch);
                this.listenTo(this.usersCollection, "pageable:state:change", this.updateCurrentPage);
                this.listenTo(this.usersCollection, "reset", function () {
                    componentHandler.upgradeDom();
                });
                this.usersCollection.fetch();
                this.searchByCollection = new Backbone.Collection();
                this.sortByCollection = new Backbone.Collection();
                this.rowsCountCollection = new Backbone.Collection([
                    {value: 12, isSelected: true},
                    {value: 24},
                    {value: 48},
                    {value: 96},
                    {value: 192}
                ]);
                this.rowsCountSelect = new SelectView({
                    settings: {
                        collection: this.rowsCountCollection,
                        type: "simple", // simple/search/multiselect
                        isNullable: false,
                        selected: true,
                        valueAttrName: "value",
                        titleAttrName: "value",
                        direction: "top",
                        parentView: this,
                        elCss: {
                            width: 50
                        }
                    }
                });
                this.listenTo(this.rowsCountSelect, "setSelected", this.setRowsCount);
            },
	        setSort: function (model) {
		        if(model.get("value")) {
			        this.usersCollection.trigger("backgrid:sort", model.get("value"), model.get("sortType"));
		        } else {
			        this.usersCollection.trigger("backgrid:sort", this.searchByCollection.at(0).get("value"), model.get("sortType"));
		        }

	        },
            setRowsCount: function (model) {
                this.usersCollection.state.pageSize = model.get("value");
                this.usersCollection.getPage(1);
            },
            onCollectionSynch: function (collection, response, options) {
                this.tableView = new TableView({
                    collection: this.usersCollection
                });
                this.$el.find(".table-wrapper").html(this.tableView.render().el);

                this.paginator = new Backgrid.Extension.Paginator({
                    collection: this.usersCollection,
                    mode: "client"
                });
                this.$el.find(".mdl-card__actions .pagination-wrapper").html(this.paginator.render().el);
                this.updateCurrentPage();

                this.tableView.makeScroll();

                this.makeSearchFilterCollections(collection);
                this.renderHeader();

	            this.gridView = new GreedView({
		            collection: this.usersCollection
	            });
	            this.$el.find(".grid-wrapper").html(this.gridView.render().el);
	            this.gridView.makeScroll();

                componentHandler.upgradeDom();
            },
            renderHeader: function () {
                this.filter = new Backgrid.Extension.ClientSideFilter({
                    collection: this.usersCollection,
                    fields: [""],
                });
                this.setSearchFields();
                this.searchSelect = new SelectView({
                    settings: {
                        placeholder: "Search by",
                        collection: this.searchByCollection,
                        type: "multiselect", // simple/search/multiselect
                        isNullable: false,
                        parentView: this,
                        direction: "bottom",
                    }
                });
                this.listenTo(this.searchSelect, "setSelected", this.setSearchFields);
                this.$el.find(".right-section .search-wrapper").append(this.searchSelect.render().el);
                
                this.searchInput = new InputView({
                    settings: {
                        type: "search", // input/search/textarea/simple/file
                        placeholder: "Search text",
                        isFloating: false,
                        isRightSideIcon: true
                    }
                });
                this.listenTo(this.searchInput, "input:keyup", this.onSearchInputChange);
                this.listenTo(this.searchInput, "input:clear", this.onSearchInputChange);
                this.$el.find(".right-section .search-wrapper").append(this.searchInput.render().el);

                this.sortSelect = new SelectView({
                    settings: {
                        placeholder: "Filter by",
                        collection: this.sortByCollection,
                        type: "simple", // simple/search/multiselect
                        isNullable: false,
                        selected: true,
                        valueAttrName: "value",
                        titleAttrName: "value",
                        direction: "bottom",
                    }
                });
	            this.listenTo(this.sortSelect, "setSelected", this.setSort);
                this.$el.find(".right-section .sort-wrapper").append(this.sortSelect.render().el);

            },
            setSearchFields: function () {
                var fieldsModels = this.searchByCollection.where({isSelected: true});
                var fields = [];
                _.each(fieldsModels, function (model) {
                    fields.push(model.get("value"));
                });
                // this.filter.options.fields = fields;
                this.filter.fields = fields;
            },
            onSearchInputChange: function () {
                this.filter.search(this.searchInput.getValue());
            },
            makeSearchFilterCollections: function (collection) {
                var model = collection.at(0);
                var self = this;
                this.sortByCollection.add({
                    value: null,
                    sortType: null,
                    isSelected: true,
                    isChecked: false
                });
                _.each(model.attributes, function (value, key) {
                    if (key != "checked" && key != "selected" && key != "guid") {
                        self.searchByCollection.add({
                            title: key,
                            value: key,
                            isSelected: true,
                            isChecked: true
                        });
                        self.sortByCollection.add({
                            value: key,
                            sortType: "ascending",
                            isSelected: false,
                            isChecked: false,
	                        icon: "sort-asc"
                        });
                        self.sortByCollection.add({
                            value: key,
                            sortType: "descending",
                            isSelected: false,
                            isChecked: false,
	                        icon: "sort-desc"
                        });
                    }
                });
            },
            onChangeUrl: function (urlParams) {
                this.headerButtons.toggleClass("active", false);
                this.wrappers.toggleClass("active", false);
                switch (urlParams) {
                    case "groups":
                        this.groupsButton.toggleClass("active", true);
                        this.groupsWrapper.toggleClass("active", true);
                        break;
                    case "grid":
                        this.gridButton.toggleClass("active", true);
                        this.gridWrapper.toggleClass("active", true);
                        break;
                    default:
                        this.tableButton.toggleClass("active", true);
                        this.tableWrapper.toggleClass("active", true);
                }
            },
            onViewTypeButtonClick: function (e) {
                App.router.navigate("users/" + e.currentTarget.dataset.name, {trigger: true});
            },
            updateCurrentPage: function () {
                if (this.paginator) {
                    var totalPages = this.paginator.collection.state.totalPages > 0 ? this.paginator.collection.state.totalPages : 1;
                    var totalRows = this.paginator.collection.state.totalRecords;
                    var rowsPerPage = this.paginator.collection.state.pageSize;
                    var onPage = this.paginator.collection.length;
                    var curPage = this.paginator.collection.state.currentPage == totalPages ? onPage : rowsPerPage;
                    var curFirst = (this.paginator.collection.state.currentPage - 1) * rowsPerPage + 1;
                    var curLast = (this.paginator.collection.state.currentPage - 1) * rowsPerPage + curPage;
                    this.$el.find(".pages-wrapper").text(curFirst + " - " + curLast + " of " + totalRows);
                }
                componentHandler.upgradeDom();
            },

            render: function () {
                var currentRoute = Backbone.history.getFragment().split("/")[1];
                this.listenTo(App.router, "route:usersRoute", this.onChangeUrl);

                this.$el.html(this.template({
                    activeTab: currentRoute
                }));
                this.headerButtons = this.$el.find(".mdl-card__title .left-section button");
                this.tableButton = this.$el.find(".mdl-card__title .left-section  [data-name='table']");
                this.gridButton = this.$el.find(".mdl-card__title .left-section  [data-name='grid']");
                this.groupsButton = this.$el.find(".mdl-card__title .left-section  [data-name='groups']");

                this.wrappers = this.$el.find(".mdl-card__supporting-text > div");
                this.tableWrapper = this.$el.find(".mdl-card__supporting-text .table-wrapper");
                this.gridWrapper = this.$el.find(".mdl-card__supporting-text .grid-wrapper");
                this.groupsWrapper = this.$el.find(".mdl-card__supporting-text .groups-wrapper");

                this.$el.find(".select-wrapper").prepend(this.rowsCountSelect.render().el);
                return this;
            }
        });

        return UsersContentView;

    });