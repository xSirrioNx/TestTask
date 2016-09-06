/**
 * Created by SirrioN on 18.04.2016.
 */
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["underscore", "backbone", "selectItemView", "checkboxView", "inputView"], function (_, Backbone, SelectItemView, CheckboxView, InputView) {
            return (root.SelectView = factory(_, Backbone, SelectItemView, CheckboxView, InputView));
        });
    } else if (typeof exports === "object") {
        module.exports = factory(require("underscore"), require("backbone"), require("selectItemView"), require("checkboxView"), require("inputView"));
    } else {
        root.SelectView = factory(root._, root.Backbone);
    }
}(this, function (_, Backbone, SelectItemView, CheckboxView, InputView) {


    var SelectTemplate = '<ul class="mdl-menu mdl-js-ripple-effect mdl-js-menu" for="<%=cid%>"></ul>';

    var Settings = Backbone.Model.extend({
        defaults: {

            placeholder: "",
            label: "",
            type: "simple", // simple/search/multiselect
            isNullable: false,
            placeholer: "",
            selectProperty: "isSelected",
            valueAttrName: "value",
            titleAttrName: "title",
            direction: "top",
        },
        initialize: function (options) {
        }
    });

    var SelectView = Backbone.View.extend({
        events: {},
        tagName: "div",
        className: "selectView",

        initialize: function (options) {
            _.bindAll.apply(_, [this].concat(_.functions(this)));
            var self = this;
            this.settings = options && options.settings
                ? new Settings(options.settings)
                : new Settings();
            this.template = _.template(SelectTemplate);
            this.collection = this.settings.get("collection");
            this.valueAttrName = this.settings.get("valueAttrName");
            this.titleAttrName = this.settings.get("titleAttrName");

            this.hasClearButton = self.settings.get("isNullable");
            this.selectProperty = self.settings.get("selectProperty");
            this.placeholder = this.settings.get("placeholder");
            this.hasCheckbox = false;
            this.hasDropDownIcon = true;
            this.inputType = "simple";
            this.isFloating = true;
            this.label = this.settings.get("label");

            if (this.settings.get("customClass")) {
                this.$el.addClass(this.settings.get("customClass"));
            }


            switch (this.settings.get("type")) {
                case "simple":
                    this.input = new InputView({
                        settings: {
                            placeholder: this.settings.get("placeholder"),
                            label: this.settings.get("label"),
                            isFloating: true,
                            type: "simple",
                            hasDropDownIcon: true,
                            valueAttrName: self.valueAttrName,
                            titleAttrName: self.titleAttrName,
                            hasClearButton: self.settings.get("isNullable"),
                            id: this.cid
                        }
                    });
                    this.listenTo(this.input, "input:submit", this.onSubmit);
                    this.listenTo(this.input, "input:click", this.onInputClick);
                    this.listenTo(this.input, "input:clear", this.onInputClear);
                    break;
                case "search":
                    this.input = new InputView({
                        settings: {
                            placeholder: this.settings.get("placeholder"),
                            label: this.settings.get("label"),
                            isFloating: true,
                            type: "input",
                            hasDropDownIcon: true,
                            valueAttrName: self.valueAttrName,
                            titleAttrName: self.titleAttrName,
                            hasClearButton: self.settings.get("isNullable"),
                            id: this.cid
                        }
                    });
                    this.cloneCollection = this.collection.clone();
                    this.listenTo(this.input, "input:keyup", this.onKeyUp);
                    this.listenTo(this.input, "input:submit", this.onSubmit);
                    this.listenTo(this.input, "input:focusIn", this.onFocusIn);
                    this.listenTo(this.input, "input:focusOut", this.onFocusOut);
                    this.listenTo(this.input, "input:click", this.onInputClick);
                    this.listenTo(this.input, "input:clear", this.onInputClear);
                    break;
                case "multiselect":
                    this.hasCheckbox = true;
                    this.input = new InputView({
                        settings: {
                            placeholder: this.settings.get("placeholder"),
                            label: this.settings.get("label"),
                            type: "simple",
                            hasDropDownIcon: true,
                            valueAttrName: self.valueAttrName,
                            titleAttrName: self.titleAttrName,
                            hasClearButton: self.settings.get("isNullable"),
                            id: this.cid
                        }
                    });
                    this.listenTo(this.input, "input:submit", this.onSubmit);
                    this.listenTo(this.input, "input:click", this.onInputClick);
                    this.listenTo(this.input, "input:clear", this.onInputClear);
                    this.listenTo(this, "isCheckedModel", this.setValue);
                    this.listenTo(this, "changeInput", this.onChangeInput);
                    break;
            }
            if (this.settings.get("type") != "multiselect") {
                this.on("setSelected", this.setSelected);
            }


        },
        render: function () {
            var self = this;
            this.$el.html(this.template({cid: this.cid}));
            this.$el.append(this.input.render().el);
            this.menuContainer = this.$el.find(".mdl-menu");
	        if(this.settings.get("maxDropdownHeight")){
		        this.menuContainer.css("max-height", this.settings.get("maxDropdownHeight"));
	        }
            switch (this.settings.get("direction")) {
                case "top":
                case "top-left":
                    this.menuContainer.addClass("mdl-menu--top-left");
                    break;
                case "top-right":
                    this.menuContainer.addClass("mdl-menu--top-right");
                    break;
                case "bottom-right":
                    this.menuContainer.addClass("mdl-menu--bottom-right");
                    break;
            }
            this.collection.each(function (model) {
                var view = new SelectItemView({
                    settings: {
                        model: model,
                        parentView: self,
                        hasRipple: true,
                        valueAttrName: self.valueAttrName,
                        titleAttrName: self.titleAttrName,
                        selectProperty: self.selectProperty,
                        hasCheckbox: self.hasCheckbox
                    }
                });
                self.menuContainer.append(view.render().el);
            });


            var object = {};
            object[this.settings.get("selectProperty")] = true;
            var selectedModels = this.collection.where(object);
            var value;
            if (selectedModels.length > 0) {
                var array = [];
                _.each(selectedModels, function (model) {
                    array.push(model.get(self.settings.get("titleAttrName")));
                });
                value = array.join();

            } else {
                value = "";
            }
            this.input.setValue(value);

            return this;
        },
        onChangeInput: function () {
            var object = {};
            object[this.settings.get("selectProperty")] = true;
            var selectedModels = this.collection.where(object);
            var value;
            var self = this;
            if (selectedModels && selectedModels.length > 0) {
                var array = [];
                _.each(selectedModels, function (model) {
                    array.push(model.get(self.settings.get("titleAttrName")));
                });
                value = array.join();

            } else {
                value = "";
            }
            this.input.setValue(value);
        },
        onFocusIn: function (e) {

        },
        onFocusOut: function (e) {

        },
        onInputClear: function () {
            if (this.settings.get("type") == "search") {
                this.cloneCollection.invoke('set', this.settings.get("selectProperty"), false);
            }
            this.collection.invoke('set', this.settings.get("selectProperty"), false);
            this.collection.invoke('set', {isChecked: false});
            this.trigger("changeSelectedItems", this.collection.find(this.settings.get("selectProperty"), true));
        },
        onInputClick: function (e) {
            document.getElementById(this.cid).click();
        },
        onKeyUp: function (e) {
            var q = $(e.target).val();
            var itemView;
            var self = this;
            //this.toggleDropdown(e, true);
            if (q == "") {
                if (!this.settings.get("isNullable")) {
                    if (!this.$el.hasClass("invalid")) {
                        this.$el.addClass("invalid");
                    }
                }
                this.collection.reset();
                this.collection.add(this.cloneCollection.models);
                this.collection.each(function (model) {
                    itemView = new SelectItemView({
                        settings: {
                            model: model,
                            parentView: self,
                            valueAttrName: self.valueAttrName,
                            titleAttrName: self.titleAttrName,
                            selectProperty: self.selectProperty,
                            hasCheckbox: self.hasCheckbox
                        }
                    });
                    self.menuContainer.append(itemView.render().el);
                });
                this.$el.find(".mdl-menu__outline, .mdl-menu__container").css("height", this.menuContainer.outerHeight());
            } else {
                if (!this.settings.get("isNullable")) {
                    if (this.$el.hasClass("invalid")) {
                        this.$el.removeClass("invalid");
                    }
                }
                this.collection.reset();
                var filteredModels = this.cloneCollection.filter(function (model) {
                    return ~model.get(self.settings.get("titleAttrName")).toString().toLowerCase().indexOf(q.toString().toLowerCase());
                });
                if (filteredModels.length == 0) {
                    this.$el.addClass("invalid");
                }
                this.collection.add(filteredModels);
                this.collection.each(function (model) {
                    itemView = new SelectItemView({
                        settings: {
                            model: model,
                            parentView: self,
                            valueAttrName: self.valueAttrName,
                            titleAttrName: self.titleAttrName,
                            selectProperty: self.selectProperty,
                            hasCheckbox: self.hasCheckbox
                        }
                    });
                    self.menuContainer.append(itemView.render().el);
                });
                this.$el.find(".mdl-menu__outline, .mdl-menu__container").css("height", this.menuContainer.outerHeight());
            }
        },
        onSubmit: function (e) {
            var self = this;
            var q = this.input.getValue();
            var filteredModels = this.cloneCollection.filter(function (model) {
                return ~model.get(self.settings.get("titleAttrName")).toString().toLowerCase().indexOf(q.toString().toLowerCase());
            });
            if (filteredModels.length == 0) {
                this.$el.addClass("invalid");
                this.input.clear();
            } else {
                var condition = {};
                condition[this.settings.get("titleAttrName")] = filteredModels[0].get(this.settings.get("titleAttrName"));
                var model = this.collection.findWhere(condition);
                model.set(this.settings.get("selectProperty"), true);
                this.setSelected(model);
            }
        },
        setSelected: function (model, submit) {
	        if(model.get("icon")) {
		        this.input.setValue({value: model.get(this.titleAttrName), icon: model.get("icon")});
	        } else {
		        this.input.setValue(model.get(this.titleAttrName));
	        }
            if (!this.settings.get("isNullable")) {
                if (this.$el.hasClass("invalid")) {
                    this.$el.removeClass("invalid");
                }
            }

            if (this.settings.get("type") == "search") {
                var value = model.get(this.settings.get("selectProperty"));
                var searchParams = {};
                searchParams[this.valueAttrName] = model.get(this.valueAttrName);
                var cloneModel = this.cloneCollection.findWhere(searchParams);
                this.cloneCollection.invoke('set', this.settings.get("selectProperty"), false);
                cloneModel.set(this.settings.get("selectProperty"), value);
            }

            if (this.settings.get("parentView")) {
                this.settings.get("parentView").trigger("setSelected");
            }
            //this.toggleDropdown(false, false);

            this.trigger("changeSelectedItems", this.collection.find(this.settings.get("selectProperty"), true));
        },
        remove: function () {
            this.trigger("remove");
            var components = this.el.querySelectorAll('[data-upgraded]');
            if (components.length > 0) {
                componentHandler.downgradeElements(components);
            }

            if (this.ripple) {
                this.ripple.remove();
            }
            if (this.input) {
                this.input.remove();
            }

            // COMPLETELY UNBIND THE VIEW
            this.undelegateEvents();
            this.$el.removeData().unbind();
            this.stopListening();

            // Remove view from DOM
            Backbone.View.prototype.remove.call(this);
        },

    });

    return SelectView;
}));