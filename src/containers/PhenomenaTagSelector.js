import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { PhenomenaTagSelector } from './PhenomenaTagSelector2'
import { handlePhenomenaTagMod } from '../actions/phenomenaList'
import { storedPhenSelector } from '../selectors'

export default connect(
    state => {
        const {
            phenomenaList: {
                phenomenonToTag
            }
        } = state

        return {
            phenomenon: phenomenonToTag,
            storedPhenSelector: storedPhenSelector(state)
        }
    },
    dispatch => bindActionCreators({
        handlePhenomenaTagMod
    }, dispatch)
)(PhenomenaTagSelector)
