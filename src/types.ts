import { GluegunToolbox } from 'gluegun'

export interface Toolbox extends GluegunToolbox {
  chooseGitCommand(): Promise<void>
}
