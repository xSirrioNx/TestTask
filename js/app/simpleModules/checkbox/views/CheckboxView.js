(function (root, factory) {
	if (typeof define === "function" && define.amd) {
		define(["underscore", "backbone"], function (_, Backbone) {
			return (root.CheckboxView = factory(_, Backbone));
		});
	} else if (typeof exports === "object") {
		module.exports = factory(require("underscore"), require("backbone"));
	} else {
		root.CheckboxView = factory(root._, root.Backbone);
	}
}(this, function (_, Backbone) {

	var CheckboxTemplate =
        '<input type="checkbox" id="<%=id%>" class="mdl-checkbox__input">' +
		'<span class="mdl-checkbox__label"><%=label%></span>';

	var IconToggleTemplate =
		'<input type="checkbox" id="<%=id%>" class="mdl-icon-toggle__input">' +
        '<i class="mdl-icon-toggle__label zmdi zmdi-<%=icon%>"></i>';

	var SwitchTemplate =
        '<input type="checkbox" id="<%=id%>" class="mdl-switch__input">' +
        '<span class="mdl-switch__label"><%=label%></span>';

	var RadioTemplate =
        '<input type="radio" id="<%=id%>" class="mdl-radio__button">' +
        '<span class="mdl-radio__label"><%=label%></span>';

	var Settings = Backbone.Model.extend({
		defaults: {
			isChecked: false,
			type: "checkbox",
			icon: "camera-alt",
			color: "color-accent",
			label: ''
		},
		initialize: function (options) {

		}
	});

	var CheckboxView = Backbone.View.extend({

		template: _.template(CheckboxTemplate),
		tagName: "label",
		className: "checkboxView mdl-js-ripple-effect",

		changeChecked: function (e) {

			if (this.settings.get("type") == "radio" && this.isChecked == true) {
				return;
			}

			this.isChecked = !this.isChecked;
			this.$el.toggleClass("is-checked", this.isChecked);
			this.$el.find("input").prop("checked", this.isChecked);
			if (this.model) {
				this.model.set("isChecked", this.isChecked);
			}
			this.trigger("change:isChecked", this.isChecked, this.model);
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
		},

		initialize: function (options) {
			_.bindAll.apply(_, [this].concat(_.functions(this)));
			this.settings = options && options.settings
				? new Settings(options.settings)
				: new Settings();
			this.isChecked = this.settings.get("isChecked");
			this.isCustomColor = false;
			if (this.settings.get("model")) {
				this.model = this.settings.get("model");
				if (this.model.get("isChecked") !== undefined) {
					this.isChecked = this.model.get("isChecked");
					this.$el.toggleClass("is-checked", this.isChecked);
				}
			}
			this.isAnimating = false;
			switch (this.settings.get("type")) {
				case "checkbox":
					this.elementClass = "mdl-checkbox mdl-js-checkbox";
					this.$el.addClass(this.elementClass);
					this.template = _.template(CheckboxTemplate);
					break;
				case "iconToggle":
					this.elementClass = "mdl-icon-toggle mdl-js-icon-toggle";
					this.$el.addClass(this.elementClass);
					this.template = _.template(IconToggleTemplate);
					break;
				case "switch":
					this.elementClass = "mdl-switch mdl-js-switch";
					this.$el.addClass(this.elementClass);
					this.template = _.template(SwitchTemplate);
					break;
				case "radio":
					this.elementClass = "mdl-radio mdl-js-radio";
					this.$el.addClass(this.elementClass);
					this.template = _.template(RadioTemplate);
					break;
				default:
					this.elementClass = "mdl-checkbox mdl-js-checkbox";
					this.$el.addClass(this.elementClass);
					this.template = _.template(CheckboxTemplate);
					break;
			}
			switch (this.settings.get("color")) {
				case "color-accent":
					this.$el.addClass("color-accent");
					break;
				case "color-contrast":
					this.$el.addClass("color-contrast");
					break;
				case "color-primary":
					this.$el.addClass("color-primary");
					break;
				default:
					this.isCustomColor = true;
			}
			this.on("toggleCheckbox", this.changeChecked);
			if (this.model) {
				this.listenTo(this.model, "change:isChecked", this.onModelChange);
			}
		},

		render: function () {
			this.$el.html(this.template({
				id: this.cid,
				icon: this.settings.get("icon"),
				label: this.settings.get("label")
			}));
			this.$el.toggleClass("is-checked", this.isChecked);
			this.$el.find("input").prop("checked", this.isChecked);
			return this;
		},

		onModelChange: function () {
			this.isChecked = this.model.get("isChecked");
			this.$el.toggleClass("is-checked", this.isChecked);
			this.$el.find("input").prop("checked", this.isChecked);
		}
	});

	return CheckboxView;
}));