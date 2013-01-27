$(document).ready(function() {
	DEM.models.Indx = Backbone.Model.extend({
		// cross-domain needs a callback to work properly
		urlRoot: DEM.domain + "categories?callback=?",
		defaults: {
			data: '',
			key: ''
		}
	});
	
	var indx = new DEM.models.Indx();
	indx.fetch();
	
	DEM.views.IndxView = Backbone.View.extend({
		events: {
			"click input[type=radio]": "onRadioClick",
			'click #choose_cat': 'showSelect',
			'click #hide_cat': 'hideSelect',
			'change #url': 'embedly',
		},
		initialize: function () {
			this.model.on('change', this.render, this)
			//this.render();
		},
		render: function () {
			//this.model.fetch();
			var attributes = this.model.toJSON();
			var embedlyKey = attributes.key;
			var template = _.template( $('#select_form').html(), attributes);
			//render the template
			this.$('#sf').html( template );
		},
		showSelect: function() {
			// display the radio buttons
			this.$('#sf').fadeIn();
			this.$('#b1').hide();
			this.$('#b2').show();
		},
				
		hideSelect: function() {
			// hide the radio buttons
			this.$('#sf').fadeOut();
			this.$('#b1').show();
			this.$('#b2').hide();
		},
				
		onRadioClick: function() {
			// if radio button clicked
			this.hideSelect();
			// assign the value of the 'checked' radio to rvalue;
			rvalue = $("input:radio[name=category]:checked").val();
			// update the span #disp_cat
			this.$('#disp_cat').html(rvalue);
		},
				
		embedly: function() {
			var url = this.$('#url').val();
			var api = 'http://api.embed.ly/1/oembed?key=' + embedlyKey + '&url=' + url;
			$.get(api, function(data) {
				alert(data);
			});
		}
	});
	
	var indxView = new DEM.views.IndxView({ el: $("body"), model: indx });
});