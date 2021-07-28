import { Toolbox } from '../types'

const GIT = 'git -c color.ui=always'

module.exports = (toolbox: Toolbox) => {
  toolbox.chooseGitCommand = async () => {
    const { prompt } = require('enquirer')
    const choices = [
      'a  <- add',
      'A  <- add -A',
      'b  <- branch -a',
      `c  <- commit -m`,
      'C  <- checkout',
      `p  <- pull`,
      's  <- status',
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
      /**
       * Stage changes
       *
       * Prompt for pathspec
       *
       * TODO: tab completion on directories
       */
      case 'a': {
        console.clear()
        await gitCommand({
          toolbox,
          command: 'status',
          displayChooseGitCommandPostCommand: false
        })
        const { pathspec } = await toolbox.prompt.ask([
          {
            type: 'input',
            name: 'pathspec',
            message: 'Enter pathspec'
          }
        ])
        gitCommand({
          toolbox,
          command: 'add',
          extraArgs: pathspec,
          displayChooseGitCommandPostCommand: false
        })
        console.clear()
        await gitCommand({ toolbox, command: 'status' })
        toolbox.chooseGitCommand()
        break
      }
      /**
       * Commit staged changes
       * Prompt for commit message
       */
      case `c`: {
        console.clear()
        const { commitMessage } = await toolbox.prompt.ask([
          {
            type: 'input',
            name: 'commitMessage',
            message: 'Enter commit message'
          }
        ])
        gitCommand({
          toolbox,
          command: 'commit',
          extraArgs: `-m "${commitMessage}"`
        })
        break
      }
      /**
       * List local branches
       * Search list prompt to select branch to checkout
       *
       * Error if branch already checked out
       */
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
            await gitCommand({ toolbox, command: 'status', extraArgs: branch })
          })
          .catch(e => console.log(e))
        break
      }
      /**
       * `git pull`
       */
      case `p`: {
        console.clear()
        await gitCommand({ toolbox, command: 'pull' })
        break
      }
      /**
       * Print `git status`
       */
      case `s`: {
        console.clear()
        await gitCommand({ toolbox, command: 'status' })
        break
      }
      /**
       * List local branches
       */
      case 'b': {
        console.clear()
        await gitCommand({ toolbox, command: 'branch' })
        break
      }
      /**
       * Add all changes
       * Print `git status`
       */
      case `A`: {
        console.clear()
        await gitCommand({
          toolbox,
          command: 'add',
          extraArgs: '-A',
          displayChooseGitCommandPostCommand: false
        })
        await gitCommand({ toolbox, command: 'status' })
        break
      }
      /**
       * Exit program
       */
      case `q`: {
        process.exit()
      }

      default: {
        console.log('UNKNOWN')
      }
    }
  }
}

type GitCommand = 'add' | 'checkout' | 'pull' | 'branch' | 'status' | 'commit'
interface GitCommandParam {
  toolbox: Toolbox
  command: GitCommand
  extraArgs?: string
  displayChooseGitCommandPostCommand?: boolean
}
const gitCommand = async ({
  toolbox,
  command,
  extraArgs = '',
  displayChooseGitCommandPostCommand = true
}: GitCommandParam) => {
  toolbox.print.info(await toolbox.system.run(`${GIT} ${command} ${extraArgs}`))
  if (displayChooseGitCommandPostCommand) {
    toolbox.chooseGitCommand()
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
