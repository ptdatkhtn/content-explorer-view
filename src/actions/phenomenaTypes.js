import _ from 'lodash'
import { getNetworkMethods } from './network'
import drupalApi from '@sangre-fp/connectors/drupal-api'
import * as actionTypes from '@sangre-fp/reducers/actionTypes'
import { requestTranslation } from '@sangre-fp/i18n'

export const getPhenomenaTypes = () => async dispatch => {
    const { loading, success, error } = getNetworkMethods(
        actionTypes.GET_PHENOMENA_TYPES,
        actionTypes.GET_PHENOMENA_TYPES_SUCCESS,
        requestTranslation('fetchingPhenomenaTypesError')
    )

    dispatch(loading())

    return drupalApi.getPhenomenaTypes()
        .then(data => {
            dispatch({
                type: actionTypes.CHANGE_TYPE,
                payload: _.map(data, type => ({
                    value: type.id,
                    label: type.alias
                }))
            })
            dispatch(success(data))
        })
        .catch(e => dispatch(error(e)))
}
