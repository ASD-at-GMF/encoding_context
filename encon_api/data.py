import sqlite3
from words import TermList, Term, TermLists


class Database:
    def __init__(self):
        self.con = sqlite3.connect("/home/pbenzoni/context/context.db")
        self.cur = self.con.cursor()
        self.cur.execute("CREATE TABLE if not exists terms(id INTEGER PRIMARY KEY AUTOINCREMENT, list_id INTEGER, term TEXT, short_definition TEXT, long_definition TEXT, wiki_link TEXT, aliases TEXT, regex_pattern TEXT, additional_info TEXT)")
        self.cur.execute("CREATE TABLE if not exists lists(id INTEGER PRIMARY KEY AUTOINCREMENT, list_name TEXT, tags TEXT)")

    ' WARNING '
    def delete(self):
        self.cur.execute("DROP TABLE if exists terms")
        self.cur.execute("DROP TABLE if exists lists")
        # self.cur.execute("DROP TABLE if exists map")

    def add_term(self, term, list_name):
        res = self.cur.execute("SELECT id FROM lists WHERE list_name = ?", (list_name,))
        ids = res.fetchone()
        list_id = ids[0]
        # term_id = (f'{list_id:04}-'f'{term_count:06}')
        data = (list_id, term.term, term.short_definition, term.long_definition, term.wiki_link, term.aliases, term.regex_pattern, term.additional_info,)
        self.cur.execute("INSERT INTO terms (list_id, term, short_definition, long_definition, wiki_link, aliases, regex_pattern, additional_info) VALUES(?, ?, ?, ?, ?, ?, ?, ?)", data)
        self.con.commit()

    def add_list(self, termlist):
        self.cur.execute("INSERT INTO lists (list_name, tags) VALUES(?, ?)", (termlist.list_name, termlist.tags,))
        self.con.commit()

    def remove_term(self, term):
        res = self.cur.execute("SELECT id FROM terms WHERE term = ?", (term,))
        term_id = res.fetchone()[0]
        self.cur.execute("DELETE FROM terms WHERE term_id = ?", (term_id,))

    def remove_list(self, list_name):
        res = self.cur.execute("SELECT id FROM lists WHERE list_name = ?", (list_name,))
        list_id = res.fetchone()[0]
        self.cur.execute("DELETE FROM terms WHERE list_id = ?", (list_id,))
        self.cur.execute("DELETE FROM lists WHERE id = ?", (list_id,))
        self.con.commit()

    def get_list(self, termlist):
        res = self.cur.execute("SELECT * FROM lists WHERE list_name = ?", (termlist.list_name,))
        termlistinfo = res.fetchone()
        if (termlistinfo):
            termlist.id = termlistinfo[0]
            termlist.tags = termlistinfo[2]
            list_id = termlistinfo[0]
            res = self.cur.execute("SELECT * FROM terms WHERE list_id = ?", (list_id,))
            terms = res.fetchall()
            for term in terms:
                term_id = (f'{list_id:04}-'f'{term[0]:06}')
                new_term = Term(term[2], term[3], term[4], term[5], term[6], term[7], term[8], term_id)
                termlist.addTerm(new_term)
        else:
            print("No List Found")
    def get_lists(self, termlists):
        for list_name in termlists.list_names:
            termlist = TermList(list_name)
            self.get_list(termlist)
            termlists.addList(termlist)
    def get_all_list_names(self):
        list_names = []
        res = self.cur.execute("SELECT list_name FROM lists", ())
        names = res.fetchall()
        for name in names:
            list_names.append(name[0])
        return list_names





# db = Database()
# # db.delete()
# termlist = TermList("Test")
# db.add_list(termlist)
# # # db.get_list(termlist.list_name)
# termlist2 = TermList("Test2", "Tags2")
# db.add_list(termlist2)
# # # db.get_list(termlist2.list_name)

# # # db.remove_list(termlist2.list_name)
# # # db.get_list(termlist2.list_name)

# term1 = Term("test", "Take measures to check the quality, performance, or reliability of (something), especially before putting it into widespread use or practice.", "Long Definition", "https://extremismterms.adl.org/search?keywords=test&sort_by=search_api_relevance", "", "", "")
# db.add_term(term1, termlist.list_name)
# term2 = Term("task", "A piece of work to be done or undertaken.", "Long Description of task", "https://extremismterms.adl.org/search?keywords=task&sort_by=search_api_relevance", "", "", "")
# db.add_term(term2, termlist.list_name)
# db.get_list(termlist.list_name)

# db.remove_list(termlist.list_name)
# db.remove_term(term.term)
# db.get_list(termlist.list_name)

# tl = TermLists(["Test", "Test2"])
# db.get_lists(tl)
# print("------")
# print(tl.to_dict())

# db = Database()
# test_long_def = "A test is a structured procedure or assessment used to evaluate a person's knowledge, skills, abilities, performance, or understanding of a specific subject, process, or function. Tests can be formal or informal and are commonly used in academic, professional, scientific, and technical contexts. For example, in education, a test might involve multiple-choice or essay questions to measure a student’s grasp of history or mathematics. In software development, a test refers to a procedure that checks whether a program or system behaves as expected under specific conditions, such as unit testing a function to ensure it returns the correct output. Medical tests, like blood tests, are used to detect health conditions or monitor treatment effectiveness. Essentially, a test is a means of gathering information to make informed decisions, identify areas for improvement, or ensure reliability and accuracy in various settings."
# db.cur.execute("UPDATE terms SET long_definition = ? WHERE term = ?", (test_long_def, "test"))

# task_long_def = "A task is a specific piece of work or an assignment that is undertaken to achieve a particular goal, often within a defined timeframe or as part of a larger project. Tasks can vary greatly in complexity, duration, and purpose, ranging from simple activities like sending an email or washing dishes to more complex undertakings such as writing a research paper or developing a mobile app. In a workplace setting, a manager might assign tasks to team members to complete different parts of a larger project—like designing a website or conducting market research. In computer science, a task may refer to a unit of computation handled by a processor, such as executing a function in parallel programming. Tasks often involve a series of steps, decision-making, or problem-solving, and they help organize work into manageable segments to ensure efficiency and productivity. Overall, a task represents focused action directed toward achieving a desired outcome."
# db.cur.execute("UPDATE terms SET long_definition = ? WHERE term = ?", (task_long_def, "task"))




