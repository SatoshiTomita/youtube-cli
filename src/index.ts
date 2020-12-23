import chalk = require('chalk');
import prompts = require('prompts');
import {api} from './api';
import Configstore = require('configstore');

const appName = 'youtube-cli';

export const main = (async () => {
  console.log(chalk.blue('Welcome to YouTube CLI\n'));
  const configStore = new Configstore(appName);
  if (configStore.get('apiKey') === undefined) {
    const userInput = await prompts({
      name: 'apiKey',
      type: 'text',
      message: 'API Key',
    });
    configStore.set('apiKey', userInput.apiKey);
  }
  const apiKey = configStore.get('apiKey');

  const userInput = await prompts({
    name: 'query',
    type: 'text',
    message: 'Search',
  });
  console.log(`Searching for ${userInput.query}...\n`);
  const result = await api.search.byQuery({
    apiKey: apiKey.apiKey,
    query: userInput.query,
  });
  console.log('result: ', result);
})();
