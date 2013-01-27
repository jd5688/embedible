import json
from urlparse import parse_qs
import cPickle

class rest_attr:
    PATH_INFO       = 'PATH_INFO'
    REQUEST_METHOD  = 'REQUEST_METHOD'
    CONTENT_LENGTH  = 'CONTENT_LENGTH'
    QUERY_STRING    = 'QUERY_STRING'
    HTTP_HOST       = 'HTTP_HOST'
    SERVER_NAME     = 'SERVER_NAME'

class Request_Apache_WSGI:
    # INIT
    def __init__(self, environ):
        self.environ = environ
        self.query_args = parse_qs(environ[rest_attr.QUERY_STRING])

    # METHOD
    # Get the request method
    def get_method(self):
        return self.environ[rest_attr.REQUEST_METHOD]

    # HOST
    # Get host name
    def get_host(self):
        if self.environ.get(rest_attr.HTTP_HOST):
            return self.environ[rest_attr.HTTP_HOST]

        return self.environ[rest_attr.SERVER_NAME]

    # CONTENT
    # Get the post request as a json object
    def get_post_data_as_json(self):
        length = int(self.environ.get(rest_attr.CONTENT_LENGTH, '0'))
        data   = self.environ['wsgi.input'].read(length)
        #print('data from wsgi post %s type %s' %(data, type(data)))
        json_obj = json.loads(data)

        return json_obj
        # Get the raw post data
    def get_raw_post_data(self):
        length = int(self.environ.get(rest_attr.CONTENT_LENGTH, '0'))
        data   = self.environ['wsgi.input'].read(length)
        return data

    # Get pickled post data
    def get_post_data_as_pickle(self):
        length = int(self.environ.get(rest_attr.CONTENT_LENGTH, '0'))
        data   = self.environ['wsgi.input'].read(length)
        return cPickle.loads(data)

    # PATH
    # Get the path
    def get_path(self):
        return self.environ[rest_attr.PATH_INFO]
        # Get the parts of the path as a list
    def get_path_as_list(self):
        return self.environ[rest_attr.PATH_INFO].split('/')[1:]

    # QUERY ARGS
    #    Get a query arg
    def get_query_arg(self, key):
        try:
            return self.query_args[key][0]
        except:
            return None
        #    Get the dict of all query args
    def get_query_args(self):
        return self.query_args




