#!/usr/bin/python

# LIBRARY
from resource_layer.Request_Apache_WSGI  import Request_Apache_WSGI
from cgi import parse_qs, escape
import json
from business_layer import main as r_main


def application(environ, start_response):
    """
    Start point of the DMR application.  Handles routing for all the REST resources defined in the system.
    """
    
    ui_domain = 'http://localhost'
	
    # Wrap the environ in a request class
    request = Request_Apache_WSGI(environ)

    # Get the path array
    path_list = request.get_path_as_list()

    # Get the request method
    method = request.get_method()

    # Create the response array
    response = []

    requested_resource = path_list[0]

    # Write environment variables if no path was specified
    if requested_resource == '':
        status = '200 OK'
        headers = [('Content-type', 'text/plain; charset=utf-8')]
        start_response(status, headers)

        return [("%s: %s\n" % (key, value)).encode("utf-8") for key, value in environ.items()]

    # Ignore favicon request
    if requested_resource == 'favicon.ico':
        status = '200 OK'
        headers = [('Content-type', 'text/plain; charset=utf-8')]
        start_response(status, headers)

        return ["Ignored"]


    # Route request
    #     GET
    if method == 'GET':
    	d = parse_qs(environ['QUERY_STRING'])
    	callback = d.get('callback', [''])[0] # Returns the first value.
        if requested_resource == 'main':
        	status = '200 OK'
        	headers = [('Content-type', 'text/plain; charset=utf-8')]
        	start_response(status, headers)
        	response = r_main.main()
            #print(response)
        elif requested_resource == 'categories':
        	status = '200 OK'
        	#headers = [('Content-type', 'text/plain; charset=utf-8')]
        	headers = [('Content-type', 'application/json')]
        	start_response(status, headers)
        	# the format to return should be: ?(data);
        	data = r_main.cat_data()
        	response = callback + "(" + json.dumps(data) + ");"

	elif method == 'OPTIONS':
		#somehow, OPTIONS requests are not getting in here but at the 'else' statement
		
		print 'opt ' + method + ' ; ' + requested_resource
		status = '200 OK'
		headers = [
			('Content-type', 'text/plain; charset=utf-8'),
			('Access-Control-Allow-Origin', 'http://localhost'),
			('Access-Control-Allow-Methods', 'POST, GET, OPTIONS'),
			('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
		]
		start_response(status, headers)
		
		response = 'gon'
    	
    #     POST
    elif method == 'POST':
        if requested_resource == 'save_embed':
        	status = '200 OK'
        	headers = [('Content-type', 'application/json')]
        	start_response(status, headers)
        		
        	try:
        		request_body_size = int(environ.get('CONTENT_LENGTH', 0))
        	except (ValueError):
        		request_body_size = 0
        	
        	# request_body is a json string
        	request_body = environ['wsgi.input'].read(request_body_size)
        	
        	#parse json text into an object
        	jbody = json.loads(request_body)
        	
        	response = r_main.embed_data(jbody)

    # DELETE
    elif method == 'DELETE':
        # Addresses
        if requested_resource == 'person':
            response = r_person.delete(request, start_response, path_list)
    
    else:
		status = '200 OK'
		headers = [
			('Content-type', 'text/plain; charset=utf-8'),
			('Access-Control-Allow-Origin', ui_domain),
			('Access-Control-Allow-Methods', 'POST, GET, OPTIONS'),
			('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
		]
		start_response(status, headers)
		
		# just send a response
		response = 'success'

    #return json.dumps(response)
    return [response]