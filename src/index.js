const core = require('@actions/core')
const exec = require('@actions/exec')
const glob = require('glob')
const fs = require('fs')
const loadJsonFile = require('load-json-file')

// TODO: for the moment it just reads one (config file's json is an array)
async function getSettings(configFilePath) {
  try {
    const [configFile] = await loadJsonFile(configFilePath)
    return configFile
  } catch (error) {
    core.setFailed(error.message)
    throw Error('Config file not found')
  }
}

// Read files in the format "./build/static/js/main.*.chunk.js"
// TODO: for the moment it just reads one
async function getFilesFromWildCard(wildCardFile) {
  try {
    const [mainFile] = await new Promise(resolve => {
      glob(wildCardFile, null, (err, files) => {
        resolve(files)
      })
    })
    return mainFile
  } catch (error) {
    core.setFailed(`"${wildCardFile}" not found`)
  }
}

async function run() {
  // Build branch
  await exec.exec('yarn build')

  // We can also get GITHUB_SHA and GITHUB_EVENT_NAME
  const { GITHUB_REF } = process.env
  const configFilePath = core.getInput('configFilePath') || './bundlewatcher.json'

  // Get file wildcards from settings
  const { file: inputFileSetting, maxSize: inputMaxSizeSetting } = await getSettings(configFilePath)

  // Get actual files
  const mainFile = await getFilesFromWildCard(inputFileSetting)

  // Get file sizes
  const { size: sizeInBytes } = fs.statSync(mainFile)

  console.log(`Main file size in branch ${GITHUB_REF}: ${sizeInBytes} B`)

  // Compare with master
  await exec.exec('git checkout master')

  // Reinstall dependencies
  await exec.exec('yarn')

  // Rebuild
  await exec.exec('yarn build')

  // Get actual files
  const mainFileMaster = await getFilesFromWildCard(inputFileSetting)

  // Get file sizes
  const { size: sizeInBytesMaster } = fs.statSync(mainFileMaster)

  console.log(`Main file size in branch master: ${sizeInBytesMaster} B`)

  console.log(`Difference from ${GITHUB_REF} to master: ${sizeInBytes - sizeInBytesMaster} B`)

  core.setFailed('error to allow rerun')
}

run()
