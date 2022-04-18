import axios from 'axios'
import {getCsrfToken, getSessionToken} from '../session'
import {
    normalizeRadar,
    normalizeCreateRadarInput,
    normalizeUpdateRadarInput,
    normalizePhenomenon,
    normalizePhenomenonInput,
    normalizePhenomenonTypes,
    normalizeGroupPhenomenonTypes,
    normalizeFeedTags,
    normalizeRestApiResult,
    normalizeGroup
} from './normalize'
import { get, map } from 'lodash-es'

const urlParams = new URLSearchParams(window.location.search)
const vsid = urlParams.get('vsid')
const extraRequestParams = vsid ? { vsid } : {}

const USER_PAGE_SIZE = 25
const DRUPAL_API_URL = process.env.REACT_APP_DRUPAL_API_URL

/**
 * @typedef {Object} Group
 * @property {number} id
 * @property {string} title
 */
/**
 * @typedef {Object} PhenomenonState
 * @property {boolean} halo
 * @property {boolean} speech_bubble
 */
/**
 * @typedef {Object} Radar
 * @property {number} id
 * @property {string} label
 * @property {string} logo_image
 * @property {boolean} hide_users
 * @property {"No"|"Yes"} allow_issue_rating
 * @property {"No"|"Yes"} enable_issue_commenting
 * @property {"No"|"Yes"} allow_comment_thumbing
 * @property {"No"|"Yes"} enable_kiosk_mode
 * @property {"No"|"Yes"} enable_issue_rating
 * @property {Object} info_screen
 * @property {"No"|"Yes"} show_freewall
 * @property {?string} axis_x_title
 * @property {?number} axis_x_max
 * @property {?number} axis_x_min
 * @property {?string} axis_y_title
 * @property {?number} axis_y_max
 * @property {?number} axis_y_min
 * @property {?number} four_fields_top_left
 * @property {?number} four_fields_top_right
 * @property {?number} four_fields_bottom_left
 * @property {?number} four_fields_bottom_right
 * @property {?number} speech_bubble_flashing_time
 * @property {?number} display_halo_when_rating
 * @property {string} map_intro
 * @property {boolean} signal_tool_enabled
 * @property {boolean} assign_new_users
 * @property {boolean} disable_newsfeed
 * @property {boolean} enable_url_login
 * @property {?number} url_login_count
 * @property {boolean} radar_template
 * @property {string} uuid
 * @property {string} title
 * @property {string} language
 * @property {Object.<string, PhenomenonState>}} phenomena
 * @property {number} owner_id
 * @property {Group} group
 */

const GET = 'GET'
const POST = 'POST'
const DELETE = 'DELETE'
const PUT = 'PUT'
const PATCH = 'PATCH'

async function httpRequest(method, path, payload = null) {

    return axios({
        method,
        url: `${DRUPAL_API_URL}/v1.0/${path}`,
        headers: {
            'X-CSRF-Token': getCsrfToken(),
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getSessionToken()}`
        },
        params: extraRequestParams,
        withCredentials: true,
        data: payload || null,

    }).then(res => res.data)
}

export async function getGroups() {
    return httpRequest(GET, 'group')
}

export async function getMemberships() {
    return httpRequest(GET, 'membership')
}

export async function getRadar(id) {
    return httpRequest(GET, `radars/${id}`)
        .then(data => data[0])
        .then(normalizeRadar)
}

export async function createRadar(radarData) {
    return httpRequest(POST, 'radars', normalizeCreateRadarInput(radarData))
        .then(data => data[0])
        .then(normalizeRadar)
}

export async function cloneRadar(parentRadarId) {
    return httpRequest(POST, 'radars', {parent_radar_id: parentRadarId})
        .then(data => data[0])
        .then(normalizeRadar)
}

export async function updateRadar(radarId, radarData) {
    return httpRequest(PATCH, `radars/${radarId}`, normalizeUpdateRadarInput(radarData))
        .then(data => data[0])
        .then(normalizeRadar)
}

export async function deleteRadar(radarId) {
    return httpRequest(DELETE, `radars/${radarId}`).then(() => radarId)
}

export async function createPhenomenon(phenomenonData) {
    return httpRequest(POST, 'phenomena', [normalizePhenomenonInput(phenomenonData)])
        .then(data => data.phenomena[0])
        .then(normalizePhenomenon)
        .then(phenomenon => ({
            ...phenomenonData,
            ...phenomenon,
        }))
}

export async function updatePhenomenon(uuid, phenomenonData) {
    return httpRequest(PATCH, `phenomena/${uuid}`, [normalizePhenomenonInput(phenomenonData)])
        .then(normalizePhenomenon)
        .then(phenomenon => ({
            ...phenomenon,
            ...phenomenonData
        }))
}

export async function createRadarSectorPhenomenon(data) {
    return httpRequest(POST, 'radar-sector-phenomena', data)
}

export async function updateRadarSectorPhenomenon(phenomenonId, phenomenonData) {
    return httpRequest(PATCH, `radar-sector-phenomena/${phenomenonId}`, phenomenonData)
}

export async function deleteRadarSectorPhenomenon(phenomenonId) {
    return httpRequest(DELETE, `radar-sector-phenomena/${phenomenonId}`).then(() => phenomenonId)
}

export async function getRadarTemplates() {
    return httpRequest(GET, 'radartemplates?&sort=label')
}

export async function updateGroup(groupId, data) {
    return httpRequest(PATCH, `group/${groupId}`, data)
}

export async function getRadarsByGroupId(groupId) {
    return httpRequest(GET, `radarsingroup?filter[gid]=${groupId}`)
}

export async function getMembershipByGroupId(groupId, page, roleFilter, searchPhrase) {
    // eslint-disable-next-line
    return httpRequest(GET, `membership?filter[gid]=${groupId}&page[number]=${page}&page[size]=${USER_PAGE_SIZE}${roleFilter && roleFilter.value ? `&filter[role]=${roleFilter.value.toLowerCase()}` : ''}${searchPhrase && searchPhrase.length ? `&email_like=${searchPhrase}` : ''}&sort=role_weight,email`)
}

export async function deleteMemberships(membershipIds) {
    return httpRequest(DELETE, `membershipsdelete`, membershipIds.map(mid => ({mid})))
}

export async function updateMembershipRole(data) {
    return httpRequest(PUT, 'membershiprole', data)
}

export async function getGroupById(groupId) {
    return httpRequest(GET, `group?filter[id]=${groupId}`)
}

export async function grantRadarUserAccess(data) {
    return httpRequest(POST, 'radargrantuseraccess', data)
}

export async function revokeRadarUserAccess(data) {
    return httpRequest(DELETE, 'radarrevokeuseraccess', data)
}

export async function inviteToRadar(data, gid) {
    return httpRequest(POST, `groupadduser/${gid}`, data)
}

export async function createRadarShareLink(radarId, gid) {
    // TODO: @jouni implement
    return 'https://fp-dev.sangre.fi/fp-radar-visit/a363b635-bb6c-401b-a9e8-257f31c33a10'
}

export async function getPhenomenaTypes(groupId) {
    const phenomenaTypes = await httpRequest(GET, 'phenomenontypes?sort=weight')
    const group = groupId && await getGroupById(groupId)
    const groupTypes = get(group, '0.settings.doc_types.phenomenon.types', [])

    return ([...normalizeGroupPhenomenonTypes(groupTypes, groupId), ...normalizePhenomenonTypes(phenomenaTypes)])
}

export async function getRssFeedTags() {
    return httpRequest(GET, 'rssfeedtags')
        .then(normalizeFeedTags)
}

/**
 *
 * @return {Promise<{count: Number, results: Object[]}>}
 */
export async function getHubspotAlertsTaxonomy() {
    return normalizeRestApiResult(await httpRequest(GET, 'hubspotalerts?sort=weight'))
}

export async function getGroupSettings(gid) {
    return httpRequest(GET, `groupsettings?gid=${Number(gid)}`)
}

export async function getGroupsWithMemberShips() {
    const [groups, memberships] = await Promise.all([getGroups(), getMemberships()])

    const membershipGroupIds = memberships ? Object.values(memberships).map(membership => parseInt(membership.gid, 10)) : []

    const groupsToNormalize = groups
        ? Object.values(groups).filter(group => membershipGroupIds.indexOf(group.id) !== -1)
        : []

    return map(groupsToNormalize, normalizeGroup)
}

export async function createSignal(data) {
    return httpRequest(POST, `signals`, [data])
}

export async function fetchShares(gid) {
    return httpRequest(GET, `radarshares?gid=${gid}`)
}

export async function regenerateShare(id) {
    return httpRequest(DELETE, `radarshares/${id}/?regenerate=1`)
}

export async function deleteShare(id) {
    return httpRequest(DELETE, `radarshares/${id}`)
}

/**
 * Returns object containing public radar share expiry time and url
 * If share url doesn't epire if  is false
 * If public radar share doesn't exists, it returns null for url
 *
 * @param {number} radarId
 * @return {Promise<{expired: (Date|boolean), url: string|null }>}
 */
export async function getRadarPublicShare(radarId) {
    return handlePublicShareInfo(await httpRequest(GET, `public-radar-shares?radar_id=${radarId}`))
}

/**
* Creates or replaces a public radar share for a radar with a new exipiry time
* If public radar share doesn't exists, it returns null for url
*
* @param {number} radarId
* @param {Date} expired
* @return {Promise<{expired: (Date|null), url: (string|null) }>}
*/
export async function createOrReplaceRadarPublicShare({ radarId, expired = null }) {
    return handlePublicShareInfo(await httpRequest(POST, `public-radar-shares?radar_id=${radarId}`, {
        login_expire: expired instanceof Date ? Math.round(expired.getTime() / 1000)  : 0
    }))
}

/**
* Removes existing public radar share
*
* @param {number} radarId
* @return {Promise<void>}
*/
export async function removeRadarPublicShare(radarId) {
    return httpRequest(DELETE, `public-radar-shares?radar_id=${radarId}`)
}

/**
 * Regenerates a new radar share url
 *
 * @param {number} radarId
 * @return {Promise<{expired: (Date|null), url: (string|null) }>}
 */
export async function regenerateRadarPublicShare(radarId) {
    return handlePublicShareInfo(await httpRequest(DELETE, `public-radar-shares?radar_id=${radarId}&regenerate=1`))
}

/**
 *
 * @param {{ login_expire: number|boolean, radar_share_url: string|null }} info
 * @return {null|{expired: (Date|boolean), url}}
 */
function handlePublicShareInfo(info) {
    if (info) {
        const  { login_expire, radar_share_url } = info
        return { expired: login_expire ? new Date(login_expire * 1000) : false, url: radar_share_url }
    } else {
        return null
    }
}

export async function getVotingResults(radarId) {
    return httpRequest(GET, `votes/?radar_id=${radarId}`)
}

export default {
    cloneRadar,
    createPhenomenon,
    createRadar,
    createRadarSectorPhenomenon,
    createSignal,
    deleteMemberships,
    deleteRadar,
    deleteRadarSectorPhenomenon,
    deleteShare,
    fetchShares,
    getGroupById,
    getGroupSettings,
    getGroups,
    getGroupsWithMemberShips,
    getMembershipByGroupId,
    getMemberships,
    getPhenomenaTypes,
    getRadar,
    getRadarTemplates,
    getRadarsByGroupId,
    getRssFeedTags,
    getHubspotAlertsTaxonomy,
    getVotingResults,
    grantRadarUserAccess,
    inviteToRadar,
    regenerateShare,
    revokeRadarUserAccess,
    updateGroup,
    updateMembershipRole,
    updatePhenomenon,
    updateRadar,
    updateRadarSectorPhenomenon,
    getRadarPublicShare,
    removeRadarPublicShare,
    createOrReplaceRadarPublicShare,
    regenerateRadarPublicShare
}
