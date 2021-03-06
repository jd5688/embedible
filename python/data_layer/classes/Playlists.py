#!/usr/bin/python
from data_layer.classes import Db
import base64
import string

class Playlists:
	def getPlaylists(self, param):
		# param object contains the username
		
		db = Db.con()
		cur = db.cursor()
		robj = {}
		
		i = 0
		# get all playlists from this user
		qry = "SELECT * FROM playlist WHERE owner = %(username)s"
		
		cur.execute(qry, param)
		# playlists exist
		if cur.rowcount > 0:
			rows = cur.fetchall()
			
			# check each playlist as item
			for item in rows:
				# make sure yobj is inialized inside the for loop where you are 
				# assigning the value to it. Otherwise, unexpected and bizzare
				# things happen when it is not properly re-initiazed upon loop
				# in this case:
				### obj[0].yobj is blank, obj[1].yobj is not blank.
				### if yobj is not re-initialized below, obj[0].yobj inherits
				### the value of obj[1].yobj.... totally strange!!!!
				yobj = {}
				plid = item[0] # get the playlist id
				# get the video ids related to this playlist
				qry = "SELECT vid_id FROM playlist_contents WHERE pl_id = %s"
				cur.execute(qry, plid)
				k = 0
				
				# if video ids exist
				if cur.rowcount > 0:
					xrows = cur.fetchall()
					# loop each one
					for xitem in xrows:
						vid_id = xitem[0]
						
						# now get the videos. even the private ones since
						# this is going to be seen only by the owner of the playlist
						qry = "SELECT uniq,category,tags,data,id FROM videos WHERE id = %s"
						
						cur.execute(qry, vid_id)
						if cur.rowcount > 0:
							yrows = cur.fetchall()
							for yitem in yrows:
								yobj[k] = {
									'uniq': yitem[0],
									'category': yitem[1],
									'tags': yitem[2],
									'data': yitem[3],
									'id':yitem[4]
								}
								k = k + 1
					
					try:
						test = yobj[0]
					except:
						yobj = False
						
					robj[i] = {
						'id' : item[0],
						'uniq': item[1],
						'playlist_name' : item[2],
						'owner': item[3],
						'is_public': item[4],
						'description': item[5],
						'tags' : item[6],
						'embeds': yobj
					}
				else:
					try:
						test = yobj[0]
					except:
						yobj = False
						
					robj[i] = {
						'id' : item[0],
						'uniq': item[1],
						'playlist_name' : item[2],
						'owner': item[3],
						'is_public': item[4],
						'description': item[5],
						'tags' : item[6],
						'embeds': yobj
					}
				i = i + 1
		try:
			test = robj[0]
		except:
			robj = False
		
		db.close()
		return robj
	
	#get specific playlist and all its embeds
	def getPlaylist(self, param):
		# param object contains the uniq_id and possibly the username
		
		db = Db.con()
		cur = db.cursor()
		robj = {}
		
		i = 0
		# get the playlist
		if param['username']:
			# user is logged in, but make sure pl_id and playlist_name matched on the DB
			# and check if owner owned the playlist. note: some users might be guessing the url.
			qry = "SELECT * FROM playlist WHERE (owner = %(username)s OR is_public = 1) AND uniq_id = %(uniq_id)s"
		else:
			#not logged in. make sure the playlist is public
			qry = "SELECT * FROM playlist WHERE uniq_id = %(uniq_id)s AND is_public = 1"

		cur.execute(qry, param)
		# playlist exists
		if cur.rowcount > 0:
			rows = cur.fetchall()
			
			# check each playlist as item
			for item in rows:
				# make sure yobj is inialized inside the for loop where you are 
				# assigning the value to it. Otherwise, unexpected and bizzare
				# things happen when it is not properly re-initiazed upon loop
				# in this case:
				### obj[0].yobj is blank, obj[1].yobj is not blank.
				### if yobj is not re-initialized below, obj[0].yobj inherits
				### the value of obj[1].yobj.... totally strange!!!!
				yobj = {}
				plid = item[0] # get the playlist id
				# get the video ids related to this playlist
				qry = "SELECT vid_id FROM playlist_contents WHERE pl_id = %s"
				cur.execute(qry, plid)
				k = 0
				
				# if video ids exist
				if cur.rowcount > 0:
					xrows = cur.fetchall()
					# loop each one
					for xitem in xrows:
						vid_id = xitem[0]
						param['vid_id'] = vid_id
						
						if param['username']:
							# now get the videos. even the private ones owned by user
							# videos that are private can only be seen by its embedder
							qry = "SELECT uniq,category,tags,data,id FROM videos WHERE id = %(vid_id)s AND (username = %(username)s OR is_public = 1)"
						else:
							# get only videos that are flagged as public
							qry = "SELECT uniq,category,tags,data,id FROM videos WHERE id = %(vid_id)s AND is_public = 1"
						
						cur.execute(qry, param)
						if cur.rowcount > 0:
							yrows = cur.fetchall()
							for yitem in yrows:
								yobj[k] = {
									'uniq': yitem[0],			
									'category': yitem[1],
									'tags': yitem[2],
									'data': yitem[3],
									'id':yitem[4]
								}
								k = k + 1
					
					try:
						test = yobj[0]
					except:
						yobj = False
						
					robj[i] = {
						'id' : item[0],
						'uniq': item[1],
						'playlist_name' : item[2],
						'owner': item[3],
						'is_public': item[4],
						'description': item[5],
						'tags' : item[6],
						'embeds': yobj
					}
				else:
					try:
						test = yobj[0]
					except:
						yobj = False
						
					robj[i] = {
						'id' : item[0],
						'uniq': item[1],
						'playlist_name' : item[2],
						'owner': item[3],
						'is_public': item[4],
						'description': item[5],
						'tags' : item[6],
						'embeds': yobj
					}
				i = i + 1
		try:
			test = robj[0]
		except:
			robj = False
		
		db.close()
		return robj
		
	def getPublicPlaylists(self, param):
		#param may contain username
		
		db = Db.con()
		cur = db.cursor()
		robj = {}
		limit = param['limit'] # 20 per page
		curPage = param['curPage'] # 1
		endAt = int(curPage) * int(limit) # 20
		startAt = endAt - int(limit) # 20 - 20 = 0
		
		param['startAt'] = startAt
		param['limit'] = int(limit)
		
		i = 0
		
		if param['username']:
			qry = "SELECT playlist.* FROM playlist, playlist_contents WHERE playlist_contents.pl_id = playlist.id and (playlist.owner = %(username)s OR playlist.is_public = 1) GROUP BY playlist.id DESC LIMIT %(startAt)s, %(limit)s"
		else:
			qry = "SELECT playlist.* FROM playlist, playlist_contents WHERE playlist_contents.pl_id = playlist.id and playlist.is_public = 1 GROUP BY playlist.id DESC LIMIT %(startAt)s, %(limit)s"
			
		cur.execute(qry, param)
		# playlists exist
		if cur.rowcount > 0:
			rows = cur.fetchall()
			
			# check each playlist as item
			for item in rows:
				# make sure yobj is inialized inside the for loop where you are 
				# assigning the value to it. Otherwise, unexpected and bizzare
				# things happen when it is not properly re-initiazed upon loop
				# in this case:
				### obj[0].yobj is blank, obj[1].yobj is not blank.
				### if yobj is not re-initialized below, obj[0].yobj inherits
				### the value of obj[1].yobj.... totally strange!!!!
				yobj = {}
				plid = item[0] # get the playlist id
				# get the video ids related to this playlist
				qry = "SELECT vid_id FROM playlist_contents WHERE pl_id = %s"
				cur.execute(qry, plid)
				k = 0
				
				# if video ids exist
				if cur.rowcount > 0:
					xrows = cur.fetchall()
					# loop each one
					for xitem in xrows:
						vid_id = xitem[0]
						param['vid_id'] = vid_id
						
						if param['username']:
							qry = "SELECT uniq,category,tags,data,id FROM videos WHERE id = %(vid_id)s AND (username = %(username)s OR is_public = 1)"
						else:
							# just get the public ones
							qry = "SELECT uniq,category,tags,data,id FROM videos WHERE id = %(vid_id)s AND is_public = 1"
							
						cur.execute(qry, param)
						if cur.rowcount > 0:
							yrows = cur.fetchall()
							for yitem in yrows:
								yobj[k] = {
									'uniq': yitem[0],
									'category': yitem[1],
									'tags': yitem[2],
									'data': yitem[3],
									'id':yitem[4]
								}
								k = k + 1
					
					try:
						test = yobj[0]
					except:
						yobj = False
						
					robj[i] = {
						'id' : item[0],
						'uniq': item[1],
						'playlist_name' : item[2],
						'owner': item[3],
						'is_public': item[4],
						'description': item[5],
						'tags' : item[6],
						'embeds': yobj
					}
				else:
					try:
						test = yobj[0]
					except:
						yobj = False
						
					robj[i] = {
						'id' : item[0],
						'uniq': item[1],
						'playlist_name' : item[2],
						'owner': item[3],
						'is_public': item[4],
						'description': item[5],
						'tags' : item[6],
						'embeds': yobj
					}
				i = i + 1
		try:
			test = robj[0]
		except:
			robj = False
		
		db.close()
		return robj
	
	def getPublicPlaylistsCount(self, param):
		#param may contain username
		
		db = Db.con()
		cur = db.cursor()
		
		if param['username']:
			qry = "SELECT playlist.* FROM playlist, playlist_contents WHERE playlist_contents.pl_id = playlist.id and (playlist.owner = %(username)s OR playlist.is_public = 1) GROUP BY playlist.id"
		else:
			qry = "SELECT playlist.* FROM playlist, playlist_contents WHERE playlist_contents.pl_id = playlist.id and playlist.is_public = 1 GROUP BY playlist.id"
			
		cur.execute(qry, param)
		# playlists exist
		if cur.rowcount > 0:
			records = cur.rowcount
		else:
			records = 0
		
		return records
			
		
	def getPublicPlaylistsByTag(self, param):
		if param['tag'] == '':
			return False
		
		db = Db.con()
		cur = db.cursor()
		robj = {}
		
		tag = param['tag']
		tag = '%' + str(tag) + '%'
		param['tag'] = tag
		
		limit = param['limit'] # 20 per page
		curPage = param['curPage'] # 1
		endAt = int(curPage) * int(limit) # 20
		startAt = endAt - int(limit) # 20 - 20 = 0
		
		param['startAt'] = startAt
		param['limit'] = int(limit)
		
		i = 0
		
		qry = "SELECT playlist.* FROM playlist, playlist_contents WHERE playlist_contents.pl_id = playlist.id and playlist.is_public = 1 AND playlist.tags like %(tag)s GROUP BY playlist.id LIMIT %(startAt)s, %(limit)s"
			
		cur.execute(qry, param)
		# playlists exist
		if cur.rowcount > 0:
			rows = cur.fetchall()
			
			# check each playlist as item
			for item in rows:
				# make sure yobj is inialized inside the for loop where you are 
				# assigning the value to it. Otherwise, unexpected and bizzare
				# things happen when it is not properly re-initiazed upon loop
				# in this case:
				### obj[0].yobj is blank, obj[1].yobj is not blank.
				### if yobj is not re-initialized below, obj[0].yobj inherits
				### the value of obj[1].yobj.... totally strange!!!!
				yobj = {}
				plid = item[0] # get the playlist id
				# get the video ids related to this playlist
				qry = "SELECT vid_id FROM playlist_contents WHERE pl_id = %s"
				cur.execute(qry, plid)
				k = 0
				
				# if video ids exist
				if cur.rowcount > 0:
					xrows = cur.fetchall()
					# loop each one
					for xitem in xrows:
						vid_id = xitem[0]
						param['vid_id'] = vid_id
						
						if param['username']:
							qry = "SELECT uniq,category,tags,data,id FROM videos WHERE id = %(vid_id)s AND (username = %(username)s OR is_public = 1)"
						else:
							# just get the public ones
							qry = "SELECT uniq,category,tags,data,id FROM videos WHERE id = %(vid_id)s AND is_public = 1"
							
						cur.execute(qry, param)
						if cur.rowcount > 0:
							yrows = cur.fetchall()
							for yitem in yrows:
								yobj[k] = {
									'uniq': yitem[0],
									'category': yitem[1],
									'tags': yitem[2],
									'data': yitem[3],
									'id':yitem[4]
								}
								k = k + 1
					
					try:
						test = yobj[0]
					except:
						yobj = False
						
					robj[i] = {
						'id' : item[0],
						'uniq': item[1],
						'playlist_name' : item[2],
						'owner': item[3],
						'is_public': item[4],
						'description': item[5],
						'tags' : item[6],
						'embeds': yobj
					}
				else:
					try:
						test = yobj[0]
					except:
						yobj = False
						
					robj[i] = {
						'id' : item[0],
						'uniq': item[1],
						'playlist_name' : item[2],
						'owner': item[3],
						'is_public': item[4],
						'description': item[5],
						'tags' : item[6],
						'embeds': yobj
					}
				i = i + 1
		try:
			test = robj[0]
		except:
			robj = False
		
		db.close()
		return robj

	def getPublicPlaylistsByTagCount(self, param):
		param['username'] = ''
		if param['tag'] == '':
			return False
		
		db = Db.con()
		cur = db.cursor()
		
		tag = param['tag']
		tag = '%' + str(tag) + '%'
		param['tag'] = tag
		
		qry = "SELECT playlist.* FROM playlist, playlist_contents WHERE playlist_contents.pl_id = playlist.id and playlist.is_public = 1 AND playlist.tags like %(tag)s GROUP BY playlist.id"
			
		cur.execute(qry, param)
		# playlists exist
		if cur.rowcount > 0:
			db.close()
			return cur.rowcount
		else:
			return 0
	
	def add_playlist(self, param):
		db = Db.con()
		cur = db.cursor()
		q = """
			INSERT INTO playlist (uniq_id, playlist_name, owner, is_public, description, tags) 
			VALUES 
			('xdemx', %(playlist)s, %(username)s, 1, %(description)s, %(tags)s)
			"""
		cur.execute(q, param)
		db.commit()
		lastId = cur.lastrowid
		db.close()
		return self._insertUniq(lastId, param['key'])

	def _insertUniq(self, id, key):
		db = Db.con()
		cur = db.cursor()
		myUniq = base64.b64encode(str(key) + str(id))
		
		par = {
			'uniq': myUniq
		}
		
		cur.execute("""UPDATE playlist SET uniq_id = %(uniq)s WHERE uniq_id = 'xdemx'""", par)
		db.commit()
		db.close()
		return 'success'
		
	def removeEmbed(self, param):
		db = Db.con()
		cur = db.cursor()
		
		cur.execute("""DELETE FROM playlist_contents WHERE pl_id = %(pl_id)s AND vid_id = %(vid_id)s""", param)	
		try:
			db.commit()
			resp = 'success'
		except:
			resp = False
		
		db.close()
		return resp

	def deletePlaylist(self, param):
		db = Db.con()
		cur = db.cursor()
		
		cur.execute("""DELETE FROM playlist WHERE id = %(pl_id)s""", param)
		try:
			db.commit()
			cur.execute("""DELETE FROM playlist_contents WHERE pl_id = %(pl_id)s""", param)
			
			try:
				db.commit()
				resp = 'success'
			except:
				resp = False
		
		except:
			resp = False
		
		db.close()
		return resp
		
	def add_to_playlist(self, param):
		db = Db.con()
		cur = db.cursor()

		# sample list_ids - ['23,34']
		for item in param['list_ids']:
			# becomes - 23,34
			if item:
				# becomes ['23','34']
				splt = string.split(item, ",")
			for y in splt:
				newPar = {
					'pl_id': y,
					'atpl_id': param['atpl_id']
				}
				q = """
				INSERT INTO playlist_contents (pl_id, vid_id) 
				VALUES 
				(%(pl_id)s, %(atpl_id)s)
				"""
				cur.execute(q, newPar)
				db.commit()
				
		db.close()
		return 'success'

	# set the embed to public or private
	def playlistToPublic(self, param):
		db = Db.con()
		cur = db.cursor()
		
		print param
		cur.execute("""UPDATE playlist SET is_public = %(is_public)s WHERE id = %(pl_id)s""", param)
		
		try:
			db.commit()
			resp = 'success'
		except:
			resp = False
		
		db.close()		
		return resp