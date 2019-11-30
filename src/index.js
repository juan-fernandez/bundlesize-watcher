const core = require('@actions/core')
const exec = require('@actions/exec')
const path = require('path')
const glob = require('glob')
const fs = require('fs')
const loadJsonFile = require('load-json-file')
const firebase = require('firebase')
require('firebase/firestore')

function initializeFirebase() {
  const firebaseApiKey = core.getInput('firebase_apikey')
  const firebaseConfig = {
    apiKey: firebaseApiKey,
    authDomain: 'bundlewatcher-github.firebaseapp.com',
    databaseURL: 'https://bundlewatcher-github.firebaseio.com',
    projectId: 'bundlewatcher-github',
    storageBucket: 'bundlewatcher-github.appspot.com',
    messagingSenderId: '78156893526',
    appId: '1:78156893526:web:d487cfe28faffa311e5af7',
    measurementId: 'G-LTBCB0ZSPB',
  }
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig)
  firebase.analytics()
  return firebase.database()
}

async function run() {
  const firebaseDatabase = initializeFirebase()
  await exec.exec('yarn build', null, {
    ignoreReturnCode: true,
  })
  const { GITHUB_SHA, GITHUB_REF, GITHUB_EVENT_NAME } = process.env
  const configFile = core.getInput('configFile') || 'bundlewatcher.json'

  let fileSetting, maxSizeSetting
  try {
    const [readConfigFile] = await loadJsonFile(`./${configFile}`)
    fileSetting = readConfigFile.file
    maxSizeSetting = readConfigFile.maxSize
  } catch (error) {
    core.setFailed(error.message)
    throw Error('Config file not found')
  }

  try {
    const [mainFile] = await new Promise(resolve => {
      glob(file, null, (err, files) => {
        resolve(files)
      })
    })
    if (!mainFile) {
      throw Error('Main file not found')
    }
    const { size: sizeInBytes } = fs.statSync(mainFile)
    const sizeInKiloBytes = sizeInBytes / 1000
    database.ref(`bundlesize/${GITHUB_SHA}`).set({
      size: sizeInBytes,
    })

    core.setFailed('error to rerun')
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
