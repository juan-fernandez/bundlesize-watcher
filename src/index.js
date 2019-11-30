const core = require('@actions/core')
const exec = require('@actions/exec')
const path = require('path')
const glob = require('glob')
const fs = require('fs')

async function run() {
  await exec.exec('yarn build', null, {
    ignoreReturnCode: true,
  })
  const event = core.getInput('event')
  const commitHash = core.getInput('sha')
  const branch = core.getInput('branch')
  const configFile = core.getInput('configFile') || 'bundlewatcher.json'

  const [{ file, maxSize }] = require(configFile)

  console.log('main file', file)
  console.log('event', event)
  console.log('commitHash', commitHash)
  console.log('branch', branch)

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
