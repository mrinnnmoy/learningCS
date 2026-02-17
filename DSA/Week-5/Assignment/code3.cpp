#include <iostream>
using namespace std;

int main()
{
    int matrix[3][3] = {
        {1, 2, 3},
        {4, 5, 6},
        {7, 8, 9}};

    int n = 3, m = 3;
    int count = 0;

    for (int i = 0; i < n - 1; i++)
    {
        for (int j = 0; j < m - 1; j++)
        {

            int sum = matrix[i][j] + matrix[i][j + 1] + matrix[i + 1][j] + matrix[i + 1][j + 1];

            if (sum % 2 == 0)
                count++;
        }
    }

    cout << "Number of 2x2 submatrices with even sum: " << count;

    return 0;
}
