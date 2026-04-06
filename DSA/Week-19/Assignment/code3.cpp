#include <iostream>
#include <vector>
#include <string>
#include <unordered_set>
using namespace std;

// ── Shared Trie Node ──────────────────────────
struct TrieNode
{
    TrieNode *children[26];
    bool isEnd;
    int childCount;

    TrieNode() : isEnd(false), childCount(0)
    {
        for (int i = 0; i < 26; i++)
            children[i] = nullptr;
    }
};

void insertNode(TrieNode *root, const string &word)
{
    TrieNode *curr = root;
    for (char ch : word)
    {
        int idx = ch - 'a';
        if (!curr->children[idx])
        {
            curr->children[idx] = new TrieNode();
            curr->childCount++;
        }
        curr = curr->children[idx];
    }
    curr->isEnd = true;
}

bool searchNode(TrieNode *root, const string &word)
{
    TrieNode *curr = root;
    for (char ch : word)
    {
        int idx = ch - 'a';
        if (!curr->children[idx])
            return false;
        curr = curr->children[idx];
    }
    return curr->isEnd;
}

void freeNode(TrieNode *node)
{
    if (!node)
        return;
    for (int i = 0; i < 26; i++)
        freeNode(node->children[i]);
    delete node;
}

// ── Part 1: Longest Common Prefix ────────────
string longestCommonPrefix(vector<string> &words)
{
    if (words.empty())
        return "";

    TrieNode *root = new TrieNode();
    for (auto &w : words)
        insertNode(root, w);

    string lcp = "";
    TrieNode *curr = root;

    while (true)
    {
        // Stop if current node is end of any word
        // or has more than one child
        if (curr->isEnd || curr->childCount != 1)
            break;

        for (int i = 0; i < 26; i++)
        {
            if (curr->children[i])
            {
                lcp += (char)('a' + i);
                curr = curr->children[i];
                break;
            }
        }
    }

    freeNode(root);
    return lcp;
}

// ── Part 2: Word Break ────────────────────────
bool wordBreakHelper(const string &s, int start,
                     TrieNode *root,
                     vector<int> &memo)
{
    if (start == (int)s.size())
        return true;
    if (memo[start] != -1)
        return memo[start];

    TrieNode *curr = root;
    for (int end = start; end < (int)s.size(); end++)
    {
        int idx = s[end] - 'a';
        if (!curr->children[idx])
            break; // No word starts here
        curr = curr->children[idx];

        if (curr->isEnd)
        {
            // Found a dictionary word s[start..end]
            // Try to break the rest
            if (wordBreakHelper(s, end + 1, root, memo))
            {
                memo[start] = 1;
                return true;
            }
        }
    }
    memo[start] = 0;
    return false;
}

bool wordBreak(const string &s, vector<string> &dict)
{
    TrieNode *root = new TrieNode();
    for (auto &w : dict)
        insertNode(root, w);

    vector<int> memo(s.size(), -1);
    bool result = wordBreakHelper(s, 0, root, memo);

    freeNode(root);
    return result;
}

// ── Part 3: Spell Checker ─────────────────────
void collectAll(TrieNode *node, string curr,
                vector<string> &result)
{
    if (!node)
        return;
    if (node->isEnd)
        result.push_back(curr);
    for (int i = 0; i < 26; i++)
        if (node->children[i])
            collectAll(node->children[i],
                       curr + (char)('a' + i), result);
}

vector<string> spellCheck(TrieNode *root,
                          const string &query)
{
    // Get all words
    vector<string> allWords;
    collectAll(root, "", allWords);

    // Find words differing by exactly 1 character
    vector<string> suggestions;
    for (auto &word : allWords)
    {
        if (word.size() != query.size())
            continue;
        int diff = 0;
        for (int i = 0; i < (int)word.size(); i++)
            if (word[i] != query[i])
                diff++;
        if (diff == 1)
            suggestions.push_back(word);
    }
    return suggestions;
}

int main()
{
    // ── Part 1 ───────────────────────────────
    cout << "=== Part 1: Longest Common Prefix ===\n";

    vector<string> w1 = {"flower", "flow", "flight"};
    vector<string> w2 = {"dog", "racecar", "car"};
    vector<string> w3 = {"interview", "inter", "internal"};

    auto lcp1 = longestCommonPrefix(w1);
    auto lcp2 = longestCommonPrefix(w2);
    auto lcp3 = longestCommonPrefix(w3);

    cout << "{flower,flow,flight}       → \"" << lcp1 << "\"\n";
    cout << "{dog,racecar,car}          → \"" << lcp2
         << (lcp2.empty() ? "(empty)" : "") << "\"\n";
    cout << "{interview,inter,internal} → \"" << lcp3 << "\"\n";

    // ── Part 2 ───────────────────────────────
    cout << "\n=== Part 2: Word Break ===\n";
    vector<string> dict = {"leet", "code", "apple", "pen"};

    vector<pair<string, bool>> tests = {
        {"leetcode", true},
        {"applepen", true},
        {"catsandog", false}};

    for (auto &[s, expected] : tests)
    {
        bool result = wordBreak(s, dict);
        cout << "\"" << s << "\" → "
             << (result ? "true" : "false")
             << (result == expected ? " ✓" : " ✗") << "\n";
    }

    // ── Part 3 ───────────────────────────────
    cout << "\n=== Part 3: Spell Checker ===\n";
    TrieNode *dictTrie = new TrieNode();
    vector<string> dictWords = {"cat", "bat", "hat", "car", "bar", "cats"};
    for (auto &w : dictWords)
        insertNode(dictTrie, w);

    vector<string> queries = {"cat", "cab", "dog"};

    for (auto &q : queries)
    {
        cout << "Query \"" << q << "\" → ";
        if (searchNode(dictTrie, q))
        {
            cout << "Correct\n";
        }
        else
        {
            auto sugg = spellCheck(dictTrie, q);
            if (sugg.empty())
                cout << "No suggestions\n";
            else
            {
                cout << "Suggestions: ";
                for (auto &s : sugg)
                    cout << s << " ";
                cout << "\n";
            }
        }
    }

    freeNode(dictTrie);
    return 0;
}