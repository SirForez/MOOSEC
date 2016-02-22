from flask import Flask, render_template, session, redirect, url_for, escape, request, json
import Additive_Passive_2, matlab

# initialize stuff
app = Flask(__name__)
cysec = Additive_Passive_2.initialize()

@app.route('/', methods=['GET', 'POST'])
def calc():
    if(request.method == "POST"):
        threatValue = request.form['threatvalue']
        controlValue = request.form['controlvalue']
        budget = request.form['budget']
        relativeGain = request.form['relativegain']
        data = cysec.cysecplan(controlValue, threatValue, float(budget), float(relativeGain))
        xy = formatData(data, cysecTable)
        return json.dumps(xy)
    else:
        return render_template('./index.html')

@app.errorhandler(404)
def not_found(error):
	return render_template('./error.html'), 404

def formatData(data, table):
	ret = []
	retWithTable = []
	for _ in range(data.size[0]):
		val = data._data[_::data.size[0]].tolist()
		ret.append(val)

	filteredTable = filterTable(cysecTable, ret[1:])

	retWithTable = ret[0:2]
	retWithTable.append(filteredTable)

	return retWithTable

def initTable(filename):
	ret = []
	f = open(filename, 'r')
	for line in f:
		ret.append(line)
	return ret

def filterTable(table, data):
	# ret = [val for index,val in enumerate(table) if data[index]]
	ret = []
	print "Data length: " + str(len(data))
	print "Data row length: " + str(len(data[0]))
	print "Table length: " + str(len(table))
	for i in range(len(table)):
		if data[i][len(data[i])-1] == 1.0:
			ret.append(table[i])
	return ret

cysecTable = initTable('cysectable.txt')

if __name__ == '__main__':
    app.run(debug=True)
