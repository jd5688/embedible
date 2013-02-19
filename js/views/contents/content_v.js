define([
  'jquery',
  'bootstrap',
  'underscore',
  'backbone',
  'models/content_m',
  'DEM',
  'text!templates/index/detail_tpl.html',
  'text!templates/facebook/fb_comments_tpl.html',
], function($, bootstrap, _, Backbone, Content_m, DEM, detail_tpl, fb_comments){
	var Content = {
		'View'	: function () { 
			return Backbone.View.extend({
				events: {
					'click #showDetBut':  'showDetails',
					'click #hideDetBut':  'hideDetails',
					'click a[name=linktags]' : 'redir',	
				},
				initialize: function () {
					this.render();
				},
				render: function () {
					if (this.model.has("id") || this.model.has("username")) {
						if (this.model.hasChanged) {
							this.model.on('change', this.main_body, this);
						} else {
							// if model has attribute named 'id' or 'username', and it hasn't changed value, load main_body immediately.
							this.main_body();
						}
					} else {
						// Otherwise, wait. if change happens, then load main_body.
						this.model.on('change', this.main_body, this);
					}
				},
				main_body: function () {
					var data = {};
					data.data = this.json();
					if (typeof data.data.id === 'undefined') {
						Backbone.history.navigate('404', true); // not found
					} else {
						// load the fb comments plugin code
						var fbTemplate = _.template( fb_comments );
						$("#head").append( fbTemplate );
						
						//get the tags
						var tags = data.data.tags;
						var tagsArr = tags.split(',');
						data.data.tags = this._createTagLinks(tagsArr);
						
						data.website = DEM.website;
						var template = _.template( detail_tpl, data );
						//render the template
						this.$el.html( template );
					}
				},
				_createTagLinks: function (tagsArr) {
					var tags = '';
					for (i = 0; i < tagsArr.length; i+= 1) {
						if (i === 0) {
							tags += '<a name="linktags" href="" id="' + $.trim(tagsArr[i]) + '">' + $.trim(tagsArr[i]) + '</a>';
						} else {
							tags += ', <a name="linktags" href="" id="' + $.trim(tagsArr[i]) + '">' + $.trim(tagsArr[i]) + '</a>';
						}
					}
					return tags;
				},
				json: function() {
					return this.model.toJSON();
				},
				showDetails: function () {
					$("#conDetails").fadeIn();
					$("#showDetBut").hide();
					$("#hideDetBut").show();
					return false;
				},
				hideDetails: function () {
					$("#conDetails").fadeOut();
					$("#showDetBut").show();
					$("#hideDetBut").hide();
					return false;
				},
				redir: function (e) {
					var clickedEl = $(e.currentTarget); // which element was clicked?
					var tag = clickedEl.attr("id");
					tag = tag.replace(/ /g, "+");
					tag = encodeURIComponent(tag);
					var uri = 'tags/' + tag;
					e.preventDefault();
					Backbone.history.navigate(uri, true);
				},
				onClose: function(){
					this.model.unbind("change", this.render);
				}
			});
		},
		'Model': function () {
			return new Content_m();
		},
	}
	return Content;
});