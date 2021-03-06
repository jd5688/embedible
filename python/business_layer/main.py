#!/usr/bin/python

import sys, os
from data_layer.classes.Videos import Videos
from data_layer.classes.Playlists import Playlists
import urllib
import md5
#from cgi import escape

# fetch the main body files
def main(param):
	x = Videos()
	
	hash = param['hash']
	publc = param['publc']
	
	# create a hash
	m = md5.new(publc + _private_key())

	# check if this hash is equal to the one transmitted
	if m.hexdigest() == hash:
	
		data = x.allPublic(param)
		
		if data:
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
		else:
			obj = False
			
		dat = {
			'data': obj,
			'records': x.countRecords('videos', '', 1),
			'id': 1234
		}
	else:
		dat = {
			'data': False,
			'records': 0,
			'id': 1234
		}
	
	return dat
	
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
	
	hash = param['hash']
	publc = str(param['publc'])

	# create a hash
	m = md5.new(publc + _private_key())

	# check if this hash is equal to the one transmitted
	if m.hexdigest() == hash:
		#param arrived 'encodeURIComponent' from the front end so use urllib.unquote_plus to decode
		data = {
			'data': urllib.unquote_plus(param['data']),
			'username' : param['username'],
			'is_public' : param['is_public'],
			'category' : param['category'],
			'tags' : param['tags'],
			'is_approved' : 0
		}

		return x.embed(data)
	else:
		return 'failed'

def contentById(param):
	id = param['id']
	x = Videos()
	obj = {}
	obj2 = {}
	
	hash = param['hash']
	publc = str(param['publc'])

	# create a hash
	m = md5.new(id + publc + _private_key())

	# check if this hash is equal to the one transmitted
	if m.hexdigest() == hash:
		# get the user's playlists
		# if username is blank, data will be false
		pl = Playlists()
		playlists = pl.getPlaylists(param)

		data = x.allPublicById(id)
		if data:
			obj = {
				'detail': 1, # this is a detail page
				'id': data[0][0],
				'category':	data[0][1],
				'tags':	data[0][2],
				'data':	data[0][3],
				'video_id': data[0][4],
				'playlists': playlists
				#'date_added'	:	data[0][4]
			}
			recommend = x.recommendedByTags(id, obj['tags'], obj['category'])
			i = 0
			if recommend:
				for item in recommend:
					obj2[i] = {
						'id' : item[0],
						'uniq': item[1],
						'data' : item[7]
					}
					i = i + 1
			else:
				obj2 = False
			
			obj['recommend'] = obj2
		else:
			obj = {
				'message': 'no record found'
			}
	else:
		obj = {
			'message': 'authentication failure'
		}
		
	return obj
	
def contents(param):
	x = Videos()
	
	hash = param['hash']
	publc = param['publc']
	type = param['type']
	
	# create a hash
	m = md5.new(publc + _private_key())

	# check if this hash is equal to the one transmitted
	if m.hexdigest() == hash:
	
		data = x.allPublicByType(param)
		
		obj = {}
		i = 0
		if data:
			for item in data:
				obj[i] = {
					'id' : item[0],
					'category' : item[1],
					'tags' : item[2],
					'data' : item[3]
					#'date_added': item[4]
				}
				i = i + 1
		else:
			obj = False
		
		dat = {
			'id': 1234, # just a random id
			'records': x.countRecords('videos', type, 1),
			'data': obj
		}
	else:
		dat = {
			'id': 1234, # just a random id
			'records': 0,
			'data': False
		}
	return dat

def contentsByTag(param):
	x = Videos()
	p = Playlists()
	
	hash = param['hash']
	publc = param['publc']
	
	# create a hash
	m = md5.new(publc + _private_key())

	# check if this hash is equal to the one transmitted
	if m.hexdigest() == hash:
		data = x.allPublicByTag(param)
		
		obj = {}
		i = 0
		if data:
			for item in data:
				obj[i] = {
					'id' : item[0],
					'category' : item[1],
					'tags' : item[2],
					'data' : item[3]
					#'date_added': item[4]
				}
				i = i + 1
		else:
			obj = data
		
		dat = {
			'id': 1234, # just a random id
			'data': obj,
			'records': x.allPublicByTagCount(param),
		}
	return dat

def contentsByTagPl(param):
	x = Videos()
	p = Playlists()
	
	hash = param['hash']
	publc = param['publc']
	
	# create a hash
	m = md5.new(publc + _private_key())
	
	# check if this hash is equal to the one transmitted
	if m.hexdigest() == hash:
		data = p.getPublicPlaylistsByTag(param)
		dat = {
			'id': 1234, # just a random id
			'data': data,
			'records': p.getPublicPlaylistsByTagCount(param)
		}
	else:
		dat = {
			'id': 1234, # just a random id
			'data': False,
			'records': 0
		}
	return dat

def tagscloud(hash, publc):
	x = Videos()
	
	# create a hash
	m = md5.new(publc + _private_key())
	
	# check if this hash is equal to the one transmitted
	if m.hexdigest() == hash:
		data = x.getAllTags()
		dat = {
			'id': 1234, # just a random id
			'data': data
		}
	else:
		dat = {
			'id': 1234, # just a random id
			'data': False
		}
	return dat

def search(param):
	x = Videos()
	p = Playlists()
	
	hash = param['hash']
	publc = param['publc']
	
	# create a hash
	m = md5.new(publc + _private_key())

	# check if this hash is equal to the one transmitted
	if m.hexdigest() == hash:
		data = x.allPublicBySearch(param)
		
		obj = {}
		i = 0
		if data:
			for item in data:
				obj[i] = {
					'id' : item[0],
					'category' : item[1],
					'tags' : item[2],
					'data' : item[3]
					#'date_added': item[4]
				}
				i = i + 1
		else:
			obj = data
		
		dat = {
			'id': 1234, # just a random id
			'data': obj,
			'records': x.allPublicBySearchCount(param),
		}
	return dat
	
def _private_key():
	return 'ph1li9sVAi0'
	