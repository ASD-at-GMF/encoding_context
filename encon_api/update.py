# encon_token: SECRET
from pyairtable import Api;
from data import Database

db = Database()
api = Api('encon_token')

db.reinit()

categories = list()
category_ids = dict()
count = 1

# Iterate over the categories, and fill database with them.
# Also get category_map with the category IDs.

categories_table = api.table('appwhw1Z9jfTWZZB3', 'Categories')
for records in categories_table.iterate():
    for record in records:
        category = record["fields"]["Category Name"]
        description = ""
        if ("Description" in record["fields"]):
            description = record["fields"]["Description"]
        color = ""
        if ("Color" in record["fields"]):
            color = record["fields"]["Color"]
        categories.append((category, description, color))
        category_ids[record["id"]] = count
        count +=1

category_map = db.get_categories_from_list(categories)

terms = list()

# Iterate over the words, and fill database with them, and for each different category ID.

words_table = api.table('appwhw1Z9jfTWZZB3', 'Words')
for records in words_table.iterate():
    for record in records:
        if record["fields"]["Category"]:
            for category in record["fields"]["Category"]:
                list_id = list_id = category_ids[category]
                term = ""
                if ("Term" in record["fields"]):
                    term = record["fields"]["Term"]
                short_definition = ""
                if ("Short Definition" in record["fields"]):
                    short_definition = record["fields"]["Short Definition"]
                long_definition = ""
                if ("Long Definition" in record["fields"]):
                    long_definition = record["fields"]["Long Definition"]
                sites = ""
                if ("Sites" in record["fields"]):
                    sites = record["fields"]["Sites"]
                aliases = ""
                if ("Aliases" in record["fields"]):
                    aliases = record["fields"]["Aliases"]
                wiki_link = ""
                if ("Link" in record["fields"]):
                    wiki_link = record["fields"]["Link"]
                terms.append((list_id, term, short_definition, long_definition, sites, aliases, wiki_link))


db.get_terms_from_list(terms)
