Just in dev now. the interactive way is not implemented temporary. :P


# license-gen

type some command to generate a LICENSE file for your project.


# Quick Start

```sh
$ npm install -g license-gen
```

```
cd /path/to/yourproject
license-gen LICENSE_TYPE
```

# Advance

```
$ license-gen [-a YOURNAME[ -y YEAR[ -p PROJECT[ LINCESE]]]]
```

eg.

```
$ license-gen -a Luffy mit
```

```
$ license-gen -a Luffy -y 2000 mit
```

license type can insert into any where of your command:
```
$ license-gen mit -a Luffy -y 2000
```

and, if you forget to specify a license type:
```
$ license-gen -a Luffy
```
then, it will ask you to input a license type.

So, You really don't need to remember these arguments' requirements.


# Alternative

you can use the interactive way to choosing a license. just type the `license-gen` and press `Return` key.

and then, finish the questions prompted, you will get a license too.


# In the future.

* interactive dialog for choosing license type, if you don't know which one to use.
* any numbers of arguments will work, default value will come from your configs.
* append the README file, add license note to the end of the file.
* much more... I think. :P


# Info
* Inspired by https://www.npmjs.org/package/license.
* license choosing flow is from http://paulmillr.com/posts/simple-description-of-popular-software-licenses/