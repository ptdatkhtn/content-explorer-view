import { getNetworkMethods } from './network'
import { requestTranslation } from '@sangre-fp/i18n'
import * as actionTypes from '@sangre-fp/reducers/actionTypes'
//import { handleImageUploadIfNeeded } from '@sangre-fp/connectors/media-api'
import {
    NEWSFEED_ERROR,
    NEWSFEED_ERROR_PARTIAL,
    storePhenomenonWithNewsFeeds,
    archivePhenomenon as archive
} from "@sangre-fp/connectors/phenomena-api"

export const archivePhenomenon = (phenomenon, callback) => async (dispatch) => {
  const { loading, success, error } = getNetworkMethods(
    actionTypes.ARCHIVE_PHENOMENON,
    actionTypes.ARCHIVE_PHENOMENON_SUCCESS,
    requestTranslation('archivePhenomenaError')
  )
  dispatch(loading())
  try {
    await archive(phenomenon.id, phenomenon.groups[0])
    dispatch(success(phenomenon.id))
    callback()
  } catch (e) {
    dispatch(error(e))
  }
}

export const storePhenomenon = (phenomenon, newsFeedChanges, callback, archived = false) => async (dispatch) => {
    const {
        group,
        imageUrl,
        imageFile,
        ...rest
    } = phenomenon

    const { loading, success, error } = phenomenon.id
        ? getNetworkMethods(
            actionTypes.UPDATE_PHENOMENON_INGESTION,
            actionTypes.UPDATE_PHENOMENON_INGESTION_SUCCESS,
            requestTranslation('updatingPhenomenaError')
        ) : getNetworkMethods(
            actionTypes.CREATE_PHENOMENA,
            actionTypes.CREATE_PHENOMENA_SUCCESS,
            requestTranslation('creatingPhenomenaError')
        )

    dispatch(loading())

    const phenomenonInput = {
        ...rest,
        group,
        // imageUrl: await handleImageUploadIfNeeded(imageFile || imageUrl, group),
        archived
    }

    try {
        const { storedPhenomenon, status, failedNewsFeedTitles } = await storePhenomenonWithNewsFeeds(phenomenonInput, newsFeedChanges)

        if (status === NEWSFEED_ERROR_PARTIAL) {
            dispatch(error(new Error('News feed error'), requestTranslation('someNewsFeedCreationError', failedNewsFeedTitles)))
        } else if (status === NEWSFEED_ERROR) {
            dispatch(error(new Error('News feed error'), requestTranslation(phenomenon.id ? 'newsFeedUpdateError' : 'newsFeedCreationError')))
        } else {
            dispatch(success(storedPhenomenon))
            callback(storedPhenomenon)
        }
    } catch (e) {
        dispatch(error(e))
    }
}
