#!/usr/bin/python
from data_layer.classes import Db
import base64

class Videos:
	def embed(self, param):
		# param is an object
		
		db = Db.con()
		cur = db.cursor()
		
		# all new videos are not approved by default (is_approved = 0)
		# not approved means that the video is not yet verified by admin
		# but by default is visible from the user -- until junked by admin
		q = """
			INSERT INTO videos (uniq, data, username, is_public, category, is_approved, tags) 
			VALUES 
			('xdemx', %(data)s, %(username)s, %(is_public)s, %(category)s, %(is_approved)s, %(tags)s)
			"""
		cur.execute(q, param)
		db.commit()
		
		lastId = cur.lastrowid
		db.close()
		return self._insertUniq(lastId, param['username'])
	
	def deleteEmbed(self, param):
		db = Db.con()
		cur = db.cursor()
		
		qry = "SELECT uniq,username,category,tags,data FROM videos WHERE id = %(id)s LIMIT 0, 1"
		cur.execute(qry, param)
		if cur.rowcount > 0:
			rows = cur.fetchall()
			data = {
				'uniq': rows[0][0],
				'username': rows[0][1],
				'category': rows[0][2],
				'tags': rows[0][3],
				'data': rows[0][4]
			}
			# now insert it
			q = """
				INSERT INTO deleted (uniq, data, username, is_public, category, is_approved, tags) 
				VALUES 
				(%(uniq)s, %(data)s, %(username)s, '1', %(category)s, '1', %(tags)s)
				"""
			cur.execute(q, data)
			db.commit()
		
		cur.execute("""DELETE FROM videos WHERE id = %(id)s""", param)	
		try:
			db.commit()
			
			resp = 'success'
		except:
			resp = False
		
		db.close()
		return resp
	
	def _insertUniq(self, id, username):
		db = Db.con()
		cur = db.cursor()
		myUniq = base64.b64encode(str(username) + str(id))
		
		par = {
			'uniq': myUniq
		}
		
		cur.execute("""UPDATE videos SET uniq = %(uniq)s WHERE uniq = 'xdemx'""", par)
		db.commit()
		db.close()
		return { 'success' : 'success' }
	
	# set the embed to public or private
	def embedToPublic(self, param):
		db = Db.con()
		cur = db.cursor()
		
		cur.execute("""UPDATE videos SET is_public = %(is_public)s WHERE id = %(id)s""", param)
		
		try:
			db.commit()
			resp = 'success'
		except:
			resp = False
		
		db.close()
		return resp
	
	# get all contents that are marked as public
	def allPublic(self):
		db = Db.con()
		cur = db.cursor()
		qry = "SELECT uniq,category,tags,data,date_added FROM videos WHERE is_public = '1' ORDER BY id DESC LIMIT 0, 100"
		cur.execute(qry)
		if cur.rowcount > 0:
			rows = cur.fetchall()
			return rows
		#return false
	
	def allUserData(self, username):
		if username == False:
			return False;
			
		db = Db.con()
		cur = db.cursor()
		qry = "SELECT uniq,category,tags,data,is_public,id,date_added FROM videos WHERE username = %s ORDER BY id DESC"
		cur.execute(qry, username)
		if cur.rowcount > 0:
			rows = cur.fetchall()
			db.close()
			return rows
		else:
			db.close()
			return False
			
	# get all public contents by type (photo, video, link, rich)
	def allPublicByType(self,type):
		obj = {
			'type1' : '%"type": "' + type + '"%',
			'type2' : '%"type":"' + type + '"%',
			'type3' : '%"type" : "' + type + '"%',
			'type4' : '%"type" :"' + type + '"%'
		}
		db = Db.con()
		cur = db.cursor()
		qry = "SELECT uniq,category,tags,data,date_added FROM videos WHERE is_public = '1' AND (data like %(type1)s OR data like %(type2)s OR data like %(type3)s OR data like %(type4)s) ORDER BY id DESC LIMIT 0, 100"
		cur.execute(qry, obj)
		if cur.rowcount > 0:
			rows = cur.fetchall()
			db.close()
			return rows
		else:
			db.close()
			return False;
	
	def allPublicByTag(self,tag):
		db = Db.con()
		cur = db.cursor()
		obj = {
			'tag' : '%' + tag + '%'
		}
		qry = "SELECT uniq,category,tags,data,date_added FROM videos WHERE is_public = 1 AND tags like %(tag)s"
		cur.execute(qry, obj)
		if cur.rowcount > 0:
			rows = cur.fetchall()
			db.close()
			return rows
		else:
			db.close()
			return False;
	
	# get public content by id
	def allPublicById(self,id):
		db = Db.con()
		cur = db.cursor()
		qry = "SELECT uniq,category,tags,data,date_added FROM videos WHERE uniq = %s"
		cur.execute(qry, id)
		if cur.rowcount > 0:
			row = cur.fetchall()
			db.close()
			return row
		else:
			db.close()
			return False
			
	def allCategories(self):
	    db = Db.con()
	    cur = db.cursor()
	    
	    cur.execute("SELECT * FROM category")
	    if cur.rowcount > 0:
			rows = cur.fetchall()
			db.close()
			return rows
	    else:
			return False
			
	def embedlyKey(self):
		return 'c08c28b368a34012a555be062cd495c4'