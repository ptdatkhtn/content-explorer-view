import _ from 'lodash'
import { ALL_GROUP_VALUE } from '../config'
import { getNetworkMethods } from './network'
import { getPhenomena } from '@sangre-fp/connectors/search-api'
import statisticsApi from '@sangre-fp/connectors/statistics-api'
import { mergePhenomenaWithTags } from '@sangre-fp/connectors/phenomena-api'
import { tagPhenomenon, removeTagPhenomenon, getTagUrisByPhenomenonUuids } from '@sangre-fp/connectors/tag-service-api'
import * as actionTypes from '@sangre-fp/reducers/actionTypes'
import { requestTranslation } from '@sangre-fp/i18n'

export const clearAllErrors = () => dispatch => dispatch({ type: actionTypes.CLEAR_ALL_ERRORS })

export const changeGroup = group => dispatch => {
    dispatch({ type: actionTypes.CHANGE_GROUP, payload: group })
}
export const changeLanguage = language => dispatch =>
    dispatch({ type: actionTypes.CHANGE_LANGUAGE, payload: language })
export const changeTime = values => dispatch => dispatch({ type: actionTypes.CHANGE_TIME , payload: values })
export const changeType = type => dispatch => dispatch({ type: actionTypes.CHANGE_TYPE, payload: type })
export const changeTag = tag => dispatch => dispatch({ type: actionTypes.CHANGE_TAG, payload: tag })
export const resetFilters = () => dispatch => dispatch({ type: actionTypes.RESET_FILTERS })

export const resetTypeFilters = () => dispatch => dispatch({ type: actionTypes.RESET_TYPE_FILTERS })

export const resetTags = () => dispatch => dispatch({ type: actionTypes.RESET_TAGS })

export const setPhenomenonToTag = phenomenon => (dispatch, getState) => {
  dispatch({ type: actionTypes.SET_PHENOM_TO_TAG, payload: getState().phenomenaList.phenomenonToTag ? false : phenomenon })
}

export const handlePhenomenaTagMod = (tag, phenomena, group) => dispatch => {
    const add = !_.includes(phenomena.tags, tag.uri)

    const { loading, success, error } = add
        ? getNetworkMethods(
            actionTypes.ADD_PHENOMENA_TAG,
            actionTypes.ADD_PHENOMENA_TAG_SUCCESS,
            requestTranslation('addingPhenomenaTagError')
        ) : getNetworkMethods(
            actionTypes.REMOVE_PHENOMENA_TAG,
            actionTypes.REMOVE_PHENOMENA_TAG_SUCCESS,
            requestTranslation('removingPhenomenaTagError')
        )

    dispatch(loading())

    if (add) {
        return tagPhenomenon(group, phenomena.id, tag.uri)
            .then(data => {
                dispatch(success({ tag: tag.uri, phenomena }))
            })
            .catch(err =>
                dispatch(error(err))
            )
    }

    return removeTagPhenomenon(group, phenomena.id, tag.uri)
        .then(data => {
            dispatch(success({ tag: tag.uri, phenomena }))
        })
        .catch(err =>
            dispatch(error(err))
        )
}


const matchPhenomenaWithStatistics = (phenomena, statistics) => {
    const filteredList = _.uniqBy([...phenomena.filter(({ archived }) => !archived)], 'id')

    return _.map(filteredList, item => (
        {
            ...item,
            crowdSourcedValue: statistics[item.id] ?
                _.round(statistics[item.id].year_median, 2) : null
        }
    ))
}


export const fetchPhenomenaList = ({ page = 0, size = 10, searchableGroup, searchInput = false, languageObj = false, tags = [], types = [], time_min = null, time_max = null }) => (dispatch, getState) => {
    const groups = []
    let language = _.get(languageObj, 'value', null)
    if (language === 'all') {
        language = null
    }
    const { loading, success, error } = getNetworkMethods(
        actionTypes.FETCH_PHENOMENA,
        actionTypes.FETCH_PHENOMENA_SUCCESS,
        requestTranslation('fetchingPhenomenaError')
    )

    if (searchableGroup.value === ALL_GROUP_VALUE) {
        // eslint-disable-next-line
        getState().phenomenaList.groups.map(({ value }) => {
            if (value >= 0) {
                groups.push(value)
            }
        })
    } else {
        groups.push(searchableGroup.value)
    }

    dispatch(loading())

    return getPhenomena({
      query: searchInput,
      groups,
      page,
      size,
      language,
      tags: tags.map(({ value }) => value),
      types: types.map(({ value }) => value),
      time_min,
      time_max
    })
      .then(data => {
        const uuidList = data.result ? data.result.map(({ id }) => id) : []

        if (data.result) {
          statisticsApi.getPhenomenaStatistics(uuidList.join(','))
            .then(statisticsData => {
              if (searchableGroup.value) {
                getTagUrisByPhenomenonUuids(searchableGroup.value, uuidList)
                  .then(tagData => {
                    const phenomenaWithStatistics = matchPhenomenaWithStatistics(data.result, statisticsData.data)
                    const phenomenaWithTags = mergePhenomenaWithTags(phenomenaWithStatistics, tagData)

                    dispatch(success({
                      total: data.page.totalElements,
                      list: phenomenaWithTags
                    }))
                  })
                  .catch(err => dispatch(error(err)))
              } else {
                dispatch(success({
                  total: data.page.totalElements,
                  list: matchPhenomenaWithStatistics(data.result, statisticsData.data)
                }))
              }
            })
            .catch(err => dispatch(error(err)))
        } else {
          dispatch(success({ total: 0, list: [] }))
        }
      })
        .catch(err => dispatch(error(err)))
}
