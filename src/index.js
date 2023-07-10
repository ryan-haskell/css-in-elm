#!/usr/bin/env node

const { parse } = require('css-tree')
const chokidar = require('chokidar')
const path = require('path')
const fs = require('fs')


let [command, inputFilepath, outputFilepath] = process.argv.slice(2)

const build = () => {
  const start = Date.now()
  
  const contents = fs.readFileSync(
    path.join(process.cwd(), ...inputFilepath.split('/')), 
    { encoding: 'utf8' }
  )
  const ast = parse(contents)

  const listOfAllClassNames =
    ([...ast.children])
      .flatMap(x => {
        try {
          return [...x.prelude.children.head.data.children]
        } catch (_) {
          return []
        }
      })
      .filter(x => x.type === "ClassSelector")
      .map(x => x.name)

  let dedupe = (list) => [...new Set(list)]
  let camel = varName => lowercase(varName).split('-').join('_')
  let lowercase = varName => varName.charAt(0).toLowerCase() + varName.slice(1)

  const classNames = dedupe(listOfAllClassNames)

  const template = `
module Css exposing (${classNames.map(camel).join(', ')})

import Html
import Html.Attributes


${classNames.map(name => `
${camel(name)} : Html.Attribute msg
${camel(name)} =
    Html.Attributes.class "${name}"
`.trim()).join('\n\n\n')}
  
  `.trim() + '\n'


  // Make output folder if it doesn't exist
  fs.mkdirSync(path.join(process.cwd(), ...outputFilepath.split('/').slice(0, -1)), { recursive: true })
  fs.writeFileSync(
    path.join(process.cwd(), ...outputFilepath.split('/')),
    template,
    { encoding: 'utf8' }
  )

  console.log(`✅ Generated ${outputFilepath.split('/').slice(-1)[0]} in ${Date.now() - start}ms`)
}

if (command === 'build') {
  build()
} else if (command === 'watch') {
  chokidar
    .watch(path.join(process.cwd(), ...inputFilepath.split('/')))
    .on('all', build)
} else {
  console.error(`Unknown command: ${command}`)
  process.exit(1)
}