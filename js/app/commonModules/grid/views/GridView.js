/**
 * Created by SirrioN on 06.09.2016.
 */
define(["backbone",
		"gridItemView",
		"text!app/commonModules/grid/templates/GridTemplate.html"],

	function (Backbone,
	          GridItemView,
	          GridTemplate) {

		var Settings = Backbone.Model.extend({
			defaults: {}
		});

		var GridView = Backbone.View.extend({

			template: _.template(GridTemplate),
			events: {
			},
			tagName: "div",
			className: "mdl-grid",

			initialize: function (options) {
				this.settings = options ? new Settings(options) : new Settings();
				this.collection = this.settings.get("collection");
				/*this.collection.on("all", function (event) {
					console.debug("collection event: ", event);
				});*/
				this.listenTo(this.collection, "reset", this.renderItemViews);
				this.itemsArray = [];
			},
			render: function () {
				this.$el.html(this.template());
				this.renderItemViews();
				return this;
			},
			renderItemViews: function () {
				var self = this;
				_.each(this.itemsArray, function (item) {
					item.remove();
				});
				this.collection.each(function (model) {
					var itemView = new GridItemView({
						model: model
					});
					self.itemsArray.push(itemView);
					self.$el.append(itemView.render().el);
				});
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
		});
		return GridView;
	});