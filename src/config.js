import {getAvailableLanguages, requestTranslation} from '@sangre-fp/i18n'

export const ALL_GROUP_VALUE = -1

export const radarLanguagesWithAll = () => [
    { value: 'all', label: requestTranslation('all') },
    ...getAvailableLanguages()
]
