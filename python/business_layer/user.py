#!/usr/bin/python

from data_layer.classes.User import Users
from data_layer.classes.Videos import Videos
from data_layer.classes.Playlists import Playlists
import md5
import urllib

# function for writing user-submitted data to database
# returns true
def login(param):
	u = Users()
	
	user = u.user_query(param);
	
	if (user):
		data = {
			'user_id'		: user[0][0],
			'user_email'	: user[0][1],
			'user_pass'		: user[0][2],
			'user_active'	: user[0][3]
		}
	
		# create a hash
		m = md5.new(data['user_email'] + data['user_pass'] + _private_key())
	
		# check if this hash is equal to the one transmitted
		if m.hexdigest() == param['password']:
			if data['user_active'] == 1:
				result	= 'success'
				message	= data['user_id']
			else:
				result = 'fail'
				message = 'User not activated.'
		else:
			result = 'fail'
			message = 'Authentication failed.'
	else:
		result = 'fail'
		message = 'Authentication failed.'
			
	obj = {
			'result'	: result,
			'message'	: message
		}
		
	return obj

def _private_key():
	return 'ph1li9sVAi0'
	
# get all embeds and the playlists created by the user
# if username is blank, returns false
def allEmbed(param):
	x = Videos()
	username = param['username']
	hash = param['hash']
	publc = param['publc']
	
	# create a hash
	m = md5.new(username + publc + _private_key())

	# check if this hash is equal to the one transmitted
	if m.hexdigest() == hash:
		
		data = x.allUserData(param)

		if data:
			embeds = {}
			i = 0
			for item in data:
				embeds[i] = {
					'id' : item[0],
					'category' : item[1],
					'tags' : item[2],
					'data' : item[3],
					'is_public' : item[4],
					'pkid' : item[5]
					#'date_added': item[5]
				}
				i = i + 1
		else:
			embeds = False

		# get the user's playlists
		# if username is blank, data will be false
		pl = Playlists()
		playlists = pl.getPlaylists(param)
		
		dat = {
				'data': embeds,
				#'records': x.allUserDataCount(param),
				'playlists': playlists,
				'id': 1234
			}
	else:
		dat = {
				'data': False,
				#'records' : 0,
				'playlists': False,
				'id': 1234
			}
		
	return dat
	
def allEmbedFromTags(param):
	x = Videos()
	username = param['username']
	data = x.allUserData(username)

	if data:
		embeds = {}
		i = 0
		for item in data:
			embeds[i] = {
				'id' : item[0],
				'category' : item[1],
				'tags' : item[2],
				'data' : item[3],
				'is_public' : item[4],
				'pkid' : item[5]
				#'date_added': item[5]
			}
			i = i + 1
	else:
		embeds = False

	# get the user's playlists
	# if username is blank, data will be false
	pl = Playlists()
	param = {
		'username' : username
	}
	playlists = pl.getPlaylists(param)
	
	dat = {
			'data': embeds,
			'playlists': playlists,
			'id': 1234
		}
		
	return dat

def deleteEmbed(hash, publc, id):
	x = Videos()
	
	# create a hash
	m = md5.new(id + publc + _private_key())
	if m.hexdigest() == hash:
		param = {
			'hash': hash,
			'id': id
		}
		bool = x.deleteEmbed(param)
		dat = { 'response' : bool }
	else:
		dat = { 'response': 'failed' }
		
	return dat

def removeEmbed(hash, publc, pl_id, vid_id):
	x = Playlists()
	
	# create a hash
	m = md5.new(pl_id + publc + _private_key())

	if m.hexdigest() == hash:
		param = {
			'pl_id': pl_id,
			'vid_id': vid_id
		}
		bool = x.removeEmbed(param)
		dat = { 'response' : bool }
	else:
		dat = { 'response': 'failed' }
		
	return dat

def deletePlaylist(hash, publc, pl_id):
	x = Playlists()
	
	# create a hash
	m = md5.new(pl_id + publc + _private_key())
	
	if m.hexdigest() == hash:
		param = {
			'pl_id': pl_id
		}
		bool = x.deletePlaylist(param)
		dat = { 'response' : bool }
	else:
		dat = { 'response': 'failed' }
		
	return dat

#set user content to public or private
def set_public(hash, publc, is_public, id):
	x = Videos()
	
	# create a hash
	m = md5.new(id + publc + _private_key())
	
	if m.hexdigest() == hash:
		param = {
			'id': id,
			'is_public': is_public
		}
		bool = x.embedToPublic(param)
		dat = { 'response' : bool }
	else:
		dat = { 'response': 'failed' }
		
	return dat

#set user playlist to public or private
def set_pl_public(hash, publc, is_public, pl_id):
	x = Playlists()
	
	# create a hash
	m = md5.new(pl_id + publc + _private_key())
	
	if m.hexdigest() == hash:
		param = {
			'pl_id': pl_id,
			'is_public': is_public
		}
		bool = x.playlistToPublic(param)
		dat = { 'response' : bool }
	else:
		dat = { 'response': 'failed' }
		
	return dat

def playlists(param):	
	x = Playlists()
	data = False
	records = 0
	
	hash = param['hash']
	publc = param['publc']
	username = param['username']
	src = param['src']
	
	if username == 'false':
		username = ''
	
	param = {
			'username' : username,
			'curPage' : param['curPage'],
			'limit' : param['limit']
		}
	m = md5.new(publc + _private_key())
	
	if username:
		# check if this hash is equal to the one transmitted
		if m.hexdigest() == hash:
			if src == 'home':
				data = x.getPublicPlaylists(param)
				records = x.getPublicPlaylistsCount(param)
			else:
				data = x.getPlaylists(param)
	else:
		# check if this hash is equal to the one transmitted
		if m.hexdigest() == hash:
			data = x.getPublicPlaylists(param)
			records = x.getPublicPlaylistsCount(param)
	
	
			
	return {
		'data': data,
		'records': records,
		'id': 1234
	}

def playlist(hash, publc, uniq_id, username=""):
	if username == 'false':
		username = ''
		
	x = Playlists()
	data = False
	# create a hash
	m = md5.new(publc + uniq_id + _private_key())
	
	# check if this hash is equal to the one transmitted
	if m.hexdigest() == hash:
		
			
		param = {
			'uniq_id' : uniq_id,
			'username': username
		}
		data = x.getPlaylist(param)
			
	return {
		'data': data,
		'id': 1234
	}
	
# add a playlist
def add_playlist(param):
	x = Playlists()
	
	hash = param['hash']
	publc = str(param['publc'])

	# create a hash
	m = md5.new(publc + _private_key())

	# check if this hash is equal to the one transmitted
	if m.hexdigest() == hash:
		data = {
			'username' 	: param['username'],
			'playlist' 	: param['pl_name'],
			'description': param['pl_desc'],
			'tags'		: param['pl_tags'],
			'key'		: _private_key()
		}
		
		return x.add_playlist(data)
	else:
		return 'failed'

# add contents to playlist
def add_to_playlist(hash, publc, atpl_id, list_ids):
	x = Playlists()
	
	# create a hash
	m = md5.new(atpl_id + publc + _private_key())
	
	# check if this hash is equal to the one transmitted
	if m.hexdigest() == hash:
		param = {
			'atpl_id' : atpl_id,
			'list_ids': list_ids
		}
		data = x.add_to_playlist(param)
		dat = { 'response' : data }
	else:
		dat = { 'response' : '' }
		
	return dat