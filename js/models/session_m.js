define([
	'jquery',
	'underscore',
	'backbone'
], function($, _, Backbone){
  	var Session = Backbone.Model.extend({
  		getCookie: function(c_name) {
			var i,x,y,ARRcookies=document.cookie.split(";");
			for (i = 0; i<ARRcookies.length; i+= 1) {
				x = ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
				y = ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
				x = x.replace(/^\s+|\s+$/g,"");
				if (x === c_name) {
					return unescape(y);
				}
			}
		},
		
		setCookie: function(c_name,value,exdays) {
			var exdate = new Date();
			exdate.setDate(exdate.getDate() + exdays);
			var c_value = escape(value) + ((exdays === null) ? "" : "; expires="+exdate.toUTCString());
			document.cookie = c_name + "=" + c_value;
			return true;
		},
		
		checkCookie: function() {
			var username = this.getCookie("username");
			if (username !== null && username !== "" && username !== undefined) {
				return username;
			} else {
				return false;
			}
		},
		
		delCookie: function(c_name) {
			// set cookie to the past
			document.cookie = c_name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
			return true;
		}
  	});
  	
  	var session = new Session();
  	return session;
});