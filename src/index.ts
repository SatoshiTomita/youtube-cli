import chalk = require('chalk');
import prompts = require('prompts');
import {api} from './api';
import Configstore = require('configstore');
import {spawn} from 'child_process';
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

const selectPlayMode = async (): Promise<
  'music' | 'video' | 'download' | 'mp3download'
> => {
  const userChoice = await prompts({
    type: 'select',
    name: 'mode',
    message: 'Play Mode',
    choices: [
      {title: 'Music', description: 'Play Audio', value: 'music'},
      {title: 'Video', description: 'Play video', value: 'video'},
      {title: 'Download', description: 'Download video', value: 'download'},
      {
        title: 'Download Music',
        description: 'Download video as mp3',
        value: 'mp3download',
      },
    ],
  });
  return userChoice.mode;
};

const playYoutube = (props: {videoId: string; noVideo?: boolean}) => {
  if (props.videoId === undefined) throw new Error('undefined');
  const url = `https://www.youtube.com/watch?v=${props.videoId}`;
  console.log('Play: ', url);
  spawn('mpv', (props.noVideo ? ['--no-video'] : []).concat(url), {
    stdio: 'inherit',
  });
};

const downloadYoutube = async (props: {videoId: string; mp3?: boolean}) => {
  if (props.videoId === undefined) throw new Error('undefined');
  const defaultDirectory = props.mp3 ? '~/Music/' : '~/Movies/';
  const directory = await prompts({
    type: 'text',
    name: 'path',
    message: `Enter your download directory (default: ${defaultDirectory})`,
  });
  const folder = directory.path || defaultDirectory;
  console.log(`Downlaod to ${folder}`);
  const confirmation = await prompts({
    type: 'confirm',
    name: 'value',
    message: 'Can you confirm?',
    initial: true,
  });
  if (!confirmation.value) return;

  const url = `https://www.youtube.com/watch?v=${props.videoId}`;
  console.log(`URL: ${url}`);
  spawn(
    'youtube-dl',
    [url, '-o', `${folder}%(title)s.%(ext)s`].concat(
      props.mp3 ? ['-x', '--audio-format', 'mp3'] : []
    ),
    {
      stdio: 'inherit',
    }
  );
};

export const main = (async () => {
  console.log(
    chalk.red(
      ' __   __         _____      _\n',
      ' \\ \\ / /__  _   |_   _|   _| |__   ___\n',
      "  \\ V / _ \\| | | || || | | | '_ \\ / _ \\\n",
      '   | | (_) | |_| || || |_| | |_) |  __/\n',
      '   |_|\\___/ \\__,_||_| \\__,_|_.__/ \\___|\n'
    )
  );
  const apiKey = await getApiKey();
  const videos = await searchVideos(apiKey);
  const videoId = await chooseVideo(videos);
  const mode = await selectPlayMode();
  switch (mode) {
    case 'music': {
      playYoutube({videoId, noVideo: true});
      break;
    }
    case 'video': {
      playYoutube({videoId});
      break;
    }
    case 'download': {
      downloadYoutube({videoId});
      break;
    }
    case 'mp3download': {
      downloadYoutube({videoId, mp3: true});
      break;
    }
  }
})();
