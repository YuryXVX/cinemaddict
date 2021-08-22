import { FILMS_COUNT_PER_STEP, ModeView } from '../const';
import { render, RenderPosition, removeElement } from '../utils/render';
import { getFilmPresenters } from './film';
import { RootPresenter } from './root-presenter';

// views
import Container from '../views/container';
import NoFilmsMessage from '../views/no-films-message';
import Sort from '../views/sort';
import ShowMoreButton from '../views/show-more-button';

// presenter
import FilmDetailsPresenter from './film-details';

export default class FilmListPresenter extends RootPresenter {
  constructor(store, handleRaitingChange, handleFiltersCountChange) {
    super(store);

    this._container = null;

    this._containerComponent = new Container({classList: ['films']});
    this._filmListComponent = new Container({ title: 'All movies. Upcoming', classList: ['films-list'] });
    this._filmListContainerComponent = new Container({ tag: 'div', classList: ['films-list__container'] });
    this._sortComponent = null;
    this._noFilmsMessageComponent = null;


    this._filmsPresenters = [];
    this._filmDetailsPresenter = null;
    this._filmDetailsPresenters = new Set();

    this._handleDataChange = this._handleDataChange.bind(this);
    this._handleRenderFilmDetailsPopup = this._renderFilmDetailsPopup.bind(this);
    this._handleChangeSortData = this._handleChangeSortData.bind(this);

    this._handleRatingChange = handleRaitingChange;
    this._handleFiltersCountChange = handleFiltersCountChange;

    this._showFilmsCount = FILMS_COUNT_PER_STEP;
  }

  _rerender({ films }) {
    if(films.length) {
      removeElement(this._noFilmsMessageComponent);
    }

    this._updateFilms(FILMS_COUNT_PER_STEP);
  }

  render(container) {
    this._container = container;

    this._renderSortComponent(this._model.activeSortButton);
    this._renderAllFilms();
    this._renderLoadMoreButton();
  }

  _handleChangeSortData(activeSort) {
    if(activeSort === this._model.activeSortButton) {
      return;
    }

    this._model.activeSortButton = activeSort;
    this._sortComponent.activeButton = this._model.activeSortButton;
  }

  _renderSortComponent() {
    this._sortComponent = new Sort();
    this._sortComponent.handleChangeSort = this._handleChangeSortData;

    render(this._container, this._sortComponent.getElement(), RenderPosition.BEFOREEND);
  }

  _renderAllFilms() {
    render(this._container, this._containerComponent.getElement(), RenderPosition.BEFOREEND);
    render(this._containerComponent.getElement(), this._filmListComponent.getElement(), RenderPosition.BEFOREEND);
    render(this._filmListComponent.getElement(), this._filmListContainerComponent.getElement(), RenderPosition.BEFOREEND);

    this._renderFilms(this._model.films.slice(0, this._showFilmsCount));
  }

  _removeFilms() {
    this._filmsPresenters.forEach((filmPresenter) => filmPresenter.destroy());
    this._filmsPresenters = [];
  }

  _updateFilms(filmsCount) {
    this._removeFilms();
    this._renderFilms(this._model.films.slice(0, filmsCount));
    this._renderLoadMoreButton();
  }

  _renderFilms(films) {
    if(!films.length) {
      this._renderNoFilmsMessage();
      removeElement(this._sortComponent);
    }

    const container = this._filmListContainerComponent.getElement();

    const filmsPresenters = getFilmPresenters(container, films, this._handleDataChange, this._handleRenderFilmDetailsPopup);

    this._filmsPresenters = this._filmsPresenters.concat(filmsPresenters);
    this._showFilmsCount = this._filmsPresenters.length;
  }

  _handleDataChange(controller, oldData, newData, mode) {
    this._model.updateFilm(oldData, newData);

    if(mode === ModeView.MODAL) {
      controller.setData(newData);
    } else {
      controller.render(newData);
    }

    this._updateFilms(this._showFilmsCount);
    this._handleRatingChange(this._model.films);
    this._handleFiltersCountChange(this._model.films);
  }

  _renderNoFilmsMessage() {
    const container = this._filmListComponent.getElement();

    this._noFilmsMessageComponent = new NoFilmsMessage();
    render(container, this._noFilmsMessageComponent.getElement(), RenderPosition.AFTERBEGIN);
  }

  _renderLoadMoreButton() {
    if(this._showMoreButton) {
      removeElement(this._showMoreButton);
    }

    if (this._showFilmsCount >= this._model.films.length) {
      return;
    }

    this._showMoreButton = new ShowMoreButton();

    render(this._filmListComponent.getElement(), this._showMoreButton.getElement(), RenderPosition.BEFOREEND);

    this._showMoreButton.setShowMoreButtonClickHandler(this._onLoadMoreButtonClick.bind(this));
  }

  _onLoadMoreButtonClick() {
    const prevFilmsCount = this._showFilmsCount;
    const films = this._model.films;

    this._showFilmsCount = this._showFilmsCount + FILMS_COUNT_PER_STEP;

    const chunckFilmList = films.slice(prevFilmsCount, this._showFilmsCount);

    this._renderFilms(chunckFilmList);

    if (this._showFilmsCount >= films.length) {
      removeElement(this._showMoreButton);
    }
  }

  _destroyOpenPopupDetails() {
    if(this._filmDetailsPresenters.has(this._filmDetailsPresenter)) {
      this._filmDetailsPresenters.forEach((it) => it.destroy());

      this._filmDetailsPresenters.delete(this._filmDetailsPresenter);
      this._filmDetailsPresenter = null;
    }
  }

  _renderFilmDetailsPopup(film) {
    this._destroyOpenPopupDetails();

    this._filmDetailsPresenter = new FilmDetailsPresenter(this._model, this._handleDataChange);
    this._filmDetailsPresenters.add(this._filmDetailsPresenter);
    this._filmDetailsPresenter.render(film);
  }

  destroy() {
    removeElement(this._containerComponent);
    removeElement(this._sortComponent);
  }
}
