import chalk = require('chalk');
import prompts = require('prompts');
import {api} from './api';
import Configstore = require('configstore');
import {spawn} from 'child_process';

const appName = 'youtube-cli';

const getApiKey = async () => {
  const configStore = new Configstore(appName);
  if (!configStore.has('apiKey')) {
    const userInput = await prompts({
      name: 'apiKey',
      type: 'text',
      message: 'API Key',
    });
    configStore.set('apiKey', userInput.apiKey);
  }
  return configStore.get('apiKey');
};
const searchVideos = async (apiKey: string) => {
  const userInput = await prompts({
    name: 'query',
    type: 'text',
    message: 'Search',
  });
  console.log(`Searching for ${userInput.query}...\n`);
  return api.search.byQuery({
    apiKey,
    query: userInput.query,
  });
};

const chooseVideo = (
  videos: {id?: string; title?: string; description?: string}[]
) => {
  const choices = videos.map(video => ({
    title: video.title || '',
    description: video.description,
    value: video.id,
    disabled: false,
  }));
  return prompts({
    type: 'select',
    name: 'videoId',
    message: 'Select a video',
    choices,
    initial: 1,
  });
};

const playYoutubeMusic = (url: string) => {
  spawn('mpv', ['--no-video', url], {stdio: 'inherit'});
};

export const main = (async () => {
  console.log(chalk.blue('Welcome to YouTube CLI\n'));
  const apiKey = await getApiKey();
  const videos = await searchVideos(apiKey);
  const userChoice = await chooseVideo(videos);

  // play
  const url = `https://www.youtube.com/watch?v=${userChoice.videoId}`;
  console.log('Play: ', url);
  playYoutubeMusic(url);
})();
