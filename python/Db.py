#!/usr/bin/python
import MySQLdb

def con():
	db = MySQLdb.connect(host="localhost", user="movielist", passwd="Aa71yah2", db="mytube") # name of the data base

	# you must create a Cursor object. It will let
	#  you execute all the query you need
	
	#cur = db.cursor()
	#return cur
	
	return db