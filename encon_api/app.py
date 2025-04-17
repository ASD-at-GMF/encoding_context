
# A very simple Flask Hello World app for you to get started with...

from flask import Flask, jsonify, request
from flask_cors import CORS
from words import WordList, TermLists
from data import Database

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello_world():
    return 'Hello from Flask!'

# Simple Get call for server's status
@app.route('/status')
def status():
    return jsonify({'running' : True})

# Simple Get call for all tags
@app.route('/tags')
def tags():
    tags = ["Technical","Verification","Work","Action","Assignment","Duty","Job","Very Large String For Testing Purposes","Small word"]
    return jsonify({'tags' : tags})

'''
POST API call to get words
Pass in data with 'text' and 'classifications' list
'text' will be html body text, 'classifications' comes from user tag settings
'''
@app.route('/words', methods=['POST'])
def words():
    if request.method == 'POST':
        data = request.get_json()
        if data:
            words = WordList()
            words.getWords(data['text'], data['classifications'])
            return words.to_dict(), 200;
        else:
            return jsonify({'error': 'Missing Text or Classifications'}), 400
    else:
        return 'POST Requests Only', 405

@app.route('/word')
def word():
    term = request.args.get('term', default = "", type = str)
    tags = request.args.getlist('tag')
    words = WordList()
    words.getWords(term, tags)
    return words.to_dict(), 200;

db = Database()

@app.route('/wordlist')
def wordlist():
    tags = request.args.getlist('tag')
    termlists = TermLists(tags)
    termlists.List.clear()
    db.get_lists(termlists)
    # return termlists.to_dict(), 200;
    # tags = ["Technical","Verification","Work","Action","Assignment","Duty","Job","Very Large String For Testing Purposes","Small word"]
    tags = db.get_all_list_names();
    # return jsonify({'tags' : tags})
    return {"tags" : tags, "lists": termlists.List}, 200;


