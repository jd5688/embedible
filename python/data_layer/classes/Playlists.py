#!/usr/bin/python
from data_layer.classes import Db
import base64

class Playlists:
	def getPlaylists(self, param):
		db = Db.con()
		cur = db.cursor()
		obj = {}
		if param['username']:
			# get all playlists from this user
			qry = "SELECT * FROM playlist WHERE owner = %(username)s"
			cur.execute(qry, param)
			if cur.rowcount > 0:
				rows = cur.fetchall()
				i = 0
				for item in rows:
					plid = item[0]
					# get the video ids related to this playlist
					qry = "SELECT vid_id FROM playlist_contents WHERE plid = %s"
					cur.execute(qry, plid)
					if cur.rowcount > 0:
						xrows = cur.fetchall()
						for xitem in xrows:
							vid_id = xitem[0]
							# now get the videos. even the private ones since
							# this is going to be seen only by the owner of the playlist
							qry = "SELECT uniq,category,tags,data FROM videos WHERE id = %s"
							cur.execute(qry, vid_id)
							yobj = {}
							if cur.rowcount > 0:
								k = 0
								yrows = cur.fetchall()
								for yitem in yrows:
									yobj[k] = {
										'uniq': yitem[0],
										'category': yitem[1],
										'tags': yitem[2],
										'data': yitem[3]
									}
									k = k + 1	
					obj[i] = {
						'id' : item[0],
						'playlist_name' : item[1],
						'owner': item[2],
						'embeds': yobj
					}
					i = i + 1
		else:
			obj = False
	
		return obj