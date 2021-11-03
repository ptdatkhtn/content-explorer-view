import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import store from './configureStore'
import PhenomenaPage from './containers/PhenomenaPageContainer'
import * as serviceWorker from './serviceWorker'
import { startSession } from '@sangre-fp/connectors/session'

import { GlobalStyles } from '@sangre-fp/ui'

import 'react-select/dist/react-select.css'
import 'react-quill/dist/quill.snow.css'
import 'rc-slider/dist/rc-slider.css'

// import './session'
import './translations'

const renderApp = (highest_group_role) => {
  return (
    <Provider store={store}>
      <GlobalStyles />
      <PhenomenaPage highest_group_role={highest_group_role}/>
    </Provider>
  )
}

const appElement = document.getElementById('fp-content-manager')

startSession(window.location.origin).then(() => {
    ReactDOM.render(
        renderApp(
          appElement.getAttribute('data-radar-highest-group-role')
        ), appElement)
})

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
