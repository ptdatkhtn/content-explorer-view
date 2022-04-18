import { getGroupSettings, getHubspotAlertsTaxonomy } from './drupal-api'
import { get } from 'lodash-es'
import axios from 'axios'
import { getSessionToken } from './session'

const TAG_SERVICE_API_URL = process.env.REACT_APP_TAG_SERVICE_API_URL

const GET = 'GET'
const POST = 'POST'
const DELETE = 'DELETE'
const PUT = 'PUT'
const PATCH = 'PATCH'

async function httpRequest (method, path, payload = null) {
  return axios({
    method: method,
    url: `${TAG_SERVICE_API_URL}/${path}`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getSessionToken()}`
    },
    data: payload
  }).then(res => res.data)
}

export async function tagPhenomenon (groupId, phenomenonUuid, tagUri, property = 'fp:docs/props/has') {
  const { error } = await httpRequest(POST, `?group=${groupId}`, { tag: tagUri, content: `fp:docs/phenomenon/${phenomenonUuid}`, property })
  return Boolean(error)
}

export async function removeTagPhenomenon (groupId, phenomenonUuid, tagUri, property = 'fp:docs/props/has') {
  const { error } = await httpRequest(POST, `remove?group=${groupId}`, { tag: tagUri, content: `fp:docs/phenomenon/${phenomenonUuid}`, property })
  return Boolean(error)
}

/**
 * Returns tag uri string array for a phenomenon uuid
 *
 * @param groupId
 * @param phenomenonUuid
 * @param property
 * @return {Promise<String[]>}
 */
export async function getTagUrisByPhenomenonUuid (groupId, phenomenonUuid, property = 'fp:docs/props/has') {
  const tags = await httpRequest(GET, `fp:docs/phenomenon/${phenomenonUuid}?group=${groupId}`) || []
  return tags.filter(({ property: tagProperty }) => tagProperty === property).map(({ tag }) => tag)

}

/**
 * Returns an object with phenomenon uuids as keys and tag uri string arrays as values
 *
 * @param groupId
 * @param {String[]} phenomenonUuids
 * @param property
 * @return {Promise<{[String]: String[] }>}
 */
export async function getTagUrisByPhenomenonUuids (groupId, phenomenonUuids, property = 'fp:docs/props/has') {
  let tagsByUris = await httpRequest(POST, `tags?group=${groupId}`, { content: phenomenonUuids.map(uuid => `fp:docs/phenomenon/${uuid}`) })

  // If returned object is empty, Service returns falsily empty array instead of an object
  if (Array.isArray(tagsByUris) && tagsByUris.length === 0) {
    return {}
  }
  const result = {}
  for (let [ docUri, tags ] of Object.entries(tagsByUris)) {
    const docUuid = docUri.replace('fp:docs/phenomenon/', '')
    result[docUuid] = tags.filter(({ property: tagProperty }) => tagProperty === property).map(({ tag }) => tag)
  }
  return result

}





function addTagUris (prefix, tags) {
  if(tags.length > 0 && !tags[0].g)
    return tags.map(({ name, ...tag }) => ({ uri: `${prefix}${name}`, ...tag }))
  else {
    if (tags && tags.length > 0) {
      const c = tags.map(group => {
        const d = group.tag.length > 0 && group.tag.map(t => {
          return ({ uri: `${prefix}${group.g}/${t.name}`, ...t })
        })
        return d
      })
      let a = []
      !!c?.length && c.map( t => {
        a.push(...t)
      })

      return a
    }
    
  }
}

export async function getGroupTags (groupId) {
    // server returns 500 error for public group, which has groupId of 0, workaround
    if(groupId && Array.isArray(groupId)) {
      const asyncRes = await Promise.all(
        groupId?.length > 0 &&  groupId?.map(async(g) => {
          const tag = get(await getGroupSettings(Number(((g === 0 || g === '0') ? NaN : g ))), ['data', 'settings', 'tags'], [])
          return {tag, g}
        })
      )
      const b = asyncRes.filter(t => t.tag.length > 0)
      return addTagUris(`fp:tags/group/`, b)
    }

    else if (groupId) {
      return addTagUris(`fp:tags/group/${groupId}/`, get(await getGroupSettings(Number(groupId)), ['data', 'settings', 'tags'], []))
    }
  
    return []
}

export async function getFpTags () {
  const { results = [] } = await getHubspotAlertsTaxonomy()
  return addTagUris('fp:tags/theme/', results.map(({ name, translation, url_alias = '' }) => ({ label: {'fi': translation, 'en': name}, name: url_alias.replace('/hubspot-alerts/', '')})))
}

export async function getLocalizedFpTags (lang) {
  return getFpTags().map(({ label, ...tag }) => ({ ...tag, label: label[lang] }))
}
