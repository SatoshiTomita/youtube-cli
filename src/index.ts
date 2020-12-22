import chalk = require('chalk');
import prompts = require('prompts');
import {api} from './api';

export const main = (async () => {
  console.log(chalk.blue('Welcome to YouTube CLI\n'));
  const apiKey = await prompts({
    name: 'apiKey',
    type: 'text',
    message: 'API Key',
  });
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
