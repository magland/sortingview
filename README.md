# sortingview

Interactively view and share results of electrophysiological spike sorting.

**This project is at an early stage of development.**

[List of recent changes](./doc/changelog.md)

## For developers

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and is configured to be deployed on [vercel](https://vercel.com). It is a static web application with a few serverless API functions.

### Running a development instance

If you are part of our vercel development team then you can run a local development version without any configuration:

```bash
# Install the vercel CLI tool:
npm install -g vercel

# Install the dependencies
cd sortingview
yarn install

# Start the development server
vercel dev

# Point your browser to http://localhost:3000
# The local app will automatically update as you code
```

If you are not part of the team, then the easiest course is to set up your own (free) vercel account, fork this repo, and add that forked repo as a new vercel project.


### Hosting a backend server

Install the python project

```bash
pip install sortingview
```

Then the backend task service:

```bash
sortingview-run-backend --channel <name-of-kachery-channel>
```


