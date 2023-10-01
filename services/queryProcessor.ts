import { Request } from "express";

export interface Query {
  artists: string[];
  albums: string[];
  genres: string[];
  years: number[];
}

export function getQuery(request: Request): Query {
  const { artists, albums, genres, years } = request.query;

  const processedQuery: Query = {
    artists:
      (artists &&
        (<string>artists).split(",").map((artist) => artist.trim())) ||
      [],
    albums:
      (albums && (<string>albums).split(",").map((album) => album.trim())) ||
      [],
    genres:
      (genres && (<string>genres).split(",").map((genre) => genre.trim())) ||
      [],
    years: (years && (<string>years).split(",").map(Number)) || [],
  };

  return processedQuery;
}
