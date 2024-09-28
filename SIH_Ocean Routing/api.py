from flask import Flask
from flask import request
from flask_restplus import Api, Resource
import json
from flask_cors import CORS
from os import listdir
from os.path import isfile, join

"""TODO_1 Load JSON movies.json into variable 
(https://stackoverflow.com/questions/27833437/load-json-file-in-python)."""
#with open('movies.json', 'r') as json_file:
#  data = json.load(json_file)

"""Define Flask app"""
flask_app = Flask(__name__)
app = Api(app=flask_app,
          version="1.0",
          title="VIA app",
          description="Demo app for via")
CORS(flask_app)

"""Define namespace"""
route_name_space = app.namespace("route", description='Store and load route')

@route_name_space.route("/")
class Test(Resource):
	@app.doc(responses={200: 'OK'}, description="Test the API")
	def get(self):
		print("Test")
		return {"Status": "OK", "Thrawn": "Maechtig"};

@route_name_space.route("/<string:name>/")
class Save(Resource):
	@app.doc(responses={200: 'OK', 400: 'Invalid Argument'}, description="Save the current route.")
	def post(self, name):
		#check whether a route with the same name exists
		n = name + ".txt"
		for f in listdir("./routes"):
			if(f.lower()==n.lower()):
				return {"Status": 'Invalid Argument'}, 400
		
		text = request.data.decode('utf-8')
		dic = json.loads(text)
		print(dic['travel_time'])
		dic['name'] = name
		
		nm = "routes/" + name + ".txt"
		file1 = open(nm,"w")
		file1.write(text)
		file1.close()
		return {"Status": 'OK'};

@route_name_space.route("/get_all/")
class GetAll(Resource):
	@app.doc(responses={200: 'OK'}, description="Obtain all saved routes.")
	def get(self):
		ret = [];
		for f in listdir("./routes"):
			ret.append(f.replace('.txt', ''))
		#for x in col.find({},{ "_id": 1, "name": 1}):
		#	ret.append(x["name"]);
		print(json.dumps(ret))
		return {"Status": 'OK', "Data": ret};

@route_name_space.route("/get_route/<string:name>/")
class Load(Resource):
	@app.doc(responses={200: 'OK', 400: 'Invalid Argument'}, description="Load the selected route.")
	def get(self, name):
		query = { "name": name }
		#doc = col.find(query, { "_id": 0, "name": 0})
		#for x in doc:
		#	return {"Status": 'OK', "Data": json.dumps(x)};
		n = name + ".txt"
		for f in listdir("./routes"):
			if(f.lower()==n.lower()):
				nm = "routes/" + name + ".txt"
				file1 = open(nm,"r")
				data=file1.read()#.replace('\n', '')
				return {"Status": 'OK', "Data": data}
				
		return {"Status": 'Invalid Argument'}, 400;

@route_name_space.route("/delete_route/<string:name>/")
class Delete(Resource):
	@app.doc(responses={200: 'OK', 400: 'Invalid Argument'}, description="Delete the selected route.")
	def delete(self, name):
		col.remove({'name':name})
		return {"Status": 'OK'};

"""Run Flask app"""
if __name__ == '__main__':
	flask_app.run()