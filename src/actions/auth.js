import { getNetworkMethods } from './network'
import { startSession } from '@sangre-fp/connectors/session'
import * as actionTypes from '@sangre-fp/reducers/actionTypes'
import { requestTranslation } from '@sangre-fp/i18n'

export const getAuth = () => dispatch => {
    const { loading, success, error } = getNetworkMethods(
        actionTypes.FETCH_SESSION,
        actionTypes.FETCH_SESSION_SUCCESS,
        requestTranslation('authorizingError')
    )
    dispatch(loading())
    return startSession()
        .then(() => dispatch(success()))
        .catch(err => dispatch(error(err)))
}
