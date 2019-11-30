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

  let file, maxSize
  try {
    const [configFile] = await loadJsonFile(`${process.cwd()}/${configFile}`)
    file = configFile.file
    maxSize = configFile.maxSize
  } catch (error) {
    throw Error('Config file not found')
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
