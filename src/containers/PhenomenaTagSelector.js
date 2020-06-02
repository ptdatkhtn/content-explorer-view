import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { PhenomenaTagSelector } from '@sangre-fp/tags'
import { handlePhenomenaTagMod } from '../actions/phenomenaList'

export default connect(
    state => {
        const {
            phenomenaList: {
                phenomenonToTag
            }
        } = state

        return {
            phenomenon: phenomenonToTag
        }
    },
    dispatch => bindActionCreators({
        handlePhenomenaTagMod
    }, dispatch)
)(PhenomenaTagSelector)
