import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ErrorModal } from '@sangre-fp/ui'
import { clearAllErrors } from '../actions/phenomenaList'

export default connect(
    state => {
        const {
            errors
        } = state

        return {
            errors
        }
    },
    dispatch => bindActionCreators({
        onClose: clearAllErrors
    }, dispatch)
)(ErrorModal)
