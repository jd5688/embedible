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
		return 'success'
	
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
	def allPublic(self, param):
		db = Db.con()
		cur = db.cursor()
		
		limit = param['limit'] # 20 per page
		curPage = param['curPage'] # 1
		endAt = int(curPage) * int(limit) # 20
		startAt = endAt - int(limit) # 20 - 20 = 0
		
		newPar = {
			'startAt' : startAt,
			'limit' : int(limit)
		}
		
		qry = "SELECT uniq,category,tags,data,date_added FROM videos WHERE is_public = '1' ORDER BY id DESC LIMIT %(startAt)s, %(limit)s"
		cur.execute(qry, newPar)
		if cur.rowcount > 0:
			rows = cur.fetchall()
			db.close()
			return rows
		else:
			db.close()
			return rows
	
	def allUserData(self, param):
		username = param['username']
		if username == False:
			return False;
		
		# pagination does not work at this time
		#limit = param['limit'] # 20 per page
		#curPage = param['curPage'] # 1 is the current page
		#endAt = int(curPage) * int(limit) # 20 is the record number to end at
		#startAt = endAt - int(limit) # 20 - 20 = 0 is the record number to start at
		
		newPar = {
			'username': username,
			#'startAt' : startAt,
			#'limit' : int(limit)
		}
		
		db = Db.con()
		cur = db.cursor()
		qry = "SELECT uniq,category,tags,data,is_public,id,date_added FROM videos WHERE username = %(username)s ORDER BY id DESC"
		cur.execute(qry, newPar)
		if cur.rowcount > 0:
			rows = cur.fetchall()
			db.close()
			return rows
		else:
			db.close()
			return False
			
	def allUserDataCount(self, param):
		username = param['username']
		if username == False:
			return False;
		
		limit = param['limit'] # 20 per page
		curPage = param['curPage'] # 1 is the current page
		endAt = int(curPage) * int(limit) # 20 is the record number to end at
		startAt = endAt - int(limit) # 20 - 20 = 0 is the record number to start at
		
		newPar = {
			'username': username,
			'startAt' : startAt,
			'limit' : int(limit)
		}
		
		db = Db.con()
		cur = db.cursor()
		qry = "SELECT uniq,category,tags,data,is_public,id,date_added FROM videos WHERE username = %(username)s ORDER BY id DESC LIMIT %(startAt)s, %(limit)s"
		cur.execute(qry, newPar)
		if cur.rowcount > 0:
			records = cur.rowcount
		else:
			records = 0
			
		db.close()
		return records
			
	# get all public contents by type (photo, video, link, rich)
	def allPublicByType(self,param):
		type = param['type']
		
		limit = param['limit'] # 20 per page
		curPage = param['curPage'] # 1
		endAt = int(curPage) * int(limit) # 20
		startAt = endAt - int(limit) # 20 - 20 = 0
		
		obj = {
			'type1' : '%"type": "' + type + '"%',
			'type2' : '%"type":"' + type + '"%',
			'type3' : '%"type" : "' + type + '"%',
			'type4' : '%"type" :"' + type + '"%',
			'startAt' : startAt,
			'limit' : int(limit)
		}
		
		db = Db.con()
		cur = db.cursor()
		qry = "SELECT uniq,category,tags,data,date_added FROM videos WHERE is_public = '1' AND (data like %(type1)s OR data like %(type2)s OR data like %(type3)s OR data like %(type4)s) ORDER BY id DESC LIMIT %(startAt)s, %(limit)s"
		cur.execute(qry, obj)
		if cur.rowcount > 0:
			rows = cur.fetchall()
			db.close()
			return rows
		else:
			db.close()
			return False;
	
	def allPublicByTag(self,param):
		tag = param['tag'];
		db = Db.con()
		cur = db.cursor()
		
		limit = param['limit'] # 20 per page
		curPage = param['curPage'] # 1 is the current page
		endAt = int(curPage) * int(limit) # 20 is the record number to end at
		startAt = endAt - int(limit) # 20 - 20 = 0 is the record number to start at
		
		obj = {
			'tag' : '%' + str(tag) + '%',
			'startAt' : startAt,
			'limit' : int(limit)
		}
		qry = "SELECT uniq,category,tags,data,date_added FROM videos WHERE is_public = 1 AND tags like %(tag)s LIMIT %(startAt)s, %(limit)s"
		cur.execute(qry, obj)
		if cur.rowcount > 0:
			rows = cur.fetchall()
			db.close()
			return rows
		else:
			db.close()
			return False;
	def allPublicBySearch(self,param):
		query = param['qry'];
		db = Db.con()
		cur = db.cursor()
		
		limit = param['limit'] # 20 per page
		curPage = param['curPage'] # 1 is the current page
		endAt = int(curPage) * int(limit) # 20 is the record number to end at
		startAt = endAt - int(limit) # 20 - 20 = 0 is the record number to start at
		
		obj = {
			'qry' : query,
			'startAt' : startAt,
			'limit' : int(limit)
		}
		sqry = "SELECT uniq,category,tags,data,date_added FROM videos WHERE is_public = 1 AND (tags REGEXP %(qry)s OR category REGEXP %(qry)s OR data REGEXP %(qry)s) ORDER BY id DESC LIMIT %(startAt)s, %(limit)s"
		cur.execute(sqry, obj)
		if cur.rowcount > 0:
			rows = cur.fetchall()
			db.close()
			return rows
		else:
			db.close()
			return False;
	def allPublicByTagCount(self,param):
		tag = param['tag'];
		db = Db.con()
		cur = db.cursor()
		obj = {
			'tag' : '%' + str(tag) + '%'
		}
		qry = "SELECT uniq FROM videos WHERE is_public = 1 AND tags like %(tag)s"
		cur.execute(qry, obj)
		if cur.rowcount > 0:
			db.close()
			return cur.rowcount
		else:
			db.close()
			return 0;
	def allPublicBySearchCount(self,param):
		query = param['qry'];
		db = Db.con()
		cur = db.cursor()
		obj = {
			'qry' : query
		}
		sqry = "SELECT uniq,category,tags,data,date_added FROM videos WHERE is_public = 1 AND (tags REGEXP %(qry)s OR category REGEXP %(qry)s OR data REGEXP %(qry)s)"
		cur.execute(sqry, obj)
		if cur.rowcount > 0:
			db.close()
			return cur.rowcount
		else:
			db.close()
			return 0;
	
	def countRecords(self, dbtable, type, isPublic):
		db = Db.con()
		cur = db.cursor()

		par = {
				'type1' : '%"type": "' + type + '"%',
				'type2' : '%"type":"' + type + '"%',
				'type3' : '%"type" : "' + type + '"%',
				'type4' : '%"type" :"' + type + '"%',
				'isPublic': isPublic
			}
			
		if (type):
			if dbtable == 'videos':
				qry = "SELECT id FROM videos WHERE is_public = %(isPublic)s AND (data like %(type1)s OR data like %(type2)s OR data like %(type3)s OR data like %(type4)s)"
		else:
			if dbtable == 'videos':
				qry = "SELECT id FROM videos WHERE is_public = %(isPublic)s"
			
		cur.execute(qry, par)
		if cur.rowcount > 0:
			rec = cur.rowcount
			db.close()
			return rec
		else:
			db.close()
			return 0
			
	# get public content by id
	def allPublicById(self,id):
		db = Db.con()
		cur = db.cursor()
		qry = "SELECT uniq,category,tags,data,id, date_added FROM videos WHERE uniq = %s"
		cur.execute(qry, id)
		if cur.rowcount > 0:
			row = cur.fetchall()
			db.close()
			return row
		else:
			db.close()
			return False
	
	def recommendedByTags(self, id, tags, categ):
		db = Db.con()
		cur = db.cursor()
		tags = False
		if tags:
			isWhere = ''
			i = 0
			spTags = tags.split(', ')
			for item in spTags:
				if i == 0:
					isWhere = "tags like '%" + item + "%'"
				else:
					isWhere += " OR tags like '%" + item + "%'"
				i += 1
			qry = """
					SELECT *
					  FROM videos AS r1 JOIN
						   (SELECT (RAND() *
										 (SELECT MAX(id)
											FROM videos)) AS id)
							AS r2
					 WHERE r1.id >= r2.id
					 AND uniq <> '%s'
					 AND (%s)
					 ORDER BY r1.id ASC
					 LIMIT 5
					""" %(id, isWhere)
			cur.execute(qry)
			if cur.rowcount > 0:
				rows = cur.fetchall()
				db.close()
				return rows
			else:
				db.close()
				tags = False
				
		if categ:
			return self.recommendedbByCateg(id, categ)
		else:
			return False
			
	def recommendedbByCateg(self, id, categ):
		par = {
			'categ' : categ,
			'id' : id
		}
		db = Db.con()
		cur = db.cursor()
		qry = """
				SELECT *
				  FROM videos AS r1 JOIN
					   (SELECT (RAND() *
									 (SELECT MAX(id)
										FROM videos)) AS id)
						AS r2
				 WHERE r1.id >= r2.id
				 AND uniq <> %(id)s 
				 AND category = %(categ)s
				 ORDER BY r1.id ASC
				 LIMIT 5
				"""
		cur.execute(qry, par)
		if cur.rowcount > 0:
			rows = cur.fetchall()
			db.close()
			return rows
		else:
			db.close()
			tags = False
	
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
			
	def getAllTags(self):
		db = Db.con()
		cur = db.cursor()
		i = 0
		data = {}
		cur.execute("SELECT tags FROM videos WHERE tags <> '' AND is_public = 1 GROUP BY id DESC")
		if cur.rowcount > 0:
			rows = cur.fetchall()
			for row in rows:
				tags = row[0]
				rArr = tags.split(',')
				for item in rArr:
					data[i] = item.strip()
					i += 1
			db.close()
			return data
		else:
			return False
			
	def embedlyKey(self):
		return 'c08c28b368a34012a555be062cd495c4'