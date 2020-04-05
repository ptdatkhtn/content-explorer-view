import axios from 'axios'
import { DRUPAL_API_URL, PUBLIC_URL } from './env'

// using axios built in interceptors to refresh the page if the user is either unauthorized
// or his session has run out. Drupal will automatically log the user out on refresh
axios.interceptors.response.use(null, error => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        if (!(process.env.NODE_ENV === 'development')) {
            window.location.replace(PUBLIC_URL)
        }
    }

    return Promise.reject(error)
})

export function getUserId() {
    return sessionStorage.getItem('fp-user-id')
}

/**
 * Fetch csrf & session token & user id and start session storing data to sessionStorage
 * @returns {Promise<Boolean>} Returns true
 */
export async function startSession() {
    return axios({
        method: 'get',
        url: `${DRUPAL_API_URL}/session/token`,
        withCredentials: true
    }).then(csrfRes => {
        const csrfToken = csrfRes.data['X-CSRF-Token']
        sessionStorage.setItem('fp-csrf-token', csrfToken)
        return axios({
            method: 'get',
            url: `${DRUPAL_API_URL}/fp-session-token`,
            withCredentials: true
        }).then(tokenRes => {
            const token = tokenRes.data.token
            const userId = Number(tokenRes.data.user_id)
            const roles = tokenRes.data.accountDrupalRoles

            sessionStorage.setItem('fp-session-token', token)
            sessionStorage.setItem('fp-user-id', userId)
            sessionStorage.setItem('fp-user-roles', JSON.stringify(roles))
            return true
        })
    })
}
