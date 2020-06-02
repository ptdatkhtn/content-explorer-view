import _ from 'lodash'
import { requestTranslation, setLanguage, radarLanguagesWithAll } from "@sangre-fp/i18n"
import {
    GET_GROUPS_SUCCESS,
    ARCHIVE_PHENOMENON_SUCCESS,
    UPDATE_PHENOMENON_INGESTION_SUCCESS,
    FETCH_PHENOMENA_SUCCESS,
    ADD_PHENOMENA_TAG_SUCCESS,
    REMOVE_PHENOMENA_TAG_SUCCESS,
    SET_PHENOM_TO_TAG
} from '@sangre-fp/reducers/actionTypes'

const USER_LANGUAGE = document.querySelector('html').getAttribute('lang') || 'en'
setLanguage(USER_LANGUAGE)

const PUBLIC_GROUP = { value: 0, label: requestTranslation('publicFilter') }

const initialState = {
    groups: [],
    languages: radarLanguagesWithAll(),
    phenomenaList: [],
    canEditPublic: false,
    total: 0,
    phenomenonToTag: false
}

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
                _.filter(payload, group => group.id)
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
                total: payload.total
            }
      case ARCHIVE_PHENOMENON_SUCCESS:
            return {
              ...state,
              phenomenaList: state.phenomenaList.filter(({ id }) => id !== payload)
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
