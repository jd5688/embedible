#!/usr/bin/python

import sys, os
from data_layer.classes.Videos import Videos
import urllib
#from cgi import escape

# fetch the main body files
def main():
	x = Videos()
	data = x.getNew()

	obj = {}
	i = 0
	for item in data:
		obj[i] = {
			'id' : item[0],
			'category' : item[1],
            'tags' : item[2],
            'data' : item[3]
			#'date_added': item[4]
		}
		i = i + 1
	
	return obj
	
def cat_data():
	x = Videos()
	categ = x.allCategories()
	embedly = x.embedlyKey()
	
	#reassemble data into an object
	obj = {}
	i = 0
	for item in categ:
		obj[i] = {
			'id' : item[0],
			'name' : item[1]
		}
		i = i + 1
	
	data = {
		'key'	: embedly,
		'data'	: obj
	}
	return data

# function for writing user-submitted data to database
# returns true
def embed_data(param):
	x = Videos()
	
	#param arrived 'encodeURIcomponent' from the front end so use urllib.unquote_plus to decode
	data = {
		'data': urllib.unquote_plus(param['data']),
		'username' : param['username'],
		'is_public' : param['is_public'],
		'category' : param['category'],
		'tags' : param['tags'],
		'is_approved' : 0
	}
	
	return x.embed(data)
	
	
	