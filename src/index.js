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
  const { GITHUB_SHA, GITHUB_REF, GITHUB_EVENT_NAME } = process.env
  const configFile = core.getInput('configFile') || 'bundlewatcher.json'

  let inputFileSetting, inputMaxSizeSetting
  try {
    const [readConfigFile] = await loadJsonFile(`./${configFile}`)
    inputFileSetting = readConfigFile.file
    inputMaxSizeSetting = readConfigFile.maxSize
  } catch (error) {
    core.setFailed(error.message)
    throw Error('Config file not found')
  }

  try {
    const [mainFile] = await new Promise(resolve => {
      glob(inputFileSetting, null, (err, files) => {
        resolve(files)
      })
    })
    if (!mainFile) {
      throw Error('Main file not found')
    }
    const { size: sizeInBytes } = fs.statSync(mainFile)

    console.log('size branch', sizeInBytes)

    await exec.exec('git checkout master')

    await exec.exec('yarn build', null, {
      ignoreReturnCode: true,
    })

    const [mainFileMaster] = await new Promise(resolve => {
      glob(inputFileSetting, null, (err, files) => {
        resolve(files)
      })
    })

    const { size: sizeInBytesMaster } = fs.statSync(mainFile)

    console.log('size branch master', sizeInBytesMaster)

    console.log('difference', sizeInBytes - sizeInBytesMaster)

    core.setFailed('error to rerun')
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
