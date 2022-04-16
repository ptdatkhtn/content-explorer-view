import { getAccountLanguage, initTranslations, setLanguage } from '@sangre-fp/i18n'

const localTranslations = {
  crowdSourcedEstimate: {
    en: `Crowd sourced estimate`,
    fi: `Joukkoistettu arvio`
  },
  hasTagged: {
    en: `: Yes`,
    fi: `: On`
  },
  hasNoTagged: {
    en: `: No`,
    fi: `: Ei ole`
  },
  TagsPhenomenon: {
    en: `Tags`,
    fi: `Tageja`
  },
  AddAndRemoveTags: {
    en: `Add / remove tags`,
    fi: `Lisää / poista tageja`
  },
  TagsAddedAfterContentcardCreated: {
    en: `Tags can be added after the content card is created.`,
    fi: `Voit lisätä sisältökortille tageja, kun olet ensin luonut (tallentanut) sen.`
  }
}

initTranslations(localTranslations)

setLanguage(getAccountLanguage())