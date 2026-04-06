#include <iostream>
#include <vector>
#include <string>
using namespace std;

struct TrieNode
{
    TrieNode *children[26];
    bool isEndOfWord;
    int prefixCount; // How many words pass through this node

    TrieNode() : isEndOfWord(false), prefixCount(0)
    {
        for (int i = 0; i < 26; i++)
            children[i] = nullptr;
    }
};

class Trie
{
private:
    TrieNode *root;

    void collectAll(TrieNode *node, string curr,
                    vector<string> &result)
    {
        if (!node)
            return;
        if (node->isEndOfWord)
            result.push_back(curr);
        for (int i = 0; i < 26; i++)
            if (node->children[i])
                collectAll(node->children[i],
                           curr + (char)('a' + i), result);
    }

    void freeTrie(TrieNode *node)
    {
        if (!node)
            return;
        for (int i = 0; i < 26; i++)
            freeTrie(node->children[i]);
        delete node;
    }

public:
    Trie() { root = new TrieNode(); }
    ~Trie() { freeTrie(root); }

    void insert(const string &word)
    {
        TrieNode *curr = root;
        for (char ch : word)
        {
            int idx = ch - 'a';
            if (!curr->children[idx])
                curr->children[idx] = new TrieNode();
            curr = curr->children[idx];
            curr->prefixCount++;
        }
        curr->isEndOfWord = true;
    }

    bool search(const string &word)
    {
        TrieNode *curr = root;
        for (char ch : word)
        {
            int idx = ch - 'a';
            if (!curr->children[idx])
                return false;
            curr = curr->children[idx];
        }
        return curr->isEndOfWord;
    }

    bool startsWith(const string &prefix)
    {
        TrieNode *curr = root;
        for (char ch : prefix)
        {
            int idx = ch - 'a';
            if (!curr->children[idx])
                return false;
            curr = curr->children[idx];
        }
        return true;
    }

    int countWordsWithPrefix(const string &prefix)
    {
        TrieNode *curr = root;
        for (char ch : prefix)
        {
            int idx = ch - 'a';
            if (!curr->children[idx])
                return 0;
            curr = curr->children[idx];
        }
        return curr->prefixCount;
    }

    vector<string> getAllWords()
    {
        vector<string> result;
        collectAll(root, "", result);
        return result;
    }
};

int main()
{
    Trie trie;

    vector<string> words = {
        "apple", "app", "apt", "application",
        "bat", "ball", "bad", "band"};
    for (auto &w : words)
        trie.insert(w);

    cout << "=== Search ===\n";
    cout << "search(app)         : " << (trie.search("app") ? "true" : "false") << "\n";
    cout << "search(ap)          : " << (trie.search("ap") ? "true" : "false") << "\n";
    cout << "search(apple)       : " << (trie.search("apple") ? "true" : "false") << "\n";
    cout << "search(cat)         : " << (trie.search("cat") ? "true" : "false") << "\n";

    cout << "\n=== Prefix Search ===\n";
    cout << "startsWith(app)     : " << (trie.startsWith("app") ? "true" : "false") << "\n";
    cout << "startsWith(ba)      : " << (trie.startsWith("ba") ? "true" : "false") << "\n";
    cout << "startsWith(cat)     : " << (trie.startsWith("cat") ? "true" : "false") << "\n";

    cout << "\n=== Count With Prefix ===\n";
    cout << "countWordsWithPrefix(app) : " << trie.countWordsWithPrefix("app") << "\n";
    cout << "countWordsWithPrefix(ba)  : " << trie.countWordsWithPrefix("ba") << "\n";
    cout << "countWordsWithPrefix(b)   : " << trie.countWordsWithPrefix("b") << "\n";

    cout << "\n=== All Words (lexicographic) ===\n";
    for (auto &w : trie.getAllWords())
        cout << "  " << w << "\n";

    return 0;
}