import { Toolbox } from '../types'

module.exports = (toolbox: Toolbox) => {
  const GIT = 'git -c color.ui=always'
  toolbox.chooseGitCommand = async () => {
    const { prompt } = require('enquirer')
    const choices = [
      `c  <- commit`,
      'C  <- checkout',
      `p  <- pull`,
      's  <- status',
      'a  <- add -A',
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
        console.log('git commit')
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
              message: 'Select topping',
              name: 'topping',
              choices: [
                'Pepperoni',
                'Ham',
                'Ground Meat',
                'Bacon',
                'Mozzarella',
                'Bottle'
              ],
              validate: function(answer) {
                if (answer === 'Bottle') {
                  return `Whoops, ${answer} is not a real topping.`
                }
                return true
              }
            }
          ])
          .then(function(answers) {
            console.log(JSON.stringify(answers, null, '  '))
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
        toolbox.print.info(await toolbox.system.run(`${GIT} status`))
        toolbox.chooseGitCommand()
        break
      }
      case `a`: {
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
