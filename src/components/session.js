import axios from 'axios'

if (!window.fpSession) {
    window.fpSession = {
        sessionToken: null,
        csrfToken: null,
        userId: null,
        username: null,
        userRoles: [],
        visitorUid: null,
        publicShare: false
    }
}

try {
    window.fpSession.visitorUid = localStorage.getItem('fp-vid')
} catch (err) {
    console.info('local storage not available')
}

const DRUPAL_API_URL = process.env.REACT_APP_DRUPAL_API_URL

export function getSessionToken() {
    return window.fpSession.sessionToken
}

export function getCsrfToken() {
    return window.fpSession.csrfToken
}

export function getUserId() {
    return window.fpSession.userId
}

export function getUsername() {
    return window.fpSession.username
}

export function getUserRoles() {
    return window.fpSession.userRoles
}

// Returns unique visitor id normally stored to browser's local storage (not available in incognito)
export function getVisitorUid() {
    return window.fpSession.visitorUid
}

export function isPublicShare() {
    return window.fpSession.publicShare
}

/**
 * Fetch csrf & session token & user id and start session storing data to sessionStorage
 * @param {string} redirectUrlOnAuthError if set, redirects the user to given Url on auth error or such
 * @param {string} vsid visitor session id
 * @returns {Promise<Boolean>} Returns true
 */
export async function startSession(redirectUrlOnAuthError = null, vsid = null) {
    if (!vsid) {
        const urlParams = new URLSearchParams(window.location.search)
        vsid = urlParams.get('vsid')
    }
    const extraRequestParams = {}
    if (vsid) {
        extraRequestParams.vsid = vsid
    }

    try {
        const csrfRes = await axios({
            method: 'get',
            url: `${DRUPAL_API_URL}/session/token`,
            withCredentials: !vsid,
            params: extraRequestParams
        })
        window.fpSession.csrfToken = csrfRes.data['X-CSRF-Token']

        // Pass existing visitor uid stored to user's local storage to Drupal to be consumed by other services
        const headers = {}
        let visitorUid = getVisitorUid()
        if (visitorUid) {
            headers['X-FP-Vid'] = getVisitorUid()
        }

        const tokenRes = await axios({
            method: 'get',
            url: `${DRUPAL_API_URL}/fp-session-token`,
            withCredentials: !vsid,
            headers,
            params: extraRequestParams
        })
        window.fpSession.sessionToken = tokenRes.data.token
        window.fpSession.userId = Number(tokenRes.data.user_id)
        window.fpSession.userRoles = tokenRes.data.accountDrupalRoles || []
        window.fpSession.username = tokenRes.data.user_name
        window.fpSession.publicShare = Boolean(tokenRes.data.public_share)
        try {
            localStorage.setItem('fp-vid', tokenRes.data.visitor_uid)
        } catch (err) {
            console.info('Local storage not available')
        }
        return true
    } catch (err) {
        window.fpSession.sessionToken = null
        window.fpSession.csrfToken = null
        window.fpSession.userId = null
        window.fpSession.userRoles = []
        window.fpSession.username = null
        window.fpSession.visitorUid = null
        window.fpSession.publicShare = false
        console.warn(`Creating session failed: ${err.message}`)
        if (redirectUrlOnAuthError) {
            if ([401, 403].includes(err.response?.status)) {
                if (!(process.env.NODE_ENV === 'development')) {
                    window.location.replace(redirectUrlOnAuthError)
                } else {
                    console.log(`Redirect omitted in dev env: ${redirectUrlOnAuthError}`)
                }
            }
        }
        return false
    }
}
