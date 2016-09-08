/**
 * Created by SirrioN on 07.09.2016.
 */
define(["backbone"],

	function (Backbone) {

		var Settings = Backbone.Model.extend({
			defaults: {}
		});

		var GroupsView = Backbone.View.extend({

			events: {
			},
			tagName: "div",
			className: "mdl-tabs__panel",

			initialize: function (options) {
				this.settings = options ? new Settings(options) : new Settings();
				this.collection = this.settings.get("collection");
				this.$el.attr("id", this.settings.get("name"));
				if(this.settings.get("isActive")){
					this.$el.addClass("is-active");
				}
			},
			render: function () {
				//this.$el.html(this.template());
				return this;
			}
		});
		return GroupsView;
	});