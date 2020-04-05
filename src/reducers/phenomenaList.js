import _ from 'lodash'
// eslint-disable-next-line
import { radarLanguagesWithAll, ALL_GROUP_VALUE } from '../config'
import { makeGroup } from '../helpers'
import { requestTranslation, setLanguage } from "@sangre-fp/i18n"
import {
    GET_GROUPS_SUCCESS,
    CREATE_PHENOMENA_SUCCESS,
    UPDATE_PHENOMENON_INGESTION_SUCCESS,
    CHANGE_GROUP,
    CHANGE_LANGUAGE,
    FETCH_PHENOMENA_SUCCESS,
    CHANGE_TIME,
    CHANGE_TYPE,
    RESET_FILTERS,
    RESET_TAGS,
    CHANGE_TAG,
    ADD_PHENOMENA_TAG_SUCCESS,
    REMOVE_PHENOMENA_TAG_SUCCESS,
    SET_PHENOM_TO_TAG
} from '@sangre-fp/reducers/actionTypes'

const USER_LANGUAGE = document.querySelector('html').getAttribute('lang') || 'en'
const SELECTED_LANGUAGE = _.find(radarLanguagesWithAll(), { value: USER_LANGUAGE })

setLanguage(USER_LANGUAGE)

// removing all group because of tags, could reinstate later
// const ALL_GROUP = { value: ALL_GROUP_VALUE, label: requestTranslation('allGroupsFilter') }
const PUBLIC_GROUP = { value: 0, label: requestTranslation('publicFilter') }

const initialState = {
    groups: [],
    languages: radarLanguagesWithAll(),
    selectedGroup: PUBLIC_GROUP,
    selectedLanguage: SELECTED_LANGUAGE,
    phenomenaList: [],
    canEditPublic: false,
    total: 0,
    selectedTimes: {min: new Date().getFullYear(), max: null},
    selectedTypes: [],
    allSelectedTypes: [],
    selectedTags: [],
    phenomenonToTag: false
}

const addOrRemoveValueFromArray = (array, value) => _.find(array, value) ? _.filter(array, v => v.label !== value.label) : [...array, value]

export default (state = initialState, { type, payload }) => {
    switch (type) {
        case SET_PHENOM_TO_TAG:
            return { ...state, phenomenonToTag: payload }
        case ADD_PHENOMENA_TAG_SUCCESS:
            const { tag, phenomena } = payload

            return {
                ...state,
                phenomenonToTag: { ...state.phenomenonToTag, tags: state.phenomenonToTag.tags ? [...state.phenomenonToTag.tags, tag] : [tag] },
                phenomenaList: state.phenomenaList.map(o => {
                    if (o.id === phenomena.id) {
                        return { ...o, tags: o.tags ? [...o.tags, tag] : [tag]}
                    }

                    return o
                })
            }
        case REMOVE_PHENOMENA_TAG_SUCCESS:
            return {
                ...state,
                phenomenonToTag: { ...state.phenomenonToTag, tags: state.phenomenonToTag.tags.filter(t => !_.isEqual(t, payload.tag)) },
                phenomenaList: state.phenomenaList.map(o => {
                    if (o.id === payload.phenomena.id) {
                        return { ...o, tags: o.tags.filter(t => !_.isEqual(t, payload.tag) ) }
                    }

                    return o
                })
            }
        case GET_GROUPS_SUCCESS:
            const groups = _.concat(
                [PUBLIC_GROUP],
                _.filter(
                    _.map(payload, makeGroup),
                    group => group.id
                )
            )
            const canEditPublic = _.some(groups, group => group.canEditPublic)

            return {
                ...state,
                groups,
                canEditPublic
            }
        case FETCH_PHENOMENA_SUCCESS:
            return {
                ...state,
                phenomenaList: payload.list,
                total: payload.total.value
            }
        case CHANGE_GROUP:
            return {
                ...state,
                selectedGroup: payload
            }
        case CHANGE_LANGUAGE:
            return {
                ...state,
                selectedLanguage: payload
            }
        case CHANGE_TIME:
            return {
                ...state,
                selectedTimes: payload
            }
        case CHANGE_TAG:
            return {
                ...state,
                selectedTags: addOrRemoveValueFromArray(state.selectedTags, payload)

            }
        case CHANGE_TYPE:
            // if types have not been fetched yet
            // set all selected types for reset later
            if (!state.selectedTypes.length) {
                return {
                    ...state,
                    selectedTypes: payload,
                    allSelectedTypes: payload
                }
            }

            return {
                ...state,
                selectedTypes: addOrRemoveValueFromArray(state.selectedTypes, payload)
            }

        case RESET_TAGS:
            return {
                ...state,
                selectedTags: []
            }
        case RESET_FILTERS:
            return {
                ...state,
                selectedGroup: PUBLIC_GROUP,
                selectedLanguage: SELECTED_LANGUAGE,
                selectedTimes: {min: new Date().getFullYear(), max: null},
                selectedTypes: state.allSelectedTypes,
                selectedTags: []
            }
        case CREATE_PHENOMENA_SUCCESS:
            return {
                ...state,
                // eslint-disable-next-line
                phenomenaList: [payload, ...state.phenomenaList].filter(({ archived }) => !archived)
            }
        case UPDATE_PHENOMENON_INGESTION_SUCCESS:
            const newList = state.phenomenaList.map(phenomenon => {
                if (phenomenon.id === payload.id) {
                    return {
                        ...phenomenon,
                        ...payload
                    }
                }

                return phenomenon
            })

            return {
                ...state,
                phenomenaList: newList.filter(({ archived }) => !archived)
            }
        default:
            return state
    }
}
