# Purpose

The purpose of this project is to easily test if a change to the appsettings response would break FE's validation.

You just create some example appsettings json-files, point this validator at them and it will say which work and which don't. To see examples, see folder `example-input`

npm run fetch actually downloads the validation files from pp-fe repo and puts them into the project

I assume you have

- Node >16
- npm
- access to github fe repo

# How to run project

First time:

```bash
  npm install
  npm run fetch
  npm start ARG
```

Not first time:

```bash
  npm run fetch
  npm start ARG
```

or

```bash
  npm run fetch-start ARG
```

If you don't need latest version of stuff, just

```bash
  npm start ARG
```

`npm start` (and `npm run fetch-start`) requires 1 argument, that argument is a file path to either

- a file, then the test is ran against that file
- a directory, then the test is ran against all json files in that directory (not recursive at the moment but easy to fix if that is desirable)

ex:

```bash
  npm start example-input
```

will run test on

- example-input/app-settings-invalid.json
- example-input/app-settings.json

```bash
  npm start example-input/app-settings.json
```

will run test on just

- example-input/app-settings.json

```bash
  npm start http://localhost:5000/configuration
```

will call that endpoint (GET) and run the test on the response
there is an example server you can start in parallell, it accepts a port but assumes 5000 if not given

```bash
  npm run mock-server PORT
  npm start http://localhost:5000/configuration
```

# One liner

This line does it all (switch out example-input to your folder)

```bash
  npm install && npm run fetch-and-start example-input
```

# Testing

Prerequisites:

```bash
  npm install
  npm run fetch
```

Then just run

```bash
  npm test
```

# Other

- Let oskar know if this might be useful
- JSON is pronounced J'son 🇫🇷
