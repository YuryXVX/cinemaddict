import { TimePeriod, ProfileRaiting, SortType, FilterType } from '../const';

const RatingCount = {
  novice: (filmsCount) => filmsCount >= 1 && filmsCount <= 10,
  fan: (filmsCount) => filmsCount >= 11 && filmsCount <= 20,
  modeBuff: (filmsCount) => filmsCount >= 21,
};

const arrayToMapGenre = (target) => target.reduce((genreMap, [ganreName, ganreValue]) => ({ ...genreMap, [ganreName]: ganreValue }), {});
const sortedMapByMaxCount = (target) => (Object.entries(target).sort(([, valueA], [, valueB]) => valueB - valueA));

export const getFilmsCountByGenre = (films) => {
  const currentGenreMap = films.reduce((genreMap, film) => {
    const current = film.info.genre;

    current.forEach((ganre) => {
      genreMap[ganre] = 0;
    });

    return genreMap;
  }, {});

  films.forEach((film) => {
    const { info: { genre } } = film;

    genre.forEach((it) => {
      if(currentGenreMap[it]) {
        currentGenreMap[it]++;
      } else {
        currentGenreMap[it] = 1;
      }
    });
  });

  return arrayToMapGenre(sortedMapByMaxCount(currentGenreMap));
};

const getTopGenre = (films) => {
  if(!films.length) {
    return;
  }
  const genreMap = getFilmsCountByGenre(films);

  const [topGanre] = Object.keys(genreMap);

  return topGanre;
};

const getAllFilmsDuration = (films) => films.length ? films.reduce((total, film) => total + film.info.runtime, 0) : 0;

export const getFilmInfoForStatisticsView = (films) => ({
  totalDuration: getAllFilmsDuration(films),
  watchedFilmsCount: films.length ? films.length : 0,
  getTopGenre: getTopGenre(films),
});

export const filterFilmsByWatchingDate = (films, timePeriod) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentMonthDay = currentDate.getDate();
  const currentHours = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();
  const currentSeconds = currentDate.getSeconds();
  const currentMilliseconds = currentDate.getMilliseconds();
  let dateToCompare;

  switch (timePeriod) {
    case TimePeriod.TODAY: {
      dateToCompare = new Date(currentYear, currentMonth, currentMonthDay);
      break;
    }

    case TimePeriod.WEEK: {
      dateToCompare = new Date(currentYear, currentMonth, currentMonthDay - 7, currentHours, currentMinutes, currentSeconds, currentMilliseconds);
      break;
    }

    case TimePeriod.MONTH: {
      dateToCompare = new Date(currentYear, currentMonth - 1, currentMonthDay, currentHours, currentMinutes, currentSeconds, currentMilliseconds);
      break;
    }

    case TimePeriod.YEAR: {
      dateToCompare = new Date(currentYear - 1, currentMonth, currentMonthDay, currentHours, currentMinutes, currentSeconds, currentMilliseconds);
      break;
    }

    default: {
      dateToCompare = null;
    }
  }

  if (!dateToCompare) {
    return films;
  }

  return films.filter((film) => {
    const watchingDate = film.filmDetails.watchingDate ? new Date(film.filmDetails.watchingDate) : null;

    if (!watchingDate) {
      return null;
    }

    return watchingDate >= dateToCompare;
  });
};

export const getFilmsByFilter = (films, filter) => {
  if(filter === 'ALL') {
    return films;
  }

  return films.slice().filter(({ filmDetails }) => filmDetails[filter.toLowerCase()]);
};

export const getUserRating = (filmsCount) => {
  if(RatingCount.novice(filmsCount)) {
    return ProfileRaiting.NOVICE;
  }

  if(RatingCount.fan(filmsCount)) {
    return ProfileRaiting.FAN;
  }

  if(RatingCount.modeBuff(filmsCount)) {
    return ProfileRaiting.MORE_BUFF;
  }

  return ProfileRaiting.NOTHING;
};

export const getSortFilms = (films ,sortType = SortType.DEFAULT) => {
  switch(sortType) {
    case SortType.RATING: {
      return films.slice().sort((a, b) => a.info.totalRating > b.info.totalRating ? -1 : 0);
    }

    case SortType.DATE: {
      return films.slice().sort((a, b) => new Date(a.filmDetails.watchingDate) - new Date(b.filmDetails.watchingDate));
    }

    default: {
      return films.slice();
    }
  }
};

export const updateFilters = (films, activeFilter) => Object.keys(FilterType)
  .map((filter) => ({
    name: FilterType[filter],
    count: filter === activeFilter
      ? getFilmsByFilter(films, activeFilter).length
      : getFilmsByFilter(films, filter).length,
  }));


export const getTopRatedFilms = (films) => films.slice().sort((a, b) => a.info.totalRating < b.info.totalRating ? 0 : -1);

export const getMostCommentedFilms = (films) => films.slice().sort((a, b) => a.comments.length < b.comments.length ? 0 : -1).filter((it) => it.comments.length);

export const convertArrayToMap = (array) => (array.reduce((map, film) => {
  const { id } = film;

  if (!id) {
    return map;
  }

  map[film.id] = film;

  return map;
}, {}));
