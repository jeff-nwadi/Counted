'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useTransfers() {
  const [transfers, setTransfers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orgId, setOrgId] = useState(null)

  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !active) return

        // Get org_id
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('org_id')
          .eq('user_id', user.id)
          .single()

        if (profileErr) throw profileErr
        if (!profile || !active) return

        const currentOrgId = profile.org_id
        setOrgId(currentOrgId)

        // Fetch transfers
        const { data, error: err } = await supabase
          .from('transfers')
          .select('*')
          .eq('org_id', currentOrgId)
          .order('created_at', { ascending: false })

        if (err) throw err
        if (active) {
          setTransfers(data || [])
          setLoading(false)
        }
      } catch (err) {
        console.error('Error fetching transfers:', err)
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

  // Live subscription to transfers table
  useEffect(() => {
    if (!orgId) return

    const channel = supabase
      .channel('transfers-realtime-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transfers', filter: `org_id=eq.${orgId}` },
        (payload) => {
          setTransfers((prev) => {
            if (prev.some((t) => t.id === payload.new.id)) return prev
            return [payload.new, ...prev]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orgId])

  // Executes a transfer: logs the transfer and updates quantities at both locations
  const executeTransfer = useCallback(async (itemId, qty, fromLocId, toLocId, userId) => {
    if (!orgId) {
      throw new Error('No organization profile found. You cannot perform this action.')
    }

    try {
      // 1. Insert the transfer record
      const { data: transfer, error: txError } = await supabase
        .from('transfers')
        .insert({
          org_id: orgId,
          item_id: itemId,
          qty,
          from_location: fromLocId,
          to_location: toLocId,
          created_by: userId
        })
        .select()
        .single()

      if (txError) throw txError

      // 2. Decrement quantity from source location
      const { data: fromStock, error: fromErr } = await supabase
        .from('stock_levels')
        .select('*')
        .eq('location_id', fromLocId)
        .eq('item_id', itemId)
        .single()

      if (fromErr && fromErr.code !== 'PGRST116') throw fromErr // PGRST116 is code for no rows returned

      if (fromStock) {
        const { error: updErr } = await supabase
          .from('stock_levels')
          .update({ qty: Math.max(0, fromStock.qty - qty), updated_at: new Date().toISOString() })
          .eq('id', fromStock.id)
        if (updErr) throw updErr
      }

      // 3. Increment quantity at destination location (upsert)
      const { data: toStock, error: toErr } = await supabase
        .from('stock_levels')
        .select('*')
        .eq('location_id', toLocId)
        .eq('item_id', itemId)
        .single()

      if (toErr && toErr.code !== 'PGRST116') throw toErr

      if (toStock) {
        const { error: updErr } = await supabase
          .from('stock_levels')
          .update({ qty: toStock.qty + qty, updated_at: new Date().toISOString() })
          .eq('id', toStock.id)
        if (updErr) throw updErr
      } else {
        const { error: insErr } = await supabase
          .from('stock_levels')
          .insert({
            org_id: orgId,
            location_id: toLocId,
            item_id: itemId,
            qty,
            reorder_level: 0,
            updated_at: new Date().toISOString()
          })
        if (insErr) throw insErr
      }

      return transfer
    } catch (err) {
      console.error('Failed to execute transfer:', err)
      throw err
    }
  }, [orgId])

  return {
    transfers,
    loading,
    error,
    executeTransfer
  }
}
