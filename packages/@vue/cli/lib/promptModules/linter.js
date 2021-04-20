module.exports = (cli) => {
  const { chalk, hasGit, execa, error } = require('@vue/cli-shared-utils')

  cli.injectFeature({
    name: 'Linter / Formatter',
    value: 'linter',
    short: 'Linter',
    description: 'Check and enforce code quality with ESLint or Prettier',
    link:
            'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint',
    plugins: ['eslint'],
    checked: true
  })

  cli.injectPrompt({
    name: 'eslintConfig',
    when: (answers) => answers.features.includes('linter'),
    type: 'list',
    message: 'Pick a linter / formatter config:',
    description:
            'Checking code errors and enforcing an homogeoneous code style is recommended.',
    choices: (answers) => [
      {
        name: 'ESLint + CH168',
        value: 'ch168',
        short: 'CH168',
        checked: true
      },
      // {
      //   name: 'ESLint with error prevention only',
      //   value: 'base',
      //   short: 'Basic'
      // },
      // {
      //   name: 'ESLint + Airbnb config',
      //   value: 'airbnb',
      //   short: 'Airbnb'
      // },
      // {
      //   name: 'ESLint + Standard config',
      //   value: 'standard',
      //   short: 'Standard'
      // },
      // {
      //   name: 'ESLint + Prettier',
      //   value: 'prettier',
      //   short: 'Prettier'
      // },
      // ...(answers.features.includes('ts')
      //   ? [
      //     {
      //       name: `TSLint (deprecated)`,
      //       value: 'tslint',
      //       short: 'TSLint'
      //     }
      //   ]
      //   : [])
    ]
  })

  cli.injectPrompt({
    name: 'lintOn',
    message: 'Pick additional lint features:',
    when: (answers) => answers.features.includes('linter'),
    type: 'checkbox',
    choices: [
      {
        name: 'Lint on save',
        value: 'save',
        checked: true
      },
      {
        name: 'Lint and fix on commit' + (hasGit() ? '' : chalk.red(' (requires Git)')),
        value: 'commit'
      }
    ]
  })

  cli.onPromptComplete((answers, options) => {
    if (
      answers.features.includes('linter') &&
            answers.eslintConfig !== 'tslint'
    ) {
      if(answers.eslintConfig == 'ch168'){
        let version = 'latest'
        try {
          const { stdout } = execa.sync('npm', [
            'info',
            'eslint-config-168',
            'dist-tags'
          ])
          let a = eval(`() => (${stdout})`)
          version = answers.features.includes('ts') ? a()['ts'] : 'latest'
        } catch (e) {
          error(`${chalk.cyan('eslint-config-168获取版本号失败')}`)
        }
        options.plugins['eslint-config-168'] = { version }
      } else {
        options.plugins['@vue/cli-plugin-eslint'] = {
          config: answers.eslintConfig,
          lintOn: answers.lintOn
        }
      }
    }
  })
}
