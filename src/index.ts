import chalk = require('chalk');
import prompts = require('prompts');
import axios from 'axios';
import {config} from './config';

export const main = (async () => {
  console.log(chalk.blue('welcome to YouTube CLI\n'));
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

  const response = await axios.get<SearchResponse>(config.api.search, {
    params: {
      part: 'snippet',
      key: apiKey,
      q: userInput.query,
    },
  });
  const data = response.data.items.map(item => ({
    id: item.id.videoId,
    title: item.snippet?.title,
    description: item.snippet?.description,
  }));
  console.log('result: ', data);
})();

type SearchResponse = {
  kind: string;
  etag: string;
  nextPageToken: string;
  regionCode: 'JP';
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: {
    kind: string;
    etag: string;
    id: {
      kind: string;
      videoId: string;
    };
    snippet?: {
      publishedAt: string;
      channelId: string;
      title: string;
      description: string;
      thumbnails: {
        default: {
          url: string;
          width: number;
          height: number;
        };
        medium: {
          url: string;
          width: number;
          height: number;
        };
        high: {
          url: string;
          width: number;
          height: number;
        };
      };
      channelTitle: string;
      liveBroadcastContent: 'live';
      publishTime: string;
    };
  }[];
};
