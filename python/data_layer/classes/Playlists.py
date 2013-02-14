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
						'playlist_name' : item[1],
						'owner': item[2],
						'is_public': item[3],
						'embeds': yobj
					}
				else:
					try:
						test = yobj[0]
					except:
						yobj = False
						
					robj[i] = {
						'id' : item[0],
						'playlist_name' : item[1],
						'owner': item[2],
						'is_public': item[3],
						'embeds': yobj
					}
				i = i + 1
		try:
			test = robj[0]
		except:
			robj = False
		
		return robj
	
	#get specific playlist and all its embeds
	def getPlaylist(self, param):
		# param object contains the playlist id, playlist name
		# and possibly the username
		
		db = Db.con()
		cur = db.cursor()
		robj = {}
		
		i = 0
		# get the playlist
		if param['username']:
			# user is logged in, but make sure pl_id and playlist_name matched on the DB
			# some users might be guessing the url.
			qry = "SELECT * FROM playlist WHERE owner = %(username)s AND id = %(pl_id)s AND playlist_name = %(pl_name)s"
		else:
			#not logged in. make sure the playlist is public
			qry = "SELECT * FROM playlist WHERE id = %(pl_id)s AND playlist_name = %(pl_name)s AND is_public = 1"

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
						'playlist_name' : item[1],
						'owner': item[2],
						'is_public': item[3],
						'embeds': yobj
					}
				else:
					try:
						test = yobj[0]
					except:
						yobj = False
						
					robj[i] = {
						'id' : item[0],
						'playlist_name' : item[1],
						'owner': item[2],
						'is_public': item[3],
						'embeds': yobj
					}
				i = i + 1
		try:
			test = robj[0]
		except:
			robj = False
		
		return robj
		
	def getPublicPlaylists(self):
		db = Db.con()
		cur = db.cursor()
		robj = {}
		
		i = 0
		# get 100 new most recent playlists
		qry = "SELECT playlist.* FROM playlist, playlist_contents WHERE playlist_contents.pl_id = playlist.id and playlist.is_public = 1 GROUP BY playlist.id DESC LIMIT 0, 100"
			
		cur.execute(qry)
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
						
						# just get the public ones
						qry = "SELECT uniq,category,tags,data,id FROM videos WHERE id = %s AND is_public = 1"
							
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
						'playlist_name' : item[1],
						'owner': item[2],
						'is_public': item[3],
						'embeds': yobj
					}
				else:
					try:
						test = yobj[0]
					except:
						yobj = False
						
					robj[i] = {
						'id' : item[0],
						'playlist_name' : item[1],
						'owner': item[2],
						'is_public': item[3],
						'embeds': yobj
					}
				i = i + 1
		try:
			test = robj[0]
		except:
			robj = False
		
		return robj

	def add_playlist(self, param):
		db = Db.con()
		cur = db.cursor()
		q = """
			INSERT INTO playlist (playlist_name, owner, is_public) 
			VALUES 
			(%(playlist)s, %(username)s, 1)
			"""
		cur.execute(q, param)
		db.commit()
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
			
		return resp
		
	def add_to_playlist(self, param):
		db = Db.con()
		cur = db.cursor()
		splt = string.split(param['list_ids'], ",")
		for item in splt:
			if item:
				newPar = {
					'pl_id': item,
					'atpl_id': param['atpl_id']
				}
				q = """
				INSERT INTO playlist_contents (pl_id, vid_id) 
				VALUES 
				(%(pl_id)s, %(atpl_id)s)
				"""
				cur.execute(q, newPar)
				db.commit()
			
				return 'success'
			else:
				return 'failed'

	# set the embed to public or private
	def playlistToPublic(self, param):
		db = Db.con()
		cur = db.cursor()
		
		cur.execute("""UPDATE playlist SET is_public = %(is_public)s WHERE id = %(pl_id)s""", param)
		
		try:
			db.commit()
			resp = 'success'
		except:
			resp = False
			
		return resp