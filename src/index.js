const core = require('@actions/core')
const exec = require('@actions/exec')
const path = require('path')
const glob = require('glob')
const fs = require('fs')
const loadJsonFile = require('load-json-file')

async function run() {
  await exec.exec('yarn build', null, {
    ignoreReturnCode: true,
  })
  const { GITHUB_SHA, GITHUB_REF, GITHUB_EVENT_NAME, HOME, HOMEPATH, USERPROFILE } = process.env
  const configFile = core.getInput('configFile') || 'bundlewatcher.json'

  console.log('home', HOME)
  console.log('homePATH', HOMEPATH)
  console.log('USERPROFILE', USERPROFILE)
  let file, maxSize
  try {
    const [readConfigFile] = await loadJsonFile(`${process.cwd()}/${configFile}`)
    file = readConfigFile.file
    maxSize = readConfigFile.maxSize
  } catch (error) {
    core.setFailed(error.message)
    throw Error('Config file not found')
    try {
      const [readConfigFile2] = await loadJsonFile(`./${configFile}`)
      file = readConfigFile2.file
      maxSize = readConfigFile2.maxSize
    } catch (error) {
      core.setFailed(error.message)
      throw Error('Config file not found')
    }
  }

  console.log('file', file)
  console.log('maxSize', maxSize)

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
    console.log(`Main bundle size: ${sizeInKiloBytes}KB`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
