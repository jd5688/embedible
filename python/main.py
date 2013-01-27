#!/usr/bin/python

from wsgiref.simple_server import make_server
from resource_layer.rest import application as rest_application
import logging
import sys

httpd = make_server('', 8000, rest_application)
print('Serving on port 8000...')
httpd.serve_forever()
