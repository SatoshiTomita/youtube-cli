import axios from 'axios';
import {config} from '../config';

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
export const byQuery = async (props: {apiKey: string; query: string}) => {
  const response = await axios.get<SearchResponse>(config.api.search, {
    params: {
      part: 'snippet',
      key: props.apiKey,
      q: props.query,
    },
  });
  console.log(response);

  return response.data.items.map(item => ({
    id: item.id.videoId,
    title: item.snippet?.title,
    description: item.snippet?.description,
  }));
};
