#!/usr/bin/python
from data_layer.classes import Db

class Users: 
	def user_query(self, param):
		db = Db.con()
		cur = db.cursor()
		q = """
			SELECT * FROM users WHERE user_email = %(username)s
		"""
		cur.execute(q, param)
		if cur.rowcount > 0:
			rows = cur.fetchall()
			db.close()
			return rows
		else:
			return False
			
	def userRegister(self, param):
		db = Db.con()
		cur = db.cursor()
		q = """
				INSERT INTO users 
				(user_email, user_pass, user_active) VALUES
				(%(username)s, %(password)s, 1)	
			"""
		cur.execute(q, param)
		try:
			db.commit()
			return True
		except:
			return False