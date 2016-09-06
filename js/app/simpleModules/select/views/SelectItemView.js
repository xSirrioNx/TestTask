define(['backbone', 'underscore'],

	function (Backbone, _) {

		var Settings = Backbone.Model.extend({
			defaults: {
				hasCheckbox: false,
				hasRipple: true
			},
			initialize: function (options) {
				if (!options.model)return console.error('SelectView: settings.model not set!');
			}
		});

		var SelectItemViewTemplate = "<span><%=options.get('model').get(options.get('titleAttrName'))%></span>";

		var SelectItemView = Backbone.View.extend({

			template: _.template(SelectItemViewTemplate),
			events: {
				"click": "onItemClick"
			},
			tagName: "li",
			className: "mdl-menu__item",

			initialize: function (options) {
				_.bindAll.apply(_, [this].concat(_.functions(this)));
				this.settings = options && options.settings
					? new Settings(options.settings)
					: new Settings();
				if (this.settings.get("model").get(this.settings.get("selectProperty"))) {
					this.$el.addClass("isSelected");
				}

				this.options = options.settings;
				this.options.model.set({id: this.cid});
				if (this.settings.get("hasCheckbox")) {
					this.checkboxView = new CheckboxView({
						settings: {
							model: this.options.model
						}
					});
					if (this.settings.get("model").get("isChecked")) {
						this.$el.attr("checked", true);
						this.$el.addClass("checked");
						this.settings.get("parentView").trigger("isCheckedModel", this.settings.get("model"));
					}
					this.$el.addClass("hasCheckbox");
				}
				this.listenTo(this.settings.get("model").collection, 'reset', this.remove);
				this.listenTo(this.settings.get("parentView"), 'remove', this.remove);
				this.listenTo(this.settings.get("model"), "change:selected", this.onChangeSelected);
				this.listenTo(this.settings.get("model"), "change:" + this.settings.get("selectProperty"), this.onChangeSelected);
				this.listenTo(this.settings.get("model"), "change:isChecked", this.onChangeChecked);
			},
			onChangeChecked: function (model) {
				this.settings.get("parentView").trigger("changeInput");
				this.$el.toggleClass("isSelected", model.get("isChecked"));
				model.set(this.settings.get("selectProperty"), model.get("isChecked"));
			},
			onChangeSelected: function (model) {
				this.$el.toggleClass("isSelected", model.get(this.settings.get("selectProperty")));
				this.settings.get("parentView").trigger("changeInput");
			},
			onItemClick: function (e) {
				e.preventDefault();
				if (this.settings.get("hasCheckbox")) {
					e.stopPropagation();
					e.stopImmediatePropagation();
				}

				if (!this.settings.get("hasCheckbox")) {
					this.options.model.collection.invoke('set', this.settings.get("selectProperty"), false);
				}
				this.options.model.set(this.settings.get("selectProperty"), !this.options.model.get(this.settings.get("selectProperty")));
				if (this.settings.get("hasCheckbox")) {
					this.options.model.set("isChecked", this.options.model.get(this.settings.get("selectProperty")));
				}

				this.settings.get("parentView").trigger("setSelected", this.options.model);
			},
			render: function () {
				this.$el.append(this.template({options: this.settings, name: this.settings.get("titleAttrName")}));
				if (this.settings.get("hasCheckbox")) {
					this.$el.prepend(this.checkboxView.render().el);
				}
				if (this.settings.get("model").get("icon")) {
					this.$el.append("<i class='zmdi zmdi-" + this.settings.get("model").get("icon") + "'></i>");
				}
				return this;
			},
			remove: function () {
				if (this.ripple) {
					this.ripple.remove();
				}
				if (this.checkboxView) {
					this.checkboxView.remove();
				}
				var components = this.el.querySelectorAll('[data-upgraded]');
				if (components.length > 0) {
					componentHandler.downgradeElements(components);
				}
				// COMPLETELY UNBIND THE VIEW
				this.undelegateEvents();
				this.$el.removeData().unbind();
				this.stopListening();

				// Remove view from DOM
				//this.remove();
				Backbone.View.prototype.remove.call(this);
			}
		});

		return SelectItemView;

	});