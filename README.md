# Lifetracker

> Keep track of events and trends in your life.

This is sort of the evolved form of my [LifeTracker](http://github.com/cranndarach/lifetracker) app, translated to Electron. Like the rest of LifeTracker, this is largely a learning experience, and so it will develop as my skills develop, and it will not always be clean or elegant. But at the same time, I've been excited about this project for a long time, and so I do plan to keep working on it and see where it can go.

## Installation

Binaries are coming soon! In the meantime, it will need to be built from source. Requires node.js and npm.

Download the repository from the green "Clone or Download" button, or clone via command line:

```sh
git clone http://github.com/cranndarach/lifetracker-electron.git
```

Extract the `.zip` or `.tar.gz` if you downloaded it via the button. If you're un-tarring via command line, that's:

```sh
cd [directory/containing/tarball]
tar -xvf lifetracker-electron.tar.gz
```

Next, `cd` into the directory containing the project, and install via npm:

```sh
cd lifetracker-electron
npm install
```

If you are happy to run it from the command line, skip to the next section. If you want to build an executable yourself, run the following:

```sh
npm run-script build-[platform]
```

where `[platform]` is one of `win`, `mac`, or `linux`. Then you'll find the executable in the `dist/` folder. (The executable will be called something like `Lifetracker` or `Lifetracker.exe`.) **Note: This has only been tested for Windows 10 and Linux Mint 18.** If it doesn't work for you, you may need to just run it from command line (or, if you fix the script, you could submit a pull request!).

## Run the app

If you didn't build an executable, then once you have successfully run `npm install`, run:

```sh
npm start
```

to start the program!

## To-do

The main feature that is coming up is the ability to view, manipulate, and export your data. I mean very soon, because that's practically the point of this whole project.

This will be a place where I will *especially* welcome contributions.

## Contributing

Contributions are welcome, though specific information about contributing will become available as the project develops (and, since I'm new at this, I am not sure how long that will be). If you are interested in contributing in the meantime, please don't hesitate to submit an issue with any questions, or just go ahead and fork it and submit a pull request if you're feeling adventurous. Doing so will probably help me understand by doing what kinds of information I will need to facilitate further contributions.

Beginners are definitely welcome---this project is a learning experience for me, so it makes sense for it to also be a learning experience for anyone!

## License info

Copyright © 2016 R Steiner, licenced under the terms of the [MIT license](https://github.com/cranndarach/lifetracker-electron/blob/master/LICENSE).
The structure of `index.js` is adapted from [Bozon](https://github.com/railsware/bozon), © Alex Chaplinsky, MIT Licence.
