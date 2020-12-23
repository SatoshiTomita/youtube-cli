import chalk = require('chalk');
import prompts = require('prompts');
import {api} from './api';
import Configstore = require('configstore');
const mpv = require('node-mpv');

const appName = 'youtube-cli';

export const main = (async () => {
  // title
  console.log(chalk.blue('Welcome to YouTube CLI\n'));

  // apikey
  const configStore = new Configstore(appName);
  if (!configStore.has('apiKey')) {
    const userInput = await prompts({
      name: 'apiKey',
      type: 'text',
      message: 'API Key',
    });
    configStore.set('apiKey', userInput.apiKey);
  }
  const apiKey = configStore.get('apiKey');

  // search
  const userInput = await prompts({
    name: 'query',
    type: 'text',
    message: 'Search',
  });
  console.log(`Searching for ${userInput.query}...\n`);
  const videos = await api.search.byQuery({
    apiKey,
    query: userInput.query,
  });

  // choose video
  const choices = videos.map(video => ({
    title: video.title || '',
    description: video.description,
    value: video.id,
    disabled: false,
  }));
  const userChoice = await prompts({
    type: 'select',
    name: 'videoId',
    message: 'Select a video',
    choices,
    initial: 1,
  });

  // play
  const mpvPlayer = new mpv(
    {
      // verbose: true,
      audio_only: true,
    }
    // ['--fullscreen', '--fps=60']
  );
  const url = `https://www.youtube.com/watch?v=${userChoice.videoId}`;
  mpvPlayer.load(url);
})();
