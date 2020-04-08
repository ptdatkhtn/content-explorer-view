import { getAccountLanguage, initTranslations, setLanguage } from '@sangre-fp/i18n'

const localTranslations = {
  crowdSourcedEstimate: {
    en: `Crowd sourced estimate`,
    fi: `Joukkoistettu arvio`
  }
}

initTranslations(localTranslations)

setLanguage(getAccountLanguage())