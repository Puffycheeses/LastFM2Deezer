import LastFM from "@toplast/lastfm";
import { IAlbum } from "@toplast/lastfm/lib/common/common.interface";
import { IUserGetTopAlbumsParams } from "@toplast/lastfm/lib/modules/user/params.interface";
import { SearchAlbumResponse } from "deezer-api-ts/dist/responses/search-album.response";
import * as deezerApi from "deezer-api-ts";
const fm = new LastFM(process.env.lastFM);

const getTopAlbumsForPeriod = async (params: IUserGetTopAlbumsParams): Promise<IAlbum[]> => {
  const albums = await fm.user.getTopAlbums(params);
  return albums.topalbums.album;
};

interface getDeezerLinkForAlbumResponse {
  searchedAlbum: IAlbum;
  foundAlbum?: SearchAlbumResponse;
  nonDeluxe?: boolean;
  fuzzy?: boolean;
}

const getDeezerLinkForAlbum = async (album: IAlbum): Promise<getDeezerLinkForAlbumResponse> => {
  const deezer = await deezerApi.searchAlbums({
    album: album.name,
    artist: album.artist?.name
  });

  if (deezer.data.length === 0) {
    if (album.name?.includes("Deluxe")) {
      const newAlbumName = album.name.replace(/(\(Deluxe.*\))$/g, "").trim();
      const nonDeluxe = await deezerApi.searchAlbums({
        album: newAlbumName,
        artist: album.artist?.name
      });

      if (nonDeluxe.data.length === 0) {
        const fuzzy = await deezerApi.searchAlbums({
          album: newAlbumName,
        });

        return {
          searchedAlbum: album,
          foundAlbum: fuzzy.data[0],
          fuzzy: true,
          nonDeluxe: true
        };
      } else {
        return {
          searchedAlbum: album,
          foundAlbum: nonDeluxe.data[0],
          nonDeluxe: true
        };
      }
    }

    const fuzzy = await deezerApi.searchAlbums({
      album: album.name,
    });

    if (fuzzy.data.length > 0) {
      return {
        searchedAlbum: album,
        foundAlbum: fuzzy.data[0],
        fuzzy: true,
        nonDeluxe: false
      };
    } else {
      return {
        searchedAlbum: album
      };
    }
  }

  return {
    searchedAlbum: album,
    foundAlbum: deezer.data[0],
  };
};

const getAlbums = async () => {
  const topAlbums = await getTopAlbumsForPeriod({user: process.env.username});
  const responses: getDeezerLinkForAlbumResponse[] = [];
  for (const album of topAlbums) {
    const link = await getDeezerLinkForAlbum(album);
    responses.push(link);
  }

  console.log("\nMatches:");
  responses.filter(response => !response.fuzzy && !response.nonDeluxe && response.foundAlbum).forEach(response => console.log(response.foundAlbum.link));
  console.log("\nNon Deluxe Matches:");
  responses.filter(response => response.nonDeluxe && !response.fuzzy).forEach(response => console.log(response.foundAlbum.link));
  console.log("\nFuzzy Matches:");
  responses.filter(response => response.fuzzy).forEach(response => console.log(`${response.searchedAlbum.name} by ${response.searchedAlbum.artist.name}:\n${response.foundAlbum.link} (by ${response.foundAlbum.artist.name})`));
  console.log("\nNo Matches:");
  responses.filter(response => !response.foundAlbum).forEach(response => console.log(response.searchedAlbum.name));
};

getAlbums().then((): void => {
  /** @TODO: Research calling an async func without this gross hack */
  return;
});
