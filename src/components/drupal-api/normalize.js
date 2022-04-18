import _, { toLower, filter, sortBy } from 'lodash-es'

export const normalizeRadar = radar => {
    const {
        hide_users,
        title,
        map_intro,
        language,
        axis_x_title,
        axis_x_max,
        axis_x_min,
        axis_y_title,
        axis_y_max,
        axis_y_min,
        four_fields_top_left,
        four_fields_top_right,
        four_fields_bottom_left,
        four_fields_bottom_right,
        enable_issue_rating,
        allow_issue_rating,
        show_freewall,
        enable_issue_commenting,
        allow_comment_thumbing,
        logo_image,
        display_halo_when_rating,
        uuid,
        signal_tool_enabled,
        owner_id,
        enable_url_login,
        url_login_expire,
        url_login_link,
        radar_template,
        title_logo,
        timeline_label_format,
        ...rest
    } = radar

    return {
        hideUsersFromTrial: hide_users,
        radarName: title,
        mapIntro: map_intro,
        radarLanguage: language,
        axisXTitle: axis_x_title,
        axisXMax: axis_x_max,
        axisXMin: axis_x_min,
        axisYTitle: axis_y_title,
        axisYMax: axis_y_max,
        axisYMin: axis_y_min,
        fourFieldsTopLeft: four_fields_top_left,
        fourFieldsTopRight: four_fields_top_right,
        fourFieldsBottomLeft: four_fields_bottom_left,
        fourFieldsBottomRight: four_fields_bottom_right,
        displayHaloWhenRating: display_halo_when_rating,
        commentsOn: enable_issue_commenting === 'Yes',
        likingOn: allow_comment_thumbing === 'Yes',
        ratingsOn: enable_issue_rating === 'Yes',
        votingOn: allow_issue_rating === 'Yes',
        discussionOn: show_freewall === 'Yes',
        radarImage: logo_image,
        uuid,
        signalToolEnabled: signal_tool_enabled,
        ownerId: owner_id,
        enableUrlLogin: enable_url_login,
        urlLoginExpire: url_login_expire,
        urlLoginLink: url_login_link,
        isRadarTemplate: !!radar_template,
        titleLogo: title_logo,
        timelineLabelFormat: timeline_label_format,
        ...rest
    }
}

const normalizeRadarInput = (radarSettings) => {
    const {
        radarName,
        mapIntro,
        hideUsersFromTrial,
        phenomenaSet,
        ratingsOn = false,
        commentsOn = false,
        likingOn = false,
        discussionOn = false,
        votingOn = false,
        radarImage = null,
        radarTitleImage = null,
        axisXTitle = null,
        axisXMax = null,
        axisXMin = null,
        axisYTitle = null,
        axisYMax = null,
        axisYMin = null,
        fourFieldsTopLeft = null,
        fourFieldsTopRight = null,
        fourFieldsBottomLeft = null,
        fourFieldsBottomRight = null,
        displayHaloWhenRating = false,
        timelineLabelFormat = false
    } = radarSettings

    return {
        title: radarName,
        map_intro: mapIntro,
        hide_users: hideUsersFromTrial ? 1 : 0,
        template_id: phenomenaSet,
        allow_issue_rating: votingOn ? 'Yes' : 'No',
        enable_issue_rating: ratingsOn ? 'Yes' : 'No',
        enable_issue_commenting: commentsOn ? 'Yes' : 'No',
        show_freewall: discussionOn ? 'Yes' : 'No',
        allow_comment_thumbing: likingOn ? 'Yes' : 'No',
        axis_x_title: axisXTitle,
        axis_x_max: axisXMax,
        axis_x_min: axisXMin,
        axis_y_title: axisYTitle,
        axis_y_max: axisYMax,
        axis_y_min: axisYMin,
        four_fields_top_left: fourFieldsTopLeft,
        four_fields_top_right: fourFieldsTopRight,
        four_fields_bottom_left: fourFieldsBottomLeft,
        four_fields_bottom_right: fourFieldsBottomRight,
        display_halo_when_rating: displayHaloWhenRating,
        logo_image: radarImage,
        title_logo: radarTitleImage,
        timeline_label_format: timelineLabelFormat
    }
}

export const normalizeUpdateRadarInput = radarSettings => {
    const {
        group,
        enableUrlLogin,
        urlLoginExpire,
        isRadarTemplate,
        timelineLabelFormat
    } = radarSettings

    return {
        ...normalizeRadarInput(radarSettings),

        // Public group is an empty array atm
        gid: (!group || (Array.isArray(group) && group.length === 0)) ? { id: 0 } : group,
        enable_url_login: enableUrlLogin,
        url_login_expire: urlLoginExpire,
        radar_template: isRadarTemplate,
        timeline_label_format: timelineLabelFormat
    }
}

export const normalizeCreateRadarInput = (radarSettings) => {
    const {
        group,
        radarLanguage
    } = radarSettings

    return {
        ...normalizeRadarInput(radarSettings),

        // Public group is an empty array atm // TODO check why this is handled differently in update and create
        gid: group,
        language: radarLanguage || 'en'
        // TODO check why enable_url_login etc are not in create
    }
}

export const normalizePhenomenon = (phenomenon) => {
    const {
        uuid
    } = phenomenon

    return {
        uuid: toLower(uuid)
    }
}

const normalizeRelatedPhenomena = relatedPhenomena => relatedPhenomena.map(phenom => ({...phenom, id: phenom.uuid }))

export const normalizePhenomenonInput = phenomenonInput => {
    const {
        relatedPhenomena,
        title,
        language,
        shortTitle,
        state,
        video,
        body,
        videoText,
        lead,
        imageUrl,
        feedTag,
        group,
        userId,
        archived,
        timing,
        links
    } = phenomenonInput

    const dto = {
        short_name: shortTitle,
        group_id: group,
        user_id: Number(userId),
        megatrend: 1,
        language,
        title,
        issue_state: state.issue_state,
        video_url: video,
        body,
        media_text: videoText,
        related_phenomena: normalizeRelatedPhenomena(relatedPhenomena),
        ingress_body: lead,
        feed_tag: feedTag,
        image_url: imageUrl,
        timing,
        links
    }

    if (archived) {
        dto.archived = 1
    }

    if ((Number(group) === 0)) {
        dto.visibility = 'PUBLIC'
    }

    return dto
}

export const sortTypes = types => {
  if (types.length) {
    const customTypes = [...types]
    const defaultTypes = types.slice(Math.max(types.length - 6, 0))

    defaultTypes[1].order = 1
    defaultTypes[3].order = 4
    defaultTypes[0].order = 6
    defaultTypes[4].order = 5
    defaultTypes[5].order = 3
    defaultTypes[2].order = 2

    const sortedTypes = sortBy(defaultTypes, 'order')
    customTypes.splice(customTypes.length - 6)

    return [...customTypes, ...sortedTypes]
  }

  return types
}

// phenomenonTypes endpoint returns an object with numeric keys. Mapping through it with lodash removes self etc
export const normalizePhenomenonTypes = phenomenonTypes => {
    const filteredTypes = filter(phenomenonTypes, phenomenonType => phenomenonType.id)

    return sortTypes(filteredTypes)
}

export const normalizeGroupPhenomenonTypes = (groupPhenomenonTypes, groupId) =>
    groupPhenomenonTypes.map(type => {
        return {
            id: `fp:doc-types/group/${groupId}/${type.name}`,
            title: type.label || type.name,
            label: type.label || type.name,
            groupType: true,
            ...type
        }
    })

// feedTags endpoint returns an object with numeric keys. Mapping through it with lodash removes self etc
export const normalizeFeedTags = feedTags =>
    filter(feedTags, feedTag => feedTag.id)

export function normalizeRestApiResult ({count, ...drupalRestApiObject }) {
  return {
    results: Object.values(drupalRestApiObject).filter(({ url_alias }) => url_alias),
    count: Number(count)
  }
}

export const editorRole = role => {
    if (role === 'manager' || role === 'owner' || role === 'editor') {
        return true
    }

    return false
}

export const publicEditorRole = permissions => !!_.find(permissions, permission => permission === 'fp editor')

export const normalizeGroup = group => {
    const {
      id,
      label,
      radarsUsed,
      radarsAllowed: radarsAllowedString,
      accountDrupalRoles,
      accountPermissions,
      availableResources
    } = group

    // backend is returning this as a string for whatever reason
    const radarsAllowed = Number(radarsAllowedString)

    // not sure why this info is in the group
    const canEditPublic = accountDrupalRoles && publicEditorRole(accountDrupalRoles[0])
    const canEdit = accountPermissions && editorRole(accountPermissions.role)

    return {
      ...group,
      id,
      value: id,
      label,
      radarsAllowed,
      radarsUsed,
      hasAvailableRadars: radarsUsed < radarsAllowed,
      availableResources,
      canEditPublic,
      canEdit
    }
}
