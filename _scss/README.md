This directory contains `.scss` files specific to the project.

For the Materialize source code, go to `../lib/materialize-src/`.

The theme files (e.g., `themes/dark-theme.scss`) are the ones that are actually used by the program (the specific one to be used is defined in the user's
preferences). For more granularity, one could theoretically add subdirectories to `themes/` for individual themes (or sets of themes, whatever seems most appropriate).

To compile, run:

```sh
sass --watch _scss:css
```
