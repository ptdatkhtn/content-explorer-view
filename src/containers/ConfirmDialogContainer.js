import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ConfirmDialog } from '@sangre-fp/ui'
import { toggleConfirmationDialog } from '../actions/confirmDialog'

export default connect(
    state => state.confirmDialog,
    dispatch => ({
        ...bindActionCreators({
            toggleConfirmationDialog
        }, dispatch)
    })
)(ConfirmDialog)
