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
			return rows