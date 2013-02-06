define([
  'jquery',
  'bootstrap',
  'tooltip',
  'underscore',
  'backbone',
  'models/index_main_m',
  'DEM',
  'text!templates/dashboard/dashboard_nav_tpl.html',
  'text!templates/dashboard/main_body_tpl.html',
  'text!templates/dashboard/preloader_tpl.html',
], function($, bootstrap, tooltip, _, Backbone, Index_m, DEM, d_nav, body_tpl, preloader_tpl){
	var Dashboard = {
		View : function () {
			return Backbone.View.extend({
				events: {
					'click input[type=image]':  'redir',
					'click #show_all': 'redir2',
					'click #my_videos': 'redir2',
					'click #my_photos': 'redir2',
					'click #my_rich': 'redir2',
					'click #my_links': 'redir2',
					'click #propu': 'propu'
				},
				initialize: function () {
					this.counter = this.inc(); // initialize counter
					this.render();
				},
				inc : function () {
					var i = 0;
					return function (j) {
						return j !== undefined ? j : i += 1;
					};
				},
				
				counter : '',
				render: function () {
					if (this.model.has("username") || this.model.has("id")) {
						// if model has attribute named 'username', load main_body immediately.
						this.main_body();
					} else {
						// Otherwise, wait. if change happens, then load main_body.
						this.model.on('change', this.main_body, this);
					}
				},
				main_body: function () {
					var data = {};
					data.data = this.json();
					data.website = DEM.website;
					var template = _.template( body_tpl, data );
					//render the template
					this.$el.html( template );
					
					// check the uri and make the appropriate tab active at the dashboard
					var cURL = location.protocol + '//' + location.hostname + location.pathname
					
					//alert(cURL + ' - ' + DEM.website + 'dashboard/');
					
					if (cURL === DEM.website + 'dashboard' || cURL === DEM.website + 'dashboard/') {
						this._show_all();
					} else if (cURL === DEM.website + "dashboard/my_videos" || cURL === DEM.website + "dashboard/my_videos/") {
						this._my_videos();
					} else  if (cURL === DEM.website + "dashboard/my_photos" || cURL === DEM.website + "dashboard/my_photos/") {
						this._my_photos();
					} else  if (cURL === DEM.website + "dashboard/my_links" || cURL === DEM.website + "dashboard/my_links/") {
						this._my_links();
					} else  if (cURL === DEM.website + "dashboard/my_rich" || cURL === DEM.website + "dashboard/my_rich/") {
						this._my_rich();
					}
					
					// enable the tooltips plugin
					$('.thumbnail').tooltip({
						selector: "input[rel=tooltip]",
						placement: "bottom"
					});
					
					$('.none').tooltip({
						selector: "input[rel=tooltip]",
						placement: "bottom"
					});
				},
				json: function() {
					return this.model.toJSON();
				},
				redir: function (e) {
					if (this.counter() === 1) {
						if (typeof e !== "undefined") {
							var clickedEl = $(e.currentTarget); // which element was clicked?
							var uri = decodeURIComponent(clickedEl.attr("value")); // get the value
							//var uri = $("#" + id).val();
							e.preventDefault();
							Backbone.history.navigate(uri, true);
						}
					}
					
				},
				redir2: function (e) {
					if (this.counter() === 1) {
						if (typeof e !== "undefined") {
							var clickedEl = $(e.currentTarget); // which element was clicked?
							var uri = decodeURIComponent(clickedEl.attr("id")); // get the value
							uri = uri === "show_all" ? "" : uri;
							uri = "dashboard/" + uri;
							e.preventDefault();
							Backbone.history.navigate(uri, true);
						}
					}
				},	
				propu: function (e) {
					var clickedEl = $(e.currentTarget);
					// ID is the primary key id of the embed
					var id = clickedEl.attr("name");
					var axion = clickedEl.attr("title");
					console.log(id + ' - ' + axion);
					
					var template = _.template( preloader_tpl );
					
					if (axion === 'make it private') {
						// reverse the button to 'make it public'
						//var thisHtml = '<a href="#" id="propu" name="' + id + '" title="make it public"><span class="label label-info">private</span></a>';
						//$('#' + id).html(thisHtml);
						
						$('#' + id).html('<img src="images/icons/loading.gif"/>');
					} else { // make it public was pressed
						//var thisHtml = '<a href="#" id="propu" name="' + id + '" title="make it private"><span class="label">public</span></a>';
						//$('#' + id).html(thisHtml);
						
						$('#' + id).html('<img src="images/icons/loading.gif"/>');
					}
				},
				_show_all: function () {
					var data = {};
					data.activ = "show_all";
					var naviTabs = _.template( d_nav, data );
					$('#nav_tabs').html( naviTabs );
					
					$('#xmy_videos').hide();
					$('#xshow_all').fadeIn();
					$('#xmy_photos').hide();
					$('#xmy_links').hide();
					$('#xmy_rich').hide();
					return true;
				},
				_my_videos: function () {
					var data = {};
					data.activ = "my_videos";
					var naviTabs = _.template( d_nav, data );
					$('#nav_tabs').html( naviTabs );
					
					$('#xmy_videos').fadeIn();
					$('#xshow_all').hide();
					$('#xmy_photos').hide();
					$('#xmy_links').hide();
					$('#xmy_rich').hide();
					return true;
				},
				_my_photos: function () {
					var data = {};
					data.activ = "my_photos";
					var naviTabs = _.template( d_nav, data );
					$('#nav_tabs').html( naviTabs );
					
					$('#xmy_videos').hide();
					$('#xshow_all').hide();
					$('#xmy_photos').fadeIn();
					$('#xmy_links').hide();
					$('#xmy_rich').hide();
					return true;
				},
				_my_links: function () {
					var data = {};
					data.activ = "my_links";
					var naviTabs = _.template( d_nav, data );
					$('#nav_tabs').html( naviTabs );
					
					$('#xmy_videos').hide();
					$('#xshow_all').hide();
					$('#xmy_photos').hide();
					$('#xmy_links').fadeIn();
					$('#xmy_rich').hide();
					return true;
				},
				_my_rich: function () {
					var data = {};
					data.activ = "my_rich";
					var naviTabs = _.template( d_nav, data );
					$('#nav_tabs').html( naviTabs );
					
					$('#xmy_videos').hide();
					$('#xshow_all').hide();
					$('#xmy_photos').hide();
					$('#xmy_links').hide();
					$('#xmy_rich').fadeIn();
					return true;
				},
			});
		},
		'Main'	: function () {
			return new Index_m();
		}
	};
	return Dashboard;
});