(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["underscore", "backbone", "buttonView"], function (_, Backbone, ButtonView) {
            return (root.InputView = factory(_, Backbone, ButtonView));
        });
    } else if (typeof exports === "object") {
        module.exports = factory(require("underscore"), require("backbone"), require("buttonView"));
    } else {
        root.InputView = factory(root._, root.Backbone, root.ButtonView);
    }
}(this, function (_, Backbone, ButtonView) {

    var InputTemplate = '<input class="mdl-textfield__input" type="text">' +
        '<span class="mdl-textfield__label"><%= label %></span>';

    var SimpleInput = '<label class="mdl-textfield__label"><%= label %></label>' +
        '<a href="#" class="mdl-textfield__input simpleInput">' +
        '<div class="inputValue"><%= placeholder %></div></a>';

    var SearchTemplate =
        '<div class="mdl-textfield__expandable-holder">' +
        '<input class="mdl-textfield__input" type="text">' +
        '<label class="mdl-textfield__label"><%= placeholder %></label>' +
        '</div>';

    var TextareaTemplate = '<textarea class="mdl-textfield__input" rows="<%=rows%>"></textarea>' +
        '<label class="mdl-textfield__label"><%= placeholder %></label>';

    var FileTemplate = '';

    var Settings = Backbone.Model.extend({
        defaults: {
            type: "input", // input/search/textarea/simple/file
            placeholder: "",
            isFloating: false,
            rows: 3,
            isRightSideIcon: false,
            hasClearButton: true,
            hasDropDownIcon: false,
            isPassword: false,
	        hasValidation: false,
	        validationErrorText: ""
        },
        initialize: function (options) {
        }
    });

    var InputView = Backbone.View.extend({
        events: {
            "focusin .mdl-textfield__input": "onFocusIn",
            "focusout .mdl-textfield__input": "onFocusOut",
            "keyup .mdl-textfield__input": "onKeyUp",
            "click .dropDownIcon": "onDropDownIconClick",
            "click .mdl-textfield__input": "onClick",
            //"click .simpleInput": "onClick",
            "click .clearButton": "onClearButtonClick",
            "mouseup": "onMouseUp"
            //"click .mdl-button": "onIconClick",
            //"dblclick .mdl-button": "onDblClick"
        },
        tagName: "div",
        className: "mdl-textfield inputView mdl-js-textfield",

        clear: function () {
            this.$el.find("input").val("");
        },
        getValue: function () {
            return this.$el.find("input").val();
        },

        remove: function () {
            var components = this.el.querySelectorAll('[data-upgraded]');
            if (components.length > 0) {
                componentHandler.downgradeElements(components);
            }

            if (this.searchButton) {
                this.searchButton.remove();
            }
            if (this.clearButton) {
                this.clearButton.remove();
            }
            this.undelegateEvents();
            this.$el.removeData().unbind();
            this.stopListening();
            Backbone.View.prototype.remove.call(this);
        },

        initialize: function (options) {
            // _.bindAll.apply(_, [this].concat(_.functions(this)));
            this.settings = options && options.settings
                ? new Settings(options.settings)
                : new Settings();
            switch (this.settings.get("type")) {
                case "input":
                    this.template = _.template(InputTemplate);
                    if (this.settings.get("isFloating")) {
                        this.$el.addClass("mdl-textfield--floating-label");
                    }

                    break;
                case "search":
                    this.template = _.template(SearchTemplate);
                    this.$el.addClass("mdl-textfield--expandable");
                    this.searchButton = new ButtonView({
                        settings: {
                            type: "icon",
                            color: "color-primary",
                            content: "search"
                        }
                    });
                    this.$el.prepend(this.searchButton.render().el);
                    this.listenTo(this.searchButton, "buttonClicked", this.onIconClick);
                    this.listenTo(this.searchButton, "buttonDblClicked", this.onDblClick);
                    break;
                case "textarea":
                    this.template = _.template(TextareaTemplate);
                    break;
                case "simple":
                    if (this.settings.get("isFloating")) {
                        this.$el.addClass("mdl-textfield--floating-label");
                    }
                    this.template = _.template(SimpleInput);
                    break;
                default:
                    return console.error("InputView: Wrong type");
            }

            if (this.settings.get("hasClearButton")) {
                this.$el.addClass("hasClearButton");
            }

            if (this.settings.get("hasDropDownIcon")) {
                this.$el.addClass("hasDropDownIcon");
            }

            this.on("setValue", this.setValue);
        },

        onClearButtonClick: function (e) {
            e.preventDefault();
            switch (this.settings.get("type")) {
                case "input":
                    this.$el.find("input").val("");
                    break;
                case "search":
                    this.$el.find("input").val("");
                    break;
                case "textarea":
                    this.$el.find("textarea").val("");
                    break;
                case "simple":
                    this.$el.find(".inputValue").text("");
            }
            this.$el.removeClass("is-dirty");
            this.onKeyUp(e);
            this.trigger("input:clear");
        },

        onDropDownIconClick: function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.$el.find('.mdl-textfield__input').focus();
            this.trigger("input:click", e);

        },

        onClick: function (e) {
            e.preventDefault();
        },
        onDblClick: function () {
            this.$el.removeClass("is-focused");
        },
        onIconClick: function (e) {
            this.$el.find("input").focus();
            if (this.$el.find("input").val() && this.$el.find("input").val() != "") {
                this.trigger("input:submit", e);
            }
        },
        onFocusIn: function (e) {
            this.$el.addClass("is-focused");
            this.trigger("input:focusIn", e);
        },
        onFocusOut: function (e) {
            this.$el.removeClass("is-focused");
            this.trigger("input:focusOut", e);
        },
        onKeyUp: function (e) {
            if ($(e.currentTarget).hasClass("inputClearButton")) {
                return;
            }
            if ((this.$el.find("input").val() || this.$el.find("input").val() != "") && !this.$el.hasClass("is-dirty")) {
                this.$el.addClass("is-dirty");
            } else {
                if (this.$el.find("input").val() == "") {
                    this.$el.removeClass("is-dirty");
                }
            }

            if (e.keyCode == 13) {
                this.trigger("input:submit", e);

            } else {
                this.trigger("input:keyup", e);
            }
        },
        render: function () {
            if (this.settings.get("isRightSideIcon")) {
                this.$el.addClass("isRightSideIcon");
                this.$el.prepend(this.template({
                    placeholder: this.settings.get("placeholder"),
                    label: this.settings.get("label"),
                    rows: this.settings.get("rows")
                }));
            } else {
                this.$el.append(this.template({
                    placeholder: this.settings.get("placeholder"),
                    label: this.settings.get("label"),
                    rows: this.settings.get("rows")
                }));
            }
            if (this.settings.get("isPassword")) {
                this.$el.find("input").attr("type", "password");
            }
            if (this.settings.get("id")) {
                this.$el.find(".mdl-textfield__input").attr("id", this.settings.get("id"));
            }
            if (this.settings.get("hasDropDownIcon")) {
                this.$el.prepend('<i class="zmdi zmdi-caret-down dropDownIcon"></i>');
            }
            if (this.settings.get("hasClearButton")) {
                this.$el.prepend('<i class="clearButton inputClearButton zmdi zmdi-close"></i>');
            }
	        if(this.settings.get("hasValidation")){
		        this.$el.append('<span class="mdl-textfield__error">' + this.settings.get("validationErrorText") + '</span>');
	        }

            return this;
        },
	    toggleValidation: function (state) {
		    this.$el.toggleClass("is-invalid", state);
	    },
        setValue: function (value) {
            if (value !== "") {
                this.$el.addClass("is-dirty");
            } else {
                this.$el.removeClass("is-dirty");
            }
            switch (this.settings.get("type")) {
                case "input":
                case "search":
                    this.$el.find("input").val(value);
                    break;
                case "textarea":
                    this.$el.find("textarea").val(value);
                    break;
                case "simple":
	                if(value && value.icon) {
		                this.$el.find(".inputValue").text(value.value);
		                this.$el.find(".simpleInput i").remove();
		                this.$el.find(".simpleInput").append("<i class='zmdi zmdi-" + value.icon + "'></i>");
	                } else {
		                this.$el.find(".simpleInput i").remove();
		                this.$el.find(".inputValue").text(value);
	                }
            }
            return this;
        }
    });

    return InputView;
}));