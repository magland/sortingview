# sortingview

Interactively view and share results of electrophysiolic spike sorting.

**This project is at an early stage of development.**

## Overview

The frontend (GUI) and backend (compute engine) are decoupled, allowing you to view your own data locally without uploading to our servers. You can also share those views with remote collaborators without uploading any data.

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

If you are not part of the team, then the easiest course is to set up your own (free) vercel account, fork this repo, and add that forked repo as a new vercel project. You will also need to create a (free) [ably](https://ably.com) account, get an API key will full permissions, and set the following environment variable in the vercel project settings:

```
ABLY_API_KEY=...
```

Then you should be able to run the server locally as above:

```
vercel dev
```

In the future it will also be possible to run this locally without a vercel and/or ably account.

### Deployment

Merges into the `deploy` branch will be automatically deployed to https://sortingview.vercel.app

<!-- Commits to other branches will generate [preview deployments](https://vercel.com/docs/git#preview-branches). -->


