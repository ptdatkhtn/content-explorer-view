import _ from 'lodash'
import { ALL_GROUP_VALUE } from '../config'
import { getNetworkMethods } from './network'
import { getPhenomena } from '@sangre-fp/connectors/search-api'
import statisticsApi from '@sangre-fp/connectors/statistics-api'
import { tagPhenomenon, removeTagPhenomenon } from '@sangre-fp/connectors/tag-service-api'
import * as actionTypes from '@sangre-fp/reducers/actionTypes'
import { requestTranslation } from '@sangre-fp/i18n'

export const clearAllErrors = () => dispatch => dispatch({ type: actionTypes.CLEAR_ALL_ERRORS })

export const setPhenomenonToTag = phenomenon => (dispatch, getState) => {
  dispatch({ type: actionTypes.SET_PHENOM_TO_TAG, payload: getState().phenomenaList.phenomenonToTag ? false : phenomenon })
}

export const handlePhenomenaTagMod = (tag, phenomena, grp) => dispatch => {
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

    const group = _.isObject(grp) ? grp.value : grp
    if (Array.isArray(grp)) {
        if(_.isObject(grp[0])) {
            let newGrp = [];
            grp.map((g) => {
                newGrp.push(g.value)
            })
            getPhenomena({
                groups: newGrp,
                phenomena: [phenomena?.id]
                }).then(phenInfo => {
                    addAndRemoveTags(add, dispatch, success, error, phenInfo.result[0].group, phenomena, tag.uri)
                })
        } else {
            getPhenomena({
                groups: grp,
                phenomena: [phenomena?.id]
                }).then(phenInfo => {
                    addAndRemoveTags(add, dispatch, success, error, phenInfo.result[0].group, phenomena, tag.uri)
                })
        }

    }

    else {
            addAndRemoveTags(add, dispatch, success, error, _.isObject(group) ? group.value: group, phenomena, tag.uri)
    }

}

const addAndRemoveTags = (add, dispatch, success, error, groupId, phenomena, tagUri) => {
        if (add) {
        return tagPhenomenon(groupId , phenomena.id, tagUri)
            .then(data => {
                dispatch(success({ tag: tagUri, phenomena }))
            })
            .catch(err =>
                dispatch(error(err))
            )
    }

    return removeTagPhenomenon( groupId, phenomena.id, tagUri)
        .then(data => {
            dispatch(success({ tag: tagUri, phenomena }))
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
                _.round(statistics[item.id].year_median, 2).toFixed(2) : null
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

    if (searchableGroup?.value === ALL_GROUP_VALUE) {
        // eslint-disable-next-line
        getState().phenomenaList.groups.map(({ value }) => {
            if (value >= 0) {
                groups.push(value)
            }
        })
    } else {
        if (Array.isArray(searchableGroup?.value)) {
            // eslint-disable-next-line
            searchableGroup?.value?.map(value => groups.push(value))
        }
        else groups.push(searchableGroup.value)
    }

    dispatch(loading())

    return getPhenomena({
      query: searchInput,
      groups,
      page,
      size,
      language,
      tags: tags.map( tag => {
          if ( tag.value) return tag.value
          else return tag.uri
      }),
      types: types.map(({ value }) => value),
      time_min: !time_min ? null : time_min,
      time_max
    })
      .then(data => {
        const uuidList = data.result ? data.result.map(({ id }) => id) : []

        if (data.result) {
          statisticsApi.getPhenomenaStatistics(uuidList.join(','))
            .then(statisticsData => {
                dispatch(success({
                  total: data.page.totalElements,
                  list: matchPhenomenaWithStatistics(data.result, statisticsData.data)
                }))
            })
            .catch(err => dispatch(error(err)))
        } else {
          dispatch(success({ total: 0, list: [] }))
        }
      })
        .catch(err => dispatch(error(err)))
}
