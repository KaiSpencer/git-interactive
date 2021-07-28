import { Toolbox } from '../types'

module.exports = (toolbox: Toolbox) => {
  const GIT = 'git -c color.ui=always'
  toolbox.chooseGitCommand = async () => {
    const { prompt } = require('enquirer')
    const choices = [
      `c  <- commit -m`,
      'C  <- checkout',
      `p  <- pull`,
      's  <- status',
      'A  <- add -A',
      'b  <- branch -a',
      'q  <<< exit'
    ]

    const { confirm } = await prompt([
      {
        type: `confirm`,
        name: `confirm`,
        message: `Which git command`,
        default: `\n\n${choices.join('\n')}`,
        isTrue(input) {
          return /^[ty1]/i.test(input)
            ? true
            : choices.find(ele => ele[0] === input)
            ? input
            : ''
        }
      }
    ])

    switch (confirm) {
      case `c`: {
        console.clear()
        const { commitMessage } = await toolbox.prompt.ask([
          {
            type: 'input',
            name: 'commitMessage',
            message: ' Enter commit message'
          }
        ])
        console.log(commitMessage)

        toolbox.print.info(
          await toolbox.system.run(`git commit -m "${commitMessage}"`)
        )
        break
      }
      case `C`: {
        console.clear()
        const inquirer = require('inquirer')

        // Register plugin
        inquirer.registerPrompt('search-list', require('inquirer-search-list'))

        inquirer
          .prompt([
            {
              type: 'search-list',
              message: 'Select branch',
              name: 'branch',
              choices: await gitBranches(toolbox),
              validate: function(answer) {
                if (answer[0] == '*') {
                  return `${answer} is already checked out!`
                }
                return true
              }
            }
          ])
          .then(async function(answer: { branch: string }) {
            const { branch } = answer
            console.clear()
            toolbox.print.info(
              await toolbox.system.run(`${GIT} checkout ${branch}`)
            )
            toolbox.chooseGitCommand()
          })
          .catch(e => console.log(e))
        break
      }
      case `p`: {
        console.clear()
        toolbox.print.info(await toolbox.system.run(`${GIT} pull`))
        toolbox.chooseGitCommand()
        break
      }
      case `s`: {
        console.clear()
        toolbox.print.newline
        toolbox.print.info(await toolbox.system.run(`${GIT} status`))
        toolbox.chooseGitCommand()
        break
      }
      case 'b': {
        console.clear()
        toolbox.print.info(await toolbox.system.run(`git branch`))
        toolbox.chooseGitCommand()
        break
      }
      case `A`: {
        console.clear()
        toolbox.system.run(`${GIT} add -A`)
        toolbox.print.info(await toolbox.system.run(`${GIT} status`))
        toolbox.chooseGitCommand()
        break
      }
      case `q`: {
        process.exit()
      }

      default: {
        console.log('UNKNOWN')
      }
    }
  }
}

const gitBranches = async (toolbox: Toolbox): Promise<string[]> => {
  const branches = (await toolbox.system.run(`git branch`))
    .split('\n')
    .map(branch => branch.trim())

  branches.forEach((item, index) => {
    if (item === '') {
      branches.splice(index, 1)
    }
  })
  return branches
}
