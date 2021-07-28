import { Toolbox } from '../types'

module.exports = {
  name: 'git-interactive',
  description: 'Runs through a kitchen sink of Gluegun tools',
  run: async (toolbox: Toolbox) => {
    console.clear()

    await toolbox.chooseGitCommand()
  }
}
