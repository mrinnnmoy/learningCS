# List of things learned.

## What is DSA?

- DSA stands for Data Structures and Algorithms.

- Data Structures means the way some data is stored. For example, we can store data as lists or in a stack or as a tree. All of these are examples of data structures.

- Algorithms is a set of steps you need to follow to solve some problem. Either the set of steps is known (example, sorting, DFS etc) or you derive the set of steps using first principles and logical thinking.

<hr />

## CP v/s DSA.

- CP stands for Competitive Programming. It is a sport where competitors solve DSA problems. They are either online or onsite. CodeChef, Codeforces are examples of online platforms where CP contests are organised. You can participate in these sitting from home. ICPC, IOI, CodeJam, local contests in tech fests etc are example of onsite contests.

- Technically, CP is a sport version of DSA. However, we often use “DSA” to refer to the action of people learning DSA for interview preparation or college exams whereas the term “CP” is used to refer to the action of people participating in the coding competitions / sport.

<hr />

## Choice of Language.

- All of us wants to stay in our comfort zone. But it’s very difficult to write code in every language or more than 1 language in a live class.

  ![img](https://camo.githubusercontent.com/d466e2213e4b21b0db14a3c9bf77bd9128bcfaaa7e7a50affda5803d9b1c0bf2/68747470733a2f2f656e637279707465642d74626e302e677374617469632e636f6d2f696d616765733f713d74626e3a414e64394763544e6936534e6a796d495942484442726f425f4679584f525436362d4d375468496a385f4e517864336b52772673)

- Try keeping yourself language agnostic. Though focus more on how to think about the problem and solve it than writing the code. However, in some cases we will be writing some code - we can decide on C++ / JS or do alternatively. However, you will also get the code in all other languages in the reading materials.

<hr />

## C++ Setup.

- **Installing compiler and configuring with VS Code.**
  - For compiling C++ programs to machine code (executables), you need g++ compilers. Generally with Mac and Linux, g++ comes preinstalled. Check using the command.

          g++ --version

  - For installing on Windows, you need to install mingw and then add it to PATH.

    Tutorial: [Using GCC with MinGW](https://code.visualstudio.com/docs/cpp/config-mingw#_prerequisites)

  - You can also setup a VS Code extension for features like Code Completion, Running on VS Code by clicking button etc.

    [C/C++ for Visual Studio Code](https://code.visualstudio.com/docs/languages/cpp)
    |
    [Code Runner](https://marketplace.visualstudio.com/items?itemName=formulahendry.code-runner)

- **How it all works?**
  - You write your code in a file with extension `.cpp`. For example: `main.cpp`

  - Then you convert your CPP file to a machine executable using the compiler: `g++ main.cpp`.

  - This creates an executable file which depends on the OS. For example, in Windows it creates `a.exe` whereas in UNIX systems (LINUX/Mac) it creates an `a.out`.

  - You can execute this file to run the program and get output. `./a.out`

  - If you want to change the name of the executable, you can pass the `-o` argument: `g++ main.cpp -o main.out`

- **Want to try it out yourself?**
  - Create a new file and open it in VSCode, or some text editor.

  - Paste the following code

          #include<iostream>

          using namespace std;

          int main() {
              cout<<"Hello World!"<<endl;
              return 0;
          }

  - Save the file with the name `main.cpp`.

  - Now compile the file and create an executable using the following command: `g++ main.cpp -o main.out` (Replace it with `g++ main.cpp -o main.exe` in case of Windows machine)

  - You can see a new file `main.out`(or `main.exe`) got created in the same directory (or current working directory)

  - Let’s run the program now. Run `./main.out` if you are in Unix systems (Mac / Linux) or `.\main.exe` if you are in Windows machine. You should see “Hello World!” printed on your terminal.

<hr />
