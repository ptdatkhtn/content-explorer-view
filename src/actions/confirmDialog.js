import * as actionTypes from '@sangre-fp/reducers/actionTypes'

/*
  payload is settings object
  settings: {
    text,
    title,
    callback
  }
*/

export const toggleConfirmationDialog = payload => dispatch =>
  dispatch({ type: actionTypes.TOGGLE_CONFIRM_DIALOG, payload })
