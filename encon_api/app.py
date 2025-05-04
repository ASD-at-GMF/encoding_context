
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
DEPRECATED
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
# DEPRECATED; keeping for possible word finding in backend
@app.route('/word')
def word():
    term = request.args.get('term', default = "", type = str)
    tags = request.args.getlist('tag')
    words = WordList()
    words.getWords(term, tags)
    return words.to_dict(), 200;

db = Database()

'''
IMPORTANT: Main API Call
GET API call to get words
Pass in the categories that the user would like to display.
Returns data for chrome extension intialization:
- All the list names.
- Corresponding list colors
- All of the terms in the selected lists.
'''
@app.route('/wordlist')
def wordlist():
    tags = request.args.getlist('tag')
    termlists = TermLists(tags)
    termlists.List.clear()
    db.get_lists(termlists)
    # return termlists.to_dict(), 200;
    # tags = ["Technical","Verification","Work","Action","Assignment","Duty","Job","Very Large String For Testing Purposes","Small word"]
    tags = db.get_all_list_names_and_colors();
    # return jsonify({'tags' : tags})
    return {"tags" : tags[0], "colors": tags[1], "lists": termlists.List}, 200;


