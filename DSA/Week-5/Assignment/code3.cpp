#include <iostream>
#include <string>
using namespace std;

int main()
{
    string s;
    cout << "Enter a string: ";
    getline(cin, s);

    int freq[256] = {0}; // ASCII frequency array

    // Count frequency
    for (char ch : s)
    {
        if (ch != ' ')
        {
            freq[(int)ch]++;
        }
    }

    // Print frequency & find max
    int maxFreq = 0;
    char maxChar;

    for (int i = 0; i < 256; i++)
    {
        if (freq[i] > 0)
        {
            cout << (char)i << " : " << freq[i] << endl;

            if (freq[i] > maxFreq)
            {
                maxFreq = freq[i];
                maxChar = (char)i;
            }
        }
    }

    cout << "Most frequent character: " << maxChar;

    return 0;
}