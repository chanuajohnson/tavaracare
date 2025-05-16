
import { supabase } from "@/lib/supabase";
import { Medication } from "@/types/medicationTypes";

// Function to seed Ms. Peltier's medications for demo purposes
export const seedPeltierMedications = async (carePlanId: string) => {
  try {
    console.log("Checking if medications exist for care plan:", carePlanId);
    
    // Check if medications already exist for this care plan
    const { data: existingMeds, error: checkError } = await supabase
      .from('medications')
      .select('id')
      .eq('care_plan_id', carePlanId);
    
    if (checkError) {
      console.error("Error checking existing medications:", checkError);
      return false;
    }
    
    // If medications already exist, don't seed
    if (existingMeds && existingMeds.length > 0) {
      console.log(`${existingMeds.length} medications already exist for this care plan`);
      return false;
    }
    
    // Define Ms. Peltier's medications
    const peltierMedications: Omit<Medication, 'id' | 'created_at' | 'updated_at'>[] = [
      {
        care_plan_id: carePlanId,
        name: "APO Atenolol",
        dosage: "100mg",
        instructions: "1 in morning",
        special_instructions: "Take with food",
        schedule: {
          morning: true,
          afternoon: false,
          evening: false,
          night: false
        },
        medication_type: "prescription",
        prescription_terms: "PO OD"
      },
      {
        care_plan_id: carePlanId,
        name: "APO Hydro",
        dosage: "50mg",
        instructions: "1/2 in morning",
        schedule: {
          morning: true,
          afternoon: false,
          evening: false,
          night: false
        },
        medication_type: "prescription",
        prescription_terms: "PO OD"
      },
      {
        care_plan_id: carePlanId,
        name: "Caltrate",
        dosage: "600mg",
        instructions: "1 in morning",
        schedule: {
          morning: true,
          afternoon: false,
          evening: false,
          night: false
        },
        medication_type: "supplement"
      },
      {
        care_plan_id: carePlanId,
        name: "Palixid",
        dosage: "10mg",
        instructions: "Once daily",
        schedule: {
          morning: false,
          afternoon: false,
          evening: true,
          night: false
        },
        medication_type: "prescription",
        prescription_terms: "PO OD"
      },
      {
        care_plan_id: carePlanId,
        name: "Risperidone",
        dosage: "1mg",
        instructions: "At bedtime",
        schedule: {
          morning: false,
          afternoon: false,
          evening: false,
          night: true
        },
        medication_type: "prescription",
        prescription_terms: "PO Nocte"
      }
    ];
    
    // Insert the medications
    const { data, error } = await supabase
      .from('medications')
      .insert(peltierMedications)
      .select();
    
    if (error) {
      console.error("Error seeding medications:", error);
      return false;
    }
    
    console.log("Successfully seeded medications:", data?.length);
    return true;
  } catch (error) {
    console.error("Error in seedPeltierMedications:", error);
    return false;
  }
};
