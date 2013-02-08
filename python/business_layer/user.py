#!/usr/bin/python

from data_layer.classes.User import Users
from data_layer.classes.Videos import Videos
import md5

# function for writing user-submitted data to database
# returns true
def login(param):
	u = Users()
	
	user = u.user_query(param);
	
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
		
	obj = {
			'result'	: result,
			'message'	: message
		}
		
	return obj

def _private_key():
	return 'ph1li9sVAi0'
	
def allEmbed(username):
	x = Videos()
	data = x.allUserData(username)

	if data:
		obj = {}
		i = 0
		for item in data:
			obj[i] = {
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
		obj = False

	
	dat = {
			'data': obj,
			'id': 1234
		}
		
	return dat

def deleteEmbed(hash, id):
	x = Videos()
	
	# create a hash
	m = md5.new(id + _private_key())
	if m.hexdigest() == hash:
		param = {
			'hash': hash,
			'id': id
		}
		bool = x.deleteEmbed(param)
		if bool:
			dat = { 'response' : bool }
	else:
		dat = { 'response': 'failed' }
		
	return dat
#set user content to public or private
def set_public(is_public, id):
	x = Videos()
	param = {
		'is_public': is_public,
		'id': id
	}
	
	bool = x.embedToPublic(param)
	
	if bool:
		dat = { 'response': bool }
	else:
		dat = { 'response': 'failed' }
	
	return dat