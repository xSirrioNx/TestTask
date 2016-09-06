/**
 * Created by SirrioN on 06.09.2016.
 */
define(["backbone",
		"text!app/commonModules/grid/templates/GridItemTemplate.html"],

	function (Backbone,
	          GridItemTemplate) {

		var Settings = Backbone.Model.extend({
			defaults: {}
		});

		var GridView = Backbone.View.extend({

			template: _.template(GridItemTemplate),
			events: {
				"click .mdl-card__title .left-section button": "onViewTypeButtonClick"
			},
			tagName: "div",
			className: "mdl-cell mdl-cell--3-col",

			initialize: function (options) {
				this.settings = options ? new Settings(options) : new Settings();
				var self = this;
				this.model = this.settings.get("model");
				this.modelBinder = new Backbone.ModelBinder();
				this.bindings = {
					title: {
						selector: "[name=name]",
						converter: function () {
							return self.model.get("name") + ", " + self.model.get("age")
						}
					},
					phone: {
						selector: "[name=phone]",
						converter: function () {
							return self.model.get("phone")
						}
					},
					department: {
						selector: "[name=department]",
						converter: function () {
							return self.model.get("group")
						}
					}
					,
					company: {
						selector: "[name=company]",
						converter: function () {
							return self.model.get("company")
						}
					}
				}
			},
			render: function () {
				this.$el.append(this.template(this.model.toJSON()));

				this.modelBinder.bind(this.model, this.el, this.bindings);
				return this;
			},
			remove: function () {
				//console.debug("remove", this.model.get("name"));
				this.modelBinder.unbind();
				/*if (this.checkboxView) {
					this.checkboxView.remove();
				}*/
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
		return GridView;
	});