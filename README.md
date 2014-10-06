# license-gen

type some command to generate a LICENSE file for your project.


# Quick Start

```sh
$ npm install -g license-gen
```

```
cd /path/to/yourproject
license LICENSE_TYPE
```

# Advance

```
$ license [-a YOURNAME[ -y YEAR[ -p PROJECT[ LINCESE]]]]
```

eg.

```
$ license -a Luffy mit
```

```
$ license -a Luffy -y 2000 mit
```

license type can insert into any where of your command:
```
$ license mit -a Luffy -y 2000
```

and, if you forget to specify a license type:
```
$ license -a Luffy
```
then, it will ask you to input a license type.

So, You really don't need to remember these arguments' requirements.


# Alternative

you can use the interactive way to choosing a license. just type the `license` and press `Return` key.

and then, finish the questions prompted, you will get a license too.


# In the future.
* append the README file, add license note to the end of the file.
* much more... I think. :P


# Info
* Inspired by https://www.npmjs.org/package/license.
* license choosing flow is from http://paulmillr.com/posts/simple-description-of-popular-software-licenses/
