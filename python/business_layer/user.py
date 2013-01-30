#!/usr/bin/python

from data_layer.classes.User import Users
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
	
	
	