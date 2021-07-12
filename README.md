# sortingview

Interactively view, curate, and share results of electrophysiological spike sorting.

**This project is at an early stage of development.**

[List of recent changes](./doc/changelog.txt)

### Hosting a backend server

Install the python project

```bash
pip install --upgrade sortingview
```

Then the backend task service:

```bash
sortingview-start-backend --channel <name-of-kachery-channel>
```

## Adding a new workspace

Open the web app, select a kachery channel, then click the links to add a new workspace. This will show an example script you can run on the computer that is running the task backend.

## Adding a new recording/sorting to a workspace

Open the web app, select a kachery channel and a workspace, and click the "Import Recordings" link. This will show an example script you can run on the computer that is running the task backend.

## Setting external unit metrics for a sorting

Open the web app, and navigate to a recording and then a sorting. In the sorting view, click on the "Metrics" in the left control bar. This will provide instructions on adding unit metrics.

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

## Authors

Jeremy Magland and Jeff Soules, Center for Computational Mathematics, Flatiron Institute

In collaboration with Kyu Hyun Lee and Loren Frank, Frank Laboratory @ UCSF
