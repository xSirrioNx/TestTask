/**
 * Created by SirrioN on 07.09.2016.
 */
define(["backbone",
		"tabView",
		"text!app/commonModules/groups/templates/GroupsTemplate.html"],

	function (Backbone,
	          TabView,
	          GroupsTemplate) {

		var Settings = Backbone.Model.extend({
			defaults: {}
		});

		var GroupsView = Backbone.View.extend({

			template: _.template(GroupsTemplate),
			events: {
			},
			tagName: "div",
			className: "mdl-tabs mdl-js-tabs mdl-js-ripple-effect",

			initialize: function (options) {
				var self = this;
				this.settings = options ? new Settings(options) : new Settings();
				this.collection = this.settings.get("collection");
				this.groupsArray = _.uniq(_.pluck(this.collection.fullCollection.toJSON(), 'group'));
				this.collectionsArray = [];
				_.each(this.groupsArray, function (group) {
					var collection = Backbone.Collection.extend();
					self.collectionsArray[group] = new collection(self.collection.fullCollection.where({group: group}));
				});
				/*this.renderTabs();
				console.debug("ready");*/
				setTimeout(()=>{this.trigger("tabsPrepared");}, 100);

			},
			render: function () {
				var self = this;
				this.$el.prepend(this.template());
				_.each(this.groupsArray, function (group, index) {
					var isActive = "";
					if(index == 0){
						isActive = " is-active";
					}
					//self.$el.find(".mdl-tabs__tab-bar").append('<a href="#' + group + '" class="mdl-tabs__tab'+isActive+'">' + group + '</a>');
				});
				componentHandler.upgradeDom();
				return this;
			},
			renderTabs: function () {
				var self = this;
				_.each(this.groupsArray, function (group, index) {
					var isActive = false;
					if(index == 0){
						isActive = true;
					}
					var itemView = new TabView({
						name: group,
						isActive: isActive
						//collection: self.collectionsArray[group]
					});
					self.$el.append(itemView.render().el);
				});
			}
		});
		return GroupsView;
	});