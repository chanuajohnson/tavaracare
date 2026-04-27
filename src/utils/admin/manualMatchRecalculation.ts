import { supabase } from '@/integrations/supabase/client';

/**
 * Manually trigger match recalculation for an available caregiver
 * This is useful for backfilling matches when caregivers were already available
 * but the trigger wasn't active
 */
export async function manuallyTriggerMatchRecalculation(caregiverId: string, caregiverName: string) {
  try {
    console.log(`Manually triggering match recalculation for caregiver: ${caregiverName} (${caregiverId})`);
    
    const { data, error } = await supabase.functions.invoke('recalculate-matches-on-availability-change', {
      body: {
        caregiver_id: caregiverId,
        caregiver_name: caregiverName,
        previous_status: false, // Simulate becoming available
        new_status: true
      }
    });

    if (error) {
      console.error('Error triggering manual recalculation:', error);
      throw error;
    }

    console.log('Manual recalculation triggered successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to trigger manual recalculation:', error);
    throw error;
  }
}

/**
 * Trigger recalculation for all currently available caregivers
 * This backfills matches for caregivers who were available before the trigger was active
 */
export async function backfillAvailableCaregiverMatches() {
  try {
    console.log('Starting backfill for all available caregivers...');
    
    // Get all available professional caregivers
    const { data: availableCaregivers, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'professional')
      .eq('available_for_matching', true);

    if (error) {
      console.error('Error fetching available caregivers:', error);
      throw error;
    }

    if (!availableCaregivers || availableCaregivers.length === 0) {
      console.log('No available caregivers found for backfill');
      return { processed: 0, results: [] };
    }

    console.log(`Found ${availableCaregivers.length} available caregivers to process`);
    
    const results = [];
    
    for (const caregiver of availableCaregivers) {
      try {
        const result = await manuallyTriggerMatchRecalculation(
          caregiver.id, 
          caregiver.full_name || 'Unknown'
        );
        results.push({ caregiverId: caregiver.id, success: true, result });
        
        // Add a small delay to avoid overwhelming the edge function
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to process caregiver ${caregiver.id}:`, error);
        results.push({ caregiverId: caregiver.id, success: false, error });
      }
    }

    console.log('Backfill completed:', { processed: availableCaregivers.length, results });
    return { processed: availableCaregivers.length, results };
  } catch (error) {
    console.error('Failed to backfill caregiver matches:', error);
    throw error;
  }
}