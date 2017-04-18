# LifeTracker

> Keep track of events and trends in your life.

[![NPM](https://nodei.co/npm/lifetracker.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/lifetracker/)

This project is largely a learning experience, and so it will develop as my
skills develop, and it will not always be clean or elegant. But I've also been
excited about this project for a long time, and so I do plan to keep working on
it and see where it can go.

## What is it?

Our lives are filled with a ton of data, and it can be hard to keep it all in
mind and make sense of it.

LifeTracker is an app that lets you track all kinds of things in your life. Log
what you're doing, how well you slept last night, how you're feeling, what
you've eaten, anything you want.

Then, you can export your data and start asking questions: How well do you feel
on days when you eat breakfast compared to when you don't? At what time of day
do you work best? How much is your energy affected by X, Y, and Z?

Whether you're tracking out of simple curiosity, to increase your productivity,
to manage your health, or any other reason, my hope is that LifeTracker can
help make the patterns clearer and give you better control over your life.

## How does it work?

Here is a basic overview, but LifeTracker is designed to be flexible and
modifiable, so you can really use it in whatever way works best for you (see
the [wiki](https://github.com/cranndarach/lifetracker/wiki) for tips).

First, pick which kind of entry you want to log.

![Pick a page](screenshots/influences-page.png)

>Image of a window showing the "Infuences" page of LifeTracker. The page header
says "LifeTracker," and below it are four blue buttons: three in the first row,
and one in the second. The buttons are labeled "Log Misc. Influence," "Log
Sleep," "Log Coping Mechanism," and "Log Medicine Taken." On the left is
a naviagation bar. Its header says "Pages." Below it are links labeled "Home,"
"Main," "Influences," "Status," "Data," and "Edit preferences." The
"Influences" link is highlighted.

![Pick a form](screenshots/log-sleep-blank.png)

>Image of the "Log Sleep" form. From top to bottom, the fields are: a date-time
field labeled "Went to bed" showing the default time, a date-time field labeled
"Woke up" showing the default time, a text field labeled "Location" showing the
default hint "e.g., home, work," a slider labeled "Quality" set to zero,
a blank text area labeled "Notes," and a blank text field labeled "Tags." At the
bottom, there is a button that says "Submit."

Then, fill in whatever fields you want. You can leave anything blank if you don't
feel like answering it or don't think it would be helpful.

![Fill in the form](screenshots/log-sleep-filled.png)

>An image of the same "Log Sleep" form, only with the user's data entered. The
"Went to bed" field is set to "04/09/2017, 11:30 PM," the "Woke up" field is set
to "04/10/2017, 07:25 AM," the "Location" field is set to "home," the "Quality"
slider is set to about 85% full, and the "Notes" and "Tags" fields are blank.

You can go explore or export your data whenever you want.

![Explore or export data](screenshots/data-export.png)

>An image of the "Data" page of LifeTracker. There is a rectangular box labeled
"Filter data" containing two sets of fields. The first fieldset has
a mult-select box labeled "In which fields?" with "med-taken title" selected.
Underneath it is a text field labeled "Search for," and in the box the user has
typed "Claritin." The second fieldset has the same inputs, and the same field
selected. The "Search for" box says "Loratadine." Underneath it are two white
buttons labeled "Add row" and "Search," and one green button labeled "Export
all to CSV." Below that is a table showing the results of the search, with two
green buttons labeled "Export to CSV..." and "Export to JSON..."

## Installation

**Please note that LifeTracker is still in active development.** I want it to
be available to you, but there will definitely be some bugs, as well as some
not-yet-implemented features. Check back for updates once in a while, feel free
to submit issues with bugs or feature requests, and *please keep a backup of
your data.*

### Standalone version

Go to the [Releases](https://github.com/cranndarach/lifetracker/releases) tab and download the version for your OS. Unzip
it and run the file called `Lifetracker` or `Lifetracker.exe`.

### From npm

Requires node.js and npm.

Run:

```sh
npm install --global lifetracker
```

Then run by entering

```sh
lifetracker
```
into your terminal or command prompt.

### From source

Requires node.js and npm. Other dependencies will be installed using npm.

Download the repository from the green "Clone or Download" button, or clone via
command line:

```sh
git clone http://github.com/cranndarach/lifetracker.git
```

Extract the `.zip` or `.tar.gz` if you downloaded it via the button. If you're
un-tarring via command line, that's:

```sh
cd [directory/containing/tar]
tar -xvf lifetracker.tar.gz
```

or unzipping:

```sh
cd [directory/containing/zip]
unzip lifetracker.zip
```

Next, `cd` (change directories) into the directory containing the project, and
install via npm:

```sh
cd lifetracker
npm install
```

If you are happy to run it from the command line, then once you have
successfully run `npm install`, run:

```sh
npm start
```

to start the program!

If you'd prefer to build an executable yourself, run the following:

```sh
npm run-script build-[platform]
```

where `[platform]` is one of `win`, `mac`, or `linux`. Then you'll find the
executable in the `dist/` folder. (The executable will be called something like
`Lifetracker` or `Lifetracker.exe`.) **Note: This has only been tested for
Windows 10 and Linux Mint 18.** If it doesn't work for you, you may need to
just run it from command line (or, if you fix the script, you could submit
a pull request!).

## To-do

* More options for viewing, manipulating, and analyzing data.
  * Contributions are encouraged here. It doesn't even have to be part of the
  app itself. If you have an R script that you use to analyze your data, for
  example, please share it! Maybe we could even make an awesome-lifetracker
  repository for community-submitted data utilities.
* The UI theme is evolving bit by bit. More themes are definitely needed.
* Easier manipulation/creation of entry forms.
* A way to edit past entries in-app.
* A way to see all prevously-entered categories when writing an entry.

## Contributing

Part of what's exciting about LifeTracker is how much room there is for
customization. If you develop a feature, make tweaks to the UI or add a whole
new theme, or make any changes that you think should be part of the main
project, please submit a pull request! If you make some changes that are more
tailored to you, but that you'd like to share anyway, consider adding it to the
[Show off your style](https://github.com/cranndarach/lifetracker/wiki/Show-off-your-style) wiki page.

Beginners are definitely welcome---this project is a learning experience for
me, so it makes sense for it to also be a learning experience for anyone! If
you're looking for a place to get started, check out the ["great-for-beginners"
issues
label](https://github.com/cranndarach/lifetracker/issues?q=is%3Aissue+is%3Aopen+label%3Agreat-for-beginners)

## License info

Copyright © 2016-2017 R Steiner, licenced under the terms of the [MIT
license](https://github.com/cranndarach/lifetracker/blob/master/LICENSE).
