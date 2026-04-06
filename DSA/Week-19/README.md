# List of things learned.

## 1. Introduction to Trie.

A **Trie** (pronounced "try") is a special tree-like data structure used to store strings where each node represents a **single character** of a string.

The word "Trie" comes from the word "re**trie**val", because it was originally designed for fast string retrieval.

Unlike a BST where each node stores a complete value, in a Trie each **path from root to a marked node** represents a complete word.

> 📷 **Trie storing words: "can", "cat", "bat", "bad":**
> ![Trie](https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Trie_example.svg/250px-Trie_example.svg.png)

```
Words: {"can", "cat", "bat", "bad"}

         root
        /    \
       c      b
       |      |
       a      a
      / \    / \
     n   t  t   d
     *   *  *   *

* = end of word marker
```

### Why Trie?

Consider searching for a word in a set of 1 million words:

| Approach     | Search Time                           |
| ------------ | ------------------------------------- |
| Array / List | O(n × m) where m = word length        |
| Hash Set     | O(m) average, O(m²) worst (collision) |
| BST          | O(m × log n)                          |
| **Trie**     | **O(m)** — always, guaranteed         |

Trie wins whenever:

- You need **prefix-based search** (autocomplete)
- You need to store a **dictionary** of words
- You need **longest prefix matching** (IP routing)
- You need to check if any stored word is a **prefix of another**

### Real-Life Applications

- **Autocomplete** : Google search suggestions, IDE code completion
- **Spell Checker** : dictionary lookups and suggestions
- **IP Routing** : longest prefix matching in routers
- **Word Games** : Boggle, Scrabble word validation
- **Contact Search** : phone contact prefix search
- **DNA Sequencing** : pattern matching in genomic data

---

## 2. Trie Node Structure

Each node in a Trie contains:

- An array (or map) of **children**, one slot per possible character
- A boolean **isEndOfWord** flag to mark if a complete word ends here

### Array-based Node (fixed alphabet size)

Used when the character set is small and known. (e.g., only lowercase English letters = 26)

```cpp
struct TrieNode {
    TrieNode* children[26];   // One slot per lowercase letter
    bool isEndOfWord;

    TrieNode() {
        isEndOfWord = false;
        for (int i = 0; i < 26; i++)
            children[i] = nullptr;
    }
};
```

```
Index mapping:
'a' → index 0
'b' → index 1
'c' → index 2
...
'z' → index 25

Formula: index = character - 'a'
```

### Map-based Node (dynamic alphabet)

Used when the character set is large or unknown (Unicode, digits + letters, etc.).

```cpp
#include <unordered_map>

struct TrieNode {
    unordered_map<char, TrieNode*> children;
    bool isEndOfWord;

    TrieNode() : isEndOfWord(false) {}
};
```

### Comparison

|                | Array-based          | Map-based              |
| -------------- | -------------------- | ---------------------- |
| Space per node | O(alphabet size)     | O(actual children)     |
| Access speed   | O(1)                 | O(1) average           |
| Best for       | Small fixed alphabet | Large/unknown alphabet |
| Memory waste   | High (empty slots)   | None                   |

---

## 3. Core Trie Operations

### 3.1 Insert

Walk down the Trie character by character. If a node for the current character doesn't exist, create it. After inserting all characters, mark the last node as end of word.

```
Insert "cat" into empty Trie:

Step 1: root → child['c'-'a'] = child[2] → doesn't exist → create node C
Step 2: node C → child['a'-'a'] = child[0] → doesn't exist → create node A
Step 3: node A → child['t'-'a'] = child[19] → doesn't exist → create node T
Step 4: Mark node T → isEndOfWord = true

Insert "can":
Step 1: root → child[2] → exists (node C) ← reuse
Step 2: node C → child[0] → exists (node A) ← reuse
Step 3: node A → child['n'-'a'] = child[13] → create node N
Step 4: Mark node N → isEndOfWord = true
```

```cpp
void insert(TrieNode* root, const string& word) {
    TrieNode* curr = root;

    for (char ch : word) {
        int idx = ch - 'a';

        // If child doesn't exist, create it
        if (!curr->children[idx])
            curr->children[idx] = new TrieNode();

        // Move to child
        curr = curr->children[idx];
    }

    // Mark end of word
    curr->isEndOfWord = true;
}
```

**Time Complexity:** O(m) where m = length of word

**Space Complexity:** O(m) in worst case (all new nodes)

---

### 3.2 Search

Walk down the Trie character by character.

If at any point a required child doesn't exist, the word is not in the Trie.

If we reach the end of the word, check _isEndOfWord_.

```
Search "cat" in Trie containing {"cat", "can", "bat"}:

Step 1: root → child[2] → exists (C) ✓
Step 2: C    → child[0] → exists (A) ✓
Step 3: A    → child[19]→ exists (T) ✓
Step 4: T.isEndOfWord = true → FOUND ✓

Search "ca":
Step 1: root → child[2] → C ✓
Step 2: C    → child[0] → A ✓
Step 3: A.isEndOfWord = false → NOT FOUND ✗
        ("ca" is a prefix but not a complete word)

Search "car":
Step 1: root → child[2] → C ✓
Step 2: C    → child[0] → A ✓
Step 3: A    → child[17]→ nullptr → NOT FOUND ✗
```

```cpp
bool search(TrieNode* root, const string& word) {
    TrieNode* curr = root;

    for (char ch : word) {
        int idx = ch - 'a';

        // If child doesn't exist, word not in Trie
        if (!curr->children[idx])
            return false;

        curr = curr->children[idx];
    }

    // Word exists only if this is marked as end
    return curr->isEndOfWord;
}
```

**Time Complexity:** O(m)

**Space Complexity:** O(1)

---

### 3.3 Starts With (Prefix Search)

Check if any word in the Trie starts with the given prefix. Same as search but we don't check isEndOfWord at the end.

```
Check prefix "ca" in Trie with {"cat", "can", "bat"}:

Step 1: root → child[2] → C ✓
Step 2: C    → child[0] → A ✓
Step 3: Reached end of prefix → return true
        (we don't care if it's a word — just that the path exists)

Check prefix "be":
Step 1: root → child[1] → B ✓
Step 2: B    → child[4] → nullptr → return false
```

```cpp
bool startsWith(TrieNode* root, const string& prefix) {
    TrieNode* curr = root;

    for (char ch : prefix) {
        int idx = ch - 'a';
        if (!curr->children[idx])
            return false;
        curr = curr->children[idx];
    }

    return true;   // Prefix path exists
}
```

**Time Complexity:** O(m)

**Space Complexity:** O(1)

---

### 3.4 Delete

Deleting a word from a Trie is more involved. We must:

1. Verify the word exists
2. Unmark the `isEndOfWord` flag at the end node
3. Recursively delete nodes that are no longer needed (nodes with no children and not end of another word)

```
Delete "cat" from Trie containing {"cat", "can"}:

Before:
  root → C → A → T* (isEndOfWord=true)
              ↓
              N* (isEndOfWord=true)

Step 1: Unmark T (isEndOfWord = false)
Step 2: T has no children → delete T
Step 3: A still has child N → STOP (don't delete A)

After:
  root → C → A → N*
```

```cpp
bool deleteWord(TrieNode* root, const string& word, int depth = 0) {
    if (!root) return false;

    // Base case: reached end of word
    if (depth == word.size()) {
        if (root->isEndOfWord)
            root->isEndOfWord = false;

        // Delete this node only if it has no children
        for (int i = 0; i < 26; i++)
            if (root->children[i]) return false;  // Has children, keep it

        return true;   // No children, safe to delete
    }

    int idx = word[depth] - 'a';
    if (!root->children[idx]) return false;  // Word not found

    bool shouldDelete = deleteWord(root->children[idx], word, depth + 1);

    if (shouldDelete) {
        delete root->children[idx];
        root->children[idx] = nullptr;

        // Delete current node if it's not end of another word
        // and has no other children
        if (!root->isEndOfWord) {
            for (int i = 0; i < 26; i++)
                if (root->children[i]) return false;
            return true;
        }
    }
    return false;
}
```

**Time Complexity:** O(m)

**Space Complexity:** O(m) — recursion stack

---

## 4. Complete Trie Implementation in C++

```cpp
#include <iostream>
#include <string>
#include <vector>
using namespace std;

struct TrieNode {
    TrieNode* children[26];
    bool isEndOfWord;

    TrieNode() {
        isEndOfWord = false;
        for (int i = 0; i < 26; i++)
            children[i] = nullptr;
    }
};

class Trie {
private:
    TrieNode* root;

    // Helper to check if node has any children
    bool hasChildren(TrieNode* node) {
        for (int i = 0; i < 26; i++)
            if (node->children[i]) return true;
        return false;
    }

    // Helper for delete
    bool deleteHelper(TrieNode* node, const string& word, int depth) {
        if (!node) return false;

        if (depth == (int)word.size()) {
            if (node->isEndOfWord) node->isEndOfWord = false;
            return !hasChildren(node);
        }

        int idx = word[depth] - 'a';
        if (!node->children[idx]) return false;

        bool shouldDelete = deleteHelper(node->children[idx], word, depth + 1);

        if (shouldDelete) {
            delete node->children[idx];
            node->children[idx] = nullptr;
            return !node->isEndOfWord && !hasChildren(node);
        }
        return false;
    }

    // Helper for collecting all words
    void collectWords(TrieNode* node, string current,
                      vector<string>& result) {
        if (node->isEndOfWord)
            result.push_back(current);

        for (int i = 0; i < 26; i++) {
            if (node->children[i]) {
                collectWords(node->children[i],
                             current + (char)('a' + i),
                             result);
            }
        }
    }

    // Helper to free all memory
    void freeTrie(TrieNode* node) {
        if (!node) return;
        for (int i = 0; i < 26; i++)
            freeTrie(node->children[i]);
        delete node;
    }

public:
    Trie() { root = new TrieNode(); }
    ~Trie() { freeTrie(root); }

    void insert(const string& word) {
        TrieNode* curr = root;
        for (char ch : word) {
            int idx = ch - 'a';
            if (!curr->children[idx])
                curr->children[idx] = new TrieNode();
            curr = curr->children[idx];
        }
        curr->isEndOfWord = true;
    }

    bool search(const string& word) {
        TrieNode* curr = root;
        for (char ch : word) {
            int idx = ch - 'a';
            if (!curr->children[idx]) return false;
            curr = curr->children[idx];
        }
        return curr->isEndOfWord;
    }

    bool startsWith(const string& prefix) {
        TrieNode* curr = root;
        for (char ch : prefix) {
            int idx = ch - 'a';
            if (!curr->children[idx]) return false;
            curr = curr->children[idx];
        }
        return true;
    }

    void deleteWord(const string& word) {
        deleteHelper(root, word, 0);
    }

    // Get all words with given prefix (autocomplete)
    vector<string> getWordsWithPrefix(const string& prefix) {
        TrieNode* curr = root;
        for (char ch : prefix) {
            int idx = ch - 'a';
            if (!curr->children[idx]) return {};
            curr = curr->children[idx];
        }
        vector<string> result;
        collectWords(curr, prefix, result);
        return result;
    }

    // Get all words in Trie
    vector<string> getAllWords() {
        vector<string> result;
        collectWords(root, "", result);
        return result;
    }
};

int main() {
    Trie trie;

    // Insert words
    vector<string> words = {"apple","app","application",
                            "apply","apt","bat","ball","bad"};
    for (auto& w : words) trie.insert(w);

    cout << "=== Search ===\n";
    cout << "search(app)         : " << (trie.search("app")         ? "Found" : "Not Found") << "\n";
    cout << "search(apple)       : " << (trie.search("apple")       ? "Found" : "Not Found") << "\n";
    cout << "search(ap)          : " << (trie.search("ap")          ? "Found" : "Not Found") << "\n";
    cout << "search(cat)         : " << (trie.search("cat")         ? "Found" : "Not Found") << "\n";

    cout << "\n=== Prefix Search ===\n";
    cout << "startsWith(app)     : " << (trie.startsWith("app")     ? "Yes" : "No") << "\n";
    cout << "startsWith(ba)      : " << (trie.startsWith("ba")      ? "Yes" : "No") << "\n";
    cout << "startsWith(cat)     : " << (trie.startsWith("cat")     ? "Yes" : "No") << "\n";

    cout << "\n=== Autocomplete 'app' ===\n";
    auto suggestions = trie.getWordsWithPrefix("app");
    for (auto& s : suggestions) cout << "  " << s << "\n";

    cout << "\n=== All Words ===\n";
    auto all = trie.getAllWords();
    for (auto& w : all) cout << "  " << w << "\n";

    cout << "\n=== Delete 'app' ===\n";
    trie.deleteWord("app");
    cout << "search(app)   : " << (trie.search("app")   ? "Found" : "Not Found") << "\n";
    cout << "search(apple) : " << (trie.search("apple") ? "Found" : "Not Found") << "\n";

    return 0;
}
```

**Output:**

```
=== Search ===
search(app)         : Found
search(apple)       : Found
search(ap)          : Not Found
search(cat)         : Not Found

=== Prefix Search ===
startsWith(app)     : Yes
startsWith(ba)      : Yes
startsWith(cat)     : No

=== Autocomplete 'app' ===
  app
  apple
  application
  apply

=== All Words ===
  app
  apple
  application
  apply
  apt
  bad
  ball
  bat

=== Delete 'app' ===
search(app)   : Not Found
search(apple) : Found
```

---

## 5. Trie. (Advanced Applications)

### 5.1 Autocomplete System

An autocomplete system suggests completions for a given prefix, optionally ranked by frequency.

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>
#include <algorithm>
using namespace std;

struct AutoNode {
    unordered_map<char, AutoNode*> children;
    bool   isEnd;
    int    frequency;   // How many times this word was searched

    AutoNode() : isEnd(false), frequency(0) {}
};

class AutoComplete {
private:
    AutoNode* root;

    void collect(AutoNode* node, string current,
                 vector<pair<int,string>>& results) {
        if (node->isEnd)
            results.push_back({node->frequency, current});
        for (auto& [ch, child] : node->children)
            collect(child, current + ch, results);
    }

public:
    AutoComplete() { root = new AutoNode(); }

    void insert(const string& word, int freq = 1) {
        AutoNode* curr = root;
        for (char ch : word) {
            if (!curr->children.count(ch))
                curr->children[ch] = new AutoNode();
            curr = curr->children[ch];
        }
        curr->isEnd = true;
        curr->frequency += freq;
    }

    // Return top k suggestions for prefix sorted by frequency
    vector<string> getSuggestions(const string& prefix, int k = 5) {
        AutoNode* curr = root;
        for (char ch : prefix) {
            if (!curr->children.count(ch)) return {};
            curr = curr->children[ch];
        }

        vector<pair<int,string>> results;
        collect(curr, prefix, results);

        // Sort by frequency descending
        sort(results.begin(), results.end(),
             [](auto& a, auto& b) { return a.first > b.first; });

        vector<string> suggestions;
        for (int i = 0; i < min(k, (int)results.size()); i++)
            suggestions.push_back(results[i].second);

        return suggestions;
    }
};

int main() {
    AutoComplete ac;
    ac.insert("apple",       100);
    ac.insert("app",          80);
    ac.insert("application",  60);
    ac.insert("apply",        40);
    ac.insert("apt",          20);
    ac.insert("appetizer",    10);

    cout << "Top suggestions for 'app':\n";
    for (auto& s : ac.getSuggestions("app", 3))
        cout << "  " << s << "\n";

    cout << "\nTop suggestions for 'appl':\n";
    for (auto& s : ac.getSuggestions("appl", 3))
        cout << "  " << s << "\n";

    return 0;
}
```

**Output:**

```
Top suggestions for 'app':
  apple
  app
  application

Top suggestions for 'appl':
  apple
  application
  apply
```

---

### 5.2 Longest Common Prefix

Find the longest prefix shared by all strings in an array.

```
Words: {"flower", "flow", "flight"}

Insert all into Trie.
Walk from root as long as:
  - Only ONE child exists at current node
  - Current node is NOT end of word

f → l → o   ← at 'o', two children ('w' and 'w'... wait)
          Actually: flow and flower share 'f','l','o','w'
          flight shares only 'f','l'
          So LCP = "fl"
```

```cpp
string longestCommonPrefix(vector<string>& words) {
    if (words.empty()) return "";

    Trie trie;
    for (auto& w : words) trie.insert(w);

    // Walk the trie from root
    // Continue only while exactly one child and not end of word
    string prefix = "";
    TrieNode* curr = trie.getRoot();   // expose root via getter

    while (true) {
        // Count children
        int childCount = 0;
        int childIdx   = -1;
        for (int i = 0; i < 26; i++) {
            if (curr->children[i]) {
                childCount++;
                childIdx = i;
            }
        }

        // Stop if multiple children, end of word, or no children
        if (childCount != 1 || curr->isEndOfWord) break;

        prefix += (char)('a' + childIdx);
        curr    = curr->children[childIdx];
    }
    return prefix;
}
```

---

### 5.3 Count Words with Given Prefix

Count how many words in the Trie start with a given prefix.

```cpp
// Add a countEndings field to each TrieNode
struct CountNode {
    CountNode* children[26];
    int countEndings;   // Words passing through or ending here

    CountNode() : countEndings(0) {
        for (int i = 0; i < 26; i++) children[i] = nullptr;
    }
};

void insertCount(CountNode* root, const string& word) {
    CountNode* curr = root;
    for (char ch : word) {
        int idx = ch - 'a';
        if (!curr->children[idx])
            curr->children[idx] = new CountNode();
        curr = curr->children[idx];
        curr->countEndings++;   // Increment for every node on path
    }
}

int countWordsWithPrefix(CountNode* root, const string& prefix) {
    CountNode* curr = root;
    for (char ch : prefix) {
        int idx = ch - 'a';
        if (!curr->children[idx]) return 0;
        curr = curr->children[idx];
    }
    return curr->countEndings;
}
```

---

### 5.4 Word Search in a Dictionary (Spell Checker)

Check if a word exists OR find the closest suggestions for misspelled words.

```cpp
// Find all words within edit distance 1 of the query
// (a simplified spell checker)
void fuzzySearch(TrieNode* node, const string& word,
                 int index, string current,
                 int errors, int maxErrors,
                 vector<string>& results) {
    if (errors > maxErrors) return;

    if (index == (int)word.size()) {
        if (node->isEndOfWord)
            results.push_back(current);
        return;
    }

    for (int i = 0; i < 26; i++) {
        if (!node->children[i]) continue;
        char ch = 'a' + i;
        int newErrors = errors + (ch != word[index] ? 1 : 0);
        fuzzySearch(node->children[i], word, index + 1,
                    current + ch, newErrors, maxErrors, results);
    }
}
```

---

## 6. Compressed Trie (Radix Tree). (Concept)

A regular Trie wastes space when many nodes have only one child. A **Compressed Trie** (Radix Tree) merges chains of single-child nodes into a single edge with a string label.

> 📷 **Radix Tree — compressed trie with edge labels:**
> ![Radix Tree](https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Patricia_trie.svg/330px-Patricia_trie.svg.png)

```
Regular Trie for {"test", "testing", "tested"}:
t → e → s → t → (end)
                ↓
                i → n → g → (end)
                e → d → (end)

Compressed Trie:
"test" → (end)
       → "ing" → (end)
       → "ed"  → (end)
```

**Benefits:**

- Saves memory by merging single-child chains
- Same O(m) lookup time
- Used in IP routing tables, suffix arrays

---

## 7. Trie vs HashMap for String Storage

| Feature       | Trie              | HashMap         |
| ------------- | ----------------- | --------------- |
| Search        | O(m)              | O(m) average    |
| Insert        | O(m)              | O(m) average    |
| Prefix search | O(m) ✓            | Not supported ✗ |
| Autocomplete  | O(m + results) ✓  | Not supported ✗ |
| Sorted output | Yes (DFS) ✓       | No ✗            |
| Memory        | High (many nodes) | Lower           |
| Collision     | Never ✓           | Possible ✗      |
| Worst case    | O(m) guaranteed   | O(m²) possible  |

**Use Trie when:**

- You need prefix-based operations
- You need sorted word enumeration
- You need guaranteed O(m) worst case
  **Use HashMap when:**
- You only need exact-match lookups
- Memory is a concern
- No prefix operations needed

---

## 8. Time & Space Complexity Summary

| Operation            | Time     | Space          |
| -------------------- | -------- | -------------- |
| Insert               | O(m)     | O(m)           |
| Search               | O(m)     | O(1)           |
| Starts With          | O(m)     | O(1)           |
| Delete               | O(m)     | O(m) recursion |
| Autocomplete         | O(m + k) | O(k)           |
| Get all words        | O(n × m) | O(n × m)       |
| Longest prefix       | O(n × m) | O(n × m)       |
| Build Trie (n words) | O(n × m) | O(n × m)       |

Where:

- `m` = length of word / prefix
- `n` = number of words
- `k` = number of results
  **Space for the full Trie:**
- Worst case: O(n × m × alphabet_size)
- Average case (shared prefixes): much less

---

## 9. Important Tips & Common Mistakes

- Always initialize all children to `nullptr` in the constructor, uninitialized pointers cause undefined behavior
- `isEndOfWord` is what separates "cat" from "ca" when both paths exist, never forget it
- Deleting a word does NOT mean deleting all its nodes, only nodes with no other purpose
- For case-insensitive Trie, convert all characters to lowercase before insert/search
- When using array-based nodes, the index formula `ch - 'a'` only works for lowercase letters, adjust for other character sets
- Prefix search (`startsWith`) returns true even if the prefix is not a complete word, this is intentional and by design
- Autocomplete DFS traversal returns words in **lexicographic order** naturally, no sorting needed
- Memory usage is Trie's biggest weakness, for 1 million words of average length 10, array-based Trie uses ~260MB
- Always free Trie memory recursively (post-order deletion) to avoid leaks

---

## Assignments.

1. **Basic Trie Operations.**

   **Task:** Implement a `Trie` class from scratch with the following operations and test each one carefully:
   - `insert(word)` : Insert a word
   - `search(word)` : Return true if exact word exists
   - `startsWith(prefix)` : Return true if any word has this prefix
   - `countWordsWithPrefix(prefix)` : Count how many inserted words start with prefix
   - `getAllWords()` : Return all words in the Trie in lexicographic order

   **Test with:**

   ```
   Insert: "apple", "app", "apt", "application",
           "bat", "ball", "bad", "band"

   search("app")          → true
   search("ap")           → false
   search("apple")        → true
   search("cat")          → false
   startsWith("app")      → true
   startsWith("ba")       → true
   startsWith("cat")      → false
   countWordsWithPrefix("app") → 3  (app, apple, application)
   countWordsWithPrefix("ba")  → 3  (bat, ball, bad, band → 4)
   getAllWords()           → alphabetical list of all 8 words
   ```

   [Solution](./Assignment/code1.cpp)

2. **Autocomplete System + Delete Operation.**

   **Task:** Build an **Autocomplete System** and implement a correct **Delete** operation:

   **Part 1 — Autocomplete:**
   - Insert words with frequencies
   - Given a prefix, return the top 3 suggestions **sorted by frequency** (highest first)
   - If no suggestions, print "No suggestions"
     **Part 2 — Delete:**
   - Implement correct deletion that:
   - Removes the word from search results
   - Does NOT delete nodes shared with other words
   - Does NOT delete prefix nodes of longer words

   **Test with:**

   ```
   Part 1 — Insert with frequencies:
   "hello":50, "help":80, "hero":30, "helmet":60,
   "her":45,   "he":90,   "heat":25, "heavy":35

   getSuggestions("he", top 3) → he(90), help(80), helmet(60)
   getSuggestions("hel", top 3)→ help(80), helmet(60), hello(50)
   getSuggestions("her", top 3)→ hero(30)... wait:
                               her(45), hero(30)
   getSuggestions("xyz")        → No suggestions

   Part 2 — Delete:
   Insert: "cat", "cats", "catfish", "car", "card"

   Before delete:
   search(cat)    → true
   search(cats)   → true

   deleteWord("cat")

   After delete:
   search(cat)    → false  (removed)
   search(cats)   → true   (shared nodes kept)
   search(car)    → true   (unaffected)
   ```

   [Solution](./Assignment/code2.cpp)

3. **Longest Common Prefix + Word Search Validation + Spell Checker.**

   **Task:** Solve all three parts using Trie:

   **Part 1 — Longest Common Prefix:**
   Given an array of words, find the longest string that is a prefix of all words in the array. Use a Trie-based approach.

   **Part 2 — Word Break Problem:**
   Given a string `s` and a dictionary of words, determine if `s` can be broken into a space-separated sequence of one or more dictionary words. Use Trie + recursion.

   **Part 3 — Simple Spell Checker:**
   Given a dictionary and a list of query words, for each query:
   - If the word exists → print "Correct"
   - If not → find and print all words in the dictionary that differ by exactly 1 character at any position (same length only)

   **Test with:**

   ```
   Part 1:
   words = {"flower","flow","flight"} → "fl"
   words = {"dog","racecar","car"}    → ""
   words = {"interview","inter","internal"} → "inter"

   Part 2:
   dict = {"leet","code","apple","pen"}
   s = "leetcode"   → true  (leet + code)
   s = "applepen"   → true  (apple + pen)
   s = "catsandog"  → false

   Part 3:
   dict = {"cat","bat","hat","car","bar","cats"}
   queries: "cat"  → Correct
           "cab"  → Suggestions: cat, bar (differ by 1)
           "dog"  → No suggestions
   ```

   [Solution](./Assignment/code3.cpp)
