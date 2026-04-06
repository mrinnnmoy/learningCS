#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>
#include <algorithm>
using namespace std;

// ── Part 1: Autocomplete ──────────────────────
struct AutoNode
{
    AutoNode *children[26];
    bool isEnd;
    int freq;

    AutoNode() : isEnd(false), freq(0)
    {
        for (int i = 0; i < 26; i++)
            children[i] = nullptr;
    }
};

class AutoComplete
{
private:
    AutoNode *root;

    void collect(AutoNode *node, string curr,
                 vector<pair<int, string>> &res)
    {
        if (!node)
            return;
        if (node->isEnd)
            res.push_back({node->freq, curr});
        for (int i = 0; i < 26; i++)
            if (node->children[i])
                collect(node->children[i],
                        curr + (char)('a' + i), res);
    }

    void freeNode(AutoNode *node)
    {
        if (!node)
            return;
        for (int i = 0; i < 26; i++)
            freeNode(node->children[i]);
        delete node;
    }

public:
    AutoComplete() { root = new AutoNode(); }
    ~AutoComplete() { freeNode(root); }

    void insert(const string &word, int freq)
    {
        AutoNode *curr = root;
        for (char ch : word)
        {
            int idx = ch - 'a';
            if (!curr->children[idx])
                curr->children[idx] = new AutoNode();
            curr = curr->children[idx];
        }
        curr->isEnd = true;
        curr->freq = freq;
    }

    vector<string> getSuggestions(const string &prefix, int k = 3)
    {
        AutoNode *curr = root;
        for (char ch : prefix)
        {
            int idx = ch - 'a';
            if (!curr->children[idx])
                return {};
            curr = curr->children[idx];
        }

        vector<pair<int, string>> results;
        collect(curr, prefix, results);

        sort(results.begin(), results.end(),
             [](auto &a, auto &b)
             { return a.first > b.first; });

        vector<string> suggestions;
        for (int i = 0; i < min(k, (int)results.size()); i++)
            suggestions.push_back(results[i].second);
        return suggestions;
    }
};

// ── Part 2: Delete ────────────────────────────
struct DelNode
{
    DelNode *children[26];
    bool isEnd;

    DelNode() : isEnd(false)
    {
        for (int i = 0; i < 26; i++)
            children[i] = nullptr;
    }
};

class TrieWithDelete
{
private:
    DelNode *root;

    bool hasChildren(DelNode *node)
    {
        for (int i = 0; i < 26; i++)
            if (node->children[i])
                return true;
        return false;
    }

    // Returns true if node can be deleted
    bool deleteHelper(DelNode *node, const string &word, int depth)
    {
        if (!node)
            return false;

        if (depth == (int)word.size())
        {
            if (!node->isEnd)
                return false; // Word not found
            node->isEnd = false;
            // Safe to delete if no children
            return !hasChildren(node);
        }

        int idx = word[depth] - 'a';
        bool shouldDelete = deleteHelper(node->children[idx],
                                         word, depth + 1);
        if (shouldDelete)
        {
            delete node->children[idx];
            node->children[idx] = nullptr;
            // Delete this node only if not end of another word
            // and no remaining children
            return !node->isEnd && !hasChildren(node);
        }
        return false;
    }

    void freeNode(DelNode *node)
    {
        if (!node)
            return;
        for (int i = 0; i < 26; i++)
            freeNode(node->children[i]);
        delete node;
    }

public:
    TrieWithDelete() { root = new DelNode(); }
    ~TrieWithDelete() { freeNode(root); }

    void insert(const string &word)
    {
        DelNode *curr = root;
        for (char ch : word)
        {
            int idx = ch - 'a';
            if (!curr->children[idx])
                curr->children[idx] = new DelNode();
            curr = curr->children[idx];
        }
        curr->isEnd = true;
    }

    bool search(const string &word)
    {
        DelNode *curr = root;
        for (char ch : word)
        {
            int idx = ch - 'a';
            if (!curr->children[idx])
                return false;
            curr = curr->children[idx];
        }
        return curr->isEnd;
    }

    void deleteWord(const string &word)
    {
        deleteHelper(root, word, 0);
    }
};

int main()
{
    // ── Part 1: Autocomplete ─────────────────
    cout << "=== Part 1: Autocomplete ===\n";
    AutoComplete ac;
    ac.insert("hello", 50);
    ac.insert("help", 80);
    ac.insert("hero", 30);
    ac.insert("helmet", 60);
    ac.insert("her", 45);
    ac.insert("he", 90);
    ac.insert("heat", 25);
    ac.insert("heavy", 35);

    auto printSugg = [](const string &prefix,
                        vector<string> sugg)
    {
        cout << "getSuggestions(\"" << prefix << "\") → ";
        if (sugg.empty())
        {
            cout << "No suggestions\n";
            return;
        }
        for (auto &s : sugg)
            cout << s << " ";
        cout << "\n";
    };

    printSugg("he", ac.getSuggestions("he", 3));
    printSugg("hel", ac.getSuggestions("hel", 3));
    printSugg("her", ac.getSuggestions("her", 3));
    printSugg("xyz", ac.getSuggestions("xyz", 3));

    // ── Part 2: Delete ────────────────────────
    cout << "\n=== Part 2: Delete ===\n";
    TrieWithDelete td;
    for (auto &w : {"cat", "cats", "catfish", "car", "card"})
        td.insert(w);

    cout << "Before delete:\n";
    cout << "  search(cat)     : " << (td.search("cat") ? "true" : "false") << "\n";
    cout << "  search(cats)    : " << (td.search("cats") ? "true" : "false") << "\n";
    cout << "  search(catfish) : " << (td.search("catfish") ? "true" : "false") << "\n";
    cout << "  search(car)     : " << (td.search("car") ? "true" : "false") << "\n";

    td.deleteWord("cat");
    cout << "\nAfter deleteWord(cat):\n";
    cout << "  search(cat)     : " << (td.search("cat") ? "true" : "false") << "\n";
    cout << "  search(cats)    : " << (td.search("cats") ? "true" : "false") << "\n";
    cout << "  search(catfish) : " << (td.search("catfish") ? "true" : "false") << "\n";
    cout << "  search(car)     : " << (td.search("car") ? "true" : "false") << "\n";

    return 0;
}