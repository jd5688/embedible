require.config({
  paths: {   
    //baseURL is /js/
    jquery: 'libs/jquery',
    bootstrap: 'libs/bootstrap/bootstrap.min',
    tooltip: 'libs/bootstrap/bootstrap-tooltip',
	modal: 'libs/bootstrap/bootstrap-modal',
    jcrypt: 'libs/jquery.crypt',
	carousel: 'libs/jquery.carouFredSel-6.2.0-packed',
    underscore: 'libs/underscore',
    backbone: 'libs/backbone', // this version of backbone is AMD enabled, downloaded at https://github.com/amdjs
    templates: '../templates', // the templates folder
    text: 'text', // required for require-ing templates
    DEM: 'namespace', // set globals here
	Paginator: 'paginator',
    mysession: 'models/session_m' // user session
  }
});

require([
  	'app',
], function(app){
    app.initialize();
});