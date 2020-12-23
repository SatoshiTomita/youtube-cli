import chalk = require('chalk');
import prompts = require('prompts');
import {api} from './api';
import Configstore = require('configstore');
import {spawn} from 'child_process';
// import {textSync} from 'figlet';

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
    validate: text => (text.length > 0 ? true : false),
  });
  if (userInput.query === undefined) throw new Error('undefined');
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
    // description: video.description,
    value: video.id,
    disabled: false,
  }));
  return prompts({
    type: 'select',
    name: 'videoId',
    message: 'Select a video',
    choices,
    initial: 0,
  });
};

const playYoutubeMusic = (videoId: string) => {
  if (videoId === undefined) throw new Error('undefined');
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  console.log('Play: ', url);
  spawn('mpv', ['--no-video', url], {stdio: 'inherit'});
};

export const main = (async () => {
  console.log(chalk.red('Welcome to YouTube CLI\n'));
  // console.log(
  //   chalk.red(
  //     textSync('YouTube CLI', {
  //       font: 'Standard',
  //     })
  //   )
  // );
  const apiKey = await getApiKey();
  const videos = await searchVideos(apiKey);
  const userChoice = await chooseVideo(videos);
  playYoutubeMusic(userChoice.videoId);
})();
