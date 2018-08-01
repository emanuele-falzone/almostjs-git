# almostjs-git

__ALMOsT__ is an **A**gi**L**e **MO**del **T**ransformation framework for JavaScript

[![NPM Version](https://img.shields.io/npm/v/almost-git.svg)](https://img.shields.io/npm/v/almost-git.svg)
[![Build Status](https://travis-ci.org/emanuele-falzone/almostjs-git.svg?branch=master)](https://travis-ci.org/emanuele-falzone/almostjs-git)
[![Build status](https://ci.appveyor.com/api/projects/status/0q78i1q1d333w70p/branch/master?svg=true)](https://ci.appveyor.com/project/emanuele-falzone/almostjs-git/branch/master)
[![Coverage Status](https://coveralls.io/repos/github/emanuele-falzone/almostjs-git/badge.svg?branch=master)](https://coveralls.io/github/emanuele-falzone/almostjs-git?branch=master)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This repository contains a __model and text co-evolution tool__. 

We take as a reference scenario a development team that uses __Model Driven Development__ and in particular __Model to Text transofrmation__ to speed up app development.
The tool allow the developer to preserve the parts of the code that are defined outside the model-and-generate cycle, such as the code defining the look and feel of the graphical user interface and the connection between the client side and the back-end service endpoints.

## Installation

```bash
$ npm install -g almost-git
```

## Usage

Initialize the repository.
This step is very important, you will not be able to use the *evolve* feature without this step.
```bash
$ almost-git init
```

Start the evolution process passing as parameter the folder containing the new generated code.
```bash
$ almost-git evolve ~/new-generated-code
```

During evolution process conflicts may arise. 
The tool try to solve them automatically using git, leaving manual intervention as fallback. 
Finalize the evolution after manual conflict resolution.
```bash
$ almost-git evolve --continue
```

If you change your mind and you do not want to solve conflict you can abort the evolution process.
```bash
$ almost-git evolve --abort
```

## Example

Let's imagine Topolino is a software developer that use a Model Driven Development tool that generates code starting from a UML model.
Topolino builds the first version of the model and run the code generator. 
The generated code is stored into *model-0-generated-code folder*. 
Topolino also creates an empty folder called *repository*.

```bash
$ ls ~
repository      model-0-generated-code
```

```
model-0-generated-code
│   one.js
│   two.js
```

Topolino copies the generated code into the empty folder that will be out *git* repository.

```bash
$ cp -R ~/model-0-generated-code/. ~/repository/
```

The generated code is composed of two files.

```
repository
│   one.js
│   two.js
```

The content of each file is shown below.

```bash
$ cat ~/repo/one.js
====
value: 1
====
$ cat ~/repo/two.js
====
value: 2
====
```

Topolino is now ready to initialize the *git* repository and to commit the first version of his awesome application.

```bash
$ cd ~/repository
$ almost-git init
Repository correclty initialized!
```

Now you can use almost-git to evolve your code.
As we can see from the log the tool has commited the first generated code.
```
$ git log
1234567 first version of the generated code
```

Topolino now needs to change the content of the file *one.js* in order to improve his application.
```
$ nano ~/repo/one.js
$ cat ~/repo/one.js
====
value: one
====
```

After such effort Topolino commits the changes.
```
$ git commit -a -m "Change value in one.js"
```

```
$ git log
1234567 first version of the generated code
2345778 Change value in one.js
```

Then Topolino realized that a change in the model is required. He modify the model and run the code generator, saving the new generated code into *model-1-generated-code* folder.

```bash
$ ls ~
repository      model-0-generated-code      model-1-generated-code
```

The new generated code is composed of two files. 
The file *one.js* is still there and its content is not changed from the previoulsy generated code. 
The file *two.js* disappeared. 
A new file *three.js* is generated.

```
model-1-generated-code
│   one.js
│   three.js
```

The content of each file is shown below
```bash
$ cat ~/model-1-generated-code/one.js
====
value: 1
====
$ cat ~/model-1-generated-code/three.js
====
value: 3
====
```

Topolino needs to use the new generated code while preserving the changes he made on the previous version of the generated code. 
But Topolino is happy, because he is using __almost-git__. 
Topolino starts the code evolution using the tool. 
The folder storing the new generated code has to be passed as parameter.

```
$ cd ~/repository
$ almost-git evolve ~/model-1-generated-code
```

The tool build new version of the code based on the *model-1-generated-code* while preserving the changes the developer made to *one.js*

```
repository
│   one.js
│   three.js
```

The content of the files of the final version is shown below.

```bash
$ cat ~/repo/one.js
====
value: one
====
$ cat ~/repo/three.js
====
value: 3
====
```

The tool add two commits:
- a snapshot of the new generated code
- the new version of the code obtained reappling the manual changes to the new generated code

```
$ git log
1234567 first version of the generated code
2345778 Change value in one.js
3456789 second version of the generated code
4567890 merged model
```