import { useState, useEffect } from 'react'
import { getFpTags } from '@sangre-fp/connectors/tag-service-api'
import {getGroupTags} from './getGroupTags'

const useTags = (group) => {
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFetch = async () => {
    setLoading(true)
    setError(null)
    try {
      setTags(group === 0 ? [await getFpTags(), []] : await Promise.all([ getFpTags(), getGroupTags(group) ]))
    } catch (e) {
      setError(e)
    }

    setLoading(false);
  }

  useEffect(() => {
    handleFetch()
  }, [group])

  return {
    tags,
    loading,
    error
  }
}

export default useTags