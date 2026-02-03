# List of things learned.

## **Binary Search.**

![binarySearch-img](https://www.notion.so/image/https%3A%2F%2Fimages.pexels.com%2Fphotos%2F762687%2Fpexels-photo-762687.jpeg%3Fcs%3Dsrgb%26dl%3Dpexels-jess-bailey-designs-762687.jpg%26fm%3Djpg?table=block&id=bc11eb13-ab8a-436e-b6ec-ff6ac31bd80b&cache=v2)

Assume you're reading a book and you want to read page 747.

How can you reach the page?

One way is to go through all the pages one by one till you reach 747.

But this will take up a lot of time.

What we generally do is, open a random page and check the page number. If the current page number is less than 747, follow the same process on the right side pages.

Similarly if the current page number is greater than 747, check the left side.

Now in our case, we can be a bit biased while selecting the page to open first during searching. Because we know the page numbers follow a particular order like 1,2,3,... and we also know the last page number.

So let's say the total number of pages is 800. So we know 747 is towards the end. So we will open up a page towards the end of the book in the first iteration.

However, in real life, we do not always have this information.

So picking a pivot is crucial for the search to be faster. It has been found that, the search is fastest in worst case when we choose the middle element as the pivot.

This leads us to the concept of binary search.

<hr />

## **What is Binary Search?**

Binary search is a searching algorithm, that works on a monotonic sequence (increasing or decreasing) and efficiently searches for an element.

![binarySearch](https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2F5hsod7t93v85b23rk671.png)

<hr />

## **Binary search in Action.**

- How does Binary search work?

    During the binary search, we always discard half of the search space. As I mentioned earlier, it works only on monotonic sequences i.e. sequences that are increasing or decreasing. Let’s take an example:

    We are given an array containing the following elements:

        int arr[] = {1, 1, 2, 3, 4, 5, 6, 7, 8};

    We need to search for the element 7 in the array.

    Here are the steps how the binary search program would execute:

    - Determine the middle element. `4` is the middle element (i.e., index 4)

    - Now we know 7 > 4. And as the array is increasing, it is definitely on the RHS. So we can just discard the left half and continue our search on the right half. So, the new search space we are considering is `[5,6,7,8]`.

    - Repeat the same process. The middle element is 6. As 7 > 6, we know it lies on the RHS. So we reject the left half. Now search space becomes `[7,8]`.

    - The middle element is 7. As it is the same as the requested element, so we return it.

<hr />

## **Complexity Analysis.**

In binary search, as discussed, half of the search space is rejected every iteration. So in the worst case, we will be continuing till we are left with at least one element.

So initially we start with `N` elements.

After the first iteration, we have `N/2` elements.

After the second iteration, `N/4` elements.

And so on.

    N -> N/2 -> N/4 -> N/8 -> N/16 -> ..... -> 1

We can also write this as,

    N -> N/2 -> N/(2^2) -> N/(2^3) -> ..... -> N/(2^k)

where `N/(2^k) = 1` and it runs for k iterations.

So `k = log2(N)`

The overall complexity of the binary search algorithm is, `log2(N)` where N is the search space.

<hr />

## **Let's solve some problems.**

- Write a C++ program to implement Binary Search on a sorted array. Such that the program should search for a given element and print its index if found.

    If the element is not present, print an appropriate message.

    [Solution](./prcatise/code1.cpp)

- Write a C++ program for a given array of N elements and also a number k.

    Find if there are 2 elements, whose sum is equal to k.

    [Solution](./prcatise/code2.cpp)

- Write a program in C++ to count pairs whose sum is less than target.

    [Solution](./prcatise/code3.cpp)

<hr />

## **Lower-bound like searches.**

Firstly, what do I mean by lower-bound. It is a function that is available with the algorithm library. It returns the first index ≥ x. In these cases, you are not just searching if an element is present or not, but rather the first index that satisfies a monotonic property.

Let’s understand with an example. In the following array, find the first index that is greater than or equal to 5.

    int arr[] = {1, 1, 2, 3, 3, 4, 5, 5, 6, 7, 8};

The answer should be 6.

In these types of questions as 0-1 questions, where you can generate a 0-1 array based on the property. The property is ≥ 5.

Now elements satisfying the property get a 1, else 0.

If you think about it, as the array is increasing, initially the elements are 0, because they are less than 5. Once it becomes 5, it will always be ≥5 as the array is increasing.

So the 0-1 equivalent array will be

    [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1]

In these arrays, we need to find the first occurrence of 1. Now traditional binary search doesn’t work here as it would return true whenever it sees a one. We specifically want the first occurrence of 1. So we will tweak our binary search implementation a bit to tackle this.

- We will not terminate when we find the desired number (1 or 5).

- lo will always point to something that is not satisfying the property

- hi will always point to something that is satisfying the property.

- Or vice versa between lo and hi
 
If we think about the statements above, where should we end the loop?

In a state like this `[0, 1]`, where lo points to the last 0 and hi points to the first 1.

- For example, **write a program in c++ to find peak element.**

    **Hint.**

    Is there a property that is getting satisfied by each array element and is monotonic?

    In the first half we have elements arr[i] > arr[i-1]
    
    In the second half, it is arr[i] < arr[i-1]
 
    If we consider this property, do we get a 0-1 array? Yes!
 
    Let’s understand with an example:
    [1, 2, 3, 4, 3, 2]
    
    Ignore index 0, as -1 is not a valid index. Let’s compute from 1
    
    index = 1: Is arr[i] < arr[i-1]? No
    
    index = 2: Is arr[i] < arr[i-1]? No
    
    index = 3: Is arr[i] < arr[i-1]? No
    
    index = 4: Is arr[i] < arr[i-1]? Yes
    
    index = 5: Is arr[i] < arr[i-1]? Yes
 
    So we get [null, 0, 0, 0, 1, 1]
 
    Now we can do binary search on this.

    [Solution](./prcatise/code4.cpp)

        ⚠️ Note / Issue

        The algorithm returns any one peak element, not necessarily the maximum element in the array.

        If multiple peaks exist, the binary search approach may return the first peak it encounters based on the search direction.

        This behavior is correct according to the problem statement, which allows returning the index of any peak element.

        Time Complexity: O(log n)
        Space Complexity: O(1)

<hr />

## **Taking it to the next level.**

We discussed earlier, that if we have some monotonic array, where each element satisfies a monotonic property, we can binary search on the monotonic property using 0-1 array.

But, this holds true even for a non-monotonic array. In general, if we have some property that is monotonic, we can binary search for it.

We saw that with the peak element example, the array was not monotonic. But we identified a property `arr[i] > arr[i-1]` that is monotonic, and based on that did a binary search. However, often the property that makes it monotonic is not so simple.

Let's understand this with an example:

[Capacity To Ship Packages Within D-Days](https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/description/)

Here the weights in not a monotonic array (i.e. neither increasing nor decreasing).

Let’s say the maximum capacity of the ship is X.

Now for X, if it takes more than D days, obviously if the capacity is < X, then also it takes more than D days. (Think like this, if the ship can carry max capacity of 10 kgs and with this it takes 5 days, then if it has max capacity of 5 kgs, obviously it will take ≥ 5 days)
 
Similarly, if the ship takes ≤D days with X capacity, it will obviously take ≤D days when its capacity is > X. (Example, if ship can carry 10kgs and it takes 5 days, obviously it will take ≤ 5 days if its capacity was 15 kgs)
 
So the property maximum capacity of the ship is itself monotonic with the number of days taken.

As max capacity increases, the days taken decrease. As capacity decreases, days taken increase.

Let’s say `G(x)` returns the number of days taken when max capacity is x.

`F(x)` is whether the ship can transport all the goods within D days if its max capacity is x.

That is, `F(x) = G(x) <= D`

If we carefully observe, F(x) is monotonic.

For lower values of x, G(x) is more and thus F(x) is false. As x increases, a point comes when G(x) ≤ D, and F(x) becomes true. And from there, it always stays true as x increases.
 
Now, what do we want. Minimum possible value of the maximum capacity. So we want the first x, where F(x) becomes true. 🙂
 
That’s it!
 
The code becomes something like this

    int lo = LOW_VAL, hi = MAX_VAL;

    while (lo < hi-1) {
        int mid = (lo + hi)/2;
    if (F(mid)) hi = mid;
    else lo = mid;
    }

    return hi;

Now what is pending to identify? LOW_VAL, HIGH_VAL and how is G(x) calculated
 
LOW_VAL = Lowest possible value of maximum capacity. That is the maximum capacity cannot be lower than this. So in the worst case, we need to carry all the packages right? And one package / day. So the ship should be at least able to carry the maximum weighted package.

    LOW_VAL = *max_element(weights.begin(), weights.end());

MAX_VAL = Maximum possible capacity that is needed for our problem. In best case, the ship transfers all the goods in one day itself. So at max, it needs a total capacity of total sum of all the weights.

    MAX_VAL = accumulate(weights.begin(), weights.end(), 0);

Finally G(x). What is it? Given max carrying capacity of the ship is x, how many days would it take. We can just run a linear search for this because it has to transfer all the weights in order.

    int G(int x, vector<int> &weights) {
    int days = 0;
    int current_weight = 0;
    for(int i=0; i<weights.size(); i++) {
        if (current_weight + weights[i] <= x) {
            // We can take this in the same day
            current_weight += weights[i];
        } else {
            // We need to take this on a new day
            days++;
            current_weight = weights[i];
        }
    }
    
    return days;
    }

    bool F(int x, int d, vector<int> &weights) {
    return G(x, weights) <= d;
    }

Now you might be wondering, wouldn’t it take a lot of time, or not meet the time constraints?

Let’s analyze the complexity. We are running a binary search. For each binary search iteration, we are calling `F(mid)` which in turn calls `G(mid)`. So each iteration takes O(N) time. But how many iterations in binary search? It’s `log2(N)`.

So overall complexity is: `O(Nlog2(N))`

<hr />

## **Some more problems to solve.**

- [Minimm time to Complete trips.](https://leetcode.com/problems/minimum-time-to-complete-trips/description/)

    [Solution](./prcatise/code5.cpp)