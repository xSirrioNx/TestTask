/**
 * Created by SirrioN on 21.08.2016.
 */
define(["backbone",
		"backgrid",
		"selectView",
		"text!app/commonModules/table/templates/TableTemplate.html",
		"backgridFilter",
		"backgridPaginator",
		"backgridSelectAll"
	],

	function (Backbone,
	          Backgrid,
	          SelectView,
	          TableTemplate) {

		var Settings = Backbone.Model.extend({
			defaults: {}
		});

		Backgrid.Grid = Backgrid.Grid.extend({
			className: "mdl-data-table mdl-js-data-table"
		});
		Backgrid.Extension.NumericCell = Backgrid.IntegerCell.extend({
			className: "mdl-data-table__cell--numeric"
		});

		Backgrid.Extension.NumericHeaderCell = Backgrid.HeaderCell.extend({
			className: "mdl-data-table__cell--numeric"
		});

		Backgrid.Extension.NonNumericCell = Backgrid.StringCell.extend({
			className: "mdl-data-table__cell--non-numeric"
		});

		Backgrid.Extension.NonNumericHeaderCell = Backgrid.HeaderCell.extend({
			className: "mdl-data-table__cell--non-numeric"
		});

		Backgrid.Extension.EditHeaderCell = Backgrid.HeaderCell.extend({
			className: "edit-cell"
		});

		Backgrid.Extension.DeleteHeaderCell = Backgrid.HeaderCell.extend({
			className: "delete-cell"
		});

		Backgrid.Extension.CheckRowCell = Backgrid.Extension.SelectRowCell.extend({
			className: "check-all-header-cell",
			initialize: function (options) {

				this.column = options.column;
				if (!(this.column instanceof Backgrid.Column)) {
					this.column = new Backgrid.Column(this.column);
				}

				var column = this.column, model = this.model, $el = this.$el;
				this.listenTo(column, "change:renderable", function (column, renderable) {
					$el.toggleClass("renderable", renderable);
				});

				if (Backgrid.callByNeed(column.renderable(), column, model)) $el.addClass("renderable");

				this.listenTo(model, "backgrid:select", function (model, selected) {
					this.$el.find("label").toggleClass("is-checked", selected);
					this.checkbox().prop("checked", selected).change();
				});
			},
			onChange: function () {
				var checked = this.checkbox().prop("checked");
				this.$el.parent().toggleClass("checked", checked);
				this.model.trigger("backgrid:selected", this.model, checked);
			},
			render: function () {
				var disabled = "";
				if (this.column.get("disabled"))
					disabled = 'disabled="disabled"';
				var id = this.guidGenerator();
				//this.$el.empty().append('<input tabindex="-1" type="checkbox" '+disabled+' />');
				this.$el.empty().append(
					'<label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect mdl-data-table__select" for="' + id + '" ' + disabled + '>' +
					'<input type="checkbox" id="' + id + '" class="mdl-checkbox__input" ' + disabled + '>' +
					'</label>'
				);
				this.delegateEvents();
				return this;
			},
			guidGenerator: function () {
				var S4 = function () {
					return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
				};
				return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
			},
			remove: function () {
				var components = this.el.querySelectorAll('[data-upgraded]');
				if (components.length > 0) {
					componentHandler.downgradeElements(components);
				}

				this.undelegateEvents();
				this.$el.removeData().unbind();
				this.stopListening();

				Backbone.View.prototype.remove.call(this);
			}
		});

		/*Backgrid.Extension.CheckAllHeaderCell = Backgrid.Extension.SelectAllHeaderCell.extend({
			className: "check-row-cell",
			render: function () {
				var disabled = "";
				if (this.column.get("disabled"))
					disabled = 'disabled="disabled"';
				var id = this.guidGenerator();
				//this.$el.empty().append('<input tabindex="-1" type="checkbox" '+disabled+' />');
				this.$el.empty().append(
					'<label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect mdl-data-table__select" for="' + id + '" ' + disabled + '>' +
					'<input type="checkbox" id="' + id + '" class="mdl-checkbox__input" ' + disabled + '>' +
					'</label>'
				);
				this.delegateEvents();
				return this;
			},
			guidGenerator: function () {
				var S4 = function () {
					return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
				};
				return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
			}
		});*/

		var TableView = Backbone.View.extend({

			template: _.template(TableTemplate),
			events: {},
			tagName: "div",
			className: "table-view scroll",

			initialize: function (options) {
				this.settings = options ? new Settings(options) : new Settings();
				this.collection = this.settings.get("collection");
				this.listenTo(this.collection, "backgrid:refresh", function () {
					componentHandler.upgradeDom();
				});
				this.columns = this.makeColums(this.collection);
				this.table = new Backgrid.Grid({
					columns: this.columns,
					collection: this.collection,
					emptyText: "No data."
				});
			},
			makeColums: function (collection) {
				var model = collection.at(0);
				var columns = [];
				/*columns.push({
					name: "",
					cell: "check-row",
					headerCell: "check-all"
				});*/
				_.each(model.attributes, function (value, key) {
					if (key != "checked" && key != "selected" && key != "guid") {
						columns.push({
							name: key,
							cell: "string",
							sortable: false,
							editable: false
						});
					}
				});
				return columns;
			},
			makeScroll: function () {
				var paramsV = {
					track: this.$el.find(".scroller__track"),
					bar: this.$el.find(".scroller__track > .scroller__bar"),
					barOnCls: 'baron',
					direction: 'v',
					pause: 0
				};
				var paramsH = {
					track: this.$el.find(".scroller__track__h"),
					bar: this.$el.find(".scroller__track__h > .scroller__bar__h"),
					barOnCls: 'baron__h',
					direction: 'h',
					//freeze: true,
					pause: 0
				};
				this.baron = this.$el.baron(paramsH).baron(paramsV);
			},
			render: function () {
				this.$el.html(this.template());
				this.$el.append(this.table.render().el);
				//this.makeScroll();
				return this;
			}
		});

		return TableView;

	});