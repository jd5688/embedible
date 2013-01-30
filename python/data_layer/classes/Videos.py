#!/usr/bin/python
from data_layer.classes import Db

class Videos:
	def embed(self, param):
		# param is an object
		
		db = Db.con()
		cur = db.cursor()
		
		# all new videos are not approved by default (is_approved = 0)
		# not approved means that the video is not yet verified by admin
		# but by default is visible from the user -- until junked by admin
		q = """
			INSERT INTO videos (data, username, is_public, category, is_approved, tags) 
			VALUES 
			(%(data)s, %(username)s, %(is_public)s, %(category)s, %(is_approved)s, %(tags)s)
			"""
		cur.execute(q, param)
		db.commit()
		return 'success'
		
	def getAll(uid):
		cur = Db.con()
		cur.execute("SELECT embed FROM videos WHERE user_id = 'uid'")
		if cur.rowcount > 0:
			rows = cur.fetchall()
			return rows
			
	def getOne(self, key):
		cur = Db.con()
		qry = "SELECT * FROM videos WHERE mkey = %s" % key
		#qry = "SELECT * FROM videos WHERE user_id = %s" % 1
		cur.execute(qry)
		if cur.rowcount > 0:
			row = cur.fetchall()
			return row
		return false
			
	def publicize(key):
		cur = Db.con()
		cur.execute("UPDATE videos SET is_public = 1 WHERE mkey = 'key'")
		return true
		
	def privatize(key):
		cur = Db.con()
		cur.execute("UPDATE videos SET is_public = 0 WHERE mkey = 'key'")
		return true
		
	def allPublic():
		cur = Db.con()
		cur.execute("SELECT embed FROM videos")
		if cur.rowcount > 0:
			rows = cur.fetchall()
			return rows
			
	def allPublicByCategory(cat):
		cur = Db.con()
		cur.execute("SELECT embed FROM videos WHERE category = 'cat'")
		if cur.rowcount > 0:
			rows = cur.fetchall()
			return rows
			
	def allCategories(self):
	    db = Db.con()
	    cur = db.cursor()
	    
	    cur.execute("SELECT * FROM category")
	    if cur.rowcount > 0:
			rows = cur.fetchall()
			return rows
			
	def embedlyKey(self):
		return 'c08c28b368a34012a555be062cd495c4'