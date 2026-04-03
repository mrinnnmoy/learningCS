#include <iostream>
#include <vector>
#include <stdexcept>
using namespace std;

class MaxHeap
{
private:
    vector<int> heap;

    void heapifyUp(int i)
    {
        while (i > 0)
        {
            int parent = (i - 1) / 2;
            if (heap[parent] < heap[i])
            {
                swap(heap[parent], heap[i]);
                i = parent;
            }
            else
                break;
        }
    }

    void heapifyDown(int i)
    {
        int n = heap.size();
        while (true)
        {
            int largest = i;
            int l = 2 * i + 1;
            int r = 2 * i + 2;
            if (l < n && heap[l] > heap[largest])
                largest = l;
            if (r < n && heap[r] > heap[largest])
                largest = r;
            if (largest != i)
            {
                swap(heap[i], heap[largest]);
                i = largest;
            }
            else
                break;
        }
    }

public:
    void insert(int val)
    {
        heap.push_back(val);
        heapifyUp(heap.size() - 1);
        cout << "Inserted " << val << " → heap: ";
        display();
    }

    int extractMax()
    {
        if (heap.empty())
            throw runtime_error("Heap empty");
        int maxVal = heap[0];
        heap[0] = heap.back();
        heap.pop_back();
        if (!heap.empty())
            heapifyDown(0);
        return maxVal;
    }

    int getMax()
    {
        if (heap.empty())
            throw runtime_error("Heap empty");
        return heap[0];
    }

    bool isEmpty() { return heap.empty(); }
    int size() { return heap.size(); }

    void display()
    {
        for (int x : heap)
            cout << x << " ";
        cout << "\n";
    }
};

// ── Heap Sort ─────────────────────────────────
void siftDown(vector<int> &arr, int n, int i)
{
    int largest = i;
    int l = 2 * i + 1;
    int r = 2 * i + 2;
    if (l < n && arr[l] > arr[largest])
        largest = l;
    if (r < n && arr[r] > arr[largest])
        largest = r;
    if (largest != i)
    {
        swap(arr[i], arr[largest]);
        siftDown(arr, n, largest);
    }
}

void heapSort(vector<int> &arr)
{
    int n = arr.size();
    // Build max heap
    for (int i = n / 2 - 1; i >= 0; i--)
        siftDown(arr, n, i);
    // Extract elements
    for (int i = n - 1; i > 0; i--)
    {
        swap(arr[0], arr[i]);
        siftDown(arr, i, 0);
    }
}

int main()
{
    // ── Max Heap ──────────────────────────────
    cout << "=== Max Heap Operations ===\n";
    MaxHeap mh;
    for (int v : {10, 20, 5, 30, 15, 25, 1})
        mh.insert(v);

    cout << "\nFinal heap : ";
    mh.display();
    cout << "Max        : " << mh.getMax() << "\n";
    cout << "ExtractMax : " << mh.extractMax() << "\n";
    cout << "Heap after : ";
    mh.display();
    cout << "Size       : " << mh.size() << "\n";

    // ── Heap Sort ─────────────────────────────
    cout << "\n=== Heap Sort ===\n";
    vector<int> arr = {4, 10, 3, 5, 1, 8, 2};
    cout << "Before: ";
    for (int x : arr)
        cout << x << " ";
    cout << "\n";

    heapSort(arr);

    cout << "After : ";
    for (int x : arr)
        cout << x << " ";
    cout << "\n";

    return 0;
}