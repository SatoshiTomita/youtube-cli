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
      kind: 'youtube#video' | 'youtube#playlist';
      videoId?: string;
      playlistId?: string;
    };
    snippet?: {
      publishedAt: string;
      channelId: string;
      title: string;
      description: string;
      thumbnails: {
        default: {
          url: string;
          width?: number;
          height?: number;
        };
        medium: {
          url: string;
          width?: number;
          height?: number;
        };
        high: {
          url: string;
          width?: number;
          height?: number;
        };
      };
      channelTitle: string;
      liveBroadcastContent: 'none' | 'live';
      publishTime: string;
    };
  }[];
};

export type Video = {
  id: string;
  title?: string;
  description?: string;
};

export const byQuery = async (props: {
  apiKey: string;
  query: string;
}): Promise<Video[]> => {
  if (!props.apiKey || !props.query)
    throw new Error(`Invalid argument: ${props}`);
  const response = await axios.get<SearchResponse>(config.api.search, {
    params: {
      part: 'snippet',
      key: props.apiKey,
      q: props.query,
      maxResults: 20,
      safeSearch: 'none',
      type: 'video,playlist',
    },
  });
  return response.data.items.map(item => ({
    id: item.id.videoId || item.id.playlistId || '',
    title: item.snippet?.title,
    description: item.snippet?.description,
    // tumbnail: item.snippet?.thumbnails.default.url,
  }));
};
