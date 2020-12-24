import chalk = require('chalk');
import prompts = require('prompts');
import {api} from './api';
import Configstore = require('configstore');
import {spawn} from 'child_process';
import {textSync} from 'figlet';
import Table = require('cli-table3');
import {Video} from './api/search';

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

const chooseVideo = async (videos: Video[]): Promise<string> => {
  const table = new Table({
    head: ['', 'title'],
    colWidths: [4, 76],
  });
  table.push();

  videos.forEach((video, index) => {
    table.push([index, video.title]);
  });

  console.log(table.toString());
  const userChoice = await prompts({
    type: 'number',
    name: 'videoNumber',
    message: 'Select a video number',
    min: 0,
    max: videos.length - 1,
    initial: 0,
  });
  return videos[userChoice.videoNumber].id;
};

const playYoutubeMusic = (videoId: string) => {
  if (videoId === undefined) throw new Error('undefined');
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  console.log('Play: ', url);
  spawn('mpv', ['--no-video', url], {stdio: 'inherit'});
};

export const main = (async () => {
  console.log(
    chalk.red(
      textSync('YouTube', {
        font: 'Standard',
      })
    )
  );
  const apiKey = await getApiKey();
  const videos = await searchVideos(apiKey);
  const videoId = await chooseVideo(videos);
  playYoutubeMusic(videoId);
})();
