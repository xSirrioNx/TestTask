(function (root, factory) {
	if (typeof define === "function" && define.amd) {
		define(["underscore", "backbone"], function (_, Backbone) {
			return (root.ButtonView = factory(_, Backbone));
		});
	} else if (typeof exports === "object") {
		module.exports = factory(require("underscore"), require("backbone"));
	} else {
		root.ButtonView = factory(root._, root.Backbone);
	}
}(this, function (_, Backbone) {

	var IconTemplate = '<i class="zmdi zmdi-<%=content%>"></i>';
	var FabTemplate = '<i class="zmdi zmdi-plus"></i>';
	var ButtonTemplate = '<%=content%>';

	var Settings = Backbone.Model.extend({
		defaults: {
			type: "flat", // flat / raised / fab / mini-fab / icon
			color: "", // color-primary / color-accent / ''
			content: "", // !Note: For type: "icon" - icon name from http://zavoloklom.github.io/material-design-iconic-font/icons.html#new, for type: "flat/raised" - button text
			hasRipple: true,
			hasBadge: false,
			dataBadge: false,
			customClass: ""
		},
		initialize: function (options) {

		}
	});

	var ButtonView = Backbone.View.extend({
		events: {
			"click": "onButtonClick",
			"dblclick": "onButtonDblClick"
		},
		tagName: "button",
		className: "mdl-button buttonView mdl-js-button",

		remove: function () {
			var components = this.el.querySelectorAll('[data-upgraded]');
			if (components.length > 0) {
				componentHandler.downgradeElements(components);
			}

			if (this.ripple) {
				this.ripple.remove();
			}

			// COMPLETELY UNBIND THE VIEW
			this.undelegateEvents();
			this.$el.removeData().unbind();
			this.stopListening();

			// Remove view from DOM
			//this.remove();
			Backbone.View.prototype.remove.call(this);
		},

		initialize: function (options) {
			_.bindAll.apply(_, [this].concat(_.functions(this)));
			this.settings = options && options.settings
				? new Settings(options.settings)
				: new Settings();
			/*this.$el.addClass("mdl-badge");
			 this.$el.attr("data-badge", "1");*/
			this.on("setBadgeData", this.setBadgeData);
			switch (this.settings.get("type")) {
				case "raised":
					this.$el.addClass("mdl-button--raised");
					this.template = _.template(ButtonTemplate);
					break;
				case "fab":
					this.$el.addClass("mdl-button--fab");
					this.template = _.template(FabTemplate);
					break;
				case "mini-fab":
					this.$el.addClass("mdl-button--fab mdl-button--mini-fab");
					this.template = _.template(FabTemplate);
					break;
				case "icon":
					this.$el.addClass("mdl-button--icon");
					this.template = _.template(IconTemplate);
					break;
				default:
					this.template = _.template(ButtonTemplate);
			}
			switch (this.settings.get("color")) {
				case "color-primary":
					this.$el.addClass("mdl-button--primary");
					break;
				case "color-accent":
					this.$el.addClass("mdl-button--accent");
					break;
			}
			if (this.settings.get("hasRipple")) {
				this.$el.addClass("mdl-js-ripple-effect");
				//this.$el.append('<span class="mdl-button__ripple-container"></span>');
				/*this.ripple = new RippleView({
					settings: {
						animationTime: 0.2
					}
				});
				this.$el.find(".mdl-button__ripple-container").html(this.ripple.render().el);*/
			}
			if (this.settings.get("customClass")) {
				this.$el.addClass(this.settings.get("customClass"));
			}
			if (this.settings.get("customId")) {
				this.$el.attr("id", this.settings.get("customId"));
			}

		},

		onButtonClick: function (e) {
			if (this.ripple) {
				this.ripple.animate(e);
			}
			this.trigger("buttonClicked", e);
		},
		onButtonDblClick: function () {
			this.trigger("buttonDblClicked");
		},
		render: function () {
			this.$el.prepend(this.template({
				content: this.settings.get("content")
			}));
			if (this.settings.get("type") == "icon" && this.settings.get("hasBadge")) {
				this.$el.find("i").addClass("mdl-badge");
				if (this.settings.get("dataBadge")) {
					this.$el.find("i").attr("data-badge", this.settings.get("dataBadge"));
				}
			}
			return this;
		},
		setBadgeData: function (number) {
			if (this.settings.get("type") == "icon" && this.settings.get("hasBadge")) {
				if (number == "" || number == 0 || !number) {
					this.$el.find("i").removeAttr("data-badge");
					return;
				}
				this.$el.find("i").attr("data-badge", number);
			}
		}
	});

	return ButtonView;
}));