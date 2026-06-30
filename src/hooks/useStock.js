'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export function useStock() {
  const [locations, setLocations] = useState([])
  const [items, setItems] = useState([])
  const [stockLevels, setStockLevels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orgId, setOrgId] = useState(null)
  const [userId, setUserId] = useState(null)

  // Fetch initial data
  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !active) return
        setUserId(user.id)

        // Get org_id from profiles
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('org_id')
          .eq('user_id', user.id)
          .single()

        if (profileErr) throw profileErr
        if (!profile || !active) return

        const currentOrgId = profile.org_id
        setOrgId(currentOrgId)

        // Parallel fetch locations, items, stock levels
        const [locsRes, itemsRes, stockRes] = await Promise.all([
          supabase.from('locations').select('*').eq('org_id', currentOrgId).order('name'),
          supabase.from('items').select('*').eq('org_id', currentOrgId).order('name'),
          supabase.from('stock_levels').select('*').eq('org_id', currentOrgId)
        ])

        if (locsRes.error) throw locsRes.error
        if (itemsRes.error) throw itemsRes.error
        if (stockRes.error) throw stockRes.error

        if (active) {
          setLocations(locsRes.data || [])
          setItems(itemsRes.data || [])
          setStockLevels(stockRes.data || [])
          setLoading(false)
        }
      } catch (err) {
        console.error('Error loading stock data:', err)
        if (active) {
          setError(err.message)
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [])

  // Subscribe to real-time changes
  useEffect(() => {
    if (!orgId) return

    const channel = supabase
      .channel('stock-realtime-channel')
      // Stock levels realtime
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stock_levels', filter: `org_id=eq.${orgId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setStockLevels((prev) => {
              if (prev.some((s) => s.id === payload.new.id)) return prev
              return [...prev, payload.new]
            })
          } else if (payload.eventType === 'UPDATE') {
            setStockLevels((prev) =>
              prev.map((s) => (s.id === payload.new.id ? payload.new : s))
            )
          } else if (payload.eventType === 'DELETE') {
            setStockLevels((prev) => prev.filter((s) => s.id === payload.old.id))
          }
        }
      )
      // Locations realtime
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'locations', filter: `org_id=eq.${orgId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLocations((prev) => {
              if (prev.some((l) => l.id === payload.new.id)) return prev
              return [...prev, payload.new].sort((a, b) => a.name.localeCompare(b.name))
            })
          } else if (payload.eventType === 'UPDATE') {
            setLocations((prev) =>
              prev.map((l) => (l.id === payload.new.id ? payload.new : l)).sort((a, b) => a.name.localeCompare(b.name))
            )
          } else if (payload.eventType === 'DELETE') {
            setLocations((prev) => prev.filter((l) => l.id === payload.old.id))
          }
        }
      )
      // Items realtime
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'items', filter: `org_id=eq.${orgId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setItems((prev) => {
              if (prev.some((i) => i.id === payload.new.id)) return prev
              return [...prev, payload.new].sort((a, b) => a.name.localeCompare(b.name))
            })
          } else if (payload.eventType === 'UPDATE') {
            setItems((prev) =>
              prev.map((i) => (i.id === payload.new.id ? payload.new : i)).sort((a, b) => a.name.localeCompare(b.name))
            )
          } else if (payload.eventType === 'DELETE') {
            setItems((prev) => prev.filter((i) => i.id === payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orgId])

  // Adjust stock level with optimistic UI update
  const adjustStock = useCallback(async (locationId, itemId, newQty) => {
    if (!orgId) {
      throw new Error('No organization profile found. You cannot perform this action.')
    }

    // Optimistic update
    setStockLevels((prev) =>
      prev.map((s) =>
        s.location_id === locationId && s.item_id === itemId
          ? { ...s, qty: Math.max(0, newQty) }
          : s
      )
    )

    try {
      const { error: err } = await supabase
        .from('stock_levels')
        .update({ qty: Math.max(0, newQty), updated_at: new Date().toISOString() })
        .eq('location_id', locationId)
        .eq('item_id', itemId)

      if (err) throw err
    } catch (err) {
      console.error('Failed to update stock qty:', err)
      // Re-fetch to sync with database in case of failure
      const { data } = await supabase
        .from('stock_levels')
        .select('*')
        .eq('org_id', orgId)
      if (data) setStockLevels(data)
    }
  }, [orgId])

  // Add location
  const addLocation = useCallback(async (name, code) => {
    if (!orgId) {
      throw new Error('No organization profile found. You cannot perform this action.')
    }
    try {
      const { data, error: err } = await supabase
        .from('locations')
        .insert({ org_id: orgId, name, code })
        .select()
        .single()

      if (err) throw err
      return data
    } catch (err) {
      console.error('Failed to add location:', err)
      throw err
    }
  }, [orgId])

  // Add item
  const addItem = useCallback(async (name, sku) => {
    if (!orgId) {
      throw new Error('No organization profile found. You cannot perform this action.')
    }
    try {
      const { data, error: err } = await supabase
        .from('items')
        .insert({ org_id: orgId, name, sku })
        .select()
        .single()

      if (err) throw err
      return data
    } catch (err) {
      console.error('Failed to add item:', err)
      throw err
    }
  }, [orgId])

  // Create or Update stock levels (e.g. adjust reorder level)
  const updateStockSettings = useCallback(async (locationId, itemId, qty, reorderLevel) => {
    if (!orgId) {
      throw new Error('No organization profile found. You cannot perform this action.')
    }
    try {
      const { data, error: err } = await supabase
        .from('stock_levels')
        .upsert(
          {
            org_id: orgId,
            location_id: locationId,
            item_id: itemId,
            qty,
            reorder_level: reorderLevel,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'location_id,item_id' }
        )
        .select()
        .single()

      if (err) throw err
      return data
    } catch (err) {
      console.error('Failed to update stock settings:', err)
      throw err
    }
  }, [orgId])

  return {
    locations,
    items,
    stockLevels,
    loading,
    error,
    orgId,
    userId,
    adjustStock,
    addLocation,
    addItem,
    updateStockSettings
  }
}
