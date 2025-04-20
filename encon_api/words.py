class Word:
    def __init__(self, word, definition, classifications, adlLink, definition_long):
            self.word = word
            self.definition = definition
            self.definition_long = definition_long
            self.classifications = classifications
            self.adlLink = adlLink
    def checkWord(self, text, classifications):
        matchClassification = set(self.classifications) & set(classifications) or not classifications
        matchWord = text.lower().find(self.word) != -1 or not text;
        return matchClassification and matchWord
    def to_dict(self):
        # return {self.word:{'definition': self.definition, 'classifications': self.classifications, 'adlLink': self.adlLink}}
        return {'definition': self.definition, 'definition_long': self.definition_long, 'classifications': self.classifications, 'adlLink': self.adlLink}

class WordList:
    def __init__(self):
            self.list = {}
    def addWord(self, word):
            self.list[word.word] = word.to_dict()
    def getWords(self, text, classifications):
        for word in TestList:
            if word.checkWord(text, classifications):
                self.addWord(word)
                # print(word.word)
    def to_dict(self):
        return {'words': self.list}

class TermLists:
    def __init__(self, list_names=[]):
        self.List = []
        self.List.clear()
        self.list_names = list_names
    def addList(self, termList):
        # self.List[termList.list_name] = termList.to_dict()
        self.List.append(termList.to_dict())
    def to_dict(self):
        return {"lists": self.List}

class TermList:
    def __init__(self, list_name, tags="", id=0):
        self.list_name = list_name
        self.tags = tags
        self.id = id
        self.terms = []
    def addTerm(self, term):
        # self.terms[term.term] = term.to_dict()
        self.terms.append(term.to_dict())
    def to_dict(self):
        return {"listId": self.id, "listName": self.list_name, "tags": self.tags, "terms": self.terms}

class Term:
    def __init__(self, term, short_definition, long_definition, wiki_link, sites, aliases, regex_pattern, additional_info, term_id=0):
        self.term = term
        self.short_definition = short_definition
        self.long_definition = long_definition
        self.wiki_link = wiki_link
        self.sites = sites
        self.aliases = aliases
        self.regex_pattern = regex_pattern
        self.additional_info = additional_info
        self.term_id=term_id
    def to_dict(self):
        return {"term_id": self.term_id, "term": self.term, "short_definition": self.short_definition, "long_definition": self.long_definition, "wiki_link": self.wiki_link, "sites": self.sites, "aliases": self.aliases, "regex_pattern": self.regex_pattern, "additional_info": self.additional_info}

test = Word("test", "Take measures to check the quality, performance, or reliability of (something), especially before putting it into widespread use or practice.", ["Technical","Verification"], "https://extremismterms.adl.org/search?keywords=test&sort_by=search_api_relevance",
        "A test is a structured procedure or assessment used to evaluate a person's knowledge, skills, abilities, performance, or understanding of a specific subject, process, or function. Tests can be formal or informal and are commonly used in academic, professional, scientific, and technical contexts. For example, in education, a test might involve multiple-choice or essay questions to measure a student’s grasp of history or mathematics. In software development, a test refers to a procedure that checks whether a program or system behaves as expected under specific conditions, such as unit testing a function to ensure it returns the correct output. Medical tests, like blood tests, are used to detect health conditions or monitor treatment effectiveness. Essentially, a test is a means of gathering information to make informed decisions, identify areas for improvement, or ensure reliability and accuracy in various settings."
    )
task = Word("task", "A piece of work to be done or undertaken.", ["Work","Action","Assignment","Duty","Job","Very Large String For Testing Purposes","Small word"], "https://extremismterms.adl.org/search?keywords=task&sort_by=search_api_relevance",
        "A task is a specific piece of work or an assignment that is undertaken to achieve a particular goal, often within a defined timeframe or as part of a larger project. Tasks can vary greatly in complexity, duration, and purpose, ranging from simple activities like sending an email or washing dishes to more complex undertakings such as writing a research paper or developing a mobile app. In a workplace setting, a manager might assign tasks to team members to complete different parts of a larger project—like designing a website or conducting market research. In computer science, a task may refer to a unit of computation handled by a processor, such as executing a function in parallel programming. Tasks often involve a series of steps, decision-making, or problem-solving, and they help organize work into manageable segments to ensure efficiency and productivity. Overall, a task represents focused action directed toward achieving a desired outcome."
    )
TestList = [test, task]

# tl = TermLists ()

# termlist = TermList("testlist", "Tags")

# term = Term("testterm", "Short Definition", "Long Definition", "link", "", "", "")

# termlist.addTerm(term)
# tl.addList(termlist)

# print(tl.to_dict())

# Test = WordList()
# Test.getWords("test words task", ["Technical"])


