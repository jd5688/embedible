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
	m = md5.new(data['user_email'] + data['user_pass']);
	
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
				'data' : item[3]
				#'date_added': item[4]
			}
			i = i + 1
	else:
		obj = {
			'message': 'no record found'
		}

	dat = {
			'data': obj,
			'id': 1234
		}
		
	return dat