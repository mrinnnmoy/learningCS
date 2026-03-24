#include <iostream>
#include <vector>
using namespace std;

int solutionCount = 0;

// Print the board
void printBoard(vector<int> &board, int n)
{
    for (int row = 0; row < n; row++)
    {
        for (int col = 0; col < n; col++)
        {
            cout << (board[row] == col ? "Q" : ".") << " ";
        }
        cout << "\n";
    }
    cout << "\n";
}

void solveNQueens(
    int row, int n,
    vector<int> &board,
    vector<bool> &cols,      // Columns occupied
    vector<bool> &leftDiag,  // (row - col) diagonals occupied
    vector<bool> &rightDiag, // (row + col) diagonals occupied
    bool printBoards)
{
    // Base case: all queens placed
    if (row == n)
    {
        solutionCount++;
        if (printBoards)
        {
            cout << "Solution " << solutionCount << ":\n";
            printBoard(board, n);
        }
        return;
    }

    // Try placing queen in each column of current row
    for (int col = 0; col < n; col++)
    {
        // Check if column or diagonals are under attack
        if (cols[col] || leftDiag[row - col + n] || rightDiag[row + col])
            continue;

        // Place queen
        board[row] = col;
        cols[col] = true;
        leftDiag[row - col + n] = true;
        rightDiag[row + col] = true;

        // Recurse to next row
        solveNQueens(row + 1, n, board, cols, leftDiag, rightDiag, printBoards);

        // Remove queen (backtrack)
        board[row] = -1;
        cols[col] = false;
        leftDiag[row - col + n] = false;
        rightDiag[row + col] = false;
    }
}

void solve(int n, bool printBoards)
{
    solutionCount = 0;
    vector<int> board(n, -1);
    vector<bool> cols(n, false);
    vector<bool> leftDiag(2 * n, false);  // row - col ranges from -(n-1) to (n-1)
    vector<bool> rightDiag(2 * n, false); // row + col ranges from 0 to 2(n-1)

    solveNQueens(0, n, board, cols, leftDiag, rightDiag, printBoards);
    cout << "Total solutions for N=" << n << ": " << solutionCount << "\n\n";
}

int main()
{
    cout << "N = 4:\n";
    cout << "================================\n";
    solve(4, true);

    cout << "N = 5:\n";
    cout << "================================\n";
    solve(5, false);

    return 0;
}