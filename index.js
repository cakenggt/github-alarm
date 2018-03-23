#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const notifier = require('node-notifier');
const octokit = require('@octokit/rest')();

const PATH = path.join(__dirname, 'token.txt');
var last = new Date().toISOString();

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function callRequest() {
  const newLast = new Date().toISOString();
  octokit.activity.getNotifications({
    all: true,
    since: last
  })
  .then(result => {
    if (result.data && result.data.length) {
      notifier.notify({
        title: 'Github Notifier',
        message: 'New Github Notifications!',
        sound: 'Submarine',
        timeout: 60
      });
    }
    last = newLast;
    setTimeout(callRequest, 10000);
  })
  .catch(err => {
    console.log(err);
    setTimeout(callRequest, 10000);
  });
}

fs.readFile(PATH, 'utf8', function (err, data) {
  if (err) {
    // File isn't there
    rl.question('Go to https://github.com/settings/tokens and create a token with "notification" permission, and then enter it here. ', function (answer) {
      octokit.authenticate({
        type: 'token',
        token: answer
      });

      rl.close();

      fs.writeFile (PATH, answer, function(err) {
        if (err) throw err;
      });

      callRequest();
    });
  } else {
    octokit.authenticate({
      type: 'token',
      token: data
    });

    callRequest();
  }
});
